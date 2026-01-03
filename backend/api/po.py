"""
Purchase Order Router
CRUD operations and HTML upload/scraping
"""

import logging
import sqlite3
from typing import List

from bs4 import BeautifulSoup
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from backend.core.errors import bad_request, internal_error
from backend.core.exceptions import ResourceNotFoundError
from backend.db.models import PODetail, POListItem, POStats
from backend.db.session import get_db
from backend.services.ingest_po import POIngestionService
from backend.services.po_scraper import extract_items, extract_po_header
from backend.services.po_service import po_service
from backend.services.reconciliation_service import ReconciliationService

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/stats", response_model=POStats)
def get_po_stats(db: sqlite3.Connection = Depends(get_db)):
    """Get aggregated PO statistics"""
    try:
        # Total POs
        total_pos = db.execute("SELECT COUNT(*) FROM purchase_orders").fetchone()[0]

        # Active POs (Pending/Open)
        active_count = db.execute(
            "SELECT COUNT(*) FROM purchase_orders WHERE po_status IN ('Pending', 'Open')"
        ).fetchone()[0]

        # Pending POs (same as active for now or more specific logic)
        pending_pos = active_count

        # Completed POs
        completed_pos = db.execute(
            "SELECT COUNT(*) FROM purchase_orders WHERE po_status IN ('Closed', 'Delivered')"
        ).fetchone()[0]

        # Total Value (Net)
        total_value = db.execute(
            "SELECT COALESCE(SUM(net_po_value), 0) FROM purchase_orders"
        ).fetchone()[0]

        # YTD Value (Fiscal Year)
        # Assuming current fiscal year for simplicity or specific logic
        total_value_ytd = total_value  # Placeholder

        # Pending Approval (e.g. Pending status or no status)
        pending_approval_count = db.execute(
            "SELECT COUNT(*) FROM purchase_orders WHERE po_status = 'Pending' OR po_status IS NULL OR po_status = ''"
        ).fetchone()[0]

        # Open Orders (e.g. Open status)
        open_orders_count = db.execute(
            "SELECT COUNT(*) FROM purchase_orders WHERE po_status = 'Open'"
        ).fetchone()[0]

        return {
            "total_pos": total_pos,
            "active_count": active_count,
            "total_value": total_value,
            "pending_pos": pending_pos,
            "completed_pos": completed_pos,
            "total_value_ytd": total_value_ytd,
            "total_value_change": 0,  # Placeholder
            "open_orders_count": open_orders_count,
            "pending_approval_count": pending_approval_count,
        }
    except Exception as e:
        logger.error(f"Failed to get PO stats: {e}")
        return {
            "total_pos": 0,
            "active_count": 0,
            "total_value": 0,
            "pending_pos": 0,
            "completed_pos": 0,
            "total_value_ytd": 0,
            "total_value_change": 0,
            "open_orders_count": 0,
            "pending_approval_count": 0,
        }


@router.get("/", response_model=List[POListItem])
def list_pos(db: sqlite3.Connection = Depends(get_db)):
    """List all Purchase Orders with quantity details"""
    return po_service.list_pos(db)


@router.get("/{po_number}", response_model=PODetail)
def get_po_detail(po_number: str, db: sqlite3.Connection = Depends(get_db)):
    """Get Purchase Order detail with items and deliveries"""
    return po_service.get_po_detail(db, po_number)


@router.get("/{po_number}/context")
def get_po_context(po_number: str, db: sqlite3.Connection = Depends(get_db)):
    """Fetch PO context (Supplier/Buyer info) for DC/Invoice auto-fill"""
    po = db.execute(
        """
        SELECT po.po_number, po.po_date, po.supplier_name, po.supplier_gstin,
               b.name as buyer_name, b.gstin as buyer_gstin, b.billing_address as buyer_address
        FROM purchase_orders po
        LEFT JOIN buyers b ON po.buyer_id = b.id
        WHERE po.po_number = ?
    """,
        (po_number,),
    ).fetchone()

    if not po:
        raise ResourceNotFoundError("PO", po_number)

    return dict(po)


@router.get("/{po_number}/dc")
def check_po_has_dc(po_number: str, db: sqlite3.Connection = Depends(get_db)):
    """Check if PO has an associated Delivery Challan"""
    try:
        dc_row = db.execute(
            """
            SELECT id, dc_number FROM delivery_challans 
            WHERE po_number = ? 
            LIMIT 1
        """,
            (po_number,),
        ).fetchone()

        if dc_row:
            return {
                "has_dc": True,
                "dc_id": dc_row["id"],
                "dc_number": dc_row["dc_number"],
            }
        else:
            return {"has_dc": False}
    except Exception:
        # Table might not exist yet
        return {"has_dc": False}


@router.post("/", response_model=PODetail)
async def create_po_manual(po_data: PODetail, db: sqlite3.Connection = Depends(get_db)):
    """Manually create a Purchase Order from structured data"""
    return await process_po_update(po_data, db)


@router.put("/{po_number}", response_model=PODetail)
async def update_po(po_number: str, po_data: PODetail, db: sqlite3.Connection = Depends(get_db)):
    """Update an existing Purchase Order"""
    # Force po_number consistency
    po_data.header.po_number = po_number
    return await process_po_update(po_data, db)


async def process_po_update(po_data: PODetail, db: sqlite3.Connection):
    """Shared logic for creating/updating PO via structured model"""
    try:
        from backend.services.ingest_po import POIngestionService

        ingestion_service = POIngestionService()

        # 1. Map header to scraper-like format
        header_map = {
            "PURCHASE ORDER": str(po_data.header.po_number),
            "PO DATE": po_data.header.po_date,
            "SUPP NAME M/S": po_data.header.supplier_name,
            "SUPP CODE": po_data.header.supplier_code,
            "PHONE": po_data.header.supplier_phone,
            "FAX": po_data.header.supplier_fax,
            "EMAIL": po_data.header.supplier_email,
            "DVN": po_data.header.department_no,
            "ENQUIRY": po_data.header.enquiry_no,
            "ENQ DATE": po_data.header.enquiry_date,
            "QUOTATION": po_data.header.quotation_ref,
            "QUOT-DATE": po_data.header.quotation_date,
            "RC NO": po_data.header.rc_no,
            "ORD-TYPE": po_data.header.order_type,
            "PO STATUS": po_data.header.po_status,
            "TIN NO": po_data.header.tin_no,
            "ECC NO": po_data.header.ecc_no,
            "MPCT NO": po_data.header.mpct_no,
            "PO-VALUE": po_data.header.po_value,
            "FOB VALUE": po_data.header.fob_value,
            "NET PO VAL": po_data.header.net_po_value,
            "AMEND NO": po_data.header.amend_no,
            "INSPECTION BY": po_data.header.inspection_by,
            "INSPECTION AT BHEL": po_data.header.inspection_at,
            "NAME": po_data.header.issuer_name,
            "DESIGNATION": po_data.header.issuer_designation,
            "PHONE NO": po_data.header.issuer_phone,
            "REMARKS": po_data.header.remarks,
        }

        # 2. Map items and their nested deliveries
        items_list = []
        for item in po_data.items:
            item_map = {
                "PO ITM": item.po_item_no,
                "MATERIAL CODE": item.material_code,
                "DESCRIPTION": item.material_description,
                "DRG": item.drg_no,
                "UNIT": item.unit,
                "PO RATE": item.po_rate,
                "ORD QTY": item.ordered_quantity,
                "RCD QTY": item.received_quantity,
                "MTRL CAT": item.mtrl_cat,
                "deliveries": [],
            }

            # Map nested lots
            if item.deliveries:
                for d in item.deliveries:
                    if d.delivered_quantity and d.delivered_quantity > d.ordered_quantity:
                        raise HTTPException(
                            status_code=400,
                            detail=f"Lot {d.lot_no}: Delivered quantity ({d.delivered_quantity}) cannot exceed ordered quantity ({d.ordered_quantity})",
                        )

                    item_map["deliveries"].append(
                        {
                            "LOT NO": d.lot_no,
                            "DELY QTY": d.ordered_quantity,
                            "RCD QTY": d.received_quantity,
                            "DELY DATE": d.dely_date,
                            "ENTRY ALLOW DATE": d.entry_allow_date,
                            "DEST CODE": d.dest_code,
                            "DSP QTY": d.delivered_quantity,  # Pass DSP for track persistence
                        }
                    )
            else:
                # Fallback to single lot if none provided
                item_map["deliveries"].append(
                    {
                        "LOT NO": 1,
                        "DELY QTY": item.ordered_quantity,
                        "DELY DATE": po_data.header.po_date,
                        "ENTRY ALLOW DATE": po_data.header.po_date,
                        "DEST CODE": po_data.header.department_no or 1,
                    }
                )

            items_list.append(item_map)

        success, warnings = ingestion_service.ingest_po(db, header_map, items_list)

        if success:
            db.commit()
            # TOT-5 Sync
            ReconciliationService.sync_po(db, str(po_data.header.po_number))
            db.commit()
            return po_data
        else:
            raise bad_request(f"Failed to ingest PO: {', '.join(warnings)}")

    except Exception as e:
        raise internal_error(f"Failed to process PO update: {str(e)}", e) from e


@router.post("/upload")
async def upload_po_html(file: UploadFile = File(...), db: sqlite3.Connection = Depends(get_db)):
    """Upload and parse PO HTML file"""

    if not file.filename.endswith(".html"):
        raise bad_request("Only HTML files are supported")

    # Read and parse HTML
    content = await file.read()
    soup = BeautifulSoup(content, "lxml")

    # Extract data using existing scraper logic
    po_header = extract_po_header(soup)
    po_items = extract_items(soup)

    if not po_header.get("PURCHASE ORDER"):
        raise bad_request("Could not extract PO number from HTML")

    # Debug: Log extracted data
    print(
        f"🔍 SCRAPER OUTPUT: PO={po_header.get('PURCHASE ORDER')}, Items={len(po_items)}",
        flush=True,
    )
    if po_items:
        print(f"🔍 Sample Item: {po_items[0]}", flush=True)
    else:
        print("⚠️ WARNING: No items extracted from HTML!", flush=True)

    # Ingest into database
    ingestion_service = POIngestionService()
    linked_srvs_count = 0  # Initialize before transaction block
    try:
        from backend.db.session import db_transaction

        # Use explicit transaction context for atomicity
        # If any error occurs (validation or DB), context manager rolls back
        with db_transaction(db):
            # Validate FY Uniqueness (Optional strict check)
            from backend.validation.validation import get_financial_year

            po_num = po_header.get("PURCHASE ORDER")
            po_date = po_header.get("DATE")
            if po_num and po_date:
                pass
                # fy = get_financial_year(po_date)
                # Example: If strict uniqueness is desired, uncomment and adjust
                # existing = db.execute(
                #     "SELECT id FROM purchase_orders WHERE po_number = ? AND financial_year = ?",
                #     (po_num, fy),
                # ).fetchone()
                # if existing:
                #     raise ValueError(f"PO {po_num} for FY {fy} already exists.")

            # Ingestion service call
            # Note: ingestion_service should NOT commit internally
            success, warnings = ingestion_service.ingest_po(db, po_header, po_items)

            if success:
                po_number = str(po_header.get("PURCHASE ORDER"))
                # TOT Sync removed - reconciliation happens at DC/SRV level, not PO upload

                if linked_srvs_count > 0:
                    warnings.append(
                        f"✅ Linked {linked_srvs_count} existing SRV(s) to PO {po_number}"
                    )
            else:
                # If ingestion returns false (logical failure), we raise exception to force rollback
                raise ValueError(f"Ingestion logic returned failure: {warnings}")

        # Transaction committed automatically here if block exits successfully

        return {
            "success": True,
            "po_number": po_header.get("PURCHASE ORDER"),
            "warnings": warnings,
            "linked_srvs": linked_srvs_count,
        }
    except Exception as e:
        # Rethrow as HTTP 500/400 properly
        if isinstance(e, ValueError):  # Catch our validation errors
            raise bad_request(str(e)) from e
        raise internal_error(f"Failed to ingest PO: {str(e)}", e) from e


@router.post("/upload/batch")
async def upload_po_batch(
    files: List[UploadFile] = File(...), db: sqlite3.Connection = Depends(get_db)
):
    """Upload and parse multiple PO HTML files with atomic processing per file."""

    results = []
    successful = 0
    failed = 0
    total_linked_srvs = 0

    ingestion_service = POIngestionService()
    from backend.db.session import db_transaction

    for file in files:
        result = {
            "filename": file.filename,
            "success": False,
            "po_number": None,
            "message": "",
            "linked_srvs": 0,
        }

        try:
            # Validate file type
            if not file.filename.endswith(".html"):
                result["message"] = "Only HTML files are supported"
                failed += 1
                results.append(result)
                continue

            # Read and parse HTML
            content = await file.read()
            print(f"📄 Read {len(content)} bytes from {file.filename}", flush=True)
            soup = BeautifulSoup(content, "lxml")
            print("✅ Parsed HTML into BeautifulSoup", flush=True)

            # Extract data
            print(f"🔍 Extracting PO header from {file.filename}...", flush=True)
            po_header = extract_po_header(soup)
            print(f"📋 Header extracted: {po_header.get('PURCHASE ORDER')}", flush=True)

            print(f"🔍 Extracting PO items from {file.filename}...", flush=True)
            po_items = extract_items(soup)
            print(f"📦 Items extracted: {len(po_items)}", flush=True)

            if not po_header.get("PURCHASE ORDER"):
                print(f"🔥🔥🔥 PARSING FAILED for {file.filename}: PO Number missing", flush=True)
                result["message"] = "Could not extract PO number from HTML"
                failed += 1
                results.append(result)
                continue

            print(
                f"🔥🔥🔥 EXTRACTED PO: {po_header.get('PURCHASE ORDER')} from {file.filename}",
                flush=True,
            )

            # Atomic transaction per file
            # If one file fails, only that one is rolled back. Others can succeed.
            # (Assuming user wants batch to be "best effort" per file, but "all-or-nothing" WITHIN a file)
            with db_transaction(db):
                success, warnings = ingestion_service.ingest_po(db, po_header, po_items)

                if success:
                    # Reconciliation is now handled inside ingestion service
                    # (skipped for new POs, run for existing POs with deliveries)
                    # po_number = str(po_header.get("PURCHASE ORDER"))

                    linked_srvs_count = 0  # Placeholder
                    total_linked_srvs += linked_srvs_count

                    result["success"] = True
                    result["po_number"] = po_header.get("PURCHASE ORDER")
                    result["linked_srvs"] = linked_srvs_count

                    message = (
                        warnings[0]
                        if warnings
                        else f"Successfully ingested PO {po_header.get('PURCHASE ORDER')}"
                    )
                    if linked_srvs_count > 0:
                        message += f" (Linked {linked_srvs_count} SRV(s))"
                    result["message"] = message
                    successful += 1
                else:
                    raise ValueError(f"Ingestion Error: {warnings}")

        except Exception as e:
            import traceback

            print(f"🔥🔥🔥 UPLOAD ERROR for {file.filename}:", flush=True)
            print(traceback.format_exc(), flush=True)
            result["message"] = f"Error: {str(e)}"
            failed += 1
            # Transaction already rolled back by context manager

        results.append(result)

    return {
        "total": len(files),
        "successful": successful,
        "failed": failed,
        "total_linked_srvs": total_linked_srvs,
        "results": results,
    }


@router.get("/{po_number}/excel")
def download_po_excel(po_number: str, db: sqlite3.Connection = Depends(get_db)):
    """Download PO as Excel"""
    try:
        po_detail = po_service.get_po_detail(db, po_number)

        # Flatten deliveries for now (using all deliveries from all items)
        deliveries = []
        for item in po_detail.items:
            deliveries.extend(item.deliveries)

        from fastapi.responses import StreamingResponse

        from backend.services.excel_service import ExcelService

        excel_file = ExcelService.generate_po_excel(po_detail.header, po_detail.items, deliveries)

        filename = f"PO_{po_number}.xlsx"
        headers = {"Content-Disposition": f'attachment; filename="{filename}"'}

        return StreamingResponse(
            excel_file,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers=headers,
        )
    except Exception as e:
        raise internal_error(f"Failed to generate Excel: {str(e)}", e) from e


@router.patch("/{po_number}/items/{item_no}/delivered_qty")
async def update_delivered_qty(
    po_number: str, item_no: int, delivered_qty: float, db: sqlite3.Connection = Depends(get_db)
):
    """
    Manually update delivered quantity for a PO item.
    Enforces PO-2 invariant and triggers TOT-5 reconciliation.
    """
    try:
        # Fetch the item
        item_row = db.execute(
            """
            SELECT id, ord_qty, manual_delivered_qty 
            FROM purchase_order_items 
            WHERE po_number = ? AND po_item_no = ?
            """,
            (po_number, item_no),
        ).fetchone()

        if not item_row:
            return bad_request(f"Item {item_no} not found in PO {po_number}")

        # PO-2 Validation: Cannot deliver more than ordered
        ordered_qty = item_row["ord_qty"] or 0
        if delivered_qty > ordered_qty + 0.001:  # 0.001 tolerance
            return bad_request(
                f"Cannot deliver more than ordered (PO-2). "
                f"Ordered: {ordered_qty}, Attempted: {delivered_qty}"
            )

        # Update manual_delivered_qty
        db.execute(
            """
            UPDATE purchase_order_items 
            SET manual_delivered_qty = ?, updated_at = CURRENT_TIMESTAMP
            WHERE po_number = ? AND po_item_no = ?
            """,
            (delivered_qty, po_number, item_no),
        )

        db.commit()

        # TOT-5: Trigger reconciliation sync
        ReconciliationService.sync_po(db, po_number)
        db.commit()

        return {
            "success": True,
            "po_number": po_number,
            "item_no": item_no,
            "delivered_qty": delivered_qty,
            "message": "Delivered quantity updated and reconciliation synced",
        }

    except Exception as e:
        raise internal_error(f"Failed to update delivered quantity: {str(e)}", e) from e

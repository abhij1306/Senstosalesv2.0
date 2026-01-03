"""
Delivery Challan Router
"""

import logging
import sqlite3
import sys
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException

from backend.core.errors import internal_error, not_found
from backend.core.exceptions import (
    ConflictError,
    DomainError,
    ResourceNotFoundError,
    map_error_code_to_http_status,
)
from backend.db.models import DCCreate, DCListItem, DCStats
from backend.db.session import get_db
from backend.services import report_service
from backend.services.dc import (
    check_dc_has_invoice,
)
from backend.services.dc import (
    create_dc as service_create_dc,
)
from backend.services.dc import (
    update_dc as service_update_dc,
)
from backend.services.status_service import calculate_entity_status

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/po/{po_number}/lots")
def get_po_limit_lots(po_number: str, db: sqlite3.Connection = Depends(get_db)):
    """
    Get available lots/items for dispatch from a PO.
    Used by DC Create page to populate items.
    """
    lots = report_service.get_reconciliation_lots(po_number, db)
    if not lots:
        return {"lots": []}
    return {"lots": lots}


@router.get("/stats", response_model=DCStats)
def get_dc_stats(db: sqlite3.Connection = Depends(get_db)):
    """Get DC Page Statistics"""
    try:
        # Total Challans
        total_challans = db.execute("SELECT COUNT(*) FROM delivery_challans").fetchone()[0]

        # Completed (Linked to Invoice)
        completed = db.execute("""
            SELECT COUNT(DISTINCT dc_number) FROM gst_invoices WHERE dc_number IS NOT NULL
        """).fetchone()[0]

        # Total Value
        total_value = db.execute("""
            SELECT COALESCE(SUM(dci.dispatch_qty * poi.po_rate), 0)
            FROM delivery_challan_items dci
            JOIN purchase_order_items poi ON dci.po_item_id = poi.id
        """).fetchone()[0]

        # Pending Calculation
        pending = max(0, total_challans - completed)

        return {
            "total_challans": total_challans,
            "total_challans_change": 0.0,
            "pending_delivery": pending,
            "completed_delivery": completed,
            "completed_change": 0.0,
            "total_value": total_value,
        }
    except Exception as e:
        logger.error(f"Failed to fetch DC stats: {e}", exc_info=e)
        raise internal_error("Failed to fetch DC statistics", e) from e


@router.get("/", response_model=List[DCListItem])
def list_dcs(po: Optional[str] = None, db: sqlite3.Connection = Depends(get_db)):
    """List all Delivery Challans, optionally filtered by PO"""

    # Optimized query with lot-level aggregation for accurate quantity contexts
    query = """
        SELECT 
            dc.dc_number, 
            dc.dc_date, 
            dc.po_number, 
            dc.consignee_name, 
            dc.created_at,
            (SELECT COUNT(*) FROM gst_invoices WHERE dc_number = dc.dc_number) as is_linked,
            COALESCE(SUM(dci.dispatch_qty * poi.po_rate), 0) as total_value,
            
            -- Context: Ordered quantities for the specific lots contained in this DC
            COALESCE(SUM(COALESCE(pod.dely_qty, poi.ord_qty)), 0) as total_ordered_quantity,
            
            -- Dispatch: This specific DC's total quantity
            COALESCE(SUM(dci.dispatch_qty), 0) as total_dispatched_quantity,
            
            -- Received: Quantity accepted against THIS specific DC (summed from DC items)
            COALESCE(SUM(dci.received_qty), 0) as total_received_quantity,

            -- Global Status: Current total quantity dispatched across ALL DCs for the items in THIS DC
            (
                SELECT COALESCE(SUM(all_dci.dispatch_qty), 0)
                FROM delivery_challan_items all_dci
                JOIN delivery_challan_items sub_dci ON all_dci.po_item_id = sub_dci.po_item_id 
                   AND COALESCE(all_dci.lot_no, 1) = COALESCE(sub_dci.lot_no, 1)
                WHERE sub_dci.dc_number = dc.dc_number
            ) as global_dispatched_quantity

        FROM delivery_challans dc
        LEFT JOIN delivery_challan_items dci ON dc.dc_number = dci.dc_number
        LEFT JOIN purchase_order_items poi ON dci.po_item_id = poi.id
        LEFT JOIN purchase_order_deliveries pod ON dci.po_item_id = pod.po_item_id AND dci.lot_no = pod.lot_no
    """
    params = []

    if po:
        query += " WHERE dc.po_number = ?"
        params.append(po)

    query += " GROUP BY dc.dc_number, dc.dc_date, dc.po_number, dc.consignee_name, dc.created_at"
    query += " ORDER BY dc.created_at DESC"

    rows = db.execute(query, params).fetchall()

    results = []
    for row in rows:
        total_ordered = row["total_ordered_quantity"] or 0
        total_dispatched_this_dc = row["total_dispatched_quantity"] or 0
        total_received_this_dc = row["total_received_quantity"] or 0
        global_dispatched = row["global_dispatched_quantity"] or 0

        # Balance = Total Ordered - Total Dispatched Globally
        total_pending = max(0, total_ordered - global_dispatched)

        # Status logic: For a DC, 'Ordered' target for its own lifecycle is its dispatched qty
        status = calculate_entity_status(
            total_dispatched_this_dc, total_dispatched_this_dc, total_received_this_dc
        )

        results.append(
            DCListItem(
                dc_number=row["dc_number"],
                dc_date=row["dc_date"],
                po_number=row["po_number"],
                consignee_name=row["consignee_name"],
                status=status,
                total_value=row["total_value"],
                created_at=row["created_at"],
                total_ordered_quantity=total_ordered,
                total_dispatched_quantity=total_dispatched_this_dc,
                total_pending_quantity=total_pending,
                total_received_quantity=total_received_this_dc,
            )
        )

    return results


@router.get("/{dc_number}/invoice")
def check_dc_has_invoice_endpoint(dc_number: str, db: sqlite3.Connection = Depends(get_db)):
    """Check if DC has an associated GST Invoice"""
    invoice_number = check_dc_has_invoice(dc_number, db)

    if invoice_number:
        return {"has_invoice": True, "invoice_number": invoice_number}
    else:
        return {"has_invoice": False}


@router.get("/{dc_number}/download")
def download_dc_excel(dc_number: str, db: sqlite3.Connection = Depends(get_db)):
    """Download DC as Excel"""
    try:
        logger.info(f"Downloading DC Excel: {dc_number}")
        # Get full detail logic
        dc_data = get_dc_detail(dc_number, db)
        logger.info(f"DC data fetched successfully for {dc_number}")

        from backend.services.excel_service import ExcelService

        # Use exact generator
        return ExcelService.generate_exact_dc_excel(dc_data["header"], dc_data["items"], db)

    except Exception as e:
        raise internal_error(f"Failed to generate Excel: {str(e)}", e) from e


@router.get("/{dc_number}")
def get_dc_detail(dc_number: str, db: sqlite3.Connection = Depends(get_db)):
    """Get Delivery Challan detail with items"""

    # Get DC header with PO Date
    dc_row = db.execute(
        """
        SELECT dc.*, po.po_date, po.department_no
        FROM delivery_challans dc
        LEFT JOIN purchase_orders po ON dc.po_number = po.po_number
        WHERE dc.dc_number = ?
    """,
        (dc_number,),
    ).fetchone()

    if not dc_row:
        raise not_found(f"Delivery Challan {dc_number} not found", "DC")

    header_dict = dict(dc_row)

    # POPULATE DEFAULTS FROM SETTINGS IF EMPTY
    # This ensures frontend doesn't need hardcoded fallbacks
    # POPULATE DEFAULTS FROM SETTINGS IF EMPTY
    # This ensures frontend doesn't need hardcoded fallbacks
    try:
        settings_rows = db.execute("SELECT key, value FROM settings").fetchall()
        settings = {row["key"]: row["value"] for row in settings_rows}

        if not header_dict.get("consignee_name"):
            # Try Default Buyer first, then Settings
            default_buyer = db.execute("SELECT name FROM buyers WHERE is_default = 1").fetchone()
            header_dict["consignee_name"] = (
                default_buyer["name"] if default_buyer else settings.get("buyer_name", "")
            )

        if not header_dict.get("consignee_address"):
            # Try Default Buyer first, then Settings
            default_buyer_addr = db.execute(
                "SELECT billing_address FROM buyers WHERE is_default = 1"
            ).fetchone()
            header_dict["consignee_address"] = (
                default_buyer_addr["billing_address"]
                if default_buyer_addr
                else settings.get("buyer_address", "")
            )

        # Also populate Supplier details unconditionally (User's Company)
        # These are not usually stored in the DC record but are needed for the UI
        # Check if they exist in header_dict first (unlikely) or just overwrite/fill from settings
        if not header_dict.get("supplier_name"):
            header_dict["supplier_name"] = settings.get("supplier_name", "")
        if not header_dict.get("supplier_phone"):
            header_dict["supplier_phone"] = settings.get("supplier_contact", "")
        if not header_dict.get("supplier_gstin"):
            header_dict["supplier_gstin"] = settings.get("supplier_gstin", "")

    except Exception as e:
        logger.warning(f"Failed to populate DC defaults from settings: {e}")

    # Calculate status per DC
    agg = db.execute(
        """
        SELECT 
            SUM(pod.dely_qty) as total_ord,
            SUM(dci.dispatch_qty) as total_del,
            (
                SELECT COALESCE(SUM(si.received_qty), 0)
                FROM srv_items si
                JOIN srvs s ON si.srv_number = s.srv_number
                WHERE s.is_active = 1 
                  AND si.challan_no = ?
            ) as total_recd
        FROM delivery_challan_items dci
        LEFT JOIN purchase_order_deliveries pod ON dci.po_item_id = pod.po_item_id AND dci.lot_no = pod.lot_no
        WHERE dci.dc_number = ?
    """,
        (dc_number, dc_number),
    ).fetchone()

    if agg:
        t_ord = agg["total_ord"] or 0
        t_del = agg["total_del"] or 0
        t_recd = agg["total_recd"] or 0
        header_dict["status"] = calculate_entity_status(t_ord, t_del, t_recd)
    else:
        header_dict["status"] = "Pending"

    try:
        # Get DC items with PO item details
        items = db.execute(
            """
            SELECT 
                dci.id,
                dci.dispatch_qty as dispatched_quantity,
                dci.hsn_code,
                dci.hsn_rate,
                dci.lot_no,
                dci.po_item_id,
                poi.po_item_no,
                poi.material_code,
                poi.material_description,
                poi.drg_no,
                poi.unit,
                poi.po_rate,
                poi.ord_qty,
                COALESCE(pod.dely_qty, poi.ord_qty) as lot_ordered_qty,
                COALESCE(pod.delivered_qty, 0) as lot_delivered_qty,
                COALESCE(pod.received_qty, 0) as received_quantity
            FROM delivery_challan_items dci
            JOIN purchase_order_items poi ON dci.po_item_id = poi.id
            LEFT JOIN purchase_order_deliveries pod ON dci.po_item_id = pod.po_item_id AND dci.lot_no = pod.lot_no
            WHERE dci.dc_number = ?
            """,
            (dc_number,),
        ).fetchall()

        result_items = []
        for item in items:
            item_dict = dict(item)

            # Calculate remaining info
            # po_item_id = item_dict["po_item_id"] (Unused)
            # lot_no = item_dict["lot_no"] (Unused)

            # LOT-LEVEL Ordered Quantity (from purchase_order_deliveries.dely_qty)
            lot_ordered = item_dict["lot_ordered_qty"] or 0

            # LOT-LEVEL Delivered Quantity (from purchase_order_deliveries.delivered_qty - high water mark)
            lot_delivered = item_dict["lot_delivered_qty"] or 0

            # CURRENT DC Dispatch Quantity
            current_dispatch = item_dict["dispatched_quantity"] or 0

            # Populate item_dict with correct values for frontend
            item_dict["ordered_quantity"] = lot_ordered
            item_dict["delivered_quantity"] = lot_delivered
            item_dict["dispatch_quantity"] = current_dispatch

            # RECEIVED quantity from SRV or PO
            item_dict["received_quantity"] = item_dict.get("received_quantity", 0)

            # BALANCE = Ordered - (Delivered + Current Dispatch)
            # Note: Delivered is the HIGH WATER MARK from dsp_qty, which already includes past DCs
            # So balance should be: Ordered - Delivered (since Delivered = max of all past dispatches)
            # The current DC's dispatch is already contributing to the global delivered count
            item_dict["remaining_post_dc"] = max(0, lot_ordered - lot_delivered)

            result_items.append(item_dict)

        return {"header": header_dict, "items": result_items}

    except Exception as e:
        logger.error(f"Error fetching DC Detail for {dc_number}: {str(e)}", exc_info=True)
        raise internal_error(f"Failed to fetch DC details: {str(e)}", e) from e


@router.post("/")
def create_dc(dc: DCCreate, items: List[dict], db: sqlite3.Connection = Depends(get_db)):
    print(f"DEBUG: Endpoint create_dc called with dc_number={dc.dc_number}")
    sys.stdout.flush()
    """
    Create new Delivery Challan with items
    items format: [{
        "po_item_id": "uuid",
        "lot_no": 1,
        "dispatch_qty": 10,
        "hsn_code": "7326",
        "hsn_rate": 18
    }]
    """

    # Validate Uniqueness - Handled in Service Layer
    # from core.validation import get_financial_year, validate_unique_number
    # fy = get_financial_year(dc.dc_date)
    # validate_unique_number(...)

    # Use service layer with transaction protection
    try:
        # CRITICAL: Use BEGIN IMMEDIATE for SQLite concurrency protection
        db.execute("BEGIN IMMEDIATE")

        try:
            result = service_create_dc(dc, items, db)
            db.commit()

            # Service returns ServiceResult - extract data
            if result.success:
                return result.data
            else:
                # Should not happen if service raises DomainError
                raise HTTPException(status_code=500, detail=result.message or "Unknown error")

        except DomainError as e:
            # Convert domain error to HTTP response
            db.rollback()
            status_code = map_error_code_to_http_status(e.error_code)
            raise HTTPException(
                status_code=status_code,
                detail={
                    "message": e.message,
                    "error_code": e.error_code.value,
                    "details": e.details,
                },
            ) from e
        except Exception:
            db.rollback()
            raise

    except sqlite3.IntegrityError as e:
        logger.error(f"DC creation failed due to integrity error: {e}", exc_info=e)
        raise internal_error(f"Database integrity error: {str(e)}", e) from e


@router.put("/{dc_number}")
def update_dc(
    dc_number: str,
    dc: DCCreate,
    items: List[dict],
    db: sqlite3.Connection = Depends(get_db),
):
    """Update existing Delivery Challan - BLOCKED if invoice exists"""

    # Use service layer with transaction protection
    try:
        # CRITICAL: Use BEGIN IMMEDIATE for SQLite concurrency protection
        db.execute("BEGIN IMMEDIATE")

        try:
            result = service_update_dc(dc_number, dc, items, db)
            db.commit()

            # Service returns ServiceResult - extract data
            if result.success:
                return result.data
            else:
                # Should not happen if service raises DomainError
                raise HTTPException(status_code=500, detail=result.message or "Unknown error")

        except DomainError as e:
            # Convert domain error to HTTP response
            db.rollback()
            status_code = map_error_code_to_http_status(e.error_code)
            raise HTTPException(
                status_code=status_code,
                detail={
                    "message": e.message,
                    "error_code": e.error_code.value,
                    "details": e.details,
                },
            ) from e
        except Exception:
            db.rollback()
            raise

    except sqlite3.IntegrityError as e:
        logger.error(f"DC update failed due to integrity error: {e}", exc_info=e)
        raise internal_error(f"Database integrity error: {str(e)}", e) from e


@router.delete("/{dc_number}")
def delete_dc(dc_number: str, db: sqlite3.Connection = Depends(get_db)):
    """
    Delete a Delivery Challan
    CRITICAL: Validates invoice linkage before deletion
    """
    try:
        # Use BEGIN IMMEDIATE for transaction safety
        db.execute("BEGIN IMMEDIATE")

        from backend.services.dc import delete_dc as service_delete_dc

        result = service_delete_dc(dc_number, db)

        db.commit()
        return result.data

    except (ResourceNotFoundError, ConflictError) as e:
        db.rollback()
        status_code = map_error_code_to_http_status(e.error_code)
        raise HTTPException(
            status_code=status_code,
            detail={"message": e.message, "error_code": e.error_code.value},
        ) from e
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting DC {dc_number}: {e}")
        raise HTTPException(status_code=500, detail=str(e)) from e

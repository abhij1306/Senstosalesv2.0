"""
Production-Grade Invoice Router
Implements strict accounting rules with audit-safe transaction handling
"""

import logging
import sqlite3
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from backend.core.errors import internal_error, not_found
from backend.core.exceptions import DomainError, map_error_code_to_http_status
from backend.db.models import InvoiceListItem, InvoiceStats
from backend.db.session import get_db
from backend.services.invoice import create_invoice as service_create_invoice
from backend.services.status_service import calculate_entity_status, calculate_pending_quantity

logger = logging.getLogger(__name__)
router = APIRouter()

# ============================================================================
# REQUEST/RESPONSE MODELS
# ============================================================================


class InvoiceItemCreate(BaseModel):
    po_sl_no: str  # lot_no from DC
    description: str
    quantity: float
    unit: str = "NO"
    rate: float
    hsn_sac: Optional[str] = None
    no_of_packets: Optional[int] = None


class EnhancedInvoiceCreate(BaseModel):
    invoice_number: str
    invoice_date: str

    # DC reference (required)
    dc_number: str

    # Buyer details (editable)
    buyer_name: str
    buyer_address: Optional[str] = None
    buyer_gstin: Optional[str] = None
    buyer_state: Optional[str] = None
    buyer_state_code: Optional[str] = None
    place_of_supply: Optional[str] = None

    # Order details (from DC/PO, read-only on frontend)
    buyers_order_no: Optional[str] = None
    buyers_order_date: Optional[str] = None

    # Transport details
    vehicle_no: Optional[str] = None
    lr_no: Optional[str] = None
    transporter: Optional[str] = None
    destination: Optional[str] = None
    terms_of_delivery: Optional[str] = None

    # Optional fields
    gemc_number: Optional[str] = None
    gemc_date: Optional[str] = None
    mode_of_payment: Optional[str] = None
    payment_terms: str = "45 Days"
    despatch_doc_no: Optional[str] = None
    srv_no: Optional[str] = None
    srv_date: Optional[str] = None
    remarks: Optional[str] = None

    # Items with overrides
    items: Optional[List[InvoiceItemCreate]] = None


# ============================================================================
# ENDPOINTS
# ============================================================================


@router.get("/stats", response_model=InvoiceStats)
def get_invoice_stats(db: sqlite3.Connection = Depends(get_db)):
    """Get Invoice Page Statistics"""
    try:
        total_row = db.execute("SELECT SUM(total_invoice_value) FROM gst_invoices").fetchone()
        total_invoiced = total_row[0] if total_row and total_row[0] else 0.0

        gst_row = db.execute("SELECT SUM(cgst + sgst + igst) FROM gst_invoices").fetchone()
        gst_collected = gst_row[0] if gst_row and gst_row[0] else 0.0

        pending_payments = 0.0
        pending_payments_count = 0

        return {
            "total_invoiced": total_invoiced,
            "pending_payments": pending_payments,
            "gst_collected": gst_collected,
            "total_invoiced_change": 0.0,
            "gst_collected_change": 0.0,
            "pending_payments_count": pending_payments_count,
        }
    except Exception as e:
        logger.error(f"Error fetching stats: {e}")
        return {
            "total_invoiced": 0,
            "pending_payments": 0,
            "gst_collected": 0,
            "total_invoiced_change": 0,
            "pending_payments_count": 0,
            "gst_collected_change": 0,
        }


@router.get("", response_model=List[InvoiceListItem])
def list_invoices(
    po: Optional[int] = None,
    dc: Optional[str] = None,
    status: Optional[str] = None,
    db: sqlite3.Connection = Depends(get_db),
):
    """List all Invoices, optionally filtered by PO, DC, or Status"""

    query = """
        SELECT 
            inv.invoice_number, inv.invoice_date, inv.po_numbers, inv.dc_number,
            inv.buyer_gstin, inv.taxable_value, inv.total_invoice_value, inv.created_at,
            COUNT(DISTINCT inv_item.id) as total_items,
            COALESCE(SUM(inv_item.quantity), 0) as total_ordered_quantity,
            (
                SELECT COALESCE(SUM(dci.dispatch_qty), 0)
                FROM delivery_challan_items dci
                WHERE dci.dc_number = inv.dc_number
            ) as total_dispatched_quantity,
            (
                SELECT COALESCE(SUM(si.received_qty), 0)
                FROM srv_items si
                JOIN srvs s ON si.srv_number = s.srv_number
                WHERE s.is_active = 1 
                  AND CAST(s.invoice_number AS TEXT) = CAST(inv.invoice_number AS TEXT)
            ) as total_received_quantity
        FROM gst_invoices inv
        LEFT JOIN gst_invoice_items inv_item ON inv.invoice_number = inv_item.invoice_number AND inv.financial_year = inv_item.financial_year
        WHERE 1=1
    """
    params = []

    if po:
        query += " AND inv.po_numbers LIKE ?"
        params.append(f"%{po}%")

    if dc:
        query += " AND inv.dc_number = ?"
        params.append(dc)

    query += " GROUP BY inv.invoice_number, inv.invoice_date, inv.po_numbers, inv.dc_number,"
    query += " inv.buyer_gstin, inv.taxable_value, inv.total_invoice_value, inv.created_at"
    query += " ORDER BY inv.created_at DESC"

    rows = db.execute(query, tuple(params)).fetchall()

    results = []
    for row in rows:
        row_dict = dict(row)
        total_ordered = row_dict.get("total_ordered_quantity") or 0
        total_dispatched = row_dict.get("total_dispatched_quantity") or 0
        total_received = row_dict.get("total_received_quantity") or 0
        # BAL = ORD - RECD (what hasn't been received yet)
        # BAL = ORD - RECD (what hasn't been received yet)
        total_pending = calculate_pending_quantity(total_ordered, total_received)

        # Determine Status using centralized service
        status = calculate_entity_status(total_ordered, total_dispatched, total_received)

        row_dict["total_pending_quantity"] = total_pending
        row_dict["status"] = status
        results.append(InvoiceListItem(**row_dict))

    return results


# IMPORTANT: Specific routes must come before parameterized routes
@router.get("/{invoice_number:path}/download")
def download_invoice_excel(invoice_number: str, db: sqlite3.Connection = Depends(get_db)):
    """Download Invoice as Excel"""
    try:
        logger.info(f"Downloading Invoice Excel: {invoice_number}")
        data = get_invoice_detail(invoice_number, db)
        logger.info(f"Invoice data fetched successfully for {invoice_number}")

        from backend.services.excel_service import ExcelService

        # Use exact generator
        return ExcelService.generate_exact_invoice_excel(data["header"], data["items"], db)

    except Exception as e:
        raise internal_error(f"Failed to generate Excel: {str(e)}", e) from e


@router.get("/{invoice_number}")
def get_invoice_detail(invoice_number: str, db: sqlite3.Connection = Depends(get_db)):
    """Get Invoice detail with items and linked DCs"""

    try:
        # Fetch invoice header
        invoice_row = db.execute(
            """
            SELECT * FROM gst_invoices WHERE invoice_number = ?
        """,
            (invoice_number,),
        ).fetchone()

        if not invoice_row:
            raise not_found(
                f"Invoice {invoice_number} not found", "Invoice"
            )

        # CRITICAL FIX: Convert to dict IMMEDIATELY while DB is open
        header_dict = dict(invoice_row)
        header_dict["buyers_order_no"] = header_dict.get("po_numbers")
        # Do not overwrite if already present from SELECT *
        if not header_dict.get("buyers_order_date"):
            header_dict["buyers_order_date"] = header_dict.get("po_date")
        header_dict["dc_number"] = header_dict.get("dc_number")

        # Fetch DC date if missing
        if header_dict.get("dc_number"):
            dc_row = db.execute(
                "SELECT dc_date FROM delivery_challans WHERE dc_number = ?",
                (header_dict["dc_number"],),
            ).fetchone()
            if dc_row:
                header_dict["dc_date"] = dc_row["dc_date"]

        # Calculate live status based on aggregates
        agg = db.execute(
            """
            SELECT 
                COALESCE(SUM(inv_item.quantity), 0) as total_ord,
                (
                    SELECT COALESCE(SUM(dci.dispatch_qty), 0)
                    FROM delivery_challan_items dci
                    WHERE dci.dc_number = i2.dc_number
                ) as total_del,
                (
                    SELECT COALESCE(SUM(si.received_qty), 0)
                    FROM srv_items si
                    JOIN srvs s ON si.srv_number = s.srv_number
                    WHERE s.is_active = 1 
                      AND CAST(s.invoice_number AS TEXT) = CAST(i2.invoice_number AS TEXT)
                ) as total_recd
            FROM gst_invoice_items inv_item
            JOIN gst_invoices i2 ON inv_item.invoice_number = i2.invoice_number
            WHERE i2.invoice_number = ?
            GROUP BY i2.invoice_number
        """,
            (invoice_number,),
        ).fetchone()

        if agg:
            t_ord = agg["total_ord"] or 0
            t_del = agg["total_del"] or 0
            t_recd = agg["total_recd"] or 0
            header_dict["status"] = calculate_entity_status(t_ord, t_del, t_recd)
        else:
            header_dict["status"] = "Pending"

        # Fetch buyer details from settings if not in invoice
        if not header_dict.get("buyer_name") or not header_dict.get("buyer_gstin"):
            settings_rows = db.execute("SELECT key, value FROM settings").fetchall()
            settings = {row["key"]: row["value"] for row in settings_rows}

            # Apply settings as fallback
            # Apply settings as fallback - STRICTLY NO HARDCODING
            # If settings are missing, these will be None or empty, prompting user to configure settings.
            if not header_dict.get("buyer_name"):
                header_dict["buyer_name"] = settings.get("buyer_name", "")
            if not header_dict.get("buyer_address"):
                header_dict["buyer_address"] = settings.get("buyer_address", "")
            if not header_dict.get("buyer_gstin"):
                header_dict["buyer_gstin"] = settings.get("buyer_gstin", "")
            if not header_dict.get("buyer_state"):
                header_dict["buyer_state"] = settings.get("buyer_state", "")
            if not header_dict.get("place_of_supply"):
                header_dict["place_of_supply"] = settings.get("buyer_place_of_supply", "")

        # Fetch invoice items
        # CRITICAL FIX: Join on BOTH po_item_no AND po_number to prevent row multiplication
        # We CAST po_numbers to INTEGER to match po_item.po_number type
        items_rows = db.execute(
            """
            SELECT 
                inv_item.*,
                inv_item.total_amount as amount,
                po_item.material_code,
                po_item.ord_qty as ordered_quantity,
                po_item.delivered_qty as dispatched_quantity
            FROM gst_invoice_items inv_item
            LEFT JOIN purchase_order_items po_item 
                ON inv_item.po_sl_no = po_item.po_item_no
            JOIN gst_invoices inv 
                ON inv_item.invoice_number = inv.invoice_number AND inv_item.financial_year = inv.financial_year
            WHERE inv_item.invoice_number = ?
            AND CAST(inv.po_numbers AS INTEGER) = po_item.po_number
            ORDER BY inv_item.id
        """,
            (invoice_number,),
        ).fetchall()

        # CRITICAL FIX: Convert IMMEDIATELY while DB is open
        items = [dict(item) for item in items_rows]

        # Fetch linked DCs
        dc_links = []
        try:
            if header_dict.get("dc_number"):
                dc_rows = db.execute(
                    "SELECT * FROM delivery_challans WHERE dc_number = ?",
                    (header_dict["dc_number"],),
                ).fetchall()
                # CRITICAL FIX: Convert IMMEDIATELY
                dc_links = [dict(dc) for dc in dc_rows]
        except sqlite3.OperationalError as e:
            logger.warning(f"Could not fetch DC links: {e}")

        # Return with all data converted to dicts
        return {"header": header_dict, "items": items, "linked_dcs": dc_links}

    except Exception as e:
        logger.error(f"Error fetching invoice {invoice_number}: {e}", exc_info=True)
        raise


@router.post("")
def create_invoice(request: EnhancedInvoiceCreate, db: sqlite3.Connection = Depends(get_db)):
    """
    Create Invoice from Delivery Challan

    CRITICAL CONSTRAINTS:
    - 1 DC → 1 Invoice (enforced via INVARIANT DC-2)
    - Invoice items are 1-to-1 mapping from DC items
    - Backend recomputes all monetary values (INVARIANT INV-2)
    - Transaction uses BEGIN IMMEDIATE for collision safety
    """

    # Convert Pydantic model to dict for service layer
    invoice_data = request.dict()

    # Validate FY Uniqueness
    from backend.validation.validation import get_financial_year, validate_unique_number

    fy = get_financial_year(request.invoice_date)
    validate_unique_number(
        db,
        "gst_invoices",
        "invoice_number",
        "financial_year",
        request.invoice_number,
        fy,
    )

    # Use service layer with transaction protection
    try:
        # CRITICAL: Use BEGIN IMMEDIATE for SQLite concurrency protection
        db.execute("BEGIN IMMEDIATE")

        try:
            result = service_create_invoice(invoice_data, db)
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
        logger.error(f"Invoice creation failed due to integrity error: {e}", exc_info=e)
        raise internal_error(f"Database integrity error: {str(e)}", e) from e

    except Exception as e:
        logger.error(f"Error creating invoice: {e}", exc_info=True)
        raise

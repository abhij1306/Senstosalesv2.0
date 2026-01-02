"""
Invoice Service Layer
Centralizes all invoice business logic and validation
HTTP-agnostic - can be called from routers or AI agents
"""

import logging
import sqlite3
import uuid
from typing import Dict, List, Optional

from app.core.exceptions import (
    ConflictError,
    ErrorCode,
    ResourceNotFoundError,
    ValidationError,
)
from app.core.number_utils import to_qty
from app.core.result import ServiceResult

logger = logging.getLogger(__name__)


def generate_invoice_number(db: sqlite3.Connection) -> str:
    """DISABLED - Manual numbering now required"""
    raise NotImplementedError("Manual numbering is now required. Auto-generation is disabled.")


def calculate_tax(taxable_value: float, cgst_rate: float = 9.0, sgst_rate: float = 9.0) -> dict:
    """
    Calculate CGST and SGST amounts
    INVARIANT: INV-2 - Backend is the source of truth for all monetary calculations
    """
    cgst_amount = round(taxable_value * cgst_rate / 100, 2)
    sgst_amount = round(taxable_value * sgst_rate / 100, 2)
    total = round(taxable_value + cgst_amount + sgst_amount, 2)

    return {
        "cgst_amount": cgst_amount,
        "sgst_amount": sgst_amount,
        "total_amount": total,
    }


def validate_invoice_header(invoice_data: dict) -> None:
    """
    Validate invoice header fields
    Raises ValidationError if validation fails
    """
    if not invoice_data.get("invoice_number") or invoice_data["invoice_number"].strip() == "":
        raise ValidationError("Invoice number is required")
    if not invoice_data.get("dc_number") or invoice_data["dc_number"].strip() == "":
        raise ValidationError("DC number is required")

    if not invoice_data.get("invoice_date") or invoice_data["invoice_date"].strip() == "":
        raise ValidationError("Invoice date is required")

    if not invoice_data.get("buyer_name") or invoice_data["buyer_name"].strip() == "":
        raise ValidationError("Buyer name is required")


def check_dc_already_invoiced(dc_number: str, db: sqlite3.Connection) -> Optional[str]:
    """
    Check if DC is already linked to an invoice
    INVARIANT: DC-2 - A DC can be linked to at most ONE invoice

    Returns:
        Invoice number if already invoiced, None otherwise
    """
    existing_invoice = db.execute(
        """
        SELECT invoice_number FROM gst_invoices WHERE dc_number = ?
    """,
        (dc_number,),
    ).fetchone()

    return existing_invoice[0] if existing_invoice else None


def check_invoice_number_exists(invoice_number: str, db: sqlite3.Connection) -> bool:
    """
    Check if invoice number already exists
    INVARIANT: INV-1 - Invoice numbers must be globally unique

    Returns:
        True if exists, False otherwise
    """
    dup_check = db.execute(
        """
        SELECT invoice_number FROM gst_invoices WHERE invoice_number = ?
    """,
        (invoice_number,),
    ).fetchone()

    return dup_check is not None


def fetch_dc_items(dc_number: str, db: sqlite3.Connection) -> List[Dict]:
    """
    Fetch DC items with PO item details

    Returns:
        List of DC items with material details
    """
    dc_items = db.execute(
        """
        SELECT 
            dci.po_item_id,
            dci.lot_no,
            dci.dispatch_qty,
            poi.po_rate,
            poi.material_description as description,
            poi.hsn_code,
            poi.po_item_no
        FROM delivery_challan_items dci
        JOIN purchase_order_items poi ON dci.po_item_id = poi.id
        WHERE dci.dc_number = ?
    """,
        (dc_number,),
    ).fetchall()

    # Also fetch DC header info to map to Invoice if needed
    dc_header = db.execute(
        "SELECT consignee_name, consignee_gstin, consignee_address, vehicle_no, transporter, lr_no, po_number FROM delivery_challans WHERE dc_number = ?",
        (dc_number,),
    ).fetchone()

    return [dict(item) for item in dc_items], dict(dc_header) if dc_header else {}


def create_invoice(invoice_data: dict, db: sqlite3.Connection) -> ServiceResult[Dict]:
    """
    Create Invoice from Delivery Challan
    HTTP-agnostic - returns ServiceResult instead of raising HTTPException

    CRITICAL CONSTRAINTS:
    - 1 DC → 1 Invoice (enforced via INVARIANT DC-2)
    - Invoice items are 1-to-1 mapping from DC items
    - Backend recomputes all monetary values (INVARIANT INV-2)
    - Transaction uses BEGIN IMMEDIATE for collision safety

    Args:
        invoice_data: Invoice header data (dict matching EnhancedInvoiceCreate)
        db: Database connection (must be in transaction)

    Returns:
        ServiceResult with success status, invoice_number, total_amount, items_count
    """
    try:
        invoice_number = invoice_data["invoice_number"]
        invoice_date = invoice_data["invoice_date"]
        dc_number = invoice_data["dc_number"]

        from app.core.utils import get_financial_year

        fy = get_financial_year(invoice_date)

        # Financial year boundaries
        year_start = fy.split("-")[0]
        full_year_start = f"{year_start}-04-01"
        year_end = f"20{fy.split('-')[1]}"
        full_year_end = f"{year_end}-03-31"

        # Check for duplicate invoice number within the FY
        existing_dup = db.execute(
            """
            SELECT 1 FROM gst_invoices 
            WHERE invoice_number = ? 
            AND invoice_date >= ? AND invoice_date <= ?
        """,
            (invoice_number, full_year_start, full_year_end),
        ).fetchone()

        if existing_dup:
            raise ConflictError(
                f"Invoice number {invoice_number} already exists in Financial Year {fy}.",
                details={"invoice_number": invoice_number, "financial_year": fy},
            )

        # Validate header
        validate_invoice_header(invoice_data)

        # INVARIANT: INV-4 - Invoice must reference at least one valid DC
        dc_row = db.execute(
            """
            SELECT dc_number, dc_date, po_number FROM delivery_challans WHERE dc_number = ?
        """,
            (dc_number,),
        ).fetchone()

        if not dc_row:
            raise ResourceNotFoundError("Delivery Challan", dc_number)

        dc_dict = dict(dc_row)

        # Fetch actual PO Date from purchase_orders
        po_date_row = db.execute(
            "SELECT po_date FROM purchase_orders WHERE po_number = ?",
            (dc_dict["po_number"],),
        ).fetchone()
        actual_po_date = po_date_row[0] if po_date_row else None

        # INVARIANT: DC-2 - Check if DC already has invoice (1-DC-1-Invoice constraint)
        # This is CRITICAL - a DC can only be invoiced ONCE
        existing_invoice = check_dc_already_invoiced(dc_number, db)
        if existing_invoice:
            error_msg = f"Cannot create invoice: Delivery Challan {dc_number} has already been invoiced (Invoice Number: {existing_invoice}). Each DC can only be linked to one invoice."
            logger.warning(f"Duplicate invoice attempt blocked: {error_msg}")
            raise ConflictError(
                error_msg,
                details={
                    "dc_number": dc_number,
                    "existing_invoice_number": existing_invoice,
                    "invariant": "DC-2 (One DC → One Invoice)",
                    "action": "Please use a different DC or modify the existing invoice",
                },
            )

        # INVARIANT: INV-1 - Check for duplicate invoice number
        if check_invoice_number_exists(invoice_number, db):
            raise ConflictError(
                f"Invoice number {invoice_number} already exists",
                details={"invoice_number": invoice_number, "invariant": "INV-1"},
            )

        # Fetch DC items and header
        dc_items, dc_header = fetch_dc_items(dc_number, db)

        if not dc_items or len(dc_items) == 0:
            raise ValidationError(f"DC {dc_number} has no items")

        # INVARIANT: INV-2 - Calculate totals (backend is source of truth)
        invoice_items = []
        total_taxable = 0.0
        total_cgst = 0.0
        total_sgst = 0.0
        total_amount = 0.0

        # Prepare overrides map for O(1) lookup
        # key: str(lot_no) -> item dict
        overrides = {}
        if invoice_data.get("items"):
            for item in invoice_data["items"]:
                # Pydantic model conversion to dict might have happened already if `invoice_data` is dict
                # If using .dict(), it's a dict.
                if isinstance(item, dict):
                    overrides[str(item.get("po_sl_no"))] = item
                else:
                    # If it's an object (shouldn't be if request.dict() was called)
                    overrides[str(item.po_sl_no)] = item

        # INVARIANT: INV-2 - Calculate totals (backend is source of truth)
        invoice_items = []
        total_taxable = 0.0
        total_cgst = 0.0
        total_sgst = 0.0
        total_amount = 0.0

        for dc_item in dc_items:
            lot_no_str = str(dc_item["lot_no"] or "")

            # Default values from DC
            qty = dc_item["dispatch_qty"]
            rate = dc_item["po_rate"]

            # Apply Override if exists
            if lot_no_str in overrides:
                override_item = overrides[lot_no_str]
                # Allow overriding Quantity and Rate
                # We trust the user edits here, provided they are within reason (?)
                # For now, we trust the "Unlock" requirement explicitly.
                override_qty = override_item.get("quantity")
                override_rate = override_item.get("rate")

                if override_qty is not None:
                    qty = to_qty(override_qty)
                if override_rate is not None:
                    rate = float(override_rate)

            if qty <= 0:
                continue

            taxable_value = round(qty * rate, 2)

            tax_calc = calculate_tax(taxable_value)

            invoice_items.append(
                {
                    "po_sl_no": str(dc_item.get("po_item_no") or dc_item.get("lot_no") or ""),
                    "description": dc_item["description"] or "",
                    "hsn_sac": dc_item["hsn_code"] or "",
                    "quantity": qty,
                    "unit": "NO",
                    "rate": rate,
                    "taxable_value": taxable_value,
                    "cgst_rate": 9.0,
                    "cgst_amount": tax_calc["cgst_amount"],
                    "sgst_rate": 9.0,
                    "sgst_amount": tax_calc["sgst_amount"],
                    "igst_rate": 0.0,
                    "igst_amount": 0.0,
                    "total_amount": tax_calc["total_amount"],
                }
            )

            total_taxable += taxable_value
            total_cgst += tax_calc["cgst_amount"]
            total_sgst += tax_calc["sgst_amount"]
            total_amount += tax_calc["total_amount"]

        # INVARIANT: R-02 - Server-Side Totals Enforcement
        # We explicitly IGNORE any totals sent from the frontend to prevent tampering.
        # However, for audit purposes, if the frontend provided a total that deviates significantly, we log it.
        frontend_total = invoice_data.get("total_invoice_value")
        if frontend_total is not None and abs(float(frontend_total) - total_amount) > 1.0:
            logger.warning(
                f"SECURITY: Frontend/Backend mismatch for Inv {invoice_number}. "
                f"Frontend: {frontend_total}, Backend: {total_amount}. Using Backend value."
            )
            # We naturally proceed using 'total_amount' (Backend Truth), effectively enforcing the rule.

        # Mapping DC fields to Invoice
        inv_header = {
            "buyer_name": invoice_data.get("buyer_name") or dc_header.get("consignee_name"),
            "buyer_gstin": invoice_data.get("buyer_gstin") or dc_header.get("consignee_gstin"),
            "buyer_address": invoice_data.get("buyer_address")
            or dc_header.get("consignee_address"),
            "po_numbers": str(
                invoice_data.get("buyers_order_no") or dc_header.get("po_number", "")
            ),
            "buyers_order_date": invoice_data.get("buyers_order_date") or actual_po_date,
            "vehicle_no": invoice_data.get("vehicle_no") or dc_header.get("vehicle_no"),
            "transporter": invoice_data.get("transporter") or dc_header.get("transporter"),
            "lr_no": invoice_data.get("lr_no") or dc_header.get("lr_no"),
        }

        # Insert invoice header
        db.execute(
            """
            INSERT INTO gst_invoices (
                invoice_number, invoice_date, dc_number, financial_year,
                buyer_name, buyer_gstin, buyer_address,
                po_numbers, buyers_order_date,
                gemc_number, gemc_date, mode_of_payment, payment_terms,
                despatch_doc_no, srv_no, srv_date,
                vehicle_no, lr_no, transporter, destination, terms_of_delivery,
                buyer_state, buyer_state_code,
                taxable_value, cgst, sgst, igst, total_invoice_value
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
            (
                invoice_number,
                invoice_date,
                dc_number,
                fy,
                inv_header["buyer_name"],
                inv_header["buyer_gstin"],
                inv_header["buyer_address"],
                inv_header["po_numbers"],
                inv_header["buyers_order_date"],
                invoice_data.get("gemc_number"),
                invoice_data.get("gemc_date"),
                invoice_data.get("mode_of_payment"),
                invoice_data.get("payment_terms", "45 Days"),
                invoice_data.get("despatch_doc_no"),
                invoice_data.get("srv_no"),
                invoice_data.get("srv_date"),
                inv_header["vehicle_no"],
                inv_header["lr_no"],
                inv_header["transporter"],
                invoice_data.get("destination"),
                invoice_data.get("terms_of_delivery"),
                invoice_data.get("buyer_state"),
                invoice_data.get("buyer_state_code"),
                total_taxable,
                total_cgst,
                total_sgst,
                0.0,
                total_amount,
            ),
        )

        # Insert invoice items
        for item in invoice_items:
            db.execute(
                """
                INSERT INTO gst_invoice_items (
                    id, invoice_number, description, quantity, unit, rate, 
                    taxable_value, cgst_amount, sgst_amount, 
                    igst_amount, total_amount, po_sl_no, hsn_sac
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
                (
                    str(uuid.uuid4()),
                    invoice_number,
                    item["description"],
                    item["quantity"],
                    item["unit"],
                    item["rate"],
                    item["taxable_value"],
                    item["cgst_amount"],
                    item["sgst_amount"],
                    item["igst_amount"],
                    item["total_amount"],
                    item["po_sl_no"],  # CRITICAL: Required for PO linking
                    item["hsn_sac"],  # CRITICAL: Required for Tax
                ),
            )

        # DC-Invoice link is now stored directly in gst_invoices.dc_number

        logger.info(
            f"Successfully created invoice {invoice_number} from DC {dc_number} with {len(invoice_items)} items"
        )

        return ServiceResult.ok(
            {
                "success": True,
                "invoice_number": invoice_number,
                "total_amount": total_amount,
                "items_count": len(invoice_items),
            }
        )

    except (ValidationError, ResourceNotFoundError, ConflictError):
        # Domain errors - let them propagate
        raise
    except Exception as e:
        # Unexpected errors
        logger.error(f"Failed to create invoice: {e}", exc_info=True)
        return ServiceResult.fail(
            error_code=ErrorCode.INTERNAL_ERROR,
            message=f"Failed to create invoice: {str(e)}",
        )

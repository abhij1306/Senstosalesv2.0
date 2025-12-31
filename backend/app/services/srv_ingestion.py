"""
SRV Ingestion Service
Validates and inserts SRV data into the database.
"""

import sqlite3
from datetime import datetime
from typing import Dict, List, Optional, Tuple
from app.core.number_utils import to_float, to_int, to_qty

from app.services.srv_scraper import scrape_srv_html


def validate_srv_data(srv_data: Dict, db: sqlite3.Connection) -> Tuple[bool, str, bool]:
    """
    Validate SRV data before database insertion.

    Args:
        srv_data: Parsed SRV data from scraper
        db: Database session

    Returns:
        (is_valid: bool, message: str, po_found: bool)
    """
    header = srv_data.get("header", {})
    items = srv_data.get("items", [])

    # Required header fields
    if not header.get("srv_number"):
        return False, "Missing required field: SRV number", False

    if not header.get("po_number"):
        return False, "Missing required field: PO number", False

    if not header.get("srv_date"):
        return False, "Missing required field: SRV date", False

    # Remove existence check here as we handle overwrite in process_srv_file
    # existing_srv = db.execute(...)

    # Check if PO exists - STRICT ERROR as per user request
    po_exists = db.execute(
        "SELECT 1 FROM purchase_orders WHERE po_number = :po_number",
        {"po_number": header["po_number"]},
    ).fetchone()

    if not po_exists:
        # SRV-1: Strict PO Linkage Required.
        return False, f"Strict Error: PO {header['po_number']} not found. SRV cannot be processed without an existing PO.", False

    po_found = True

    # Validate items
    if not items or len(items) == 0:
        return False, "SRV must have at least one item", po_found

    # Validate each item
    for idx, item in enumerate(items):
        # Validate quantities (always, regardless of PO existence)
        received_qty = to_qty(item.get("received_qty", 0))
        rejected_qty = to_qty(item.get("rejected_qty", 0))
        accepted_qty = to_qty(item.get("accepted_qty", 0))

        if received_qty < 0:
            return (
                False,
                f"Item {idx + 1}: Received quantity cannot be negative",
                po_found,
            )

        if rejected_qty < 0:
            return (
                False,
                f"Item {idx + 1}: Rejected quantity cannot be negative",
                po_found,
            )

        if accepted_qty < 0:
            return (
                False,
                f"Item {idx + 1}: Accepted quantity cannot be negative",
                po_found,
            )

        # Enforce accounting invariant: Received = Accepted + Rejected
        # Using 0.001 tolerance for fractional quantities
        calculated_accepted = received_qty - rejected_qty
        if accepted_qty > 0 and abs(accepted_qty - calculated_accepted) > 0.001:
            return (
                False,
                f"Item {idx + 1}: Accounting invariant violated. Accepted ({accepted_qty}) must equal Received ({received_qty}) - Rejected ({rejected_qty}) = {calculated_accepted}",
                po_found,
            )

        if not item.get("po_item_no"):
             return False, f"Item {idx + 1}: Missing PO item number", po_found

        # Check if PO item exists
        po_item_exists = db.execute(
            """
            SELECT id, ord_qty, delivered_qty, pending_qty FROM purchase_order_items 
            WHERE po_number = :po_number AND po_item_no = :po_item_no
        """,
            {"po_number": header["po_number"], "po_item_no": item["po_item_no"]},
        ).fetchone()

        if not po_item_exists:
            return (
                False,
                f"Item {idx + 1}: PO item number {item['po_item_no']} not found in PO {header['po_number']}",
                po_found,
            )

        # INVARIANT: SRV-2 - Received quantity cannot exceed DC Dispatch quantity
        challan_no = item.get("challan_no")
        # received_qty already defined
        
        if challan_no:
            dc_item = db.execute(
                """
                SELECT dispatch_qty FROM delivery_challan_items 
                WHERE dc_number = ? AND po_item_id = (
                    SELECT id FROM purchase_order_items 
                    WHERE po_number = ? AND po_item_no = ?
                )
            """,
                (challan_no, header["po_number"], item["po_item_no"]),
            ).fetchone()

            if dc_item:
                dispatched_qty = dc_item[0]
                if received_qty > dispatched_qty + 0.001:
                    return (
                        False,
                        f"Item {idx + 1}: Received quantity ({received_qty}) exceeds DC {challan_no} dispatched quantity ({dispatched_qty})",
                        po_found,
                    )

    return True, "Valid", po_found


def ingest_srv_to_db(
    srv_data: Dict, db: sqlite3.Connection, po_found: bool = True
) -> bool:
    """
    Insert SRV data into database with transaction safety.
    Also updates PO item quantities with received and rejected quantities from SRV.

    Args:
        srv_data: Validated SRV data
        db: Database session
        po_found: Whether the referenced PO exists in database

    Returns:
       bool: Success status

    Raises:
        Exception: If database operation fails
    """
    header = srv_data["header"]
    items = srv_data["items"]

    try:
        # 1. Insert NEW SRV header (Soft Delete logic removed as duplicates are rejected)
        db.execute(
            """
            INSERT INTO srvs (srv_number, srv_date, po_number, invoice_number, is_active, created_at, updated_at)
            VALUES (:srv_number, :srv_date, :po_number, :invoice_number, 1, :created_at, :updated_at)
        """,
            {
                "srv_number": header["srv_number"],
                "srv_date": header["srv_date"],
                "po_number": header["po_number"],
                "invoice_number": items[0].get("invoice_no") if items and items[0].get("invoice_no") else None,
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat(),
            },
        )

        # 2. Insert SRV items
        for item in items:
            # Enforce accounting invariant: Received = Accepted + Rejected
            received_qty = to_qty(item.get("received_qty", 0))
            rejected_qty = to_qty(item.get("rejected_qty", 0))
            accepted_qty = to_qty(item.get("accepted_qty", 0))

            if accepted_qty == 0 and received_qty > 0:
                accepted_qty = max(0, received_qty - rejected_qty)

            db.execute(
                """
                INSERT INTO srv_items 
                (srv_number, po_number, po_item_no, lot_no, received_qty, rejected_qty, 
                 challan_no, created_at)
                VALUES 
                (:srv_number, :po_number, :po_item_no, :lot_no, :received_qty, :rejected_qty,
                 :challan_no, :created_at)
            """,
                {
                    "srv_number": header["srv_number"],
                    "po_number": header["po_number"],
                    "po_item_no": item["po_item_no"],
                    "lot_no": item.get("lot_no"),
                    "received_qty": received_qty,
                    "rejected_qty": rejected_qty,
                    "challan_no": item.get("challan_no"),
                    "created_at": datetime.now().isoformat(),
                },
            )


        # 3. ATOMIC SYNC: Reconciliation Service
        from app.services.reconciliation_service import ReconciliationService
        
        # We process all items for reconciliation
        # Note: reconcile_srv_ingestion handles:
        # 1. Update DC Item (received/accepted/rejected)
        # 2. Update Lot Level (purchase_order_deliveries: received_qty)
        # 3. Update Item Level (purchase_order_items: rcd_qty, rejected_qty) - replacing the manual update below
        
        if po_found:
            ReconciliationService.reconcile_srv_ingestion(
                db, items, header["srv_number"], header["po_number"]
            )

        # 4. Commit transaction
        db.commit()
        return True

    except Exception as e:
        db.rollback()
        raise e


def get_srv_aggregated_quantities(po_number: str, db: sqlite3.Connection) -> Dict:
    """
    Get aggregated received and rejected quantities per PO item from all SRVs.

    Args:
        po_number: PO number
        db: Database connection

    Returns:
        dict: {po_item_no: {"received_qty": float, "rejected_qty": float}}
    """
    result = db.execute(
        """
        SELECT 
            po_item_no,
            SUM(received_qty) as total_received,
            SUM(rejected_qty) as total_rejected
        FROM srv_items
        WHERE po_number = :po_number
        GROUP BY po_item_no
    """,
        {"po_number": po_number},
    ).fetchall()

    aggregated = {}
    for row in result:
        aggregated[row[0]] = {
            "received_qty": float(row[1] or 0),
            "rejected_qty": float(row[2] or 0),
        }

    return aggregated


def process_srv_file(
    contents: bytes,
    filename: str,
    db: sqlite3.Connection,
    po_from_filename: Optional[str] = None,
) -> Tuple[bool, List[str], int, int]:
    """
    Process an uploaded SRV HTML file.
    Parses content, validates against DB, and ingests if valid.
    Handles files containing multiple SRVs.
    """
    import hashlib

    file_hash = hashlib.sha256(contents).hexdigest()

    try:
        html_content = contents.decode("utf-8")
        srv_list = scrape_srv_html(html_content)

        if not srv_list:
            return False, ["No valid SRVs found in file"], 0, 0

        results = []
        for srv_data in srv_list:
            header = srv_data.get("header", {})
            header["file_hash"] = file_hash  # Inject hash

            # Check for exact duplicate file upload (Idempotency)
            # User requested Overwrite instead of Skip.
            # So we check if SRV exists, and if so, delete it before re-ingesting.

            existing_srv = db.execute(
                "SELECT 1 FROM srvs WHERE srv_number = :srv_number",
                {"srv_number": header.get("srv_number")},
            ).fetchone()

            if existing_srv:
                # Delete existing SRV to allow overwrite
                # This handles rollback of quantities from PO items implicitly in delete_srv
                delete_srv(header.get("srv_number"), db)

            # If PO extraction failed from HTML, try filename fallback
            if not header.get("po_number") and po_from_filename:
                header["po_number"] = str(po_from_filename)

            # Validate
            is_valid, message, po_found = validate_srv_data(srv_data, db)

            # Add po_found status to header for ingestion
            header["po_found"] = po_found
            if not po_found:
                header["warning_message"] = message

            if not is_valid:
                results.append(
                    {
                        "success": False,
                        "srv_number": header.get("srv_number", "Unknown"),
                        "error": message,
                    }
                )
                continue

            # Ingest
            try:
                ingest_srv_to_db(srv_data, db, po_found)
                
                status_msg = "Updated (Overwritten)" if existing_srv else "Created"
                if message != "Valid":
                     status_msg += f" - {message}"

                results.append(
                    {
                        "success": True,
                        "srv_number": header.get("srv_number"),
                        "warnings": [status_msg] if not po_found else [status_msg], # Pass status as warning for UI visibility
                        "status": status_msg
                    }
                )
            except Exception as e:
                print(f"Error ingesting SRV {header.get('srv_number')}: {e}")
                results.append(
                    {
                        "success": False,
                        "srv_number": header.get("srv_number", "Unknown"),
                        "error": str(e),
                    }
                )

        # Summarize results
        success_count = sum(1 for r in results if r["success"])

        all_messages = []
        for r in results:
            prefix = f"SRV {r['srv_number']}: "
            if r["success"]:
                if r.get("warnings"):
                    all_messages.append(
                        f"{prefix}Success (Warning: {r['warnings'][0]})"
                    )
                else:
                    all_messages.append(f"{prefix}Success")
            else:
                all_messages.append(f"{prefix}Failed: {r['error']}")

        failed_count = sum(1 for r in results if not r["success"])

        if success_count > 0:
            return True, all_messages, success_count, failed_count
        else:
            return False, all_messages, 0, failed_count

    except Exception as e:
        print(f"Error processing SRV file {filename}: {e}")
        import traceback

        traceback.print_exc()
        return False, [str(e)]


def delete_srv(srv_number: str, db: sqlite3.Connection) -> Tuple[bool, str]:
    """
    Delete an SRV (Hard Delete) and rollback quantities.

    Strategy:
    1. Identify affected PO items.
    2. Permanently DELETE srv_items and srvs records.
    3. Recalculate 'rcd_qty' and 'rejected_qty' for affected PO items
       by summing up remaining SRV items.

    Args:
        srv_number: SRV number to delete
        db: Database connection

    Returns:
        (success: bool, message: str)
    """
    try:
        # 1. Get affected PO items before deleting
        affected_items = db.execute(
            """
            SELECT DISTINCT po_number, po_item_no 
            FROM srv_items 
            WHERE srv_number = :srv_number
        """,
            {"srv_number": srv_number},
        ).fetchall()

        if not affected_items:
            # Check if SRV exists even without items (edge case)
            srv_exists = db.execute(
                "SELECT 1 FROM srvs WHERE srv_number = :srv", {"srv": srv_number}
            ).fetchone()
            if not srv_exists:
                return False, f"SRV {srv_number} not found"

        # 2. ATOMIC SYNC: Revert quantities BEFORE deletion
        from app.services.reconciliation_service import ReconciliationService
        ReconciliationService.reconcile_srv_deletion(db, srv_number)

        # 3. Hard Delete SRV Items first (FK constraint safety)
        db.execute(
            "DELETE FROM srv_items WHERE srv_number = :srv_number",
            {"srv_number": srv_number},
        )

        # 4. Hard Delete SRV Header
        db.execute(
            "DELETE FROM srvs WHERE srv_number = :srv_number",
            {"srv_number": srv_number},
        )

        db.commit()
        return True, f"SRV {srv_number} has been permanently deleted"

    except Exception as e:
        db.rollback()
        return False, f"Failed to delete SRV: {str(e)}"

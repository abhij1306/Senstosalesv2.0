"""
Reconciliation Service (Triangle of Truth)
Centralizes all atomic quantity updates across PO -> DC -> SRV.
Enforces the "Triangle of Truth" logic to ensure data consistency.
"""

import logging
import sqlite3
from typing import Dict, List, Optional

from backend.core.number_utils import to_qty

logger = logging.getLogger(__name__)


class ReconciliationService:
    @staticmethod
    def _recalculate_delivery_status(
        db: sqlite3.Connection,
        po_item_id: str,
        lot_no: Optional[int] = None,
        exclude_dc_number: Optional[str] = None,
        exclude_srv_number: Optional[str] = None,
    ) -> None:
        """
        Helper: Recalculates delivered_qty and rcd_qty based on actual DC and SRV records.
        Enforces De-coupled Status: Delivered = Total Dispatched.
        Updates both Lot Level and Item Level.

        Args:
            db: The SQLite database connection.
            po_item_id: The ID of the purchase order item.
            lot_no: Optional lot number for lot-specific recalculation. If None, all lots are recalculated.
            exclude_dc_number: If provided, quantities from this DC will be excluded from dispatch calculations.
            exclude_srv_number: If provided, quantities from this SRV will be excluded from received/rejected calculations.
        """
        # Fetch PO Item Details
        po_info = db.execute(
            "SELECT po_number, po_item_no, ord_qty, manual_delivered_qty, rcd_qty FROM purchase_order_items WHERE id = ?",
            (po_item_id,),
        ).fetchone()
        if not po_info:
            return
        po_num, po_item_num, item_ord, item_manual, _ = (
            po_info[0],
            po_info[1],
            to_qty(po_info[2]),
            to_qty(po_info[3]),
            to_qty(po_info[4]),
        )

        # 1. Update Lot Levels
        lots = db.execute(
            """
            SELECT id, lot_no, dely_qty, manual_override_qty, received_qty 
            FROM purchase_order_deliveries 
            WHERE po_item_id = ? 
            ORDER BY lot_no ASC
        """,
            (po_item_id,),
        ).fetchall()

        # Calculate Total Item-Level Quantities for potential distribution
        # Total Dispatched across all lots
        dispatch_query = (
            "SELECT COALESCE(SUM(dispatch_qty), 0) FROM delivery_challan_items WHERE po_item_id = ?"
        )
        dispatch_params = [po_item_id]
        if exclude_dc_number:
            dispatch_query += " AND dc_number != ?"
            dispatch_params.append(exclude_dc_number)
        # total_item_dispatch = to_qty(db.execute(dispatch_query, dispatch_params).fetchone()[0]) (Unused)

        # Shared Received (where lot_no is NULL or 0)
        shared_srv_query = (
            "SELECT COALESCE(SUM(received_qty), 0) FROM srv_items "
            "WHERE po_number = ? AND po_item_no = ? AND (lot_no IS NULL OR lot_no = 0)"
        )
        shared_srv_params = [po_num, po_item_num]
        if exclude_srv_number:
            shared_srv_query += " AND srv_number != ?"
            shared_srv_params.append(exclude_srv_number)
        remaining_shared_received = to_qty(
            db.execute(shared_srv_query, shared_srv_params).fetchone()[0]
        )

        # Shared Dispatched (where lot_no is NULL or 0)
        shared_dispatch_query = (
            "SELECT COALESCE(SUM(dispatch_qty), 0) FROM delivery_challan_items "
            "WHERE po_item_id = ? AND (lot_no IS NULL OR lot_no = 0)"
        )
        shared_dispatch_params = [po_item_id]
        if exclude_dc_number:
            shared_dispatch_query += " AND dc_number != ?"
            shared_dispatch_params.append(exclude_dc_number)
        remaining_shared_dispatch = to_qty(
            db.execute(shared_dispatch_query, shared_dispatch_params).fetchone()[0]
        )

        for lot in lots:
            l_id, l_no, l_ord, l_manual, l_existing_recd = lot[0], lot[1], to_qty(lot[2]), to_qty(lot[3]), to_qty(lot[4])

            # 1. Direct Receipt for this lot
            direct_srv_query = "SELECT COALESCE(SUM(received_qty), 0) FROM srv_items WHERE po_number = ? AND po_item_no = ? AND lot_no = ?"
            direct_srv_params = [po_num, po_item_num, l_no]
            if exclude_srv_number:
                direct_srv_query += " AND srv_number != ?"
                direct_srv_params.append(exclude_srv_number)
            l_direct_received = to_qty(
                db.execute(direct_srv_query, direct_srv_params).fetchone()[0]
            )

            # 2. Direct Dispatch for this lot
            direct_dispatch_query = "SELECT COALESCE(SUM(dispatch_qty), 0) FROM delivery_challan_items WHERE po_item_id = ? AND lot_no = ?"
            direct_dispatch_params = [po_item_id, l_no]
            if exclude_dc_number:
                direct_dispatch_query += " AND dc_number != ?"
                direct_dispatch_params.append(exclude_dc_number)
            l_direct_dispatch = to_qty(
                db.execute(direct_dispatch_query, direct_dispatch_params).fetchone()[0]
            )

            # 2.5 Invoiced Quantity for this lot (HWM Signal)
            invoiced_query = """
                SELECT COALESCE(SUM(gii.quantity), 0)
                FROM gst_invoice_items gii
                JOIN gst_invoices gi ON gii.invoice_number = gi.invoice_number
                WHERE gii.po_item_id = ? AND gii.po_sl_no = ?
            """
            l_invoiced = to_qty(db.execute(invoiced_query, (po_item_id, l_no)).fetchone()[0])

            # 3. Add Shared quantities to fill up to ordered amount
            l_remaining_capacity_rcd = max(0, l_ord - l_direct_received)
            l_shared_received_share = min(remaining_shared_received, l_remaining_capacity_rcd)
            remaining_shared_received -= l_shared_received_share

            l_remaining_capacity_dsp = max(0, l_ord - l_direct_dispatch)
            l_shared_dispatch_share = min(remaining_shared_dispatch, l_remaining_capacity_dsp)
            remaining_shared_dispatch -= l_shared_dispatch_share

            # Final quantities for lot
            l_system_received = l_direct_received + l_shared_received_share
            l_system_dispatched = l_direct_dispatch + l_shared_dispatch_share

            # If there's surplus shared qty, add it to the last lot
            if lot == lots[-1]:
                l_system_received += remaining_shared_received
                l_system_dispatched += remaining_shared_dispatch

            # HIGH WATER MARK (HWM) LOGIC:
            # - Received HWM: MAX(Physical Receipt, Invoiced Quantity, Existing Ingested Quantity)
            # - Delivered HWM: MAX(Physical Dispatch, Received HWM, Invoiced Quantity, Manual Override)
            l_received = max(l_system_received, l_invoiced, l_existing_recd)
            l_delivered = max(l_system_dispatched, l_received, l_manual)

            db.execute(
                """
                UPDATE purchase_order_deliveries
                SET delivered_qty = ?, received_qty = ?
                WHERE po_item_id = ? AND lot_no = ?
            """,
                (l_delivered, l_received, po_item_id, l_no),
            )

            # NEW: Distribute received/accepted/rejected qty to Delivery Challan Items for this lot
            # This ensures "Total Receipt" is correctly reflected in DC List/Detail views even without challan_no
            l_total_received = to_qty(db.execute(
                "SELECT COALESCE(SUM(received_qty), 0) FROM srv_items "
                "WHERE po_number = ? AND po_item_no = ? AND lot_no = ?",
                (po_num, po_item_num, l_no)
            ).fetchone()[0])
            
            l_total_rejected = to_qty(db.execute(
                "SELECT COALESCE(SUM(rejected_qty), 0) FROM srv_items "
                "WHERE po_number = ? AND po_item_no = ? AND lot_no = ?",
                (po_num, po_item_num, l_no)
            ).fetchone()[0])

            dc_items = db.execute(
                """
                SELECT dci.id, dci.dispatch_qty 
                FROM delivery_challan_items dci
                JOIN delivery_challans dc ON dci.dc_number = dc.dc_number
                WHERE dci.po_item_id = ? AND dci.lot_no = ?
                ORDER BY dc.created_at ASC, dci.id ASC
            """,
                (po_item_id, l_no),
            ).fetchall()

            rem_rcd = l_total_received
            rem_rejd = l_total_rejected
            
            for dci_id, dci_dispatch in dc_items:
                share_rcd = min(rem_rcd, dci_dispatch)
                share_rejd = min(rem_rejd, share_rcd)
                share_acc = max(0, share_rcd - share_rejd)
                
                db.execute(
                    """
                    UPDATE delivery_challan_items 
                    SET received_qty = ?, accepted_qty = ?, rejected_qty = ? 
                    WHERE id = ?
                    """,
                    (share_rcd, share_acc, share_rejd, dci_id),
                )
                rem_rcd -= share_rcd
                rem_rejd -= share_rejd

        # 2. Update Item Level (Aggregated as SUM of Lots)
        totals = db.execute(
            """
            SELECT 
                SUM(delivered_qty) as total_dlv,
                SUM(received_qty) as total_rcd,
                SUM(dely_qty) as total_ord
            FROM purchase_order_deliveries
            WHERE po_item_id = ?
        """,
            (po_item_id,),
        ).fetchone()

        # Final Item-Level Delivered: MAX(SUM(Lot DLVs), Item-Level Manual)
        # Rule: Manual overrides only if ord > recd.
        item_system_dlv = to_qty(totals["total_dlv"])
        total_received = to_qty(totals["total_rcd"])

        if item_ord > total_received:
            item_delivered = max(item_system_dlv, item_manual)
        else:
            item_delivered = item_system_dlv

        # Calculate Total Rejected for Item (from SRVs)
        total_rejected = to_qty(
            db.execute(
                "SELECT COALESCE(SUM(rejected_qty), 0) FROM srv_items WHERE po_number = ? AND po_item_no = ?",
                (po_num, po_item_num),
            ).fetchone()[0]
        )

        db.execute(
            """
            UPDATE purchase_order_items
            SET delivered_qty = ?, rcd_qty = ?, rejected_qty = ?
            WHERE id = ?
        """,
            (item_delivered, total_received, total_rejected, po_item_id),
        )

        # logger.debug(f"Recalculated Item {po_item_id}: Del={item_delivered} (Disp={total_dispatch}, Rec={total_received})")

    @staticmethod
    def reconcile_dc_creation(db: sqlite3.Connection, items: List[Dict], dc_number: str) -> None:
        """
        Atomically updates quantities when a DC is created.
        """
        try:
            # Collect unique po_item_id and lot_no combinations to recalculate
            items_to_recalculate = set()  # Stores (po_item_id, lot_no)
            for item in items:
                po_item_id = item["po_item_id"]
                lot_no = item.get("lot_no")
                items_to_recalculate.add((po_item_id, lot_no))

            for po_item_id, lot_no in items_to_recalculate:
                ReconciliationService._recalculate_delivery_status(db, po_item_id, lot_no)

            logger.info(f"Reconciled quantities for DC Creation: {dc_number}")

        except Exception as e:
            logger.error(f"Failed to reconcile DC creation for {dc_number}: {e}")
            raise

    @staticmethod
    def reconcile_dc_deletion(db: sqlite3.Connection, dc_number: str) -> None:
        """
        Atomically reverts quantities when a DC is deleted.
        Atomically reverts 'delivered_qty' when a DC is deleted.
        Must be called BEFORE the DC items are physically deleted.
        """
        try:
            # We fetch items to know WHAT to reconcile
            items = db.execute(
                """
                SELECT po_item_id, lot_no, dispatch_qty 
                FROM delivery_challan_items 
                WHERE dc_number = ?
            """,
                (dc_number,),
            ).fetchall()

            for row in items:
                po_item_id = row[0]
                lot_no = row[1]
                # dispatch_qty = row[2] (Unused)

                # Recalculate delivery status, excluding the current DC to simulate deletion
                ReconciliationService._recalculate_delivery_status(
                    db, po_item_id, lot_no, exclude_dc_number=dc_number
                )

            logger.info(f"Reconciled quantities for DC Deletion: {dc_number}")

        except Exception as e:
            logger.error(f"Failed to reconcile DC deletion for {dc_number}: {e}")
            raise

    @staticmethod
    def reconcile_srv_ingestion(
        db: sqlite3.Connection, srv_items: List[Dict], srv_number: str, po_number: str
    ) -> None:
        """
        Atomically updates 'received_qty' across the chain.
        """
        try:
            for item in srv_items:
                po_item_no = item["po_item_no"]
                lot_no = item.get("lot_no")
                # delivered = to_qty(item.get("dispatch_qty") or 0)
                received = to_qty(item.get("received_qty") or 0)
                rejected = to_qty(item.get("rejected_qty") or 0)
                accepted = received - rejected
                challan_no = item.get("challan_no")

                po_item_row = db.execute(
                    "SELECT id FROM purchase_order_items WHERE po_number = ? AND po_item_no = ?",
                    (po_number, po_item_no),
                ).fetchone()
                if not po_item_row:
                    continue
                po_item_id = po_item_row[0]

                # 1. Update DC Item Level
                if challan_no:
                    db.execute(
                        """
                        UPDATE delivery_challan_items
                        SET received_qty = received_qty + ?, 
                            accepted_qty = accepted_qty + ?, 
                            rejected_qty = rejected_qty + ?
                        WHERE dc_number = ? AND po_item_id = ? 
                        AND (lot_no = ? OR ? IS NULL)
                    """,
                        (received, accepted, rejected, challan_no, po_item_id, lot_no, lot_no),
                    )

                # 2. Update Lot Level (for received_qty only, delivered checked by recalc)
                if lot_no:
                    db.execute(
                        "UPDATE purchase_order_deliveries SET received_qty = received_qty + ? "
                        "WHERE po_item_id = ? AND lot_no = ?",
                        (received, po_item_id, lot_no),
                    )

                # 3. Recalculate Item/Lot Delivery Status (High Water Mark)
                ReconciliationService._recalculate_delivery_status(db, po_item_id, lot_no)

            logger.info(f"Reconciled quantities for SRV Ingestion: {srv_number}")

        except Exception as e:
            logger.error(f"Failed to reconcile SRV ingestion for {srv_number}: {e}")
            raise

    @staticmethod
    def reconcile_srv_deletion(db: sqlite3.Connection, srv_number: str) -> None:
        """
        Atomically reverts quantities when an SRV is deleted.
        """
        try:
            items = db.execute(
                "SELECT po_item_no, lot_no, received_qty, rejected_qty, challan_no, po_number FROM srv_items WHERE srv_number = ?",
                (srv_number,),
            ).fetchall()

            for row in items:
                po_item_no, lot_no, received_qty, rejected_qty, challan_no, po_number = row

                po_item_row = db.execute(
                    "SELECT id FROM purchase_order_items WHERE po_number = ? AND po_item_no = ?",
                    (po_number, po_item_no),
                ).fetchone()
                if not po_item_row:
                    continue
                po_item_id = po_item_row[0]
                accepted_qty = max(0, received_qty - rejected_qty)

                # 1. Revert DC Item Level
                if challan_no:
                    db.execute(
                        """
                        UPDATE delivery_challan_items
                        SET received_qty = MAX(0, received_qty - ?), accepted_qty = MAX(0, accepted_qty - ?), rejected_qty = MAX(0, rejected_qty - ?)
                        WHERE dc_number = ? AND po_item_id = ? AND (lot_no = ? OR ? IS NULL)
                    """,
                        (
                            received_qty,
                            accepted_qty,
                            rejected_qty,
                            challan_no,
                            po_item_id,
                            lot_no,
                            lot_no,
                        ),
                    )

                # 2. Revert Lot Level
                if lot_no:
                    db.execute(
                        "UPDATE purchase_order_deliveries SET received_qty = MAX(0, received_qty - ?) WHERE po_item_id = ? AND lot_no = ?",
                        (received_qty, po_item_id, lot_no),
                    )

                # we need to simulate exclusion of THIS srv for recalculation to work if it relies on SUM()
                # Pass exclude_srv_number logic to helper?
                # Helper uses srv_items table.
                ReconciliationService._recalculate_delivery_status(
                    db, po_item_id, lot_no, exclude_srv_number=srv_number
                )

            logger.info(f"Reconciled quantities for SRV Deletion: {srv_number}")

        except Exception as e:
            logger.error(f"Failed to reconcile SRV deletion for {srv_number}: {e}")
            raise

    @staticmethod
    def sync_po(db: sqlite3.Connection, po_number: str) -> None:
        """
        TOT-5: Full PO Reconciliation Sync.
        MUST be called after any batch operation (Upload, Amendment).
        Iterates all items in the PO and recalculates delivery status (HWM).
        """
        try:
            # Get all item IDs for this PO
            items = db.execute(
                "SELECT id FROM purchase_order_items WHERE po_number = ?", (po_number,)
            ).fetchall()

            count = 0
            for row in items:
                po_item_id = row[0]
                # Recalculate Item Status (High Water Mark)
                # This handles both Item and Lot levels internally
                ReconciliationService._recalculate_delivery_status(db, po_item_id)
                count += 1

            logger.info(f"TOT-5: Synced PO {po_number} - Reconciled {count} items.")

        except Exception as e:
            logger.error(f"Failed to sync PO {po_number}: {e}")
            raise

    @staticmethod
    def sync_po_status(db: sqlite3.Connection, po_number: str) -> None:
        """
        Updates the po_status for a Purchase Order based on its items' progress.
        Logic:
        - Closed: All items are fully received (rcd_qty >= ord_qty).
        - Delivered: All items are fully dispatched (delivered_qty >= ord_qty) but not all received.
        - Pending: Some items have activity (delivered_qty > 0 or rcd_qty > 0).
        - Draft: No activity yet.
        """
        try:
            items = db.execute(
                """
                SELECT 
                    id, 
                    ord_qty, 
                    delivered_qty, 
                    rcd_qty 
                FROM purchase_order_items 
                WHERE po_number = ?
            """,
                (po_number,),
            ).fetchall()

            if not items:
                return

            all_received = True
            all_dispatched = True
            any_activity = False

            for item in items:
                ord_qty = to_qty(item["ord_qty"])
                dlv_qty = to_qty(item["delivered_qty"])
                rcd_qty = to_qty(item["rcd_qty"])

                if rcd_qty < ord_qty - 0.001:
                    all_received = False
                if dlv_qty < ord_qty - 0.001:
                    all_dispatched = False
                if dlv_qty > 0 or rcd_qty > 0:
                    any_activity = True

            new_status = "Pending"
            if all_received:
                new_status = "Closed"
            elif all_dispatched:
                new_status = "Delivered"
            elif any_activity:
                new_status = "Pending"

            db.execute(
                "UPDATE purchase_orders SET po_status = ? WHERE po_number = ?",
                (new_status, po_number),
            )
            logger.info(f"Updated status for PO {po_number} to {new_status}")

        except Exception as e:
            logger.error(f"Failed to sync PO status for {po_number}: {e}")
            raise

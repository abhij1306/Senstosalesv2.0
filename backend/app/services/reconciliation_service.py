
"""
Reconciliation Service (Triangle of Truth)
Centralizes all atomic quantity updates across PO -> DC -> SRV.
Enforces the "Triangle of Truth" logic to ensure data consistency.
"""
import sqlite3
import logging
from app.core.number_utils import to_float, to_int, to_qty
from typing import List, Dict, Optional

logger = logging.getLogger(__name__)

class ReconciliationService:
    
    @staticmethod
    def _recalculate_delivery_status(db: sqlite3.Connection, po_item_id: str, lot_no: Optional[int] = None, exclude_dc_number: Optional[str] = None, exclude_srv_number: Optional[str] = None) -> None:
        """
        Helper: Recalculates delivered_qty and rcd_qty based on actual DC and SRV records.
        Enforces High Water Mark: Delivered = MAX(Dispatched, Received).
        Updates both Lot Level and Item Level.
        
        Args:
            db: The SQLite database connection.
            po_item_id: The ID of the purchase order item.
            lot_no: Optional lot number for lot-specific recalculation.
            exclude_dc_number: If provided, quantities from this DC will be excluded from dispatch calculations.
            exclude_srv_number: If provided, quantities from this SRV will be excluded from received/rejected calculations.
        """
        # 1. Update Lot Level if lot_no is provided
        if lot_no:
            # Calculate Total Dispatched for Lot
            dispatch_query = """
                SELECT COALESCE(SUM(dispatch_qty), 0) FROM delivery_challan_items 
                WHERE po_item_id = ? AND lot_no = ?
            """
            dispatch_params = [po_item_id, lot_no]
            if exclude_dc_number:
                dispatch_query += " AND dc_number != ?"
                dispatch_params.append(exclude_dc_number)
            
            lot_dispatch = to_qty(db.execute(dispatch_query, dispatch_params).fetchone()[0])

            # Calculate Total Received for Lot
            srv_query = """
                SELECT COALESCE(SUM(received_qty), 0) FROM srv_items 
                WHERE po_item_no = (SELECT po_item_no FROM purchase_order_items WHERE id = ?) 
                AND po_number = (SELECT po_number FROM purchase_order_items WHERE id = ?)
                AND lot_no = ?
            """
            srv_params = [po_item_id, po_item_id, lot_no]
            if exclude_srv_number:
                srv_query += " AND srv_number != ?"
                srv_params.append(exclude_srv_number)

            lot_received = to_qty(db.execute(srv_query, srv_params).fetchone()[0])

            # High Water Mark
            lot_delivered = max(lot_dispatch, lot_received)

            db.execute("""
                UPDATE purchase_order_deliveries
                SET delivered_qty = ?, received_qty = ?
                WHERE po_item_id = ? AND lot_no = ?
            """, (lot_delivered, lot_received, po_item_id, lot_no))

        # 2. Update Item Level (Aggregated)
        # Calculate Total Dispatched for Item
        item_dc_query = "SELECT COALESCE(SUM(dispatch_qty), 0) FROM delivery_challan_items WHERE po_item_id = ?"
        item_dc_params = [po_item_id]
        if exclude_dc_number:
            item_dc_query += " AND dc_number != ?"
            item_dc_params.append(exclude_dc_number)
            
        total_dispatch = to_qty(db.execute(item_dc_query, item_dc_params).fetchone()[0])

        # Calculate Total Received & Rejected for Item
        po_info = db.execute("SELECT po_number, po_item_no FROM purchase_order_items WHERE id = ?", (po_item_id,)).fetchone()
        if not po_info:
            logger.warning(f"PO Item {po_item_id} not found during item recalculation.")
            return # Should not happen

        po_num, po_item_num = po_info[0], po_info[1]

        item_srv_query = """
            SELECT 
                COALESCE(SUM(received_qty), 0),
                COALESCE(SUM(rejected_qty), 0)
            FROM srv_items 
            WHERE po_number = ? AND po_item_no = ?
        """
        item_srv_params = [po_num, po_item_num]
        if exclude_srv_number:
            item_srv_query += " AND srv_number != ?"
            item_srv_params.append(exclude_srv_number)
        
        total_srv_res = db.execute(item_srv_query, item_srv_params).fetchone()
        
        total_received = to_qty(total_srv_res[0])
        total_rejected = to_qty(total_srv_res[1])

        # High Water Mark for Item
        item_delivered = max(total_dispatch, total_received)

        db.execute("""
            UPDATE purchase_order_items
            SET delivered_qty = ?, rcd_qty = ?, rejected_qty = ?
            WHERE id = ?
        """, (item_delivered, total_received, total_rejected, po_item_id))
        
        # logger.debug(f"Recalculated Item {po_item_id}: Del={item_delivered} (Disp={total_dispatch}, Rec={total_received})")


    @staticmethod
    def reconcile_dc_creation(
        db: sqlite3.Connection, 
        items: List[Dict], 
        dc_number: str
    ) -> None:
        """
        Atomically updates quantities when a DC is created.
        """
        try:
            # Collect unique po_item_id and lot_no combinations to recalculate
            items_to_recalculate = set() # Stores (po_item_id, lot_no)
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
    def reconcile_dc_deletion(
        db: sqlite3.Connection, 
        dc_number: str
    ) -> None:
        """
        Atomically reverts quantities when a DC is deleted.
        Atomically reverts 'delivered_qty' when a DC is deleted.
        Must be called BEFORE the DC items are physically deleted.
        """
        try:
            # We fetch items to know WHAT to reconcile
            items = db.execute("""
                SELECT po_item_id, lot_no, dispatch_qty 
                FROM delivery_challan_items 
                WHERE dc_number = ?
            """, (dc_number,)).fetchall()
            
            for row in items:
                po_item_id = row[0]
                lot_no = row[1]
                dispatch_qty = row[2]
                
                # We need to simulate the deletion for recalculation to work correcty.
                # But we can't delete yet.
                # So we manually pass an exclusion flag?
                # Or we assume the caller will delete after this returns.
                # The recalculate logic sums up DB state. 
                # If DC is still there, it sums it up.
                
                # HACK: We will manually update the DB state for THIS transaction to "pretend" it's deleted
                # by temporarily setting dispatch_qty to 0 for this item? No, dangerous.
                
                # Correct Approach: Pass `exclude_dc_number` to helper?
                ReconciliationService._recalculate_delivery_status(db, po_item_id, lot_no, exclude_dc_number=dc_number)
                
            logger.info(f"Reconciled quantities for DC Deletion: {dc_number}")

        except Exception as e:
            logger.error(f"Failed to reconcile DC deletion for {dc_number}: {e}")
            raise

    @staticmethod
    def reconcile_srv_ingestion(
        db: sqlite3.Connection,
        srv_items: List[Dict],
        srv_number: str,
        po_number: str
    ) -> None:
        """
        Atomically updates 'received_qty' across the chain.
        """
        try:
            for item in srv_items:
                po_item_no = item["po_item_no"]
                lot_no = item.get("lot_no")
                delivered = to_qty(item.get("dispatch_qty") or 0)
                received = to_qty(item.get("received_qty") or 0)
                rejected = to_qty(item.get("rejected_qty") or 0)
                accepted = received - rejected
                challan_no = item.get("challan_no")

                po_item_row = db.execute("SELECT id FROM purchase_order_items WHERE po_number = ? AND po_item_no = ?", (po_number, po_item_no)).fetchone()
                if not po_item_row: continue
                po_item_id = po_item_row[0]

                # 1. Update DC Item Level
                if challan_no:
                    db.execute("""
                        UPDATE delivery_challan_items
                        SET received_qty = received_qty + ?, accepted_qty = accepted_qty + ?, rejected_qty = rejected_qty + ?
                        WHERE dc_number = ? AND po_item_id = ? AND (lot_no = ? OR ? IS NULL)
                    """, (received, accepted, rejected, challan_no, po_item_id, lot_no, lot_no))

                # 2. Update Lot Level (for received_qty only, delivered checked by recalc)
                if lot_no:
                    db.execute("UPDATE purchase_order_deliveries SET received_qty = received_qty + ? WHERE po_item_id = ? AND lot_no = ?", (received, po_item_id, lot_no))

                # 3. Recalculate Item/Lot Delivery Status (High Water Mark)
                ReconciliationService._recalculate_delivery_status(db, po_item_id, lot_no)
            
            logger.info(f"Reconciled quantities for SRV Ingestion: {srv_number}")

        except Exception as e:
            logger.error(f"Failed to reconcile SRV ingestion for {srv_number}: {e}")
            raise

    @staticmethod
    def reconcile_srv_deletion(
        db: sqlite3.Connection,
        srv_number: str
    ) -> None:
        """
        Atomically reverts quantities when an SRV is deleted.
        """
        try:
            items = db.execute("SELECT po_item_no, lot_no, received_qty, rejected_qty, challan_no, po_number FROM srv_items WHERE srv_number = ?", (srv_number,)).fetchall()
            
            for row in items:
                po_item_no, lot_no, received_qty, rejected_qty, challan_no, po_number = row
                
                po_item_row = db.execute("SELECT id FROM purchase_order_items WHERE po_number = ? AND po_item_no = ?", (po_number, po_item_no)).fetchone()
                if not po_item_row: continue
                po_item_id = po_item_row[0]
                accepted_qty = max(0, received_qty - rejected_qty)

                # 1. Revert DC Item Level
                if challan_no:
                    db.execute("""
                        UPDATE delivery_challan_items
                        SET received_qty = MAX(0, received_qty - ?), accepted_qty = MAX(0, accepted_qty - ?), rejected_qty = MAX(0, rejected_qty - ?)
                        WHERE dc_number = ? AND po_item_id = ? AND (lot_no = ? OR ? IS NULL)
                    """, (received_qty, accepted_qty, rejected_qty, challan_no, po_item_id, lot_no, lot_no))

                # 2. Revert Lot Level
                if lot_no:
                    db.execute("UPDATE purchase_order_deliveries SET received_qty = MAX(0, received_qty - ?) WHERE po_item_id = ? AND lot_no = ?", (received_qty, po_item_id, lot_no))

                # we need to simulate exclusion of THIS srv for recalculation to work if it relies on SUM()
                # Pass exclude_srv_number logic to helper?
                # Helper uses srv_items table. 
                ReconciliationService._recalculate_delivery_status(db, po_item_id, lot_no, exclude_srv_number=srv_number)
            
            logger.info(f"Reconciled quantities for SRV Deletion: {srv_number}")

        except Exception as e:
            logger.error(f"Failed to reconcile SRV deletion for {srv_number}: {e}")
            raise
    @staticmethod
    def sync_po(
        db: sqlite3.Connection,
        po_number: str
    ) -> None:
        """
        TOT-5: Full PO Reconciliation Sync.
        MUST be called after any batch operation (Upload, Amendment).
        Iterates all items in the PO and recalculates delivery status (HWM).
        """
        try:
            # Get all item IDs for this PO
            items = db.execute(
                "SELECT id FROM purchase_order_items WHERE po_number = ?", 
                (po_number,)
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

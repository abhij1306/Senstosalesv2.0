"""
Purchase Order Service
Handles business logic, aggregation, and data retrieval for POs.
Separates concerns from the API router.
"""

import logging
import sqlite3
from typing import List

from app.db import get_db
from app.core.exceptions import ResourceNotFoundError
from app.models import PODetail, POHeader, POItem, POListItem, POStats
from app.services.status_service import calculate_entity_status, calculate_pending_quantity

logger = logging.getLogger(__name__)


class POService:
    """Service for Purchase Order business logic"""

    def get_stats(self, db: sqlite3.Connection) -> POStats:
        """Calculate PO Dashboard Statistics"""
        try:
            # Open Orders (Active)
            open_count = db.execute(
                "SELECT COUNT(*) FROM purchase_orders WHERE po_status = 'Active'"
            ).fetchone()[0]

            # Pending Approval (Based on 'New' status)
            pending_count = db.execute(
                "SELECT COUNT(*) FROM purchase_orders WHERE po_status = 'New' OR po_status IS NULL"
            ).fetchone()[0]

            # Total Value YTD (All POs for now)
            value_row = db.execute(
                "SELECT SUM(po_value) FROM purchase_orders"
            ).fetchone()
            total_value = value_row[0] if value_row and value_row[0] else 0.0

            return POStats(
                open_orders_count=open_count,
                pending_approval_count=pending_count,
                total_value_ytd=total_value,
                total_value_change=0.0,
            )
        except Exception as e:
            logger.error(f"Error calculating PO stats: {e}")
            # Fail gracefully for stats
            return POStats(
                open_orders_count=0,
                pending_approval_count=0,
                total_value_ytd=0.0,
                total_value_change=0.0,
            )

    def list_pos(self, db: sqlite3.Connection) -> List[POListItem]:
        """
        List all Purchase Orders with aggregated quantity details.
        Calculates ordered, dispatched, and pending quantities.
        """
        rows = db.execute("""
            SELECT po_number, po_date, supplier_name, po_value, amend_no, po_status, financial_year, created_at
            FROM purchase_orders
            ORDER BY created_at DESC
        """).fetchall()

        results = []
        for row in rows:
            po_num = row["po_number"]

            # Calculate Total Ordered Quantity
            ordered_row = db.execute(
                """
                SELECT SUM(ord_qty) FROM purchase_order_items WHERE po_number = ?
            """,
                (po_num,),
            ).fetchone()
            total_ordered = ordered_row[0] if ordered_row and ordered_row[0] else 0.0

            # Calculate Total Dispatched Quantity
            # Link via PO Items to get specific dispatches for this PO
            dispatched_row = db.execute(
                """
                SELECT SUM(dci.dispatch_qty) 
                FROM delivery_challan_items dci
                JOIN purchase_order_items poi ON dci.po_item_id = poi.id
                WHERE poi.po_number = ?
            """,
                (po_num,),
            ).fetchone()
            total_dispatched = (
                dispatched_row[0] if dispatched_row and dispatched_row[0] else 0.0
            )

            # Pending calculated after Received (Global Invariant)
            # Calculate Total Items Count
            items_count_row = db.execute(
                "SELECT COUNT(*) FROM purchase_order_items WHERE po_number = ?",
                (po_num,),
            ).fetchone()
            total_items = items_count_row[0] if items_count_row else 0

            # Fetch linked DC numbers for reference
            dc_rows = db.execute(
                "SELECT dc_number FROM delivery_challans WHERE po_number = ?", (po_num,)
            ).fetchall()
            dc_nums = [r["dc_number"] for r in dc_rows]
            linked_dcs_str = ", ".join(dc_nums) if dc_nums else None

            # Calculate Total Received & Rejected (from SRVs)
            srv_agg_res = db.execute(
                """
                SELECT 
                    COALESCE(SUM(received_qty), 0),
                    COALESCE(SUM(rejected_qty), 0)
                FROM srv_items
                WHERE po_number = ?
            """,
                (po_num,),
            ).fetchone()
            total_received = srv_agg_res[0] if srv_agg_res else 0.0
            total_rejected = srv_agg_res[1] if srv_agg_res else 0.0

            # Calculate Total pending (Derived)
            # Rule: BAL = ORD - DLV (Global Invariant BAL-1)
            # DLV is High Water Mark: MAX(DISP, RECD)
            total_delivered_hwm = max(total_dispatched, total_received)
            total_pending = calculate_pending_quantity(total_ordered, total_delivered_hwm)

            # Determine Status using centralized service
            status = calculate_entity_status(total_ordered, total_dispatched, total_received)
            if status == "Pending" and total_dispatched == 0 and total_ordered > 0:
                status = row["po_status"] or "Draft" # Respect DB status for true draft POs

            results.append(
                POListItem(
                    po_number=row["po_number"],
                    po_date=row["po_date"],
                    supplier_name=row["supplier_name"],
                    po_value=row["po_value"],
                    amend_no=row["amend_no"],
                    po_status=status,
                    linked_dc_numbers=linked_dcs_str,
                    total_ordered_quantity=total_ordered,
                    total_dispatched_quantity=total_dispatched,
                    total_received_quantity=total_received,
                    total_rejected_quantity=total_rejected,
                    total_pending_quantity=total_pending,
                    total_items_count=total_items,
                    drg_no=db.execute("SELECT drg_no FROM purchase_order_items WHERE po_number = ? LIMIT 1", (po_num,)).fetchone()[0] if total_items > 0 else None,
                    financial_year=row["financial_year"],
                    created_at=row["created_at"],
                )
            )

        return results

    def get_po_detail(self, db: sqlite3.Connection, po_number: str) -> PODetail:
        """
        Get full Purchase Order detail with items and delivery schedules.
        Includes SRV aggregated received/rejected quantities.
        """
        try:
            header_row = db.execute(
                """
                SELECT * FROM purchase_orders WHERE po_number = ?
            """,
                (po_number,),
            ).fetchone()
        except Exception as e:
            print(f"ERROR: Failed to fetch PO header for {po_number}: {e}")
            raise e

        if not header_row:
            raise ResourceNotFoundError("PO", po_number)

        header_dict = dict(header_row)

        # Calculate live status based on aggregates
        agg = db.execute("""
            SELECT 
                SUM(poi.ord_qty) as total_ord,
                (SELECT SUM(dci.dispatch_qty) FROM delivery_challan_items dci JOIN purchase_order_items poi2 ON dci.po_item_id = poi2.id WHERE poi2.po_number = ?) as total_del,
                (SELECT SUM(si.received_qty) FROM srv_items si WHERE si.po_number = ?) as total_recd
            FROM purchase_order_items poi
            WHERE poi.po_number = ?
        """, (po_number, po_number, po_number)).fetchone()

        if agg and agg["total_ord"] is not None:
            t_ord = agg["total_ord"] or 0
            t_del = agg["total_del"] or 0
            t_recd = agg["total_recd"] or 0
            header_dict["po_status"] = calculate_entity_status(t_ord, t_del, t_recd)
        else:
            header_dict["po_status"] = "Draft"
        
        # Inject Consignee Details (Derived)
        # BHEL is the standard client, so we default to it if not explicit
        header_dict["consignee_name"] = "BHEL, Bhopal"
        header_dict["consignee_address"] = (
            header_dict.get("inspection_at") or "Piplani, Bhopal, Madhya Pradesh 462022"
        )

        header = POHeader(**header_dict)

        # Get items with SRV aggregated data
        item_rows = db.execute(
            """
            SELECT id, po_item_no, material_code, material_description, drg_no, mtrl_cat,
                   unit, po_rate, ord_qty as ordered_quantity, rcd_qty as received_quantity, 
                   hsn_code
            FROM purchase_order_items
            WHERE po_number = ?
            ORDER BY po_item_no
        """,
            (po_number,),
        ).fetchall()

        # 1. Batch fetch all deliveries for all items of this PO
        item_ids = [r["id"] for r in item_rows]
        placeholders = ",".join(["?"] * len(item_ids))
        all_deliveries = []
        if item_ids:
            all_deliveries = db.execute(
                f"SELECT id, po_item_id, lot_no, dely_qty as delivered_quantity, dely_date FROM purchase_order_deliveries WHERE po_item_id IN ({placeholders}) ORDER BY lot_no",
                item_ids
            ).fetchall()
        
        # 2. Batch fetch all dispatched quantities
        all_dispatched = []
        if item_ids:
            all_dispatched = db.execute(
                f"SELECT po_item_id, COALESCE(SUM(dispatch_qty), 0) FROM delivery_challan_items WHERE po_item_id IN ({placeholders}) GROUP BY po_item_id",
                item_ids
            ).fetchall()
        dispatched_map = {r[0]: r[1] for r in all_dispatched}

        # 3. Batch fetch all SRV data
        all_srvs = db.execute(
            "SELECT po_item_no, COALESCE(SUM(received_qty), 0), COALESCE(SUM(rejected_qty), 0) FROM srv_items WHERE po_number = ? GROUP BY po_item_no",
            (po_number,)
        ).fetchall()
        srv_map = {r[0]: (r[1], r[2]) for r in all_srvs}

        # For each item, map pre-fetched data
        items_with_deliveries = []
        for item_row in item_rows:
            item_dict = dict(item_row)
            item_id = item_dict["id"]
            po_item_no = item_dict["po_item_no"]

            # Map deliveries
            item_deliveries = [dict(d) for d in all_deliveries if d["po_item_id"] == item_id]
            
            # Map dispatched
            item_dispatched = dispatched_map.get(item_id, 0.0)

            # Map SRV
            srv_received, srv_rejected = srv_map.get(po_item_no, (0.0, 0.0))

            # Update item with SRV and Dispatch quantities
            item_dict["received_quantity"] = srv_received
            item_dict["rejected_quantity"] = srv_rejected
            
            # High Water Mark: Delivered is MAX(Dispatched, Received)
            item_delivered = max(item_dispatched, srv_received)
            item_dict["delivered_quantity"] = item_delivered

            # Calculate pending: Ordered - Delivered (Global Invariant BAL-1)
            item_ordered = item_dict.get("ordered_quantity", 0)
            item_dict["pending_quantity"] = calculate_pending_quantity(item_ordered, item_delivered)

            item_with_deliveries = {**item_dict, "deliveries": item_deliveries}
            items_with_deliveries.append(POItem(**item_with_deliveries))

        return PODetail(header=header, items=items_with_deliveries)


# Singleton instance
po_service = POService()

"""
Purchase Order Service
Handles business logic, aggregation, and data retrieval for POs.
Separates concerns from the API router.
"""

import logging
import sqlite3
from typing import List

from backend.core.exceptions import ResourceNotFoundError
from backend.db.models import PODetail, POHeader, POItem, POListItem, POStats
from backend.services.status_service import (
    calculate_entity_status,
    calculate_pending_quantity,
    translate_raw_status,
)

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
            value_row = db.execute("SELECT SUM(po_value) FROM purchase_orders").fetchone()
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
        Optimized single-query version to eliminate N+1 latency.
        """
        # Single query with subqueries for aggregates to avoid N+1 problem
        # BAL = ORD - DLV (where DLV is High Water Mark)
        query = """
            SELECT 
                po.po_number, po.po_date, po.supplier_name, po.po_value, po.amend_no, po.po_status, po.financial_year, po.created_at,
                COALESCE((SELECT SUM(ord_qty) FROM purchase_order_items WHERE po_number = po.po_number), 0) as total_ordered,
                COALESCE((SELECT COUNT(*) FROM purchase_order_items WHERE po_number = po.po_number), 0) as total_items,
                (SELECT drg_no FROM purchase_order_items WHERE po_number = po.po_number LIMIT 1) as sample_drg,
                (SELECT GROUP_CONCAT(dc_number, ', ') FROM delivery_challans WHERE po_number = po.po_number) as linked_dcs,
                COALESCE((SELECT SUM(rejected_qty) FROM srv_items WHERE po_number = po.po_number), 0) as total_rejected,
                -- Received (Total for PO)
                COALESCE((
                    SELECT SUM(pod.received_qty) 
                    FROM purchase_order_deliveries pod 
                    JOIN purchase_order_items poi ON pod.po_item_id = poi.id 
                    WHERE poi.po_number = po.po_number
                ), 0) as total_received,
                -- Delivered (Total for PO - Physical Dispatch only)
                COALESCE((
                    SELECT SUM(pod.delivered_qty) 
                    FROM purchase_order_deliveries pod 
                    JOIN purchase_order_items poi ON pod.po_item_id = poi.id 
                    WHERE poi.po_number = po.po_number
                ), 0) as total_delivered,
                -- Basic Dispatch (From DC items directly)
                COALESCE((
                    SELECT SUM(dci.dispatch_qty) 
                    FROM delivery_challan_items dci 
                    JOIN purchase_order_items poi ON dci.po_item_id = poi.id 
                    WHERE poi.po_number = po.po_number
                ), 0) as total_dispatched_raw
            FROM purchase_orders po
            ORDER BY po.created_at DESC
        """

        rows = db.execute(query).fetchall()

        results = []
        for row in rows:
            t_ordered = row["total_ordered"]
            t_delivered = row["total_delivered"]
            t_dispatched_raw = row["total_dispatched_raw"]
            t_received = row["total_received"]

            # Pending calculated based on max of Dispatch or Receipt (Global Invariant)
            t_pending = calculate_pending_quantity(t_ordered, max(t_delivered, t_received))

            # Determine Status using centralized service
            status = calculate_entity_status(t_ordered, t_dispatched_raw, t_received)
            raw_db_status = translate_raw_status(row["po_status"])

            # ERP/Manual Override Logic
            if t_pending > 0.1:
                status = "Pending"
            elif raw_db_status == "Closed":
                status = "Closed"

            results.append(
                POListItem(
                    po_number=row["po_number"],
                    po_date=row["po_date"],
                    supplier_name=row["supplier_name"],
                    po_value=row["po_value"],
                    amend_no=row["amend_no"],
                    po_status=status,
                    linked_dc_numbers=row["linked_dcs"],
                    total_ordered_quantity=t_ordered,
                    total_dispatched_quantity=t_delivered,
                    total_received_quantity=t_received,
                    total_rejected_quantity=row["total_rejected"],
                    total_pending_quantity=t_pending,
                    total_items_count=row["total_items"],
                    drg_no=row["sample_drg"],
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
        agg = db.execute(
            """
            SELECT 
                SUM(poi.ord_qty) as total_ord,
                (SELECT SUM(dci.dispatch_qty) FROM delivery_challan_items dci JOIN purchase_order_items poi2 ON dci.po_item_id = poi2.id WHERE poi2.po_number = ?) as total_del,
                (SELECT SUM(si.received_qty) FROM srv_items si WHERE si.po_number = ?) as total_recd
            FROM purchase_order_items poi
            WHERE poi.po_number = ?
        """,
            (po_number, po_number, po_number),
        ).fetchone()

        if agg and agg["total_ord"] is not None:
            t_ord = agg["total_ord"] or 0
            t_del = agg["total_del"] or 0
            t_recd = agg["total_recd"] or 0
            header_dict["po_status"] = calculate_entity_status(t_ord, t_del, t_recd)
        else:
            header_dict["po_status"] = "Pending"

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
                f"""
                SELECT 
                    id, po_item_id, lot_no, 
                    dely_qty as scheduled_qty,
                    delivered_qty as dispatched_qty,
                    received_qty as rcd_qty, 
                    manual_override_qty,
                    dely_date, dest_code 
                FROM purchase_order_deliveries 
                WHERE po_item_id IN ({placeholders}) 
                ORDER BY lot_no
                """,
                item_ids,
            ).fetchall()

        # 2. Process each item and its lots
        items_with_deliveries = []
        for item_row in item_rows:
            item_dict = dict(item_row)
            item_id = item_dict["id"]
            item_dict["po_item_no"]

            # Map deliveries and compute High-Water Mark DLV
            item_deliveries = []
            total_lot_ord = 0.0
            total_lot_dlv = 0.0
            total_lot_recd = 0.0

            for d in all_deliveries:
                if d["po_item_id"] == item_id:
                    d_dict = dict(d)

                    # Logic: Lot DLV = Physical Dispatch only
                    # De-coupled from Receipt (Triangle of Truth Fix)
                    dsp = d_dict["dispatched_qty"] or 0.0
                    recd = d_dict["rcd_qty"] or 0.0
                    lot_ord = d_dict["scheduled_qty"] or 0.0
                    manual = d_dict.get("manual_override_qty") or 0.0

                    # Use manual override if provided and dispatched is less
                    lot_dlv = max(dsp, manual)

                    d_dict["delivered_quantity"] = lot_dlv  # This maps to 'DLV' in UI
                    d_dict["received_quantity"] = recd  # This maps to 'RECD' in UI
                    d_dict["ordered_quantity"] = lot_ord  # This maps to 'ORD' in UI
                    d_dict["manual_override_qty"] = manual

                    item_deliveries.append(d_dict)

                    total_lot_ord += lot_ord
                    total_lot_dlv += lot_dlv
                    total_lot_recd += recd

            # Update item with aggregate lot quantities (Ensures consistency)
            item_dict["ordered_quantity"] = total_lot_ord or item_dict.get("ordered_quantity", 0)
            item_dict["delivered_quantity"] = total_lot_dlv
            item_dict["received_quantity"] = total_lot_recd

            # Calculate pending: ORD - DLV
            item_dict["pending_quantity"] = max(
                0.0, item_dict["ordered_quantity"] - item_dict["delivered_quantity"]
            )

            item_with_deliveries = {**item_dict, "deliveries": item_deliveries}
            items_with_deliveries.append(POItem(**item_with_deliveries))

        return PODetail(header=header, items=items_with_deliveries)


# Singleton instance
po_service = POService()

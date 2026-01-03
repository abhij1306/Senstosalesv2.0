"""
Dashboard Router
Summary statistics and recent activity
"""

import sqlite3
from datetime import datetime
from typing import Any, Dict, List

from fastapi import APIRouter, Depends, HTTPException

from backend.db.models import DashboardSummary
from backend.db.session import get_db
from backend.services.status_service import calculate_entity_status

router = APIRouter()


@router.get("/summary", response_model=DashboardSummary)
def get_dashboard_summary(db: sqlite3.Connection = Depends(get_db)):
    """Get dashboard summary statistics"""
    try:
        # 1. Total Sales (Month)
        # Using active invoices. Try to filter by current month if created_at is standard.
        current_month = datetime.now().strftime("%Y-%m")
        sales_row = db.execute(
            """
            SELECT SUM(total_invoice_value) FROM gst_invoices 
            WHERE strftime('%Y-%m', created_at) = ?
        """,
            (current_month,),
        ).fetchone()
        total_sales = sales_row[0] if sales_row and sales_row[0] else 0.0

        # 2. Pending/Draft POs (Live Count)
        # Uses reconciliation_ledger for unified HWM logic
        # Status "Closed" means transaction complete.
        active_pos_count = db.execute("""
            SELECT COUNT(*) 
            FROM (
                SELECT po_number, SUM(pending_qty) as total_pending
                FROM reconciliation_ledger 
                GROUP BY po_number
            ) 
            WHERE total_pending > 0.001
        """).fetchone()[0]

        # 3. New POs Today
        current_date = datetime.now().strftime("%Y-%m-%d")
        new_pos_today = db.execute(
            """
            SELECT COUNT(*) FROM purchase_orders 
            WHERE date(created_at) = ?
        """,
            (current_date,),
        ).fetchone()[0]

        # 4. Active Challans (Uninvoiced)
        active_challans = db.execute("""
            SELECT COUNT(DISTINCT dc.dc_number)
            FROM delivery_challans dc
            LEFT JOIN gst_invoices i ON dc.dc_number = i.dc_number
            WHERE i.invoice_number IS NULL
        """).fetchone()[0]

        # 5. Total PO Value (All Time)
        value_row = db.execute("SELECT SUM(po_value) FROM purchase_orders").fetchone()
        total_po_value = value_row[0] if value_row and value_row[0] else 0.0

        # 6. Global Reconciliation Snapshot
        # 6. Global Reconciliation Snapshot (Optimized)
        # Query tables directly instead of heavy view join

        # Total Ordered
        ord_row = db.execute("SELECT SUM(ord_qty) FROM purchase_order_items").fetchone()
        total_order = ord_row[0] if ord_row and ord_row[0] else 0.0

        # Total Delivered (from DC Items)
        deliv_row = db.execute("SELECT SUM(dispatch_qty) FROM delivery_challan_items").fetchone()
        total_deliv = deliv_row[0] if deliv_row and deliv_row[0] else 0.0

        # Total Received (from SRV Items)
        recvd_row = db.execute("SELECT SUM(received_qty) FROM srv_items").fetchone()
        total_recvd = recvd_row[0] if recvd_row and recvd_row[0] else 0.0

        return {
            "total_sales_month": total_sales,
            "sales_growth": 0.0,
            "pending_pos": active_pos_count,
            "new_pos_today": new_pos_today,
            "active_challans": active_challans,
            "active_challans_growth": "Stable",
            "total_po_value": total_po_value,
            "po_value_growth": 0.0,
            "active_po_count": active_pos_count,
            "total_ordered": total_order,
            "total_delivered": total_deliv,
            "total_received": total_recvd,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.get("/activity")
def get_recent_activity(
    limit: int = 10, db: sqlite3.Connection = Depends(get_db)
) -> List[Dict[str, Any]]:
    """Get recent activity (POs, DCs, Invoices)"""
    try:
        activities = []

        # Recent POs with live status
        po_rows = db.execute(
            """
            SELECT 'PO' as type, po.po_number as number, po.po_date as date, po.supplier_name as party, po.po_value as amount, 
                   po.created_at,
                   (SELECT COALESCE(SUM(ord_qty), 0) FROM purchase_order_items WHERE po_number = po.po_number) as t_ord,
                   (
                       SELECT COALESCE(SUM(pod.delivered_qty), 0) 
                       FROM purchase_order_deliveries pod 
                       JOIN purchase_order_items poi ON pod.po_item_id = poi.id 
                       WHERE poi.po_number = po.po_number
                   ) as t_del,
                   (
                       SELECT COALESCE(SUM(pod.received_qty), 0) 
                       FROM purchase_order_deliveries pod 
                       JOIN purchase_order_items poi ON pod.po_item_id = poi.id 
                       WHERE poi.po_number = po.po_number
                   ) as t_recd
            FROM purchase_orders po
            ORDER BY po.created_at DESC LIMIT ?
        """,
            (limit,),
        ).fetchall()
        for row in po_rows:
            d = dict(row)
            d["status"] = calculate_entity_status(d["t_ord"], d["t_del"], d["t_recd"])
            activities.append(d)

        # Recent Invoices with live status
        inv_rows = db.execute(
            """
            SELECT 'Invoice' as type, inv.invoice_number as number, inv.invoice_date as date, inv.buyer_gstin as party, 
                   inv.total_invoice_value as amount, inv.created_at, inv.dc_number,
                   (SELECT COALESCE(SUM(quantity), 0) FROM gst_invoice_items WHERE invoice_number = inv.invoice_number) as t_ord,
                   (
                       SELECT COALESCE(SUM(dci.dispatch_qty), 0) FROM delivery_challan_items dci 
                       WHERE inv.dc_number = dci.dc_number
                   ) as t_del,
                   (
                       SELECT COALESCE(SUM(si.received_qty), 0) 
                       FROM srv_items si 
                       JOIN srvs s ON si.srv_number = s.srv_number 
                       WHERE s.invoice_number = inv.invoice_number
                   ) as t_recd
            FROM gst_invoices inv
            ORDER BY inv.created_at DESC LIMIT ?
        """,
            (limit,),
        ).fetchall()
        for row in inv_rows:
            d = dict(row)
            d["party"] = d["party"] or "Client"
            d["status"] = calculate_entity_status(d["t_ord"], d["t_del"], d["t_recd"])
            activities.append(d)

        # Recent DCs with live status
        dc_rows = db.execute(
            """
            SELECT 'DC' as type, dc.dc_number as number, dc.dc_date as date, dc.consignee_name as party, 
                   0 as amount, dc.created_at,
                   (
                       SELECT COALESCE(SUM(pod.dely_qty), 0) 
                       FROM delivery_challan_items dci 
                       LEFT JOIN purchase_order_deliveries pod ON dci.po_item_id = pod.po_item_id AND dci.lot_no = pod.lot_no
                       WHERE dci.dc_number = dc.dc_number
                   ) as t_ord,
                   (
                       SELECT COALESCE(SUM(dispatch_qty), 0) 
                       FROM delivery_challan_items 
                       WHERE dc_number = dc.dc_number
                   ) as t_del,
                   (
                       SELECT COALESCE(SUM(received_qty), 0) 
                       FROM srv_items 
                       WHERE challan_no = dc.dc_number
                   ) as t_recd
            FROM delivery_challans dc
            ORDER BY dc.created_at DESC LIMIT ?
        """,
            (limit,),
        ).fetchall()
        for row in dc_rows:
            d = dict(row)
            d["status"] = calculate_entity_status(d["t_ord"], d["t_del"], d["t_recd"])
            activities.append(d)

        # Sort combined list by created_at desc
        # Note: created_at might be null for scraped data, fallback to date
        def sort_key(x):
            return x["created_at"] or x["date"] or ""

        activities.sort(key=sort_key, reverse=True)

        return activities[:limit]

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.get("/insights")
def get_dashboard_insights(db: sqlite3.Connection = Depends(get_db)):
    """
    Get deterministic insights/alerts based on business rules.
    Replaces the old AI-based insights.
    """
    insights = []

    try:
        # Rule 1: Pending POs
        pending_pos = db.execute(
            "SELECT COUNT(*) FROM purchase_orders WHERE po_status = 'New' OR po_status IS NULL"
        ).fetchone()[0]
        if pending_pos > 5:
            insights.append(
                {
                    "type": "warning",
                    "text": f"{pending_pos} Purchase Orders pending approval",
                    "action": "view_pending",
                }
            )

        # Rule 2: Uninvoiced Challans
        uninvoiced = db.execute("""
            SELECT COUNT(DISTINCT dc.dc_number)
            FROM delivery_challans dc
            LEFT JOIN gst_invoices i ON dc.dc_number = i.dc_number
            WHERE i.invoice_number IS NULL
        """).fetchone()[0]

        if uninvoiced > 0:
            insights.append(
                {
                    "type": "success" if uninvoiced < 10 else "warning",
                    "text": f"{uninvoiced} Challans ready for invoicing",
                    "action": "view_uninvoiced",
                }
            )

        # Rule 3: Recent Rejections (SRV)
        recent_rejections = db.execute("""
            SELECT COUNT(*) FROM srv_items 
            WHERE rejected_qty > 0 
            AND created_at >= date('now', '-7 days')
        """).fetchone()[0]

        if recent_rejections > 0:
            insights.append(
                {
                    "type": "error",
                    "text": f"{recent_rejections} items rejected in last 7 days",
                    "action": "view_srv",
                }
            )

        # Fallback if quiet
        if not insights:
            insights.append(
                {
                    "type": "success",
                    "text": "All systems operational. No immediate alerts.",
                    "action": "none",
                }
            )

        return insights

    except Exception:
        # Fail gracefully
        return [{"type": "error", "text": "System alert check failed", "action": "none"}]

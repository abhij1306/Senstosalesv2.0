"""
Report Service Layer
Centralizes all report generation logic ensuring deterministic output.
Phase 4 Requirement: No AI, purely SQL-based.
"""

import sqlite3

import pandas as pd


def get_po_reconciliation_by_date(
    start_date: str, end_date: str, db: sqlite3.Connection
) -> pd.DataFrame:
    """
    Generate PO vs Delivered vs Received vs Rejected report.
    Adapted from Master Prompt to match actual Schema.

    Schema Mapping:
    - purchase_order_items.ord_qty -> ordered_qty
    - srv_items JOIN on po_number, po_item_no (not id)
    """
    query = """
    SELECT 
      poi.po_number,
      poi.po_item_no,
      poi.material_description as item_description,
      poi.ord_qty as ordered_qty,
      
      -- Subquery for Total Dispatched
      COALESCE((
        SELECT SUM(dci.dispatch_qty) 
        FROM delivery_challan_items dci 
        WHERE dci.po_item_id = poi.id
      ), 0) as total_dispatched,
      
      -- Subquery for Total Accepted/Rejected/Received
      COALESCE((
        SELECT SUM(srvi.accepted_qty)
        FROM srv_items srvi
        JOIN srvs s ON srvi.srv_number = s.srv_number
        WHERE CAST(srvi.po_number AS TEXT) = CAST(poi.po_number AS TEXT) 
          AND srvi.po_item_no = poi.po_item_no
          AND s.is_active = 1
      ), 0) as total_accepted,

      COALESCE((
        SELECT SUM(srvi.rejected_qty)
        FROM srv_items srvi
        JOIN srvs s ON srvi.srv_number = s.srv_number
        WHERE CAST(srvi.po_number AS TEXT) = CAST(poi.po_number AS TEXT) 
          AND srvi.po_item_no = poi.po_item_no
          AND s.is_active = 1
      ), 0) as total_rejected

    FROM purchase_order_items poi
    JOIN purchase_orders po ON poi.po_number = po.po_number
    WHERE po.po_date BETWEEN ? AND ?
       OR EXISTS (
         SELECT 1 FROM delivery_challans dc 
         WHERE dc.po_number = po.po_number AND dc.dc_date BETWEEN ? AND ?
       )
    ORDER BY poi.po_number, poi.po_item_no;
    """

    # Use pandas for easy DataFrame handling
    try:
        df = pd.read_sql_query(query, db, params=[start_date, end_date, start_date, end_date])
        # Add a calculated 'total_received' column for the frontend
        df['total_received'] = df['total_accepted'] + df['total_rejected']
        # Ensure numeric types
        for col in ['ordered_qty', 'total_dispatched', 'total_accepted', 'total_rejected', 'total_received']:
            df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)
        return df
    except Exception as e:
        print(f"Error generating PO reconciliation report: {e}")
        return pd.DataFrame()


def get_monthly_sales_summary(
    start_date: str, end_date: str, db: sqlite3.Connection
) -> pd.DataFrame:
    """
    Generate Revenue Velocity Report: Ordered Value vs Delivered Value.
    
    Ordered Value = Sum(ord_qty * po_rate) by PO Date Month
    Delivered Value = Sum(dispatch_qty * po_rate) by DC Date Month (proxy for revenue realization)
    """
    # 1. Ordered Value Query
    q_ordered = """
    SELECT 
        strftime('%Y-%m', po.po_date) as month,
        SUM(poi.ord_qty * poi.po_rate) as ordered_value
    FROM purchase_orders po
    JOIN purchase_order_items poi ON po.po_number = poi.po_number
    WHERE po.po_date BETWEEN ? AND ?
    GROUP BY month
    """
    
    # 2. Delivered Value Query
    q_delivered = """
    SELECT 
        strftime('%Y-%m', dc.dc_date) as month,
        SUM(dci.dispatch_qty * poi.po_rate) as delivered_value
    FROM delivery_challans dc
    JOIN delivery_challan_items dci ON dc.dc_number = dci.dc_number
    JOIN purchase_order_items poi ON dci.po_item_id = poi.id
    WHERE dc.dc_date BETWEEN ? AND ?
    GROUP BY month
    """

    try:
        df_ord = pd.read_sql_query(q_ordered, db, params=[start_date, end_date])
        df_del = pd.read_sql_query(q_delivered, db, params=[start_date, end_date])
        
        # Merge on month (Outer join to keep all months)
        df = pd.merge(df_ord, df_del, on='month', how='outer').fillna(0)
        
        # Sort by month desc (for Table view consistency)
        df = df.sort_values('month', ascending=False)
        
        return df
    except Exception as e:
        print(f"Error generating Revenue Velocity report: {e}")
        return pd.DataFrame(columns=['month', 'ordered_value', 'delivered_value'])


def get_dc_register(
    start_date: str, end_date: str, db: sqlite3.Connection
) -> pd.DataFrame:
    """
    Generate DC Register.
    """
    query = """
    SELECT 
        dc.dc_number,
        dc.dc_date,
        dc.po_number,
        dc.consignee_name,
        COUNT(dci.id) as item_count,
        SUM(dci.dispatch_qty) as total_qty,
        SUM(dci.dispatch_qty * poi.po_rate) as total_value
    FROM delivery_challans dc
    LEFT JOIN delivery_challan_items dci ON dc.dc_number = dci.dc_number
    LEFT JOIN purchase_order_items poi ON dci.po_item_id = poi.id
    WHERE dc.dc_date BETWEEN ? AND ?
    GROUP BY dc.dc_number, dc.dc_date, dc.po_number, dc.consignee_name
    ORDER BY dc.dc_date DESC;
    """
    try:
        df = pd.read_sql_query(query, db, params=[start_date, end_date])
        return df
    except Exception as e:
        print(f"Error generating DC Register: {e}")
        return pd.DataFrame()


def get_invoice_register(
    start_date: str, end_date: str, db: sqlite3.Connection
) -> pd.DataFrame:
    """
    Detailed Invoice Register
    """
    query = """
    SELECT 
        invoice_number,
        invoice_date,
        dc_number,
        po_numbers,
        buyer_gstin,
        taxable_value,
        cgst,
        sgst,
        igst,
        total_invoice_value
    FROM gst_invoices
    WHERE invoice_date BETWEEN ? AND ?
    ORDER BY invoice_date DESC;
    """
    try:
        df = pd.read_sql_query(query, db, params=[start_date, end_date])
        return df
    except Exception as e:
        print(f"Error generating Invoice Register: {e}")
        return pd.DataFrame()


def get_pending_po_items(db: sqlite3.Connection) -> pd.DataFrame:
    """
    Get items where pending_qty > 0
    """
    query = """
    SELECT 
        po_number,
        po_item_no,
        material_description,
        ord_qty,
        pending_qty,
        (ord_qty - pending_qty) as delivered_qty
    FROM purchase_order_items
    WHERE pending_qty > 0
    ORDER BY po_number, po_item_no;
    """
    try:
        df = pd.read_sql_query(query, db)
        return df
    except Exception as e:
        print(f"Error generating Pending PO Items report: {e}")
        return pd.DataFrame()


def get_po_register(
    start_date: str, end_date: str, db: sqlite3.Connection
) -> pd.DataFrame:
    """
    Summary of POs with totals.
    """
    query = """
    SELECT 
        po.po_number,
        po.po_date,
        SUM(poi.ord_qty) as total_ordered,
        COALESCE(SUM(dci.dispatch_qty), 0) as total_dispatched,
        SUM(poi.pending_qty) as pending_qty,
        CASE 
            WHEN SUM(poi.pending_qty) <= 0 THEN 'Completed'
            WHEN COALESCE(SUM(dci.dispatch_qty), 0) > 0 THEN 'In Progress'
            ELSE 'Pending'
        END as status
    FROM purchase_orders po
    JOIN purchase_order_items poi ON po.po_number = poi.po_number
    LEFT JOIN delivery_challan_items dci ON poi.id = dci.po_item_id
    WHERE po.po_date BETWEEN ? AND ?
    GROUP BY po.po_number, po.po_date
    ORDER BY po.po_date DESC;
    """
    try:
        df = pd.read_sql_query(query, db, params=[start_date, end_date])
        return df
    except Exception as e:
        print(f"Error generating PO Register: {e}")
        return pd.DataFrame()

def get_reconciliation_lots(po_number: str, db: sqlite3.Connection) -> list:
    """
    Get available lots/items for dispatch from a PO.
    Calculates remaining quantity (Ordered - Dispatched).
    """
    query = """
    SELECT 
        poi.id as po_item_id,
        poi.po_item_no,
        poi.material_description,
        poi.drg_no,
        COALESCE(pod.lot_no, 1) as lot_no,
        COALESCE(pod.dely_qty, poi.ord_qty) as lot_ordered_qty,
        COALESCE((
            SELECT SUM(dci.dispatch_qty)
            FROM delivery_challan_items dci
            WHERE dci.po_item_id = poi.id AND dci.lot_no = COALESCE(pod.lot_no, 1)
        ), 0) as lot_dispatched_qty,
        COALESCE((
            SELECT SUM(srvi.received_qty)
            FROM srv_items srvi
            WHERE srvi.po_number = poi.po_number 
              AND srvi.po_item_no = poi.po_item_no
              AND COALESCE(srvi.lot_no, 1) = COALESCE(pod.lot_no, 1)
        ), 0) as lot_received_qty
    FROM purchase_order_items poi
    LEFT JOIN purchase_order_deliveries pod ON poi.id = pod.po_item_id
    WHERE poi.po_number = ?
    ORDER BY poi.po_item_no, lot_no;
    """
    try:
        rows = db.execute(query, (po_number,)).fetchall()
        results = []
        for row in rows:
            r = dict(row)
            # High Water Mark: Delivered is MAX(Dispatched, Received)
            already_delivered = max(r['lot_dispatched_qty'], r['lot_received_qty'])
            remaining = r['lot_ordered_qty'] - already_delivered
            
            results.append({
                "po_item_id": r['po_item_id'],
                "lot_no": r['lot_no'],
                "material_description": r['material_description'],
                "drg_no": r['drg_no'],
                "ordered_qty": r['lot_ordered_qty'],
                "received_qty": r['lot_received_qty'],
                "remaining_qty": max(0, remaining)
            })
        return results
    except Exception as e:
        print(f"Error getting reconciliation lots: {e}")
        return []

import sqlite3
import os
import sys

# Setup Path
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.join(current_dir, "backend")
sys.path.append(backend_dir)

from app.db import get_connection

def debug_srv_fetch(po_number):
    print(f"--- DEBUGGING SRV FETCH for PO {po_number} ---")
    db_path = os.path.join(current_dir, "db", "business.db")
    print(f"DB Path: {db_path}")
    
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    
    query = """
        SELECT 
            s.srv_number, s.srv_date, s.po_number, 'Received' as srv_status, s.created_at, 1 as po_found,
            COALESCE(SUM(si.received_qty), 0) as total_received_qty,
            COALESCE(SUM(si.rejected_qty), 0) as total_rejected_qty,
            COALESCE(SUM(si.order_qty), 0) as total_order_qty,
            COALESCE(SUM(si.challan_qty), 0) as total_challan_qty,
            (COALESCE(SUM(si.received_qty), 0) - COALESCE(SUM(si.rejected_qty), 0)) as total_accepted_qty,
            GROUP_CONCAT(DISTINCT si.challan_no) as challan_numbers,
            '' as invoice_numbers
        FROM srvs s
        LEFT JOIN srv_items si ON s.srv_number = si.srv_number
        WHERE s.po_number = ?
        GROUP BY s.srv_number, s.srv_date, s.po_number, s.created_at
        ORDER BY s.srv_date DESC
    """
    
    try:
        print("Executing Query...")
        result = conn.execute(query, (po_number,)).fetchall()
        print(f"SUCCESS: Retrieved {len(result)} SRVs")
        for row in result:
             print(dict(row))
    except Exception as e:
        print("\n!!! EXCEPTION CAUGHT !!!")
        print(f"Type: {type(e).__name__}")
        print(f"Message: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    debug_srv_fetch("7284076")

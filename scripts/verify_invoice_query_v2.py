
import sqlite3
import traceback

DB_PATH = "db/business.db"

def run_debug_query():
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Original Faulty Query
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
        LEFT JOIN gst_invoice_items inv_item ON inv.invoice_number = inv_item.invoice_number
        WHERE 1=1
        GROUP BY inv.invoice_number, inv.invoice_date, inv.po_numbers, inv.dc_number,
        inv.buyer_gstin, inv.taxable_value, inv.total_invoice_value, inv.created_at
        ORDER BY inv.created_at DESC
        """
        
        print("Executing query...")
        cursor.execute(query)
        rows = cursor.fetchall()
        print(f"Success! Retrieved {len(rows)} rows.")
        for row in rows:
            print(row)
            
        conn.close()
        
    except Exception as e:
        print("QUERY FAILED!")
        print(f"Error: {e}")
        traceback.print_exc()

if __name__ == "__main__":
    run_debug_query()

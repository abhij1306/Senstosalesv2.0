
import os
import sys
import sqlite3
import datetime

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app.db import DATABASE_PATH, get_connection
from app.services.srv_ingestion import process_srv_file

def verify_srv_handling():
    print("Connecting to DB...")
    # Initialize DB if not exists (should already be done by init_db_debug_v2)
    conn = get_connection()
    
    # 1. Manually insert Alphanumeric PO
    po_number = "PO-ALPHA-123"
    print(f"Inserting PO: {po_number}")
    try:
        # Check if exists first
        exists = conn.execute("SELECT 1 FROM purchase_orders WHERE po_number = ?", (po_number,)).fetchone()
        if not exists:
            # Insert minimal PO
            conn.execute("""
                INSERT INTO purchase_orders (po_number, po_date, supplier_name, po_status)
                VALUES (?, ?, ?, 'Open')
            """, (po_number, "2023-01-01", "Test Supplier"))
            
            # Insert minimal PO Item
            # id is TEXT in new schema
            conn.execute("""
                INSERT INTO purchase_order_items (id, po_number, po_item_no, material_description, ord_qty, status)
                VALUES (?, ?, ?, ?, ?, 'Active')
            """, ("item-1", po_number, 10, "Test Material", 100))
            conn.commit()
            print("PO Inserted.")
        else:
            print("PO already exists.")
            
    except Exception as e:
        print(f"Failed to insert PO: {e}")
        conn.close()
        return

    # 2. Mock SRV HTML
    # Note: srv_scraper logic looks for "PO ITM", "SRV NO", etc.
    srv_html = f"""
    <html>
    <body>
    <table>
        <tr>
            <th>SRV NO</th>
            <th>SRV DATE</th>
            <th>PO NO</th>
            <th>PO ITM</th>
            <th>RECVD QTY</th>
            <th>ACCEPTED QTY</th>
        </tr>
        <tr>
            <td>SRV-TEST-001</td>
            <td>01/01/2023</td>
            <td>{po_number}</td>
            <td>10</td>
            <td>50</td>
            <td>50</td>
        </tr>
    </table>
    </body>
    </html>
    """
    
    print("Ingesting SRV...")
    try:
        success, messages = process_srv_file(srv_html.encode('utf-8'), "test.html", conn)
        print(f"Success: {success}")
        print(f"Messages: {messages}")
    except Exception as e:
        print(f"SRV Ingestion Failed with Exception: {e}")
        import traceback
        traceback.print_exc()

    # 3. Verify SRV in DB
    try:
        row = conn.execute("SELECT * FROM srvs WHERE srv_number = 'SRV-TEST-001'").fetchone()
        if row:
            print(f"SRV Found: {dict(row)}")
        else:
            print("SRV NOT Found!")

        # 4. Verify PO Item Update (rcd_qty)
        item_row = conn.execute("SELECT rcd_qty FROM purchase_order_items WHERE id='item-1'").fetchone()
        print(f"PO Item Received Qty: {item_row['rcd_qty']}")
    except Exception as e:
        print(f"Verification Failed: {e}")
    
    conn.close()

if __name__ == "__main__":
    verify_srv_handling()

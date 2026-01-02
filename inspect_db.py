import sqlite3
import os

db_path = os.path.join("db", "business.db")
conn = sqlite3.connect(db_path)
conn.row_factory = sqlite3.Row

print("--- Inspecting PO 7284076 Deliveries ---")
cursor = conn.execute("""
    SELECT 
        poi.po_item_no,
        pod.lot_no,
        pod.dely_qty, 
        pod.delivered_qty, 
        pod.received_qty 
    FROM purchase_order_deliveries pod 
    JOIN purchase_order_items poi ON pod.po_item_id = poi.id 
    WHERE poi.po_number = '7284076'
    ORDER BY poi.po_item_no, pod.lot_no
""")

for row in cursor.fetchall():
    print(dict(row))

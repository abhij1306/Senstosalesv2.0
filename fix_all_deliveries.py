"""
Fix all existing DC items by running reconciliation for each unique po_item_id.
"""
import sqlite3
import sys
sys.path.insert(0, '.')

conn = sqlite3.connect('db/business.db')
conn.row_factory = sqlite3.Row

from backend.services.reconciliation_service import ReconciliationService

# Get all unique po_item_id from delivery_challan_items
items = conn.execute('SELECT DISTINCT po_item_id FROM delivery_challan_items').fetchall()
print("Found", len(items), "unique po_item_ids with DCs")

for item in items:
    po_item_id = item['po_item_id']
    print("Reconciling po_item_id=", po_item_id[:8], "...")
    ReconciliationService._recalculate_delivery_status(conn, po_item_id, None)

conn.commit()
print("\nDone! All items reconciled.")

# Verify
print("\nVerification:")
poi = conn.execute("""
    SELECT poi.po_number, poi.ord_qty, poi.delivered_qty 
    FROM purchase_order_items poi
    WHERE poi.id IN (SELECT DISTINCT po_item_id FROM delivery_challan_items)
""").fetchall()
for p in poi:
    print("  PO=", p['po_number'], ", Ord=", p['ord_qty'], ", Dlv=", p['delivered_qty'])

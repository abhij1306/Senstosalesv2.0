import sqlite3
import sys
sys.path.insert(0, '.')

conn = sqlite3.connect('db/business.db')
conn.row_factory = sqlite3.Row

# Get a DCI entry
dci = conn.execute('SELECT * FROM delivery_challan_items LIMIT 1').fetchone()
po_item_id = dci['po_item_id']
lot_no = dci['lot_no']
print("Testing for po_item_id=", po_item_id[:8], ", lot_no=", lot_no)

# Before
poi_before = conn.execute('SELECT delivered_qty FROM purchase_order_items WHERE id = ?', (po_item_id,)).fetchone()
pod_before = conn.execute('SELECT delivered_qty FROM purchase_order_deliveries WHERE po_item_id = ? AND lot_no = ?', (po_item_id, lot_no)).fetchone()
print("BEFORE: POI.delivered_qty =", poi_before['delivered_qty'], ", POD.delivered_qty =", pod_before['delivered_qty'])

# Run reconciliation
from backend.services.reconciliation_service import ReconciliationService
print("\nRunning reconciliation...")
ReconciliationService._recalculate_delivery_status(conn, po_item_id, lot_no)
conn.commit()

# After
poi_after = conn.execute('SELECT delivered_qty FROM purchase_order_items WHERE id = ?', (po_item_id,)).fetchone()
pod_after = conn.execute('SELECT delivered_qty FROM purchase_order_deliveries WHERE po_item_id = ? AND lot_no = ?', (po_item_id, lot_no)).fetchone()
print("AFTER: POI.delivered_qty =", poi_after['delivered_qty'], ", POD.delivered_qty =", pod_after['delivered_qty'])

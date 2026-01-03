import sqlite3
conn = sqlite3.connect('db/business.db')
conn.row_factory = sqlite3.Row

# Get a DCI entry
dci = conn.execute('SELECT * FROM delivery_challan_items LIMIT 1').fetchone()
po_item_id = dci['po_item_id']
lot_no = dci['lot_no']
dispatch_qty = dci['dispatch_qty']
print(f"DCI: po_item_id={po_item_id[:8]}, lot_no={lot_no}, dispatch_qty={dispatch_qty}")

# Check POD for this item
pods = conn.execute('SELECT id, lot_no, dely_qty, delivered_qty FROM purchase_order_deliveries WHERE po_item_id = ?', (po_item_id,)).fetchall()
print(f"POD entries for this item: {len(pods)}")
for p in pods:
    print(f"  lot={p['lot_no']}, ord={p['dely_qty']}, dlv={p['delivered_qty']}")

# Check if lot_no matches
match = conn.execute('SELECT * FROM purchase_order_deliveries WHERE po_item_id = ? AND lot_no = ?', (po_item_id, lot_no)).fetchone()
print(f"Match for lot {lot_no}: {'FOUND' if match else 'NOT FOUND'}")

# Check POI
poi = conn.execute('SELECT po_number, ord_qty, delivered_qty FROM purchase_order_items WHERE id = ?', (po_item_id,)).fetchone()
print(f"POI: po={poi['po_number']}, ord={poi['ord_qty']}, dlv={poi['delivered_qty']}")

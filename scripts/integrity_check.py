import sqlite3
import os

DB_PATH = "db/business.db"

def run_audit():
    if not os.path.exists(DB_PATH):
        print(f"Error: Database not found at {DB_PATH}")
        return

    db = sqlite3.connect(DB_PATH)
    db.row_factory = sqlite3.Row
    errors = []

    print("=== SenstoSales Integrity Audit ===")

    # 1. Triangle of Truth: PO Items vs Delivered/Received
    print("Checking PO Item invariants...")
    poi_violations = db.execute("""
        SELECT po_number, po_item_no, ord_qty, delivered_qty, rcd_qty 
        FROM purchase_order_items 
        WHERE delivered_qty > ord_qty + 0.001 
           OR rcd_qty > ord_qty + 0.001
    """).fetchall()
    
    for row in poi_violations:
        errors.append(f"PO-2 Violation: PO {row['po_number']} Item {row['po_item_no']} has overruns. "
                     f"Ord: {row['ord_qty']}, Del: {row['delivered_qty']}, Rec: {row['rcd_qty']}")

    # 2. HWM Check: delivered_qty == MAX(dispatched, received)
    print("Checking High Water Mark consistency...")
    hwm_violations = db.execute("""
        SELECT poi.po_number, poi.po_item_no, poi.delivered_qty, 
               (SELECT COALESCE(SUM(dispatch_qty),0) FROM delivery_challan_items WHERE po_item_id = poi.id) as total_disp,
               (SELECT COALESCE(SUM(received_qty),0) FROM srv_items WHERE po_number = poi.po_number AND po_item_no = poi.po_item_no) as total_recd
        FROM purchase_order_items poi
    """).fetchall()

    for row in hwm_violations:
        expected_hwm = max(row['total_disp'], row['total_recd'])
        if abs(row['delivered_qty'] - expected_hwm) > 0.001:
            errors.append(f"TOT-5 Violation: PO {row['po_number']} Item {row['po_item_no']} HWM mismatch. "
                         f"Current: {row['delivered_qty']}, Expected (MAX): {expected_hwm}")

    # 3. Orphaned DCs
    print("Checking for orphaned Delivery Challans...")
    orphaned_dcs = db.execute("""
        SELECT dc_number FROM delivery_challans 
        WHERE po_number NOT IN (SELECT po_number FROM purchase_orders)
    """).fetchall()
    for row in orphaned_dcs:
        errors.append(f"Orphaned DC detected: {row['dc_number']}")

    # 4. Duplicate Invoices in FY
    print("Checking FY uniqueness...")
    fy_violations = db.execute("""
        SELECT invoice_number, financial_year, COUNT(*) as cnt 
        FROM gst_invoices 
        GROUP BY invoice_number, financial_year 
        HAVING cnt > 1
    """).fetchall()
    for row in fy_violations:
        errors.append(f"INV-1 Violation: Duplicate Invoice {row['invoice_number']} in FY {row['financial_year']}")

    if not errors:
        print("✅ INTEGRITY SCORE: 10/10 - All core invariants passing.")
    else:
        print(f"❌ CRITICAL: Found {len(errors)} violations!")
        for err in errors:
            print(f"  - {err}")

    db.close()

if __name__ == "__main__":
    run_audit()

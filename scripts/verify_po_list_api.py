
import sys
import os
import sqlite3
import logging

# Setup path to import backend modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../backend")))

from app.services.status_service import calculate_entity_status, calculate_pending_quantity

def get_db():
    db_path = os.path.abspath("db/business.db")
    print(f"Connecting to DB at: {db_path}")
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

def list_pos_debug():
    print("Testing list_pos logic...")
    db = get_db()
    
    # Verify tables
    tables = db.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()
    print(f"Tables found: {[t['name'] for t in tables]}")
    
    if "purchase_orders" not in [t['name'] for t in tables]:
        print("CRITICAL: purchase_orders table MISSING!")
        return

    try:
        rows = db.execute("""
            SELECT po_number, po_date, supplier_name, po_value, amend_no, po_status, financial_year, created_at
            FROM purchase_orders
            ORDER BY created_at DESC
        """).fetchall()

        print(f"Found {len(rows)} POs in DB.")

        results = []
        for i, row in enumerate(rows):
            print(f"Processing PO {i+1}: {row['po_number']}")
            po_num = row["po_number"]

            try:
                # 1. Total Ordered
                ordered_row = db.execute(
                    "SELECT SUM(ord_qty) FROM purchase_order_items WHERE po_number = ?",
                    (po_num,),
                ).fetchone()
                total_ordered = ordered_row[0] if ordered_row and ordered_row[0] else 0.0
                print(f"  - Total Ordered: {total_ordered}")

                # 2. Total Dispatched
                dispatched_row = db.execute(
                    """
                    SELECT SUM(dci.dispatch_qty) 
                    FROM delivery_challan_items dci
                    JOIN purchase_order_items poi ON dci.po_item_id = poi.id
                    WHERE poi.po_number = ?
                """,
                    (po_num,),
                ).fetchone()
                total_dispatched = (
                    dispatched_row[0] if dispatched_row and dispatched_row[0] else 0.0
                )
                print(f"  - Total Dispatched: {total_dispatched}")

                # 3. Total Items Count
                items_count_row = db.execute(
                    "SELECT COUNT(*) FROM purchase_order_items WHERE po_number = ?",
                    (po_num,),
                ).fetchone()
                total_items = items_count_row[0] if items_count_row else 0
                print(f"  - Total Items: {total_items}")

                # 4. Linked DCs
                dc_rows = db.execute(
                    "SELECT dc_number FROM delivery_challans WHERE po_number = ?", (po_num,)
                ).fetchall()
                dc_nums = [r["dc_number"] for r in dc_rows]
                print(f"  - Linked DCs: {dc_nums}")

                # 5. Total Received/Rejected
                srv_agg_res = db.execute(
                    """
                    SELECT 
                        COALESCE(SUM(received_qty), 0),
                        COALESCE(SUM(rejected_qty), 0)
                    FROM srv_items
                    WHERE po_number = ?
                """,
                    (po_num,),
                ).fetchone()
                total_received = srv_agg_res[0] if srv_agg_res else 0.0
                total_rejected = srv_agg_res[1] if srv_agg_res else 0.0
                print(f"  - Received: {total_received}, Rejected: {total_rejected}")

                # 6. DRG No (Possible fail point?)
                print("  - Fetching DRG No...")
                drg_no = None
                if total_items > 0:
                    drg_res = db.execute("SELECT drg_no FROM purchase_order_items WHERE po_number = ? LIMIT 1", (po_num,)).fetchone()
                    # CRITICAL: Check if drg_res is None even if count > 0 (should imply logic error but possible)
                    if drg_res:
                        drg_no = drg_res[0]
                    else:
                        print("    - WARNING: total_items > 0 but no row returned for drg_no limit 1")
                print(f"  - DRG No: {drg_no}")

                # 7. Status Calculation
                total_pending = calculate_pending_quantity(total_ordered, total_dispatched)
                status = calculate_entity_status(total_ordered, total_dispatched, total_received)
                if status == "Pending" and total_dispatched == 0 and total_ordered > 0:
                    status = row["po_status"] or "Draft"
                
                print(f"  - Status: {status}")

                results.append(po_num)

            except Exception as e:
                print(f"CRITICAL ERROR processing PO {po_num}: {e}")
                import traceback
                traceback.print_exc()
                # Continue loop to see if others fail
                continue

        print(f"Successfully processed {len(results)}/{len(rows)} POs.")

    except Exception as e:
        print(f"Global Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    list_pos_debug()

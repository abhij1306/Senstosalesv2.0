import sqlite3
import os

def inspect():
    db_path = 'db/business.db'
    if not os.path.exists(db_path):
        db_path = '../db/business.db'
        
    print(f"Inspecting {db_path}...")
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check POs
        print("Checking for 'DETAILS%'...")
        rows = cursor.execute("SELECT po_number, po_date FROM purchase_orders WHERE po_number LIKE 'DETAILS%'").fetchall()
        print(f"Corrupted POs (DETAILS%): {len(rows)}")
        for r in rows:
            print(r)

        print("\nChecking for '%DETAILS%' (whitespace?) ...")
        rows = cursor.execute("SELECT po_number, po_date FROM purchase_orders WHERE po_number LIKE '%DETAILS%' AND po_number NOT LIKE 'DETAILS%'").fetchall()
        print(f"Corrupted POs (%DETAILS%): {len(rows)}")
        for r in rows:
            print(r)
            
        # Check all POs count
        count = cursor.execute("SELECT COUNT(*) FROM purchase_orders").fetchone()[0]
        print(f"\nTotal POs: {count}")
        
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    inspect()

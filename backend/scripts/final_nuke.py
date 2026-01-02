import sqlite3
import os

def nuke():
    # Force absolute path
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) # backend/
    root_dir = os.path.dirname(base_dir) # project root
    db_path = os.path.join(root_dir, 'db', 'business.db')
    
    print(f"Targeting DB at: {db_path}")
    
    if not os.path.exists(db_path):
        print("DB FILE NOT FOUND AT EXPECTED PATH")
        return

    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    
    # 1. Count
    count = cur.execute("SELECT count(*) FROM purchase_orders WHERE po_number LIKE '%DETAILS%'").fetchone()[0]
    print(f"Found {count} corrupted records matching '%DETAILS%'")
    
    if count > 0:
        # 2. Delete
        print("Deleting...")
        cur.execute("DELETE FROM purchase_orders WHERE po_number LIKE '%DETAILS%'")
        print(f"Rows affected: {cur.rowcount}")
        conn.commit()
        
        # 3. Verify
        remain = cur.execute("SELECT count(*) FROM purchase_orders WHERE po_number LIKE '%DETAILS%'").fetchone()[0]
        print(f"Remaining after delete: {remain}")
        
        # 4. Vacuum
        print("Vacuuming...")
        conn.execute("VACUUM")
        print("Vacuum complete.")
    else:
        print("No matches found.")

    conn.close()

if __name__ == "__main__":
    nuke()


import sqlite3
import os

def repair():
    db_path = 'db/business.db'
    if not os.path.exists(db_path):
        print(f"DB not found at {db_path}")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # 1. Check srvs table
    print("Checking srvs table...")
    cursor.execute("PRAGMA table_info(srvs)")
    existing_srvs_cols = [r[1] for r in cursor.fetchall()]
    
    srvs_to_add = [
        ("srv_status", "VARCHAR(50) DEFAULT 'Received'"),
        ("po_found", "BOOLEAN DEFAULT 1"),
        ("warning_message", "TEXT")
    ]
    
    for col, definition in srvs_to_add:
        if col not in existing_srvs_cols:
            print(f"Adding {col} to srvs...")
            cursor.execute(f"ALTER TABLE srvs ADD COLUMN {col} {definition}")

    # 2. Check srv_items table
    print("Checking srv_items table...")
    cursor.execute("PRAGMA table_info(srv_items)")
    existing_srv_items_cols = [r[1] for r in cursor.fetchall()]
    
    srv_items_to_add = [
        ("invoice_no", "VARCHAR(50)"),
        ("remarks", "TEXT"),
        ("invoice_date", "DATE"),
        ("challan_date", "DATE"),
        ("order_qty", "DECIMAL(15,3) DEFAULT 0"),
        ("challan_qty", "DECIMAL(15,3) DEFAULT 0"),
        ("accepted_qty", "DECIMAL(15,3) DEFAULT 0"),
        ("unit", "VARCHAR(20)"),
        ("div_code", "VARCHAR(20)"),
        ("pmir_no", "VARCHAR(50)"),
        ("finance_date", "DATE"),
        ("cnote_no", "VARCHAR(50)"),
        ("cnote_date", "DATE")
    ]
    
    for col, definition in srv_items_to_add:
        if col not in existing_srv_items_cols:
            print(f"Adding {col} to srv_items...")
            cursor.execute(f"ALTER TABLE srv_items ADD COLUMN {col} {definition}")

    conn.commit()
    conn.close()
    print("Repair complete.")

if __name__ == "__main__":
    repair()

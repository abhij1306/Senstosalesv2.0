import sqlite3
import json

import os

def check():
    # Database is in project_root/db/business.db
    # This script is in backend/
    db_path = os.path.join(os.getcwd(), '..', 'db', 'business.db')
    print(f"Checking database at: {db_path}")
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # List tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = [row[0] for row in cursor.fetchall()]
    print("Tables:", tables)
    
    if 'purchase_order_deliveries' in tables:
        cursor.execute("PRAGMA table_info(purchase_order_deliveries)")
        columns = [dict(row) for row in cursor.fetchall()]
        print("\nColumns in purchase_order_deliveries:")
        for col in columns:
            print(f"  {col['name']} ({col['type']})")
            
        cursor.execute("SELECT * FROM purchase_order_deliveries LIMIT 2")
        rows = [dict(row) for row in cursor.fetchall()]
        print("\nSample Rows:")
        print(json.dumps(rows, indent=2))
    
    conn.close()

if __name__ == "__main__":
    check()

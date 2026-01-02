
import sqlite3
import sys

db_path = "../db/business.db"

try:
    # Open in Read-Only mode to avoid locking issues
    conn = sqlite3.connect(f"file:{db_path}?mode=ro", uri=True)
    cursor = conn.cursor()
    
    print("--- LIVE TABLES ---")
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = cursor.fetchall()
    for t in tables:
        print(t[0])
        
    print("\n--- SETTINGS TABLE ---")
    try:
        rows = cursor.execute("SELECT key, value FROM settings").fetchall()
        for row in rows:
            print(f"{row[0]}: {row[1]}")
    except Exception as e:
        print(f"Error reading settings: {e}")

    print("\n--- SCHEMA: gst_invoices ---")
    try:
        row = cursor.execute("SELECT sql FROM sqlite_master WHERE name='gst_invoices'").fetchone()
        if row:
            print(row[0])
        else:
            print("gst_invoices NOT FOUND")
    except Exception as e:
        print(f"Error reading gst_invoices schema: {e}")
        
    print("\n--- SCHEMA: gst_invoice_items ---")
    try:
        row = cursor.execute("SELECT sql FROM sqlite_master WHERE name='gst_invoice_items'").fetchone()
        if row:
            print(row[0])
        else:
            print("gst_invoice_items NOT FOUND")
    except Exception as e:
        print(f"Error reading gst_invoice_items schema: {e}")

except Exception as e:
    print(f"FATAL ERROR: {e}")
finally:
    if 'conn' in locals() and conn:
        conn.close()

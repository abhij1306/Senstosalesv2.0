
import sqlite3

db_path = "../db/business.db"

def inspect():
    try:
        conn = sqlite3.connect(f"file:{db_path}?mode=ro", uri=True)
        cursor = conn.cursor()
        
        print("\n=== SETTINGS ===")
        rows = cursor.execute("SELECT key, value FROM settings").fetchall()
        for row in rows:
            print(f"{row[0]}: {row[1]}")
            
        print("\n=== BUYERS ===")
        # Just check names and addresses
        rows = cursor.execute("SELECT supplier_name FROM buyers LIMIT 5").fetchall()
        for row in rows:
            print(row[0])

        print("\n=== SCHEMA: gst_invoices ===")
        row = cursor.execute("SELECT sql FROM sqlite_master WHERE name='gst_invoices'").fetchone()
        if row: print(row[0])

        print("\n=== SCHEMA: gst_invoice_items ===")
        row = cursor.execute("SELECT sql FROM sqlite_master WHERE name='gst_invoice_items'").fetchone()
        if row: print(row[0])

    except Exception as e:
        print(f"ERROR: {e}")
    finally:
        if 'conn' in locals() and conn: conn.close()

if __name__ == "__main__":
    inspect()

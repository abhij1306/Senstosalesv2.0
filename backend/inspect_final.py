
import sqlite3
db_path = "../db/business.db"
try:
    conn = sqlite3.connect(f"file:{db_path}?mode=ro", uri=True)
    c = conn.cursor()

    print("--- SCHEMA GST_INVOICES ---")
    row = c.execute("SELECT sql FROM sqlite_master WHERE name='gst_invoices'").fetchone()
    if row: print(row[0])
    
    print("\n--- SCHEMA GST_INVOICE_ITEMS ---")
    row = c.execute("SELECT sql FROM sqlite_master WHERE name='gst_invoice_items'").fetchone()
    if row: print(row[0])

    print("\n--- BUYERS TABLE INFO ---")
    for row in c.execute("PRAGMA table_info(buyers)"):
        print(row)

    print("\n--- BUYERS DATA ---")
    rows = c.execute("SELECT * FROM buyers LIMIT 5").fetchall()
    for row in rows: print(row)

except Exception as e:
    print(e)

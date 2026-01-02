import sqlite3
import os

db_path = os.path.join("db", "business.db")
conn = sqlite3.connect(db_path)
conn.row_factory = sqlite3.Row

print("--- Schema: srv_items ---")
cursor = conn.execute("PRAGMA table_info(srv_items)")
for row in cursor.fetchall():
    print(f"{row['cid']}: {row['name']} ({row['type']})")


import sqlite3

db_path = "temp_debug.db"

try:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    print("--- Buyers Table ---")
    rows = cursor.execute("SELECT * FROM buyers").fetchall()
    for row in rows:
        print(row)
    print("--------------------")

except Exception as e:
    print(f"Error: {e}")
finally:
    if conn:
        conn.close()

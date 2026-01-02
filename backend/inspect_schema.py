
import sqlite3

db_path = "temp_debug.db"

try:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = cursor.fetchall()
    print("--- All Tables ---")
    for t in tables:
        print(t[0])
    print("------------------")

except Exception as e:
    print(f"Error: {e}")
finally:
    if conn:
        conn.close()

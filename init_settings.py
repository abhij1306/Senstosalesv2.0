import sqlite3
import os

def init():
    # Use absolute path as requested by user feedback
    repo_root = r"c:\Users\abhij\.gemini\antigravity\scratch\SenstoSales"
    db_path = os.path.join(repo_root, "db", "database")
    
    print(f"Connecting to: {db_path}")
    if not os.path.exists(db_path):
        print("Database file NOT FOUND! Creating new one at", db_path)
    
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    
    try:
        conn.execute("CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT)")
        
        # Initialize with default 9.0 rates if not exists
        conn.execute("INSERT OR IGNORE INTO settings (key, value) VALUES ('cgst_rate', '9.0')")
        conn.execute("INSERT OR IGNORE INTO settings (key, value) VALUES ('sgst_rate', '9.0')")
        
        conn.commit()
    
        cursor = conn.execute("SELECT * FROM settings")
        settings = {row['key']: row['value'] for row in cursor.fetchall()}
        print(f"Current Settings in db/database: {settings}")
        
    finally:
        conn.close()

if __name__ == "__main__":
    init()

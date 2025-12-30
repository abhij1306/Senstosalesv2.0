import sqlite3
import os

DB_PATH = "db/business.db"

def dump_schema():
    if not os.path.exists(DB_PATH):
        print(f"Database not found at {DB_PATH}")
        return
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = [row[0] for row in cursor.fetchall()]
    print(f"Tables: {tables}")
    
    schema = {}
    for table in tables:
        cursor.execute(f"PRAGMA table_info({table})")
        schema[table] = [row[1] for row in cursor.fetchall()]
    
    import json
    with open("DB_SCHEMA_DUMP.json", "w") as f:
        json.dump(schema, f, indent=2)
    print("Schema dumped to DB_SCHEMA_DUMP.json")
    conn.close()

if __name__ == "__main__":
    dump_schema()

import sqlite3
import os

DB_PATH = "db/business.db"
MIGRATION_PATH = "backend/migrations/add_missing_tables.sql"

def run():
    print(f"Updating DB at {DB_PATH} with {MIGRATION_PATH}")
    if not os.path.exists(DB_PATH):
        print("DB not found!")
        return

    with sqlite3.connect(DB_PATH) as conn:
        with open(MIGRATION_PATH, 'r') as f:
            sql = f.read()
            conn.executescript(sql)
            print("Migration executed successfully.")

if __name__ == "__main__":
    run()

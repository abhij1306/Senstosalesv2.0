import os
import sqlite3

DB_PATH = r"c:\Users\abhij\.gemini\antigravity\scratch\SenstoSales\db\business.db"


def check_schema():
    if not os.path.exists(DB_PATH):
        print(f"DB not found at {DB_PATH}")
        return

    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("PRAGMA table_info(purchase_order_deliveries)")
        columns = cursor.fetchall()
        print("Columns in purchase_order_deliveries:")
        for col in columns:
            print(f"- {col[1]} ({col[2]})")
        conn.close()
    except Exception as e:
        print(f"Error: {e}")


if __name__ == "__main__":
    check_schema()

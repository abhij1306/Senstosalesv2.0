
import sqlite3
import os

DB_PATH = r"c:\Users\abhij\.gemini\antigravity\scratch\SenstoSales\db\business.db"

def migrate():
    if not os.path.exists(DB_PATH):
        print(f"Database not found at {DB_PATH}")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    try:
        print("Starting Schema Migration for Atomic Sync...")

        # 1. Add columns to purchase_order_deliveries (Lot Level)
        try:
            cursor.execute("ALTER TABLE purchase_order_deliveries ADD COLUMN delivered_qty NUMERIC DEFAULT 0")
            print("Added delivered_qty to purchase_order_deliveries")
        except sqlite3.OperationalError:
            print("delivered_qty already exists in purchase_order_deliveries")

        try:
            cursor.execute("ALTER TABLE purchase_order_deliveries ADD COLUMN received_qty NUMERIC DEFAULT 0")
            print("Added received_qty to purchase_order_deliveries")
        except sqlite3.OperationalError:
            print("received_qty already exists in purchase_order_deliveries")

        # 2. Add columns to purchase_order_items (Item Level)
        try:
            cursor.execute("ALTER TABLE purchase_order_items ADD COLUMN delivered_qty NUMERIC DEFAULT 0")
            print("Added delivered_qty to purchase_order_items")
        except sqlite3.OperationalError:
            print("delivered_qty already exists in purchase_order_items")

        # 3. Add columns to delivery_challan_items (Challan Line Level)
        # This allows us to track how much of a specific DC line has been received
        try:
            cursor.execute("ALTER TABLE delivery_challan_items ADD COLUMN received_qty NUMERIC DEFAULT 0")
            print("Added received_qty to delivery_challan_items")
        except sqlite3.OperationalError:
            print("received_qty already exists in delivery_challan_items")

        try:
            cursor.execute("ALTER TABLE delivery_challan_items ADD COLUMN accepted_qty NUMERIC DEFAULT 0")
            print("Added accepted_qty to delivery_challan_items")
        except sqlite3.OperationalError:
            print("accepted_qty already exists in delivery_challan_items")

        try:
            cursor.execute("ALTER TABLE delivery_challan_items ADD COLUMN rejected_qty NUMERIC DEFAULT 0")
            print("Added rejected_qty to delivery_challan_items")
        except sqlite3.OperationalError:
            print("rejected_qty already exists in delivery_challan_items")
            
        conn.commit()
        print("Migration Completed Successfully.")

    except Exception as e:
        print(f"Migration Failed: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    migrate()

import logging
import sqlite3

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

DB_PATH = r"c:\Users\abhij\.gemini\antigravity\scratch\SenstoSales\db\business.db"


def add_missing_column():
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()

        # Check if column exists
        cursor.execute("PRAGMA table_info(purchase_order_deliveries)")
        columns = [info[1] for info in cursor.fetchall()]

        if "received_qty" not in columns:
            logger.info("Adding 'received_qty' column to purchase_order_deliveries...")
            cursor.execute(
                "ALTER TABLE purchase_order_deliveries ADD COLUMN received_qty REAL DEFAULT 0"
            )
            conn.commit()
            logger.info("Column added successfully.")
        else:
            logger.info("'received_qty' column already exists.")

        conn.close()

    except Exception as e:
        logger.error(f"Migration failed: {e}")


if __name__ == "__main__":
    add_missing_column()

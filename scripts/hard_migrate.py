import sqlite3
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def migrate():
    conn = sqlite3.connect('db/business.db')
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # 1. Ensure Columns exist before reconstruction
    def ensure_col(table, col, type_info):
        try:
            cursor.execute(f"ALTER TABLE {table} ADD COLUMN {col} {type_info}")
            logger.info(f"Added column {col} to {table}")
        except sqlite3.OperationalError:
            pass # already exists
            
    ensure_col("purchase_order_deliveries", "delivered_qty", "DECIMAL(15,3) DEFAULT 0")
    ensure_col("purchase_order_deliveries", "received_qty", "DECIMAL(15,3) DEFAULT 0")
    ensure_col("delivery_challan_items", "received_qty", "DECIMAL(15,3) DEFAULT 0")
    ensure_col("delivery_challan_items", "accepted_qty", "DECIMAL(15,3) DEFAULT 0")
    ensure_col("delivery_challan_items", "rejected_qty", "DECIMAL(15,3) DEFAULT 0")
    ensure_col("purchase_order_items", "manual_delivered_qty", "DECIMAL(15,3) DEFAULT 0")
    ensure_col("purchase_order_items", "status", "TEXT DEFAULT 'Active'")
    ensure_col("srvs", "invoice_number", "TEXT")
    ensure_col("srvs", "is_active", "BOOLEAN DEFAULT 1")
    ensure_col("srv_items", "po_number", "TEXT")
    ensure_col("srv_items", "po_item_no", "INTEGER")
    ensure_col("srv_items", "lot_no", "INTEGER")
    ensure_col("srv_items", "challan_no", "TEXT")
    ensure_col("purchase_orders", "buyer_id", "INTEGER")
    
    # Commit these additions
    conn.commit()
    
    # 2. Run the full reconstruction script
    sql_file = 'migrations/024_strengthen_data_types.sql'
    with open(sql_file, 'r', encoding='utf-8') as f:
        sql = f.read()
        
    logger.info("Running definitive reconstruction migration...")
    try:
        cursor.execute("PRAGMA foreign_keys = OFF")
        cursor.executescript(sql)
        conn.commit()
        logger.info("Migration successful")
    except Exception as e:
        conn.rollback()
        logger.error(f"Migration failed: {e}")
        raise

if __name__ == "__main__":
    migrate()

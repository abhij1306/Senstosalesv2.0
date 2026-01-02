
import sqlite3
import shutil
from datetime import datetime

DB_PATH = "../db/business.db"
BACKUP_PATH = f"../db/business_backup_{int(datetime.now().timestamp())}.db"

def repair_db():
    print(f"Creating backup at {BACKUP_PATH}...")
    try:
        shutil.copy2(DB_PATH, BACKUP_PATH)
    except Exception as e:
        print(f"Backup failed: {e}")
        return

    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA foreign_keys = OFF")
    
    try:
        print("Starting repair...")
        # 1. Create correct table
        conn.execute("""
        CREATE TABLE IF NOT EXISTS gst_invoices_fixed (
            invoice_number TEXT PRIMARY KEY,
            invoice_date DATE NOT NULL,
            dc_number TEXT UNIQUE REFERENCES delivery_challans(dc_number),
            financial_year TEXT,
            buyer_name TEXT,
            buyer_gstin TEXT,
            buyer_address TEXT,
            po_numbers TEXT,
            buyers_order_date TEXT,
            gemc_number TEXT,
            gemc_date TEXT,
            mode_of_payment TEXT,
            payment_terms TEXT DEFAULT '45 Days',
            despatch_doc_no TEXT,
            srv_no TEXT,
            srv_date TEXT,
            vehicle_no TEXT,
            lr_no TEXT,
            transporter TEXT,
            destination TEXT,
            terms_of_delivery TEXT,
            buyer_state TEXT,
            buyer_state_code TEXT,
            taxable_value DECIMAL(15,2),
            cgst DECIMAL(15,2) DEFAULT 0,
            sgst DECIMAL(15,2) DEFAULT 0,
            igst DECIMAL(15,2) DEFAULT 0,
            total_invoice_value DECIMAL(15,2),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """)
        
        # 2. Copy data
        print("Copying data...")
        # We need to list columns to be safe, but SELECT * usually works if strict match.
        # Let's verify column count matching or just try INSERT INTO ... SELECT *
        try:
             conn.execute("INSERT INTO gst_invoices_fixed SELECT * FROM gst_invoices")
        except Exception as e:
            print(f"Direct copy failed ({e}), trying column mapping...")
            # Fallback: list columns common to both?
            # actually better to just fail and ask user if schema is vastly different
            raise e
            
        # 3. Swap
        print("Swapping tables...")
        conn.execute("DROP TABLE gst_invoices")
        conn.execute("ALTER TABLE gst_invoices_fixed RENAME TO gst_invoices")
        
        # 4. Re-enable FK
        conn.execute("PRAGMA foreign_keys = ON")
        
        # 5. Verify
        row = conn.execute("SELECT sql FROM sqlite_master WHERE name='gst_invoices'").fetchone()
        print("New Schema Definition:")
        print(row[0])
        
        if "PRIMARY KEY" in row[0]:
            print("SUCCESS: Primary Key restored.")
            conn.commit()
        else:
            print("FAILURE: Schema still missing PK. Rolling back.")
            conn.rollback()

    except Exception as e:
        print(f"Critical Error: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    repair_db()


import os
import sys
import traceback
import sqlite3
from pathlib import Path

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app.db import DATABASE_PATH, MIGRATIONS_DIR

def init_db_debug_v2():
    print(f"Checking database at: {DATABASE_PATH}")
    if DATABASE_PATH.exists():
        print(f"Removing existing database: {DATABASE_PATH}")
        try:
            os.remove(DATABASE_PATH)
            # Remove WAL/SHM files too
            wal = DATABASE_PATH.with_suffix(".db-wal")
            shm = DATABASE_PATH.with_suffix(".db-shm")
            if wal.exists(): os.remove(wal)
            if shm.exists(): os.remove(shm)
        except Exception as e:
            print(f"Failed to remove database: {e}")
            return

    print("Initializing new database...")
    
    # Initialize connection
    conn = sqlite3.connect(str(DATABASE_PATH))
    conn.execute("PRAGMA foreign_keys = ON") # Match app logic
    
    # List derived from db.py
    migration_files = [
        "v1_initial.sql",
        "002_add_alerts.sql",
        "003_add_drawing_number_and_po_notes.sql",
        "004_complete_schema_alignment.sql",
        "v4_add_srv_tables.sql",
        "005_add_srv_po_found.sql",
        "006_fix_srv_schema.sql",
        "007_add_missing_srv_fields.sql",
        "008_add_extended_srv_fields.sql",
        "009_add_lot_no_to_dc_items.sql",
        "012_add_rejected_qty_to_poi.sql",
        "013_add_document_sequences.sql",
        "014_add_settings.sql",
        "015_add_unique_constraints.sql",
        "016_atomic_accounting_triggers.sql",
        "017_fy_wise_unique_constraints.sql",
        "019_add_missing_invoice_fields.sql",
        "020_create_buyers_table.sql",
        "add_invoice_enhancements.sql",
        "add_indexes.sql",
        "022_dashboard_indexes.sql",
        "023_add_missing_sync_columns.sql",
        "024_strengthen_data_types.sql",
        "025_advanced_logic_strengthening.sql",
    ]

    cursor = conn.cursor()
    for filename in migration_files:
        file_path = MIGRATIONS_DIR / filename
        if file_path.exists():
            print(f"Applying migration: {filename}")
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    sql_script = f.read()
                cursor.executescript(sql_script)
            except Exception as e:
                print(f"FAILED to apply {filename}")
                print(f"Error: {e}")
                # Log to file
                with open('init_error_log.txt', 'w') as f:
                    f.write(f"FAILED to apply {filename}\n")
                    f.write(f"Error: {e}\n")
                    traceback.print_exc(file=f)
                return
        else:
            print(f"WARNING: Migration file not found: {file_path}")

    conn.commit()
    conn.close()
    print("SUCCESS: Database initialized.")

if __name__ == "__main__":
    init_db_debug_v2()

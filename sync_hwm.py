
import sqlite3
import os
import sys

# Add backend to path so we can import app
sys.path.append(os.path.join(os.getcwd(), "backend"))

from app.services.reconciliation_service import ReconciliationService

def sync_all():
    db_path = 'db/business.db'
    if not os.path.exists(db_path):
        # check alternative
        db_path = 'backend/db/business.db'
        if not os.path.exists(db_path):
            print("DB not found")
            return

    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    
    # Get all PO numbers
    pos = conn.execute("SELECT po_number FROM purchase_orders").fetchall()
    print(f"Syncing {len(pos)} POs...")
    
    for row in pos:
        po_num = row['po_number']
        print(f"Syncing {po_num}...")
        ReconciliationService.sync_po(conn, po_num)
        ReconciliationService.sync_po_status(conn, po_num)
    
    conn.commit()
    conn.close()
    print("Sync complete.")

if __name__ == "__main__":
    sync_all()

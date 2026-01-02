
import sqlite3
import os
import sys

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app.services.reconciliation_service import ReconciliationService

def sync_all():
    db_path = 'db/business.db'
    if not os.path.exists(db_path):
        print(f"DB not found at {db_path}")
        return

    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    
    try:
        # Get all PO numbers
        pos = conn.execute("SELECT po_number FROM purchase_orders").fetchall()
        print(f"Syncing {len(pos)} POs...")
        
        for row in pos:
            po_num = row['po_number']
            print(f"Syncing {po_num}...", end='\r')
            ReconciliationService.sync_po(conn, po_num)
        
        conn.commit()
        print("\nSync Complete!")
    except Exception as e:
        print(f"Error during sync: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    sync_all()

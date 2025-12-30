import sqlite3
import sys
import os

# Add backend to path to import ReconciliationService
sys.path.append(os.path.join(os.getcwd(), "backend"))

from app.services.reconciliation_service import ReconciliationService

DB_PATH = "db/business.db"

def mass_reconcile():
    if not os.path.exists(DB_PATH):
        print(f"Error: Database not found at {DB_PATH}")
        return

    db = sqlite3.connect(DB_PATH)
    db.row_factory = sqlite3.Row
    
    print("=== SenstoSales Mass Reconciliation (TOT-5) ===")
    
    # 1. Get all POs
    pos = db.execute("SELECT po_number FROM purchase_orders").fetchall()
    total = len(pos)
    print(f"Found {total} POs to reconcile.")

    for i, row in enumerate(pos):
        po_number = str(row['po_number'])
        try:
            ReconciliationService.sync_po(db, po_number)
            if (i + 1) % 10 == 0 or (i + 1) == total:
                print(f"[{i+1}/{total}] Synced PO {po_number}")
        except Exception as e:
            print(f"Error syncing PO {po_number}: {e}")

    # 2. Final Commit
    db.commit()
    print("✅ MASS RECONCILIATION COMPLETE.")
    db.close()

if __name__ == "__main__":
    mass_reconcile()

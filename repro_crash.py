import sqlite3
import os
import sys

# Setup Path
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.join(current_dir, "backend")
sys.path.append(backend_dir)

from app.services.po_service import POService

def debug_po(po_number):
    print(f"--- DEBUGGING PO {po_number} ---")
    db_path = os.path.join(current_dir, "db", "business.db")
    print(f"DB Path: {db_path}")
    
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    
    try:
        service = POService()
        detail = service.get_po_detail(conn, po_number)
        print("SUCCESS: Retrieved PO Detail")
    except Exception as e:
        print("\n!!! EXCEPTION CAUGHT !!!")
        print(f"Type: {type(e).__name__}")
        print(f"Message: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    debug_po("6694429") 

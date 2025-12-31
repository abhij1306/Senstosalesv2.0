
import os
import sys
import sqlite3

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app.db import get_connection, DATABASE_PATH
from app.services.ingest_po import po_ingestion_service

def verify_po_logic():
    print(f"Connecting to DB at: {DATABASE_PATH}")
    conn = get_connection()
    
    # Mock PO Data
    po_header = {
        "PURCHASE ORDER": "PO-TEST-UPLOAD-001",
        "PO DATE": "01.01.2023",
        "SUPP NAME M/S": "Test Supplier",
        "PO-VALUE": "1000.00",
        "PO STATUS": "Open"
    }
    
    po_items = [
        {
            "PO ITM": "10",
            "MATERIAL CODE": "MAT001",
            "DESCRIPTION": "Test Material",
            "ORD QTY": "100",
            "PO RATE": "10",
            "ITEM VALUE": "1000",
            "DELY DATE": "01.02.2023"
        }
    ]

    print("Ingesting Mock PO...")
    try:
        success, warnings = po_ingestion_service.ingest_po(conn, po_header, po_items)
        conn.commit()
        print(f"Success: {success}")
        print(f"Warnings: {warnings}")
        
        # Verify in DB
        row = conn.execute("SELECT * FROM purchase_orders WHERE po_number = 'PO-TEST-UPLOAD-001'").fetchone()
        if row:
            print("PO Found in DB!")
        else:
            print("PO NOT Found in DB!")
            
    except Exception as e:
        print(f"Ingestion Failed: {e}")
        import traceback
        traceback.print_exc()
    finally:
        conn.close()

if __name__ == "__main__":
    verify_po_logic()

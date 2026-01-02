import time
from pathlib import Path
import sys

# The backend directory needs to be in path for 'app' to be found
# However, we also need to import po_service.

from app.db import get_connection
from app.services.po_service import po_service

def benchmark():
    db = get_connection()
    try:
        start_time = time.time()
        results = po_service.list_pos(db)
        end_time = time.time()
        
        duration = end_time - start_time
        print(f"PO List retrieval took {duration:.4f} seconds")
        print(f"Total POs: {len(results)}")
        
        if duration < 0.5:
            print("✅ Performance goal met (sub-500ms)")
        else:
            print("❌ Performance goal NOT met")
            
    finally:
        db.close()

if __name__ == "__main__":
    benchmark()

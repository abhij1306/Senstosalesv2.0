
import os
import sys
import traceback
from pathlib import Path

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app.db import validate_database_path, DATABASE_PATH

def init_db_debug():
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
    try:
        validate_database_path()
        print("SUCCESS: Database initialized.")
    except Exception as e:
        print("FAILURE: Database initialization failed.")
        print(f"Error: {e}")
        traceback.print_exc()
        with open('init_error_log.txt', 'w') as f:
            f.write(f"Error: {e}\n")
            traceback.print_exc(file=f)

if __name__ == "__main__":
    init_db_debug()

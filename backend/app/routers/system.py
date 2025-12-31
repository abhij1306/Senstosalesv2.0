import logging
import os
import sqlite3
from fastapi import APIRouter, Depends, HTTPException
from app.db import get_db, init_db, DATABASE_PATH

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/system", tags=["System"])

@router.post("/reset-db")
def reset_database():
    """
    NUCLEAR RESET: Deletes the database and re-initializes from migrations.
    """
    try:
        logger.warning("NUCLEAR RESET INITIATED via API")
        
        # 1. Close any existing connections if possible (SQLite handles this reasonably well with WAL)
        # But we need to make sure the file can be deleted.
        
        db_file = str(DATABASE_PATH)
        wal_file = db_file + "-wal"
        shm_file = db_file + "-shm"
        
        # 1. Close all connections (best effort)
        # Note: SQLite in-process connections might still exist in the FastAPI request loop
        # We try to delete files; if they fail, we suggest a restart.
        
        deleted = []
        for f in [db_file, wal_file, shm_file]:
            if os.path.exists(f):
                try:
                    os.remove(f)
                    deleted.append(f)
                    logger.info(f"Deleted {f}")
                except Exception as e:
                    logger.error(f"Could not delete {f}: {e}")
                    raise HTTPException(status_code=500, detail=f"Database file is locked. Please restart the backend and try again. Error: {e}")
        
        # 2. Re-initialize the database
        conn = sqlite3.connect(db_file)
        try:
            # Enable WAL during init
            conn.execute("PRAGMA journal_mode = WAL")
            init_db(conn)
            logger.info("Database re-initialized successfully")
        finally:
            conn.close()
            
        return {"success": True, "message": f"Database reset complete. Deleted: {', '.join(deleted)}"}
        
    except Exception as e:
        logger.error(f"System reset failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

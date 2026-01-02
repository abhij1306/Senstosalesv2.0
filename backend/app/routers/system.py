import logging
import sqlite3

from fastapi import APIRouter, Depends, HTTPException

from app.db import get_db

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/system", tags=["System"])


@router.post("/reset-db")
def reset_database(db: sqlite3.Connection = Depends(get_db)):
    """
    NUCLEAR RESET: Clears all business data while preserving settings and master data.
    Uses truncation instead of file deletion to bypass lock issues.
    """
    try:
        logger.warning("NUCLEAR RESET INITIATED via API")

        # Tables to truncate (Business Data)
        business_tables = [
            "purchase_orders",
            "purchase_order_items",
            "purchase_order_deliveries",
            "delivery_challans",
            "delivery_challan_items",
            "gst_invoices",
            "gst_invoice_items",
            "srvs",
            "srv_items",
            "srv_po_notes",
            "document_sequences",
        ]

        for table in business_tables:
            try:
                db.execute(f"DELETE FROM {table}")
                logger.info(f"Cleared table: {table}")
            except sqlite3.OperationalError as e:
                logger.warning(f"Table {table} not found or could not be cleared: {e}")

        # Vacuum to shrink file size
        db.execute("VACUUM")
        db.commit()

        return {
            "success": True,
            "message": "Database reset complete. All business data purged.",
            "tables_cleared": business_tables,
            "preserved": ["HSN Master", "Buyers", "Settings", "Sync Logs"],
        }

    except Exception as e:
        logger.error(f"System reset failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Reset failed: {str(e)}") from e

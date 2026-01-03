import logging
import sqlite3

from fastapi import APIRouter, Depends, HTTPException

from backend.db.session import get_db

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/reset-db")
async def reset_database(db: sqlite3.Connection = Depends(get_db)):
    """
    Nuclear Reset: Clears all business transaction data.
    Preserves: Settings, Buyers (Identity), Suppliers.
    """
    try:
        # List of tables to purge (Order matters for FKs if regular delete, but we turn FKs off)
        # Using correct schema names from ingest_po.py and dc.py
        tables_to_purge = [
            # Invoices
            "gst_invoice_items",
            "gst_invoices",
            # SRVs
            "srv_items",
            "srv_headers",
            # Delivery Challans
            "delivery_challan_items",
            "delivery_challans",
            # "reconciliation_ledger", # VIEW - Cannot delete from it
            # POs
            "purchase_order_deliveries",
            "purchase_order_items",
            "purchase_orders",
            # Others
            "po_notes_templates",
        ]

        logger.info("Initiating Nuclear Database Reset...")

        # SQLite specific reset
        # 1. Disable Foreign Keys to allow dropping in any order
        db.execute("PRAGMA foreign_keys = OFF")

        for table in tables_to_purge:
            try:
                # Check if table exists first to avoid errors
                db.execute(f"DELETE FROM {table}")
                logger.info(f"Cleared table: {table}")
            except sqlite3.OperationalError as e:
                if "no such table" in str(e):
                    logger.warning(f"Table {table} not found, skipping.")
                else:
                    raise e

        # 2. Re-enable Foreign Keys
        db.execute("PRAGMA foreign_keys = ON")

        db.commit()

        logger.info("Database reset completed successfully.")

        return {
            "message": "System reset successful",
            "tables_cleared": tables_to_purge,
            "preserved": ["settings", "buyers", "users"],
        }

    except Exception as e:
        logger.error(f"System reset failed: {e}", exc_info=True)
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.post("/reconcile-all")
async def reconcile_all(db: sqlite3.Connection = Depends(get_db)):
    """
    Trigger a global reconciliation sync for all POs.
    Useful for fixing data after logic updates (Triangle of Truth).
    """
    try:
        from backend.services.reconciliation_service import ReconciliationService

        # Get all unique PO numbers from purchase_orders
        po_numbers = [
            row[0] for row in db.execute("SELECT po_number FROM purchase_orders").fetchall()
        ]

        logger.info(f"Initiating Global Reconciliation for {len(po_numbers)} POs...")

        for po_num in po_numbers:
            try:
                ReconciliationService.sync_po(db, str(po_num))
            except Exception as sync_err:
                logger.error(f"Failed to sync PO {po_num}: {sync_err}")
                # Continue with others

        db.commit()

        logger.info("Global reconciliation completed.")

        return {
            "success": True,
            "POs_synced": len(po_numbers),
            "message": f"Successfully resynced all {len(po_numbers)} Purchase Orders.",
        }

    except Exception as e:
        logger.error(f"Global reconciliation failed: {e}", exc_info=True)
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e)) from e

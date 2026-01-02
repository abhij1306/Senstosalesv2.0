"""
Common/Utility routes
Provides shared functionality across modules
"""

import logging
import sqlite3
from typing import Literal

from fastapi import APIRouter, Depends, Query

from app.core.utils import get_financial_year
from app.db import get_db

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/common", tags=["Common"])


@router.get("/check-duplicate")
def check_duplicate_number(
    type: Literal["DC", "Invoice"] = Query(..., description="Type of document to check"),
    number: str = Query(..., description="Document number to check for duplicates"),
    date: str = Query(..., description="Document date (ISO format YYYY-MM-DD)"),
    db: sqlite3.Connection = Depends(get_db),
):
    """
    Check if a DC or Invoice number already exists within the same financial year.

    CRITICAL BUSINESS RULE:
    - DC and Invoice numbers must be unique ACROSS both document types in the same FY
    - e.g., If DC "333" exists, Invoice "333" cannot be created in same FY
    - This prevents confusion and ensures clear document identification

    This is used by the frontend for real-time duplicate validation during data entry.

    Args:
        type: "DC" or "Invoice"
        number: Document number to check
        date: Document date (used to determine FY)

    Returns:
        {
            "exists": bool,
            "financial_year": str (e.g., "2024-25"),
            "conflict_type": str | None (e.g., "DC" or "Invoice" if cross-conflict)
        }
    """
    try:
        # Get financial year from date
        fy = get_financial_year(date)

        # Calculate FY boundaries
        year_start = fy.split("-")[0]
        full_year_start = f"{year_start}-04-01"
        year_end = f"20{fy.split('-')[1]}"
        full_year_end = f"{year_end}-03-31"

        exists = False
        conflict_type = None

        if type == "DC":
            # Check delivery_challans table (same type)
            dc_result = db.execute(
                """
                SELECT 1 FROM delivery_challans 
                WHERE dc_number = ? 
                AND dc_date >= ? AND dc_date <= ?
                LIMIT 1
                """,
                (number, full_year_start, full_year_end),
            ).fetchone()

            if dc_result:
                exists = True
                conflict_type = "DC"
            else:
                # Check gst_invoices table (cross-document conflict)
                invoice_result = db.execute(
                    """
                    SELECT 1 FROM gst_invoices 
                    WHERE invoice_number = ? 
                    AND invoice_date >= ? AND invoice_date <= ?
                    LIMIT 1
                    """,
                    (number, full_year_start, full_year_end),
                ).fetchone()

                if invoice_result:
                    exists = True
                    conflict_type = "Invoice"

        elif type == "Invoice":
            # Check gst_invoices table (same type)
            invoice_result = db.execute(
                """
                SELECT 1 FROM gst_invoices 
                WHERE invoice_number = ? 
                AND invoice_date >= ? AND invoice_date <= ?
                LIMIT 1
                """,
                (number, full_year_start, full_year_end),
            ).fetchone()

            if invoice_result:
                exists = True
                conflict_type = "Invoice"
            else:
                # Check delivery_challans table (cross-document conflict)
                dc_result = db.execute(
                    """
                    SELECT 1 FROM delivery_challans 
                    WHERE dc_number = ? 
                    AND dc_date >= ? AND dc_date <= ?
                    LIMIT 1
                    """,
                    (number, full_year_start, full_year_end),
                ).fetchone()

                if dc_result:
                    exists = True
                    conflict_type = "DC"

        logger.debug(
            f"Duplicate check for {type} #{number} in FY {fy}: "
            f"{'CONFLICT with ' + conflict_type if exists else 'OK'}"
        )

        return {"exists": exists, "financial_year": fy, "conflict_type": conflict_type}

    except Exception as e:
        logger.error(f"Error checking duplicate: {e}", exc_info=True)
        # Return False to allow creation (fail open for better UX)
        return {"exists": False, "financial_year": get_financial_year(date), "conflict_type": None}

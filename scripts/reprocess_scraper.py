import sqlite3
import sys
import os
import glob
from pathlib import Path
import logging

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Add backend to path to import services
sys.path.append(os.path.join(os.getcwd(), 'backend'))

try:
    from app.services.po_scraper import extract_items, extract_po_header
    from app.db import get_connection, DATABASE_PATH
except ImportError as e:
    logger.error(f"Failed to import backend modules. Make sure you are running from project root: {e}")
    sys.exit(1)

def reprocess_html_files(directory: str):
    """
    Scans directory for .html files, scrapes them, and updates DB items.
    """
    files = glob.glob(os.path.join(directory, "*.html"))
    if not files:
        logger.warning(f"No HTML files found in {directory}")
        return

    conn = sqlite3.connect(DATABASE_PATH)
    
    # Ensure FKs are enabled
    conn.execute("PRAGMA foreign_keys = ON")
    
    logger.info(f"Connected to DB at {DATABASE_PATH}")
    logger.info(f"Found {len(files)} files to process.")

    updated_count = 0
    errors = 0

    for file_path in files:
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                html_content = f.read()

            from bs4 import BeautifulSoup
            soup = BeautifulSoup(html_content, "html.parser")

            # 1. Get PO Number to identify record
            header = extract_po_header(soup)
            po_number = header.get("PURCHASE ORDER")
            
            if not po_number:
                logger.warning(f"Skipping {os.path.basename(file_path)}: Could not extract PO Number")
                continue

            # 2. Extract Items with NEW logic
            items = extract_items(soup)
            
            if not items:
                logger.warning(f"Skipping {os.path.basename(file_path)}: No items found")
                continue

            logger.info(f"Processing PO {po_number} from {os.path.basename(file_path)} ({len(items)} items)")

            # 3. Update DB
            cursor = conn.cursor()
            
            for item in items:
                po_itm = item['PO ITM']
                drg = item.get('DRG')
                desc = item.get('DESCRIPTION')
                
                # Check if item exists first? Or just update
                # We update by po_number + po_item_no
                
                cursor.execute("""
                    UPDATE purchase_order_items 
                    SET drg_no = ?, material_description = ?, updated_at = CURRENT_TIMESTAMP
                    WHERE po_number = ? AND po_item_no = ?
                """, (drg, desc, po_number, po_itm))
                
                if cursor.rowcount > 0:
                    updated_count += 1
            
            conn.commit()
            
        except Exception as e:
            logger.error(f"Error processing {file_path}: {e}")
            errors += 1

    conn.close()
    logger.info(f"Reprocessing complete. Updated {updated_count} items. Errors: {errors}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python scripts/reprocess_scraper.py <directory_of_html_files>")
        print("Example: python scripts/reprocess_scraper.py C:/PO_HTML_BACKUPS")
        # Default to current dir for testing
        reprocess_html_files(os.getcwd())
    else:
        reprocess_html_files(sys.argv[1])

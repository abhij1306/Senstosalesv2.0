import re
from bs4 import BeautifulSoup
import sys
import os

# Add backend to path to import services
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app.services.po_scraper import extract_items

if __name__ == "__main__":
    with open("1125370.html", "r", encoding="utf-8") as f:
        html = f.read()
    
    soup = BeautifulSoup(html, "html.parser")
    # Using actual function now
    items = extract_items(soup)
    
    print("--- NEW LOGIC OUTPUT ---")
    for item in items:
        # Truncate desc for cleaner output
        desc_short = (item['DESCRIPTION'][:30] + '...') if item['DESCRIPTION'] else "N/A"
        print(f"Item {item['PO ITM']}: Desc='{desc_short}' DRG='{item['DRG']}'")



import sys
import os
from bs4 import BeautifulSoup

# Add app to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.po_scraper import extract_po_header

HTML_PATHS = ["../6634396.html"]

def test_scraper():
    for text_file in HTML_PATHS:
        try:
            full_path = os.path.join(os.path.dirname(__file__), text_file)
            if not os.path.exists(full_path):
                print(f"Error: {full_path} not found")
                continue

            with open(full_path, "r", encoding="utf-8") as f:
                soup = BeautifulSoup(f.read(), "html.parser")
            
            header = extract_po_header(soup)
            
            print(f"--- EXTRACTED HEADER ({text_file}) ---")
            print(f"PO NUMBER: {header.get('PURCHASE ORDER')}")
            print(f"INSPECTION BY: {header.get('INSPECTION BY')}")
            print(f"RC NO: '{header.get('RC NO')}'")
            print(f"NAME: {header.get('NAME')}")
            print(f"DESIGNATION: {header.get('DESIGNATION')}")
            print(f"PHONE NO: {header.get('PHONE NO')}")
            
        except Exception as e:
            print(f"Error processing {text_file}: {e}")

if __name__ == "__main__":
    test_scraper()

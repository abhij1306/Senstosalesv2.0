
import sys
import os
from bs4 import BeautifulSoup
import re

HTML_PATH = "../1105063.html"

def debug_html():
    if not os.path.exists(HTML_PATH):
        print("HTML file not found")
        return

    with open(HTML_PATH, "r", encoding="utf-8") as f:
        soup = BeautifulSoup(f.read(), "html.parser")
    
    # 1. Find the element containing "INSPECTION BY"
    target = soup.find(string=re.compile("INSPECTION\s+BY", re.IGNORECASE))
    
    if target:
        print(f"--- FOUND STRING: '{target}' ---")
        parent = target.parent
        print(f"--- PARENT TAG: <{parent.name}> ---")
        print(f"--- PARENT TEXT: '{parent.get_text()}' ---")
        
        # Check siblings (Next Cell?)
        grandparent = parent.parent # tr?
        if grandparent.name == "tr":
            print("--- ROW DETECTED ---")
            cells = grandparent.find_all(["td", "th"])
            print(f"Total cells in row: {len(cells)}")
            for i, cell in enumerate(cells):
                txt = cell.get_text(strip=True)
                print(f"Cell {i}: '{txt}'")
                if "INSPECTION" in txt:
                    print(f"   (TARGET HIT at index {i})")
        else:
            print(f"--- GRANDPARENT IS <{grandparent.name}> (Not TR) ---")
            
    else:
        print("String 'INSPECTION BY' not found in HTML.")

if __name__ == "__main__":
    debug_html()

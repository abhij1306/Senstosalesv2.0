
import sys
import os
from bs4 import BeautifulSoup
import re

# Target the NEW file mentioned by the user
HTML_PATH = "../1115094.html"

def debug_rc_no():
    if not os.path.exists(HTML_PATH):
        print(f"Error: {HTML_PATH} not found")
        return

    with open(HTML_PATH, "r", encoding="utf-8") as f:
        soup = BeautifulSoup(f.read(), "html.parser")
    
    # Debug RC NO
    print("\n--- SEARCHING FOR 'RC NO' ---")
    targets = soup.find_all(string=re.compile(r"RC\s*NO", re.IGNORECASE))
    if not targets:
        print("String 'RC NO' not found.")
    
    for i, target in enumerate(targets):
        print(f"\nMatch #{i+1}: '{target}'")
        parent = target.parent
        print(f"Parent Tag: <{parent.name}>")
        
        # Check adjacent text nodes / siblings
        curr = target
        print("  Next 5 text nodes:")
        for j in range(5):
            curr = curr.find_next(string=True)
            if not curr: break
            txt = curr.strip()
            if txt:
                print(f"    {j+1}: '{txt}'")

if __name__ == "__main__":
    debug_rc_no()

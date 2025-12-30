import os
import re

TARGET_DIR = r"c:\Users\abhij\.gemini\antigravity\scratch\SenstoSales\frontend"
INJECTION_STRING = 'import { H1, H2, H3, H4, Body, SmallText, Label, Accounting } from"@/components/design-system/atoms/Typography";'

def purge_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if INJECTION_STRING not in content:
        return False
    
    print(f"Purging {filepath}...")
    
    # CASE 1: "use client"; import ... (on the same line)
    new_content = content.replace(f'"use client"; {INJECTION_STRING}', '"use client";')
    new_content = new_content.replace(f"'use client'; {INJECTION_STRING}", "'use client';")
    
    # CASE 2: The string by itself (possibly with newline)
    new_content = new_content.replace(INJECTION_STRING, "")
    
    # CASE 3: Clean up any double spaces that might have been left behind from Case 1
    new_content = new_content.replace('"use client";  ', '"use client";\n')

    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        return True
    return False

def main():
    count = 0
    for root, dirs, files in os.walk(TARGET_DIR):
        for file in files:
            if file.endswith(('.tsx', '.ts')):
                full_path = os.path.join(root, file)
                if purge_file(full_path):
                    count += 1
    print(f"Finished. Purged {count} files.")

if __name__ == "__main__":
    main()

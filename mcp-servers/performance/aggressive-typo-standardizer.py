#!/usr/bin/env python3
import re
from pathlib import Path

# Mapping of common tags + hardcoded classes to Atomic Components
# Using more specific regex to capture the whole tag if possible
TAG_TRANSFORMATIONS = [
    # H1
    (r'<(h1|div|span|p)\b([^>]*?\bclassName="[^"]*?)\btext-3xl\b([^"]*?"[^>]*?)>(.*?)</\1>', r'<H1\2\3>\4</H1>'),
    # H2
    (r'<(h2|div|span|p)\b([^>]*?\bclassName="[^"]*?)\btext-2xl\b([^"]*?"[^>]*?)>(.*?)</\2>', r'<H2\2\3>\4</H2>'),
    # H3
    (r'<(h3|div|span|p)\b([^>]*?\bclassName="[^"]*?)\btext-xl\b([^"]*?"[^>]*?)>(.*?)</\3>', r'<H3\2\3>\4</H3>'),
    # H4
    (r'<(h4|div|span|p)\b([^>]*?\bclassName="[^"]*?)\btext-lg\b([^"]*?"[^>]*?)>(.*?)</\4>', r'<H4\2\3>\4</H4>'),
    # Body (base/sm)
    (r'<(p|div|span)\b([^>]*?\bclassName="[^"]*?)\btext-(base|sm)\b([^"]*?"[^>]*?)>(.*?)</\1>', r'<Body\2\4>\5</Body>'),
    # SmallText (xs)
    (r'<(small|div|span|p)\b([^>]*?\bclassName="[^"]*?)\btext-xs\b([^"]*?"[^>]*?)>(.*?)</\1>', r'<SmallText\2\3>\4</SmallText>'),
]

TYPO_COMPONENTS = ["H1", "H2", "H3", "H4", "Body", "SmallText", "Label", "Accounting"]

def aggressive_standardize(path):
    try:
        content = path.read_text(encoding='utf-8')
        original = content
        
        # 1. Ensure Atomic Typography import is complete
        import_stmt = f'import {{ {", ".join(TYPO_COMPONENTS)} }} from "@/components/design-system/atoms/Typography";'
        if import_stmt[:40] not in content:
            # Add or update import
            if 'from "@/components/design-system/atoms/Typography"' in content:
                content = re.sub(r'import {[^}]*} from "@/components/design-system/atoms/Typography";', import_stmt, content)
            else:
                use_client = re.search(r'^"use client";?\s*', content)
                if use_client:
                    content = content[:use_client.end()] + import_stmt + "\n" + content[use_client.end():]
                else:
                    content = import_stmt + "\n" + content
        
        # 2. Tag transformations (Limited to simple non-nested cases)
        # We'll stick to class removal first as it's safer, but user wants 95%+
        for pattern, replacement in TAG_TRANSFORMATIONS:
             content = re.sub(pattern, replacement, content, flags=re.DOTALL)
        
        # 3. Final class cleanup for any remaining text-* occurrences
        content = re.sub(r'\btext-(xs|sm|base|lg|xl|2xl|3xl)\b', '', content)
        
        # 4. Clean up whitespace in className
        content = re.sub(r'className="(\s+)', 'className="', content)
        content = re.sub(r'\s+"', '"', content)
        content = re.sub(r'\s{2,}', ' ', content)

        if content != original:
            path.write_text(content, encoding='utf-8')
            return True
        return False
    except Exception as e:
        print(f"Error {path}: {e}")
        return False

def main():
    root = Path("frontend")
    modified = 0
    total = 0
    
    for p in root.rglob("*.tsx"):
        if "node_modules" in str(p) or ".next" in str(p): continue
        total += 1
        if aggressive_standardize(p):
            modified += 1
                
    print(f"✅ Aggressive Typography Sync Complete!")
    print(f"   Files searched: {total}")
    print(f"   Files modified: {modified}")

if __name__ == "__main__":
    main()

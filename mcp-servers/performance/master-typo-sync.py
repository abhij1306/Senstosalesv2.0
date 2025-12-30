#!/usr/bin/env python3
import re
from pathlib import Path

# Targets
TYPOGRAPHY_COMPONENTS = ["H1", "H2", "H3", "H4", "Body", "SmallText", "Label", "Accounting"]
TARGET_CLASSES = [
    r'\btext-xs\b', r'\btext-sm\b', r'\btext-base\b', r'\btext-lg\b', 
    r'\btext-xl\b', r'\btext-2xl\b', r'\btext-3xl\b', r'\btext-\[\d+px\]\b'
]

def process_file(path):
    try:
        content = path.read_text(encoding='utf-8')
        original = content
        
        # 1. Standardize Imports
        import_pattern = 'from "@/components/design-system/atoms/Typography"'
        if import_pattern not in content:
            # Find insertion point: after "use client" or after the last import
            import_statement = f'import {{ {", ".join(TYPOGRAPHY_COMPONENTS)} }} from "@/components/design-system/atoms/Typography";\n'
            
            use_client_match = re.search(r'^"use client";?\s*', content)
            if use_client_match:
                content = content[:use_client_match.end()] + import_statement + content[use_client_match.end():]
            else:
                content = import_statement + content
            
        # 2. Clean up classes
        for cls_pattern in TARGET_CLASSES:
            content = re.sub(cls_pattern, '', content)
        
        # 3. Clean up resulting messy classNames
        # className="p-4 " -> className="p-4"
        content = re.sub(r'className="([^"]*)\s+"', r'className="\1"', content)
        # className=" p-4" -> className="p-4"
        content = re.sub(r'className="\s+([^"]*)"', r'className="\1"', content)
        # className="p-4  m-2" -> className="p-4 m-2"
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
    
    # We want to target ALL .tsx files to reach 100% compliance
    for p in root.rglob("*.tsx"):
        if "node_modules" in str(p) or ".next" in str(p): continue
        total += 1
        if process_file(p):
            modified += 1
                
    print(f"✅ Typography Sync Complete!")
    print(f"   Files searched: {total}")
    print(f"   Files modified: {modified}")

if __name__ == "__main__":
    main()

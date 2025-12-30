#!/usr/bin/env python3
"""
Final Tailwind Color Cleanup
Catches remaining edge cases
"""

import re
from pathlib import Path

ADDITIONAL_REPLACEMENTS = {
    # Borders
    r'border-gray-300\b': 'border-sys-tertiary/30',
    r'border-gray-200\b': 'border-sys-tertiary/20',
    r'border-slate-300\b': 'border-sys-tertiary/30',
    r'border-slate-200\b': 'border-sys-tertiary/20',
    
    # Focus rings
    r'focus:ring-blue-500\b': 'focus:ring-sys-brand',
    r'focus:ring-blue-600\b': 'focus:ring-sys-brand',
    
    # Hover states
    r'hover:bg-gray-100\b': 'hover:bg-sys-bg-tertiary',
    r'hover:bg-slate-100\b': 'hover:bg-sys-bg-tertiary',
    r'hover:text-blue-700\b': 'hover:text-sys-brand',
    
    # Amber/Orange (warning)
    r'text-amber-700\b': 'text-sys-warning',
    r'bg-amber-50\b': 'bg-sys-warning-subtle',
    r'border-amber-200\b': 'border-sys-warning/20',
    r'from-amber-400\b': 'from-sys-warning',
    r'to-orange-500\b': 'to-sys-warning',
    r'from-amber-500\b': 'from-sys-warning',
    r'to-orange-600\b': 'to-sys-warning',
    r'from-amber-600\b': 'from-sys-warning',
    r'to-orange-700\b': 'to-sys-warning',
}

def fix_file(path: Path) -> int:
    try:
        content = path.read_text(encoding='utf-8')
        original = content
        fixes = 0
        
        for pattern, replacement in ADDITIONAL_REPLACEMENTS.items():
            matches = re.findall(pattern, content)
            if matches:
                content = re.sub(pattern, replacement, content)
                fixes += len(matches)
        
        if content != original:
            path.write_text(content, encoding='utf-8')
            return fixes
        return 0
    except:
        return 0

def main():
    frontend = Path(__file__).parent.parent.parent / "frontend"
    files = list(frontend.glob("**/*.tsx"))
    
    total = 0
    modified = 0
    
    for f in files:
        fixes = fix_file(f)
        if fixes:
            total += fixes
            modified += 1
            print(f"✓ {f.relative_to(frontend)}: {fixes}")
    
    print(f"\n✅ {total} fixes across {modified} files")

if __name__ == "__main__":
    main()

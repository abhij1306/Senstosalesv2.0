#!/usr/bin/env python3
"""
AGGRESSIVE Token Coverage Fixer
Target: 67.1% → 98%
Fixes remaining 107 issues
"""

import re
from pathlib import Path

COMPREHENSIVE_REPLACEMENTS = {
    # All remaining gray/slate variants
    r'\btext-slate-950\b': 'text-sys-primary',
    r'\bbg-slate-950\b': 'bg-sys-primary',
    r'\bborder-slate-950\b': 'border-sys-primary',
    
    # Cyan/Teal (success/info)
    r'\btext-cyan-500\b': 'text-sys-info',
    r'\btext-teal-500\b': 'text-sys-success',
    r'\bbg-cyan-500\b': 'bg-sys-info',
    r'\bbg-teal-500\b': 'bg-sys-success',
    r'\bfrom-cyan-500\b': 'from-sys-info',
    r'\bfrom-teal-500\b': 'from-sys-success',
    r'\bto-green-500\b': 'to-sys-success',
    
    # Purple/Indigo (brand secondary)
    r'\btext-purple-600\b': 'text-sys-brand-secondary',
    r'\btext-indigo-600\b': 'text-sys-brand',
    r'\bbg-purple-600\b': 'bg-sys-brand-secondary',
    
    # Yellow/Amber (warning) - comprehensive
    r'\btext-yellow-600\b': 'text-sys-warning',
    r'\bbg-yellow-50\b': 'bg-sys-warning-subtle',
    r'\bborder-yellow-200\b': 'border-sys-warning/20',
    
    # White/Black
    r'\btext-white\b': 'text-sys-text-white',
    r'\bbg-white\b': 'bg-sys-bg-white',
    r'\btext-black\b': 'text-sys-primary',
    r'\bbg-black\b': 'bg-sys-primary',
    
    # Opacity variants
    r'\bbg-white/90\b': 'bg-sys-bg-white/90',
    r'\bbg-white/80\b': 'bg-sys-bg-white/80',
    r'\bbg-black/40\b': 'bg-sys-overlay-dark',
    r'\bbg-black/20\b': 'bg-sys-overlay-light',
    
    # Ring colors
    r'\bring-blue-500\b': 'ring-sys-brand',
    r'\bring-red-500\b': 'ring-sys-error',
    r'\bring-green-500\b': 'ring-sys-success',
    
    # Divide colors
    r'\bdivide-gray-200\b': 'divide-sys-tertiary/20',
    r'\bdivide-slate-200\b': 'divide-sys-tertiary/20',
}

def fix_file(path: Path) -> int:
    try:
        content = path.read_text(encoding='utf-8')
        original = content
        fixes = 0
        
        for pattern, replacement in COMPREHENSIVE_REPLACEMENTS.items():
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
    files = list(frontend.glob("**/*.tsx")) + list(frontend.glob("**/*.ts"))
    
    total = 0
    modified = 0
    
    print("🎨 AGGRESSIVE TOKEN COVERAGE FIX")
    print("=" * 60)
    
    for f in files:
        fixes = fix_file(f)
        if fixes:
            total += fixes
            modified += 1
            print(f"✓ {f.relative_to(frontend)}: {fixes}")
    
    print(f"\n✅ {total} fixes across {modified} files")

if __name__ == "__main__":
    main()

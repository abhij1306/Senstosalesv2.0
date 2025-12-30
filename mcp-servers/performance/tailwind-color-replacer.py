#!/usr/bin/env python3
"""
Comprehensive Tailwind Color Replacer
Replaces ALL raw Tailwind colors with semantic CSS variables
"""

import re
from pathlib import Path
from typing import Dict

# Comprehensive color mappings
REPLACEMENTS = {
    # Gray/Slate
    r'text-gray-300\b': 'text-sys-tertiary',
    r'text-gray-400\b': 'text-sys-tertiary',
    r'text-gray-500\b': 'text-sys-secondary',
    r'text-gray-600\b': 'text-sys-secondary',
    r'text-gray-700\b': 'text-sys-primary',
    r'text-gray-800\b': 'text-sys-primary',
    r'text-gray-900\b': 'text-sys-primary',
    r'text-slate-300\b': 'text-sys-tertiary',
    r'text-slate-400\b': 'text-sys-tertiary',
    r'text-slate-500\b': 'text-sys-secondary',
    r'text-slate-600\b': 'text-sys-secondary',
    r'text-slate-700\b': 'text-sys-primary',
    r'text-slate-800\b': 'text-sys-primary',
    r'text-slate-900\b': 'text-sys-primary',
    
    # Blue (Brand)
    r'text-blue-600\b': 'text-sys-brand',
    r'text-blue-700\b': 'text-sys-brand',
    r'text-blue-800\b': 'text-sys-brand',
    r'bg-blue-50\b': 'bg-sys-brand-subtle',
    r'bg-blue-100\b': 'bg-sys-brand-subtle',
    r'border-blue-200\b': 'border-sys-brand/20',
    r'border-blue-300\b': 'border-sys-brand/30',
    
    # Red (Error)
    r'text-red-600\b': 'text-sys-error',
    r'text-red-700\b': 'text-sys-error',
    r'text-red-800\b': 'text-sys-error',
    r'text-red-900\b': 'text-sys-error',
    r'bg-red-50\b': 'bg-sys-error-subtle',
    r'bg-red-100\b': 'bg-sys-error-subtle',
    r'border-red-200\b': 'border-sys-error/20',
    r'border-red-300\b': 'border-sys-error/30',
    
    # Green (Success)
    r'text-green-600\b': 'text-sys-success',
    r'text-green-700\b': 'text-sys-success',
    r'bg-green-50\b': 'bg-sys-success-subtle',
    
    # Gray backgrounds
    r'bg-gray-50\b': 'bg-sys-bg-tertiary',
    r'bg-gray-100\b': 'bg-sys-bg-tertiary',
    r'bg-gray-200\b': 'bg-sys-bg-tertiary',
    r'bg-slate-50\b': 'bg-sys-bg-tertiary',
    r'bg-slate-100\b': 'bg-sys-bg-tertiary',
    r'bg-slate-200\b': 'bg-sys-bg-tertiary',
}

def replace_colors_in_file(file_path: Path) -> int:
    """Replace all raw Tailwind colors in a file"""
    try:
        content = file_path.read_text(encoding='utf-8')
        original = content
        fixes = 0
        
        for pattern, replacement in REPLACEMENTS.items():
            matches = re.findall(pattern, content)
            if matches:
                content = re.sub(pattern, replacement, content)
                fixes += len(matches)
        
        if content != original:
            file_path.write_text(content, encoding='utf-8')
            return fixes
        return 0
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return 0

def main():
    frontend = Path(__file__).parent.parent.parent / "frontend"
    
    # Process all TSX files
    tsx_files = list(frontend.glob("**/*.tsx"))
    
    total_fixes = 0
    files_modified = 0
    
    print("🎨 Replacing raw Tailwind colors with semantic tokens...")
    print(f"Processing {len(tsx_files)} files...\n")
    
    for file in tsx_files:
        fixes = replace_colors_in_file(file)
        if fixes > 0:
            total_fixes += fixes
            files_modified += 1
            print(f"✓ {file.relative_to(frontend)}: {fixes} fixes")
    
    print(f"\n✅ Complete!")
    print(f"   Files modified: {files_modified}")
    print(f"   Total fixes: {total_fixes}")

if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
Automated Dark Theme Fixer
Automatically fixes common dark theme issues by replacing hardcoded colors with CSS variables
"""

import json
import re
from pathlib import Path
from typing import Dict, List, Tuple

# Color mapping: hardcoded color -> CSS variable
COLOR_MAPPINGS = {
    # Grays
    "#F9FAFB": "var(--color-sys-bg-primary)",
    "#F3F4F6": "var(--color-sys-bg-primary)",
    "#E5E7EB": "var(--color-sys-surface-glass_border)",
    "#D1D5DB": "var(--color-sys-surface-glass_border)",
    "#9CA3AF": "var(--color-sys-text-secondary)",
    "#6B7280": "var(--color-sys-text-secondary)",
    "#4B5563": "var(--color-sys-text-primary)",
    "#374151": "var(--color-sys-text-primary)",
    "#1F2937": "var(--sys-bg-surface)",
    "#111827": "var(--sys-bg-surface)",
    
    # Blues (Brand)
    "#EFF6FF": "var(--color-sys-brand-bg-subtle)",
    "#DBEAFE": "var(--color-sys-brand-bg-subtle)",
    "#BFDBFE": "var(--color-sys-brand-secondary)",
    "#93C5FD": "var(--color-sys-brand-secondary)",
    "#60A5FA": "var(--color-sys-brand-secondary)",
    "#3B82F6": "var(--color-sys-brand-primary)",
    "#2563EB": "var(--color-sys-brand-primary)",
    "#1D4ED8": "var(--color-sys-brand-primary)",
    "#1E40AF": "var(--color-sys-brand-primary)",
    "#1A3D7C": "var(--color-sys-brand-primary)",
    
    # Greens (Success)
    "#ECFDF5": "var(--color-sys-status-success-bg)",
    "#10B981": "var(--color-sys-status-success)",
    "#059669": "var(--color-sys-status-success)",
    "#047857": "var(--color-sys-status-success)",
    "#2BB7A0": "var(--color-sys-status-success)",
    
    # Reds (Error)
    "#FEF2F2": "var(--color-sys-status-error-bg)",
    "#FEE2E2": "var(--color-sys-status-error-bg)",
    "#EF4444": "var(--color-sys-status-error)",
    "#DC2626": "var(--color-sys-status-error)",
    "#991B1B": "var(--color-sys-status-error)",
    
    # Yellows/Amber (Warning)
    "#FFFBEB": "var(--color-sys-status-warning-bg)",
    "#FEF3C7": "var(--color-sys-status-warning-bg)",
    "#FBBF24": "var(--color-sys-status-warning)",
    "#F59E0B": "var(--color-sys-status-warning)",
    "#D97706": "var(--color-sys-status-warning)",
    
    # Purples
    "#8B5CF6": "var(--color-sys-accent-purple)",
    "#7C3AED": "var(--color-sys-accent-purple)",
    
    # White/Black
    "#FFFFFF": "var(--color-sys-text-white)",
    "#000000": "var(--color-sys-text-black)",
    
    # Special cases
    "#F6F8FB": "var(--color-sys-bg-primary)",
    "#f0f0f0": "var(--color-sys-bg-primary)",
}

# RGBA mappings
RGBA_MAPPINGS = {
    "rgba(0,0,0,0.02)": "var(--color-sys-overlay-subtle)",
    "rgba(0,0,0,0.05)": "var(--color-sys-overlay-light)",
    "rgba(0,0,0,0.1)": "var(--color-sys-overlay-medium)",
    "rgba(0,0,0,0.12)": "var(--color-sys-overlay-medium)",
    "rgba(0,0,0,0.15)": "var(--color-sys-overlay-strong)",
    "rgba(0,0,0,0.2)": "var(--color-sys-overlay-strong)",
    "rgba(255,255,255,0.2)": "var(--color-sys-surface-glass_border)",
    "rgba(255,255,255,0.8)": "var(--color-sys-surface-glass)",
    "rgba(255,255,255,1)": "var(--color-sys-text-white)",
}

class DarkThemeFixer:
    def __init__(self, frontend_path: Path, dry_run: bool = False):
        self.frontend_path = frontend_path
        self.dry_run = dry_run
        self.fixes_applied = 0
        self.files_modified = set()
    
    def fix_file(self, file_path: Path) -> int:
        """Fix a single file and return number of fixes applied"""
        try:
            content = file_path.read_text(encoding='utf-8')
            original_content = content
            fixes_in_file = 0
            
            # Skip if it's a token definition file
            if 'globals.css' in str(file_path) or 'tokens.css' in str(file_path):
                return 0
            
            # Fix hex colors
            for hex_color, css_var in COLOR_MAPPINGS.items():
                # Case insensitive replacement
                pattern = re.compile(re.escape(hex_color), re.IGNORECASE)
                matches = pattern.findall(content)
                if matches:
                    content = pattern.sub(css_var, content)
                    fixes_in_file += len(matches)
            
            # Fix RGBA colors
            for rgba_color, css_var in RGBA_MAPPINGS.items():
                # Remove spaces for matching
                pattern = rgba_color.replace(" ", "")
                content_no_spaces = content.replace(" ", "")
                
                if pattern in content_no_spaces:
                    # Replace with spaces preserved
                    content = content.replace(rgba_color, css_var)
                    content = content.replace(rgba_color.replace(",", ", "), css_var)
                    fixes_in_file += 1
            
            # Only write if changes were made
            if content != original_content:
                if not self.dry_run:
                    file_path.write_text(content, encoding='utf-8')
                self.files_modified.add(str(file_path.relative_to(self.frontend_path)))
                self.fixes_applied += fixes_in_file
                return fixes_in_file
            
            return 0
            
        except Exception as e:
            print(f"Error fixing {file_path}: {e}")
            return 0
    
    def fix_all_files(self) -> Dict:
        """Fix all TSX files in the frontend"""
        tsx_files = list(self.frontend_path.glob('**/*.tsx'))
        
        print(f"🔧 Fixing {len(tsx_files)} files...")
        
        for file in tsx_files:
            self.fix_file(file)
        
        return {
            "fixes_applied": self.fixes_applied,
            "files_modified": len(self.files_modified),
            "modified_files": sorted(list(self.files_modified))
        }

def main():
    import argparse
    
    parser = argparse.ArgumentParser(description="Automatically fix dark theme issues")
    parser.add_argument("--dry-run", action="store_true", help="Preview changes without applying them")
    args = parser.parse_args()
    
    frontend_path = Path(__file__).parent.parent.parent / "frontend"
    
    print("🌙 Dark Theme Auto-Fixer")
    print("=" * 60)
    
    if args.dry_run:
        print("🔍 DRY RUN MODE - No files will be modified")
        print("=" * 60)
    
    fixer = DarkThemeFixer(frontend_path, dry_run=args.dry_run)
    results = fixer.fix_all_files()
    
    print("\n" + "=" * 60)
    print("📊 RESULTS")
    print("=" * 60)
    print(f"✅ Fixes Applied: {results['fixes_applied']}")
    print(f"📝 Files Modified: {results['files_modified']}")
    
    if results['modified_files']:
        print("\n📄 Modified Files:")
        for file in results['modified_files'][:10]:  # Show first 10
            print(f"  - {file}")
        
        if len(results['modified_files']) > 10:
            print(f"  ... and {len(results['modified_files']) - 10} more")
    
    if args.dry_run:
        print("\n💡 Run without --dry-run to apply these changes")
    else:
        print("\n✨ Changes have been applied!")
        print("🔄 Run the audit again to verify improvements")
    
    return results

if __name__ == "__main__":
    main()

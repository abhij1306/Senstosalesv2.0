#!/usr/bin/env python3
import re
from pathlib import Path

# Mapping of Tailwind base colors to semantic tokens
COLOR_MAP = {
    'slate-950': 'sys-primary',
    'slate-900': 'sys-primary',
    'slate-800': 'sys-primary',
    'slate-700': 'sys-primary',
    'slate-600': 'sys-secondary',
    'slate-500': 'sys-secondary',
    'slate-400': 'sys-tertiary',
    'slate-300': 'sys-tertiary',
    'slate-200': 'sys-tertiary/20',
    'slate-100': 'sys-bg-tertiary',
    'slate-50': 'sys-bg-tertiary',
    
    'gray-900': 'sys-primary',
    'gray-800': 'sys-primary',
    'gray-700': 'sys-primary',
    'gray-600': 'sys-secondary',
    'gray-500': 'sys-secondary',
    'gray-400': 'sys-tertiary',
    'gray-300': 'sys-tertiary',
    'gray-200': 'sys-tertiary/20',
    'gray-100': 'sys-bg-tertiary',
    'gray-50': 'sys-bg-tertiary',
    
    'blue-900': 'sys-brand',
    'blue-800': 'sys-brand',
    'blue-700': 'sys-brand',
    'blue-600': 'sys-brand',
    'blue-500': 'sys-brand',
    'blue-400': 'sys-brand-secondary',
    'blue-300': 'sys-brand/30',
    'blue-200': 'sys-brand/20',
    'blue-100': 'sys-brand-subtle',
    'blue-50': 'sys-brand-subtle',
    
    'red-900': 'sys-error',
    'red-800': 'sys-error',
    'red-700': 'sys-error',
    'red-600': 'sys-error',
    'red-500': 'sys-error',
    'red-400': 'sys-error',
    'red-200': 'sys-error/20',
    'red-100': 'sys-error-subtle',
    'red-50': 'sys-error-subtle',
    
    'green-600': 'sys-success',
    'green-500': 'sys-success',
    'green-100': 'sys-success-subtle',
    'green-50': 'sys-success-subtle',
    
    'yellow-600': 'sys-warning',
    'yellow-500': 'sys-warning',
    'yellow-100': 'sys-warning-subtle',
    'yellow-50': 'sys-warning-subtle',
    
    'white': 'sys-bg-white',
    'black': 'sys-primary',
}

# Mapping of Tailwind text sizes to Typography components
TYPO_MAP = {
    'text-3xl': 'H1',
    'text-2xl': 'H2',
    'text-xl': 'H3',
    'text-lg': 'H4',
    'text-base': 'Body',
    'text-sm': 'Body',
    'text-xs': 'SmallText',
}

def fix_content(content):
    # 1. Color Replacements (bg-, text-, border-, ring-, etc.)
    prefixes = ['bg', 'text', 'border', 'ring', 'divide', 'from', 'to', 'via']
    for prefix in prefixes:
        for tw_color, semantic in COLOR_MAP.items():
            pattern = rf'\b{prefix}-{tw_color}\b'
            replacement = f'{prefix}-{semantic}'
            content = re.sub(pattern, replacement, content)
    
    # 2. Typography Replacements
    # We target common tags and replace them with components
    # Specifically looking for tags that HAVE a typography class
    for size, component in TYPO_MAP.items():
        # Case A: <div/span/p/hX className="... text-size ..."> ... </div/span/p/hX>
        # This is a bit complex for regex, so we'll do the class replacement first
        # and then a separate pass for tag replacement if appropriate.
        pass

    # Simple class-to-class for typography if within a component already
    # e.g. <Body className="text-xs"> -> <SmallText className="">
    content = re.sub(r'<Body([^>]+)text-xs([^>]+)>', r'<SmallText\1 \2>', content)
    content = re.sub(r'<Body([^>]+)text-lg([^>]+)>', r'<H4\1 \2>', content)
    content = re.sub(r'<Body([^>]+)text-xl([^>]+)>', r'<H3\1 \2>', content)
    
    # Cleanup extra spaces
    content = re.sub(r'\s{2,}', ' ', content)
    
    return content

def main():
    frontend = Path('frontend')
    for ext in ['*.tsx', '*.ts', '*.css']:
        for path in frontend.rglob(ext):
            if 'node_modules' in str(path) or '.next' in str(path):
                continue
            try:
                original = path.read_text(encoding='utf-8')
                fixed = fix_content(original)
                if fixed != original:
                    path.write_text(fixed, encoding='utf-8')
                    print(f"Fixed: {path}")
            except Exception as e:
                print(f"Error {path}: {e}")

if __name__ == "__main__":
    main()

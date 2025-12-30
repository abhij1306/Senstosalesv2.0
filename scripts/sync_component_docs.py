#!/usr/bin/env python3
"""
Bidirectional Documentation Sync
Syncs component JSDoc comments with Markdown docs and in-app tooltips
"""

import json
import re
from pathlib import Path
from typing import Dict, List, Any
from datetime import datetime

# Project paths
FRONTEND_DIR = Path(__file__).parent.parent / "frontend"
COMPONENTS_DIR = FRONTEND_DIR / "components" / "design-system"
DOCS_DIR = Path(__file__).parent.parent / "docs"
TOOLTIPS_FILE = FRONTEND_DIR / "lib" / "tooltips.json"

def extract_component_metadata(file_path: Path) -> Dict[str, Any]:
    """Extract metadata from component file"""
    content = file_path.read_text(encoding='utf-8')
    
    # Extract JSDoc comment
    jsdoc_pattern = r'/\*\*\s*\n\s*\*\s*([^\n]+)\s*\n(?:\s*\*\s*([^\n]*)\s*\n)*\s*\*/'
    jsdoc_match = re.search(jsdoc_pattern, content)
    
    description = ""
    if jsdoc_match:
        description = jsdoc_match.group(1).strip()
    
    # Extract component name
    component_pattern = r'export\s+(?:const|function)\s+(\w+)'
    component_match = re.search(component_pattern, content)
    
    component_name = file_path.stem
    if component_match:
        component_name = component_match.group(1)
    
    # Extract props interface
    props_pattern = r'interface\s+(\w+Props)\s*{([^}]+)}'
    props_match = re.search(props_pattern, content)
    
    props = []
    if props_match:
        props_content = props_match.group(2)
        # Extract individual props
        prop_pattern = r'(\w+)(?:\?)?:\s*([^;]+);'
        for prop_match in re.finditer(prop_pattern, props_content):
            prop_name, prop_type = prop_match.groups()
            props.append({
                "name": prop_name.strip(),
                "type": prop_type.strip()
            })
    
    return {
        "name": component_name,
        "description": description,
        "file": str(file_path.relative_to(FRONTEND_DIR)),
        "props": props,
        "category": file_path.parent.name
    }

def generate_component_docs(components: List[Dict[str, Any]]) -> str:
    """Generate Markdown documentation for components"""
    md = f"""# Component Reference

**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}  
**Auto-synced from JSDoc comments**

## Design System Components

"""
    
    # Group by category
    by_category = {}
    for comp in components:
        cat = comp["category"]
        if cat not in by_category:
            by_category[cat] = []
        by_category[cat].append(comp)
    
    for category in ["atoms", "molecules", "organisms", "templates"]:
        if category not in by_category:
            continue
        
        md += f"\n### {category.capitalize()}\n\n"
        
        for comp in sorted(by_category[category], key=lambda x: x["name"]):
            md += f"#### `{comp['name']}`\n\n"
            
            if comp["description"]:
                md += f"{comp['description']}\n\n"
            
            if comp["props"]:
                md += "**Props:**\n\n"
                for prop in comp["props"]:
                    md += f"- `{prop['name']}`: `{prop['type']}`\n"
                md += "\n"
            
            md += f"**File:** `{comp['file']}`\n\n"
            md += "---\n\n"
    
    return md

def generate_tooltips_json(components: List[Dict[str, Any]]) -> Dict[str, str]:
    """Generate tooltips JSON for in-app help"""
    tooltips = {}
    
    for comp in components:
        if comp["description"]:
            tooltips[comp["name"]] = comp["description"]
    
    return tooltips

def main():
    """Main execution"""
    print("🔍 Scanning components...")
    
    components = []
    
    for category in ["atoms", "molecules", "organisms", "templates"]:
        category_dir = COMPONENTS_DIR / category
        if not category_dir.exists():
            continue
        
        tsx_files = list(category_dir.glob("*.tsx"))
        for file_path in tsx_files:
            if file_path.name.startswith("_"):
                continue
            
            metadata = extract_component_metadata(file_path)
            components.append(metadata)
        
        print(f"  ✓ {category}: {len(tsx_files)} components")
    
    print(f"\n📊 Total components: {len(components)}")
    
    # Generate Markdown docs
    markdown_docs = generate_component_docs(components)
    markdown_path = DOCS_DIR / "COMPONENT_REFERENCE.md"
    markdown_path.write_text(markdown_docs, encoding='utf-8')
    print(f"✅ Component docs: {markdown_path}")
    
    # Generate tooltips JSON
    tooltips = generate_tooltips_json(components)
    TOOLTIPS_FILE.parent.mkdir(parents=True, exist_ok=True)
    TOOLTIPS_FILE.write_text(json.dumps(tooltips, indent=2), encoding='utf-8')
    print(f"✅ Tooltips JSON: {TOOLTIPS_FILE}")
    
    print("\n✨ Documentation sync complete!")
    print(f"   {len(tooltips)} tooltips generated")

if __name__ == "__main__":
    main()

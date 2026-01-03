#!/usr/bin/env python3
"""
API Documentation Generator
Automatically generates OpenAPI spec and Markdown docs from backend routes
"""

import json
import re
from pathlib import Path
from typing import Dict, List, Any
from datetime import datetime

# Project paths
BACKEND_DIR = Path(__file__).parent.parent / "backend" / "api"
DOCS_DIR = Path(__file__).parent.parent / "docs" / "api"
DOCS_DIR.mkdir(parents=True, exist_ok=True)

def extract_route_info(file_path: Path) -> List[Dict[str, Any]]:
    """Extract route information from FastAPI router file"""
    routes = []
    content = file_path.read_text(encoding='utf-8')
    
    # Split into lines for better parsing
    lines = content.split('\n')
    
    for i, line in enumerate(lines):
        # Match @router.METHOD("path")
        if line.strip().startswith('@router.'):
            match = re.match(r'@router\.(get|post|put|delete|patch)\("([^"]+)"(?:,\s*response_model=(\w+))?\)', line.strip())
            if match:
                method, path, response_model = match.groups()
                
                # Find function definition (next non-decorator line)
                func_line_idx = i + 1
                while func_line_idx < len(lines) and lines[func_line_idx].strip().startswith('@'):
                    func_line_idx += 1
                
                if func_line_idx < len(lines):
                    func_line = lines[func_line_idx]
                    func_match = re.match(r'(?:async\s+)?def\s+(\w+)\(', func_line.strip())
                    
                    if func_match:
                        func_name = func_match.group(1)
                        
                        # Extract docstring (next line if it starts with """)
                        docstring = "No description"
                        if func_line_idx + 1 < len(lines):
                            doc_line = lines[func_line_idx + 1].strip()
                            if doc_line.startswith('"""') or doc_line.startswith("'''"):
                                docstring = doc_line.strip('"""').strip("'''").strip()
                        
                        routes.append({
                            "method": method.upper(),
                            "path": path,
                            "function": func_name,
                            "description": docstring,
                            "response_model": response_model,
                            "file": file_path.name
                        })
    
    return routes

def generate_openapi_spec(all_routes: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Generate OpenAPI 3.0 specification"""
    paths = {}
    
    for route in all_routes:
        path = route["path"]
        method = route["method"].lower()
        
        if path not in paths:
            paths[path] = {}
        
        paths[path][method] = {
            "summary": route["description"],
            "operationId": route["function"],
            "tags": [route["file"].replace(".py", "")],
            "responses": {
                "200": {
                    "description": "Successful response",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object"
                            }
                        }
                    }
                }
            }
        }
        
        if route["response_model"]:
            paths[path][method]["responses"]["200"]["content"]["application/json"]["schema"] = {
                "$ref": f"#/components/schemas/{route['response_model']}"
            }
    
    return {
        "openapi": "3.0.0",
        "info": {
            "title": "SenstoSales API",
            "version": "1.0.0",
            "description": "Auto-generated API documentation",
            "contact": {
                "name": "SenstoSales Team"
            }
        },
        "servers": [
            {
                "url": "http://localhost:8000",
                "description": "Development server"
            }
        ],
        "paths": paths,
        "components": {
            "schemas": {}
        }
    }

def generate_markdown_docs(all_routes: List[Dict[str, Any]]) -> str:
    """Generate Markdown API documentation"""
    md = f"""# SenstoSales API Documentation

**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}  
**Base URL:** `http://localhost:8000`

## Endpoints

"""
    
    # Group by file
    routes_by_file = {}
    for route in all_routes:
        file_name = route["file"].replace(".py", "")
        if file_name not in routes_by_file:
            routes_by_file[file_name] = []
        routes_by_file[file_name].append(route)
    
    for file_name, routes in sorted(routes_by_file.items()):
        md += f"\n### {file_name.upper()}\n\n"
        
        for route in sorted(routes, key=lambda x: x["path"]):
            md += f"#### `{route['method']}` {route['path']}\n\n"
            md += f"{route['description']}\n\n"
            
            if route["response_model"]:
                md += f"**Response Model:** `{route['response_model']}`\n\n"
            
            md += "---\n\n"
    
    return md

def main():
    """Main execution"""
    print("🔍 Scanning backend routes...")
    
    all_routes = []
    router_files = list(BACKEND_DIR.glob("*.py"))
    
    for file_path in router_files:
        if file_path.name.startswith("_"):
            continue
        
        routes = extract_route_info(file_path)
        all_routes.extend(routes)
        print(f"  ✓ {file_path.name}: {len(routes)} routes")
    
    print(f"\n📊 Total routes found: {len(all_routes)}")
    
    # Generate OpenAPI spec
    openapi_spec = generate_openapi_spec(all_routes)
    openapi_path = DOCS_DIR / "openapi.json"
    openapi_path.write_text(json.dumps(openapi_spec, indent=2), encoding='utf-8')
    print(f"✅ OpenAPI spec: {openapi_path}")
    
    # Generate Markdown docs
    markdown_docs = generate_markdown_docs(all_routes)
    markdown_path = DOCS_DIR / "API_REFERENCE.md"
    markdown_path.write_text(markdown_docs, encoding='utf-8')
    print(f"✅ Markdown docs: {markdown_path}")
    
    print("\n✨ API documentation generated successfully!")

if __name__ == "__main__":
    main()

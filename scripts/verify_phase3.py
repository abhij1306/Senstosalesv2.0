#!/usr/bin/env python3
"""
Phase 3 Verification Script
Validates automated docs-as-code implementation
"""

import json
import subprocess
from pathlib import Path
from datetime import datetime

PROJECT_ROOT = Path(__file__).parent.parent
DOCS_DIR = PROJECT_ROOT / "docs"
FRONTEND_DIR = PROJECT_ROOT / "frontend"

def check_file_exists(path: Path, description: str) -> bool:
    """Check if file exists"""
    exists = path.exists()
    status = "✅" if exists else "❌"
    print(f"{status} {description}: {path.name}")
    return exists

def verify_api_docs():
    """Verify API documentation generation"""
    print("\n📚 API Documentation")
    print("=" * 50)
    
    openapi_file = DOCS_DIR / "api" / "openapi.json"
    api_md_file = DOCS_DIR / "api" / "API_REFERENCE.md"
    
    checks = [
        check_file_exists(openapi_file, "OpenAPI Spec"),
        check_file_exists(api_md_file, "API Markdown Docs")
    ]
    
    if all(checks):
        with open(openapi_file) as f:
            spec = json.load(f)
            route_count = len(spec.get("paths", {}))
            print(f"   📊 {route_count} API routes documented")
    
    return all(checks)

def verify_component_docs():
    """Verify component documentation sync"""
    print("\n🧩 Component Documentation")
    print("=" * 50)
    
    comp_md_file = DOCS_DIR / "COMPONENT_REFERENCE.md"
    tooltips_file = FRONTEND_DIR / "lib" / "tooltips.json"
    
    checks = [
        check_file_exists(comp_md_file, "Component Markdown Docs"),
        check_file_exists(tooltips_file, "Tooltips JSON")
    ]
    
    if all(checks):
        with open(tooltips_file) as f:
            tooltips = json.load(f)
            print(f"   📊 {len(tooltips)} component tooltips")
    
    return all(checks)

def verify_mcp_servers():
    """Verify MCP server configuration"""
    print("\n🔌 MCP Servers")
    print("=" * 50)
    
    mcp_config = PROJECT_ROOT / "mcp_config.json"
    next_devtools = PROJECT_ROOT / "mcp-servers" / "next-devtools.js"
    docs_server = PROJECT_ROOT / "mcp-servers" / "docs-server.js"
    
    checks = [
        check_file_exists(mcp_config, "MCP Configuration"),
        check_file_exists(next_devtools, "Next DevTools Server"),
        check_file_exists(docs_server, "Docs Server")
    ]
    
    if check_file_exists(mcp_config, "MCP Configuration"):
        with open(mcp_config) as f:
            config = json.load(f)
            server_count = len(config.get("mcpServers", {}))
            print(f"   📊 {server_count} MCP servers configured")
    
    return all(checks)

def verify_automation():
    """Verify automation setup"""
    print("\n⚙️  Automation")
    print("=" * 50)
    
    github_workflow = PROJECT_ROOT / ".github" / "workflows" / "auto-docs.yml"
    package_json = PROJECT_ROOT / "package.json"
    
    checks = [
        check_file_exists(github_workflow, "GitHub Actions Workflow"),
        check_file_exists(package_json, "Package.json Scripts")
    ]
    
    if check_file_exists(package_json, "Package.json Scripts"):
        with open(package_json) as f:
            pkg = json.load(f)
            scripts = pkg.get("scripts", {})
            docs_scripts = [k for k in scripts.keys() if k.startswith("docs:")]
            print(f"   📊 {len(docs_scripts)} documentation scripts")
    
    return all(checks)

def check_project_size():
    """Check project footprint"""
    print("\n💾 Project Size")
    print("=" * 50)
    
    try:
        # Count files (excluding node_modules, .next, etc.)
        total_files = 0
        total_size = 0
        
        for path in PROJECT_ROOT.rglob("*"):
            if any(x in str(path) for x in ["node_modules", ".next", ".git", "venv", "__pycache__"]):
                continue
            if path.is_file():
                total_files += 1
                total_size += path.stat().st_size
        
        size_mb = total_size / (1024 * 1024)
        print(f"✅ Total Files: {total_files}")
        print(f"✅ Total Size: {size_mb:.2f} MB")
        print(f"   {'✅' if size_mb < 100 else '⚠️ '} Size target: < 100 MB")
        
        return size_mb < 100
    except Exception as e:
        print(f"❌ Error checking size: {e}")
        return False

def main():
    """Main verification"""
    print("\n" + "=" * 50)
    print("PHASE 3 VERIFICATION")
    print("Automated Docs-as-Code Implementation")
    print("=" * 50)
    print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    results = {
        "API Docs": verify_api_docs(),
        "Component Docs": verify_component_docs(),
        "MCP Servers": verify_mcp_servers(),
        "Automation": verify_automation(),
        "Project Size": check_project_size()
    }
    
    print("\n" + "=" * 50)
    print("VERIFICATION SUMMARY")
    print("=" * 50)
    
    for check, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status} - {check}")
    
    all_passed = all(results.values())
    print("\n" + "=" * 50)
    if all_passed:
        print("🎉 ALL CHECKS PASSED - PHASE 3 COMPLETE!")
    else:
        print("⚠️  SOME CHECKS FAILED - REVIEW REQUIRED")
    print("=" * 50 + "\n")
    
    return 0 if all_passed else 1

if __name__ == "__main__":
    exit(main())

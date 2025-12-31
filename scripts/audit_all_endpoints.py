#!/usr/bin/env python3
"""
Comprehensive API Endpoint Audit Script
Tests all endpoints and reports status
"""

import requests
import json
from typing import Dict, List, Tuple

BASE_URL = "http://127.0.0.1:8000"

# Define all endpoints to test
ENDPOINTS = {
    "Dashboard": [
        ("GET", "/api/dashboard/summary"),
        ("GET", "/api/dashboard/insights"),
        ("GET", "/api/dashboard/activity"),
    ],
    "Purchase Orders": [
        ("GET", "/api/po/"),
        ("GET", "/api/po/stats"),
    ],
    "Delivery Challans": [
        ("GET", "/api/dc/"),
        ("GET", "/api/dc/stats"),
    ],
    "Invoices": [
        ("GET", "/api/invoice/"),
        ("GET", "/api/invoice/stats"),
    ],
    "SRVs": [
        ("GET", "/api/srv/"),
        ("GET", "/api/srv/stats"),
    ],
    "PO Notes": [
        ("GET", "/api/po-notes/"),
    ],
    "Buyers": [
        ("GET", "/api/buyers"),
    ],
    "Settings": [
        ("GET", "/api/settings/"),
    ],
    "Search": [
        ("GET", "/api/search/?q=test"),
    ],
}

def test_endpoint(method: str, path: str) -> Tuple[int, str, str]:
    """Test a single endpoint and return (status_code, response_text, error)"""
    try:
        url = f"{BASE_URL}{path}"
        response = requests.request(method, url, timeout=5)
        
        # Try to parse as JSON for pretty printing
        try:
            data = response.json()
            response_text = json.dumps(data, indent=2)[:200]  # First 200 chars
        except:
            response_text = response.text[:200]
            
        return (response.status_code, response_text, "")
    except Exception as e:
        return (0, "", str(e))

def main():
    print("=" * 80)
    print("SenstoSales API Endpoint Audit")
    print("=" * 80)
    print()
    
    results = {
        "passed": [],
        "warnings": [],
        "failed": []
    }
    
    for category, endpoints in ENDPOINTS.items():
        print(f"\n📋 Testing {category}:")
        print("-" * 80)
        
        for method, path in endpoints:
            status_code, response, error = test_endpoint(method, path)
            
            status_icon = "✅" if status_code == 200 else "❌" if status_code >= 500 else "⚠️"
            
            print(f"{status_icon} {method:6} {path:40} → {status_code}")
            
            if error:
                print(f"   💥 Error: {error}")
                results["failed"].append((path, f"Connection error: {error}"))
            elif status_code == 200:
                results["passed"].append(path)
            elif status_code >= 500:
                print(f"   🔥 Server Error: {response[:100]}")
                results["failed"].append((path, f"500 error: {response[:100]}"))
            elif status_code >= 400:
                results["warnings"].append((path, f"{status_code}: {response[:100]}"))
    
    # Summary
    print("\n" + "=" * 80)
    print("SUMMARY")
    print("=" * 80)
    print(f"✅ Passed: {len(results['passed'])}")
    print(f"⚠️  Warnings: {len(results['warnings'])}")
    print(f"❌ Failed: {len(results['failed'])}")
    
    if results["failed"]:
        print("\n🔥 CRITICAL FAILURES:")
        for path, error in results["failed"]:
            print(f"  - {path}: {error}")
    
    if results["warnings"]:
        print("\n⚠️  WARNINGS:")
        for path, error in results["warnings"]:
            print(f"  - {path}: {error}")
    
    print()
    return len(results["failed"]) == 0

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)

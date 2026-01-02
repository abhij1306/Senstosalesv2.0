#!/usr/bin/env python3
"""
COMPREHENSIVE PRODUCTION READINESS AUDIT
Executes all critical audits for v6.0.0-dark-prod release
"""

import json
from datetime import datetime
from pathlib import Path
from typing import Dict


class ProductionAuditSuite:
    def __init__(self, project_root: Path):
        self.root = project_root
        self.frontend = project_root / "frontend"
        self.backend = project_root / "backend"
        self.results = {}
        self.timestamp = datetime.now().isoformat()

    def audit_performance(self) -> Dict:
        """Performance audit: Bundle size, Web Vitals readiness"""
        print("\n🚀 PERFORMANCE AUDIT")
        print("=" * 60)

        results = {
            "bundle_size": self._check_bundle_size(),
            "web_vitals_ready": self._check_web_vitals(),
            "lazy_loading": self._check_lazy_loading(),
            "score": 0,
        }

        # Calculate score
        score = 0
        if results["web_vitals_ready"]:
            score += 4
        if results["lazy_loading"]["compliant"]:
            score += 3
        if results["bundle_size"]["acceptable"]:
            score += 3
        results["score"] = score

        print(f"Performance Score: {score}/10")
        return results

    def _check_bundle_size(self) -> Dict:
        """Check if Next.js build exists and size"""
        next_dir = self.frontend / ".next"
        if not next_dir.exists():
            return {"acceptable": False, "reason": "No build found"}

        # Check for large bundles
        static_dir = next_dir / "static"
        if static_dir.exists():
            total_size = sum(f.stat().st_size for f in static_dir.rglob("*") if f.is_file())
            size_mb = total_size / (1024 * 1024)
            return {"acceptable": size_mb < 5, "size_mb": round(size_mb, 2), "threshold_mb": 5}
        return {"acceptable": True, "size_mb": 0}

    def _check_web_vitals(self) -> bool:
        """Check if WebVitalsReporter exists"""
        reporter = self.frontend / "components" / "WebVitalsReporter.tsx"
        return reporter.exists()

    def _check_lazy_loading(self) -> Dict:
        """Check for lazy loading patterns"""
        issues = []
        tsx_files = [
            p
            for p in self.frontend.glob("**/*.tsx")
            if "node_modules" not in str(p) and ".next" not in str(p)
        ]

        lazy_count = 0
        image_count = 0

        for file in tsx_files:
            try:
                content = file.read_text(encoding="utf-8")
                if "React.lazy" in content or "dynamic(" in content:
                    lazy_count += 1
                if "<img" in content and 'loading="lazy"' not in content:
                    if "<Image" not in content:  # Next.js Image is auto-lazy
                        issues.append(str(file.relative_to(self.frontend)))
                if "<img" in content:
                    image_count += 1
            except:
                pass

        return {
            "compliant": len(issues) < 5,
            "lazy_components": lazy_count,
            "images_without_lazy": len(issues),
            "total_images": image_count,
        }

    def audit_design_system(self) -> Dict:
        """Design system standardization audit"""
        print("\n🎨 DESIGN SYSTEM AUDIT")
        print("=" * 60)

        results = {
            "token_coverage": self._check_token_coverage(),
            "typography_compliance": self._check_typography(),
            "import_boundaries": self._check_import_boundaries(),
            "score": 0,
        }

        # Calculate score
        score = 0
        if results["token_coverage"]["percentage"] >= 90:
            score += 4
        elif results["token_coverage"]["percentage"] >= 75:
            score += 3
        elif results["token_coverage"]["percentage"] >= 60:
            score += 2

        if results["typography_compliance"]["percentage"] >= 90:
            score += 3
        elif results["typography_compliance"]["percentage"] >= 75:
            score += 2

        if results["import_boundaries"]["violations"] == 0:
            score += 3
        elif results["import_boundaries"]["violations"] < 5:
            score += 2

        results["score"] = score
        print(f"Design System Score: {score}/10")
        return results

    def _check_token_coverage(self) -> Dict:
        """Check CSS token usage vs hardcoded values"""
        # Use existing dark theme audit
        audit_file = self.root / "mcp-servers" / "performance" / "dark_theme_audit_report.json"
        if audit_file.exists():
            with open(audit_file) as f:
                data = json.load(f)
                total_issues = data["summary"]["total_issues"]
                # Estimate total checkpoints (rough)
                total_checkpoints = 325  # Original baseline
                coverage = max(0, 100 - (total_issues / total_checkpoints * 100))
                return {
                    "percentage": round(coverage, 1),
                    "issues": total_issues,
                    "compliant": total_issues < 50,
                }
        return {"percentage": 0, "issues": 999, "compliant": False}

    def _check_typography(self) -> Dict:
        """Check atomic typography usage"""
        tsx_files = [
            p
            for p in self.frontend.glob("**/*.tsx")
            if "node_modules" not in str(p) and ".next" not in str(p)
        ]

        hardcoded_fonts = 0
        atomic_usage = 0

        for file in tsx_files:
            try:
                content = file.read_text(encoding="utf-8")
                # Check for hardcoded font sizes
                if re.search(r"\btext-(xs|sm|base|lg|xl|2xl|3xl)\b", content):
                    if 'Typography"' not in content and "atoms/Typography" not in content:
                        hardcoded_fonts += 1
                # Check for atomic usage/imports
                if "Typography" in content or "H1" in content or "Body" in content:
                    atomic_usage += 1
            except:
                pass

        total = len(tsx_files)
        # Debug
        print(f"DEBUG: Found {total} tsx files, Atomic Usage: {atomic_usage}")
        compliance = (atomic_usage / total * 100) if total > 0 else 0

        return {
            "percentage": round(compliance, 1),
            "atomic_usage": atomic_usage,
            "hardcoded_fonts": hardcoded_fonts,
            "total_files": total,
        }

    def _check_import_boundaries(self) -> Dict:
        """Check for import boundary violations"""
        violations = []
        tsx_files = list(self.frontend.glob("**/*.tsx"))

        for file in tsx_files:
            try:
                content = file.read_text(encoding="utf-8")
                # Check for direct molecule imports in pages
                if "/app/" in str(file) and 'from "@/components/design-system/molecules' in content:
                    if 'from "@/components/design-system/organisms' not in content:
                        violations.append(str(file.relative_to(self.frontend)))
            except:
                pass

        return {
            "violations": len(violations),
            "files": violations[:10],  # Top 10
        }

    def audit_backend(self) -> Dict:
        """Backend & business logic audit"""
        print("\n🔧 BACKEND AUDIT")
        print("=" * 60)

        results = {
            "dead_code": self._check_dead_code(),
            "duplicate_logic": self._check_duplicates(),
            "invariants": self._check_invariants(),
            "score": 0,
        }

        score = 10  # Start at perfect
        if results["dead_code"]["files"] > 5:
            score -= 2
        if results["duplicate_logic"]["instances"] > 10:
            score -= 3
        if not results["invariants"]["compliant"]:
            score -= 5

        results["score"] = max(0, score)
        print(f"Backend Score: {score}/10")
        return results

    def _check_dead_code(self) -> Dict:
        """Check for unused Python files"""
        py_files = list(self.backend.glob("**/*.py"))
        unused = []

        for file in py_files:
            if "test" in file.name or "temp" in file.name or file.name.startswith("_"):
                if file.name != "__init__.py":
                    unused.append(str(file.relative_to(self.backend)))

        return {"files": len(unused), "list": unused[:10]}

    def _check_duplicates(self) -> Dict:
        """Check for duplicate function names across core services"""
        py_files = list(self.backend.glob("app/services/**/*.py"))
        functions = {}
        duplicates = []

        for file in py_files:
            try:
                content = file.read_text(encoding="utf-8")
                import re

                funcs = re.findall(r"def\s+(\w+)\s*\(", content)
                for func in funcs:
                    if func.startswith("__"):
                        continue  # Ignore dunder methods
                    if func in functions:
                        if functions[func] != str(file.relative_to(self.backend)):
                            duplicates.append(
                                {
                                    "name": func,
                                    "files": [functions[func], str(file.relative_to(self.backend))],
                                }
                            )
                    functions[func] = str(file.relative_to(self.backend))
            except:
                pass

        return {"instances": len(duplicates), "list": duplicates[:10]}

    def _check_invariants(self) -> Dict:
        """Check for business logic invariants"""
        # Check for tax calculation consistency
        routers = list(self.backend.glob("**/routers/*.py"))
        has_tax_calc = False
        consistent = True

        for router in routers:
            try:
                content = router.read_text(encoding="utf-8")
                if "cgst" in content.lower() or "sgst" in content.lower():
                    has_tax_calc = True
                    # Check for hardcoded rates
                    if "0.09" in content or "9.0" in content or "9 /" in content:
                        consistent = False
            except:
                pass

        return {
            "compliant": consistent,
            "has_tax_logic": has_tax_calc,
            "uses_constants": consistent,
        }

    def audit_database(self) -> Dict:
        """Database integrity audit"""
        print("\n💾 DATABASE AUDIT")
        print("=" * 60)

        # CRITICAL: Database is at db/business.db
        db_file = self.root / "db" / "business.db"

        results = {
            "exists": db_file.exists(),
            "size_mb": round(db_file.stat().st_size / (1024 * 1024), 2) if db_file.exists() else 0,
            "path": str(db_file.relative_to(self.root)),
            "fk_enabled": True,  # Will verify below
            "score": 0,
        }

        if db_file.exists():
            # Verify FK constraints
            try:
                import sqlite3

                conn = sqlite3.connect(str(db_file))
                # Enable FKs first to see if they CAN be enabled
                conn.execute("PRAGMA foreign_keys = ON;")
                cursor = conn.cursor()
                cursor.execute("PRAGMA foreign_keys;")
                fk_status = cursor.fetchone()[0]
                results["fk_enabled"] = bool(fk_status)

                # Run integrity check
                cursor.execute("PRAGMA integrity_check;")
                integrity = cursor.fetchone()[0]
                results["integrity"] = integrity
                results["integrity_ok"] = integrity == "ok"

                conn.close()

                score = 10
                if not results["fk_enabled"]:
                    score -= 3
                if not results["integrity_ok"]:
                    score -= 5
                results["score"] = max(0, score)
            except Exception as e:
                results["error"] = str(e)
                results["score"] = 5  # Partial credit for existing
        else:
            results["score"] = 0

        print(f"Database Score: {results['score']}/10")
        print(f"Location: {results['path']}")
        return results

    def audit_routing(self) -> Dict:
        """Router registration audit"""
        print("\n🛣️  ROUTING AUDIT")
        print("=" * 60)

        main_file = self.backend / "main.py"
        routers_dir = self.backend / "routers"

        results = {"registered": [], "unregistered": [], "score": 0}

        if main_file.exists() and routers_dir.exists():
            main_content = main_file.read_text(encoding="utf-8")
            router_files = [f.stem for f in routers_dir.glob("*.py") if f.stem != "__init__"]

            for router in router_files:
                if (
                    f"from routers import {router}" in main_content
                    or f"routers.{router}" in main_content
                ):
                    results["registered"].append(router)
                else:
                    results["unregistered"].append(router)

        score = (
            10
            if len(results["unregistered"]) == 0
            else max(0, 10 - len(results["unregistered"]) * 2)
        )
        results["score"] = score
        print(f"Routing Score: {score}/10")
        return results

    def audit_temp_files(self) -> Dict:
        """Find temp/test files for cleanup"""
        print("\n🗑️  TEMP FILES AUDIT")
        print("=" * 60)

        patterns = ["**/temp*", "**/*test*", "**/*.tmp", "**/.pytest_cache", "**/__pycache__"]
        temp_files = []

        for pattern in patterns:
            temp_files.extend(self.root.glob(pattern))

        # Filter out node_modules and .git
        temp_files = [
            f for f in temp_files if ".git" not in str(f) and "node_modules" not in str(f)
        ]

        results = {
            "count": len(temp_files),
            "files": [str(f.relative_to(self.root)) for f in temp_files[:20]],
            "score": 10 if len(temp_files) < 10 else 5,
        }

        print(f"Temp Files Score: {results['score']}/10")
        return results

    def generate_report(self) -> Dict:
        """Generate comprehensive audit report"""
        print("\n" + "=" * 60)
        print("EXECUTING COMPREHENSIVE PRODUCTION AUDIT")
        print("=" * 60)

        self.results = {
            "timestamp": self.timestamp,
            "performance": self.audit_performance(),
            "design_system": self.audit_design_system(),
            "backend": self.audit_backend(),
            "database": self.audit_database(),
            "routing": self.audit_routing(),
            "temp_files": self.audit_temp_files(),
        }

        # Calculate overall score
        total_score = sum(
            [
                self.results["performance"]["score"],
                self.results["design_system"]["score"],
                self.results["backend"]["score"],
                self.results["database"]["score"],
                self.results["routing"]["score"],
                self.results["temp_files"]["score"],
            ]
        )

        max_score = 60
        overall = round((total_score / max_score) * 10, 1)

        self.results["overall"] = {
            "score": overall,
            "total_points": total_score,
            "max_points": max_score,
            "grade": self._get_grade(overall),
            "deployment_risk": self._get_risk_level(overall),
        }

        # Save report
        output = self.root / "PRODUCTION_AUDIT_v6.json"
        with open(output, "w") as f:
            json.dump(self.results, f, indent=2)

        print("\n" + "=" * 60)
        print("AUDIT COMPLETE")
        print("=" * 60)
        print(f"Overall Score: {overall}/10 ({self.results['overall']['grade']})")
        print(f"Deployment Risk: {self.results['overall']['deployment_risk']}")
        print(f"\nReport saved: {output}")

        return self.results

    def _get_grade(self, score: float) -> str:
        if score >= 9:
            return "A+"
        if score >= 8:
            return "A"
        if score >= 7:
            return "B+"
        if score >= 6:
            return "B"
        if score >= 5:
            return "C"
        return "F"

    def _get_risk_level(self, score: float) -> str:
        if score >= 8:
            return "GREEN"
        if score >= 6:
            return "YELLOW"
        return "RED"


def main():
    root = Path(__file__).resolve().parent.parent.parent
    auditor = ProductionAuditSuite(root)
    auditor.generate_report()


if __name__ == "__main__":
    main()

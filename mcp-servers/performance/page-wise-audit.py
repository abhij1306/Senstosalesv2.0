#!/usr/bin/env python3
"""
Page-Wise Atomic Design & Performance Audit
Audits each page for atomic design adherence, performance, and accessibility
"""

import json
from pathlib import Path
from typing import Dict, List, Any
from dataclasses import dataclass, asdict

@dataclass
class PageAudit:
    page: str
    atomic_score: int
    performance_score: int
    accessibility_score: int
    issues: List[str]
    recommendations: List[str]

class PageWiseAuditor:
    def __init__(self, frontend_path: Path):
        self.frontend_path = frontend_path
        self.pages = []
        self.audits = []
        
    def discover_pages(self):
        """Discover all page files"""
        page_files = list(self.frontend_path.glob('app/**/page.tsx'))
        self.pages = [p for p in page_files if 'node_modules' not in str(p)]
        print(f"📄 Found {len(self.pages)} pages to audit")
        
    def audit_page(self, page_path: Path) -> PageAudit:
        """Audit a single page"""
        content = page_path.read_text(encoding='utf-8')
        page_name = str(page_path.relative_to(self.frontend_path))
        
        issues = []
        recommendations = []
        
        # Check for atomic design patterns
        atomic_violations = 0
        
        # Check for hardcoded styles
        if 'className="text-[' in content or 'className="text-xs' in content:
            atomic_violations += 1
            issues.append("Hardcoded font sizes found - use atomic typography")
            recommendations.append("Replace with <Body>, <SmallText>, <H1-H4>, etc.")
        
        # Check for inline styles
        inline_styles = content.count('style={')
        if inline_styles > 5:
            atomic_violations += inline_styles // 5
            issues.append(f"{inline_styles} inline styles found")
            recommendations.append("Move styles to CSS classes or use design tokens")
        
        # Check for hardcoded colors
        if '#' in content and 'color' in content.lower():
            color_count = content.count('#')
            atomic_violations += color_count // 10
            issues.append(f"~{color_count} potential hardcoded colors")
            recommendations.append("Use CSS variables from design tokens")
        
        # Check for raw Tailwind colors
        raw_colors = ['text-gray-', 'bg-gray-', 'text-blue-', 'bg-blue-', 'text-red-', 'bg-red-']
        for color in raw_colors:
            if color in content:
                atomic_violations += 1
                issues.append(f"Raw Tailwind color '{color}' found")
                recommendations.append("Use semantic classes like text-sys-primary")
        
        # Performance checks
        perf_issues = 0
        
        # Check for missing loading states
        if 'loading' not in content.lower() and 'skeleton' not in content.lower():
            perf_issues += 1
            issues.append("No loading state detected")
            recommendations.append("Add loading skeleton for better UX")
        
        # Check for missing error boundaries
        if 'error' not in content.lower() and 'catch' not in content.lower():
            perf_issues += 1
            issues.append("No error handling detected")
            recommendations.append("Add error boundary or try-catch")
        
        # Check for large components (potential code splitting opportunity)
        lines = len(content.split('\n'))
        if lines > 500:
            perf_issues += 1
            issues.append(f"Large component ({lines} lines)")
            recommendations.append("Consider code splitting or extracting sub-components")
        
        # Accessibility checks
        a11y_issues = 0
        
        # Check for missing ARIA labels
        if '<button' in content and 'aria-label' not in content:
            a11y_issues += 1
            issues.append("Buttons without aria-label")
            recommendations.append("Add aria-label to all interactive elements")
        
        # Check for missing alt text
        if '<img' in content and 'alt=' not in content:
            a11y_issues += 1
            issues.append("Images without alt text")
            recommendations.append("Add alt text to all images")
        
        # Calculate scores
        atomic_score = max(0, 100 - (atomic_violations * 10))
        performance_score = max(0, 100 - (perf_issues * 15))
        accessibility_score = max(0, 100 - (a11y_issues * 20))
        
        return PageAudit(
            page=page_name,
            atomic_score=atomic_score,
            performance_score=performance_score,
            accessibility_score=accessibility_score,
            issues=issues,
            recommendations=recommendations
        )
    
    def audit_all_pages(self):
        """Audit all discovered pages"""
        self.discover_pages()
        
        for page in self.pages:
            audit = self.audit_page(page)
            self.audits.append(audit)
            
            # Print progress
            avg_score = (audit.atomic_score + audit.performance_score + audit.accessibility_score) // 3
            status = "✅" if avg_score >= 80 else "⚠️" if avg_score >= 60 else "❌"
            print(f"{status} {audit.page}: {avg_score}/100")
    
    def generate_report(self) -> Dict[str, Any]:
        """Generate comprehensive report"""
        total_atomic = sum(a.atomic_score for a in self.audits)
        total_perf = sum(a.performance_score for a in self.audits)
        total_a11y = sum(a.accessibility_score for a in self.audits)
        
        count = len(self.audits)
        
        avg_atomic = total_atomic // count if count > 0 else 0
        avg_perf = total_perf // count if count > 0 else 0
        avg_a11y = total_a11y // count if count > 0 else 0
        overall = (avg_atomic + avg_perf + avg_a11y) // 3
        
        # Find pages needing attention
        needs_attention = [a for a in self.audits if 
                          (a.atomic_score + a.performance_score + a.accessibility_score) // 3 < 70]
        
        report = {
            "summary": {
                "total_pages": count,
                "overall_score": overall,
                "atomic_design_score": avg_atomic,
                "performance_score": avg_perf,
                "accessibility_score": avg_a11y,
                "pages_needing_attention": len(needs_attention)
            },
            "pages": [asdict(a) for a in self.audits],
            "priority_fixes": [
                {
                    "page": a.page,
                    "score": (a.atomic_score + a.performance_score + a.accessibility_score) // 3,
                    "issues": a.issues[:3],  # Top 3 issues
                    "recommendations": a.recommendations[:3]
                }
                for a in sorted(self.audits, 
                               key=lambda x: (x.atomic_score + x.performance_score + x.accessibility_score))[:5]
            ]
        }
        
        return report

def main():
    frontend_path = Path(__file__).parent.parent.parent / "frontend"
    
    print("=" * 60)
    print("📊 PAGE-WISE ATOMIC DESIGN & PERFORMANCE AUDIT")
    print("=" * 60)
    print()
    
    auditor = PageWiseAuditor(frontend_path)
    auditor.audit_all_pages()
    
    report = auditor.generate_report()
    
    # Save report
    output_path = Path(__file__).parent / "page_wise_audit_report.json"
    with open(output_path, "w") as f:
        json.dump(report, f, indent=2)
    
    # Print summary
    print("\n" + "=" * 60)
    print("📊 SUMMARY")
    print("=" * 60)
    print(f"Total Pages: {report['summary']['total_pages']}")
    print(f"Overall Score: {report['summary']['overall_score']}/100")
    print(f"  Atomic Design: {report['summary']['atomic_design_score']}/100")
    print(f"  Performance: {report['summary']['performance_score']}/100")
    print(f"  Accessibility: {report['summary']['accessibility_score']}/100")
    print(f"\nPages Needing Attention: {report['summary']['pages_needing_attention']}")
    
    if report['priority_fixes']:
        print("\n🎯 TOP PRIORITY FIXES:")
        for fix in report['priority_fixes']:
            print(f"\n  {fix['page']} ({fix['score']}/100)")
            for issue in fix['issues']:
                print(f"    ❌ {issue}")
    
    print(f"\n📄 Full report: {output_path}")
    
    return report

if __name__ == "__main__":
    main()

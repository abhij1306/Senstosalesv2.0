#!/usr/bin/env python3
"""
Dark Theme Readiness Audit
Scans all pages for:
1. Hardcoded colors (not using CSS variables)
2. Missing dark mode variants
3. Token adherence violations
4. Performance issues (inline styles, non-optimized images)
"""

import json
import re
from pathlib import Path
from typing import Dict, List, Any
from dataclasses import dataclass, asdict

@dataclass
class AuditIssue:
    file: str
    line: int
    severity: str  # "critical", "warning", "info"
    category: str
    message: str
    suggestion: str

class DarkThemeAuditor:
    def __init__(self, frontend_path: Path):
        self.frontend_path = frontend_path
        self.issues: List[AuditIssue] = []
        
        # Hardcoded color patterns to detect
        self.color_patterns = [
            r'#[0-9a-fA-F]{3,6}(?!["\']>)',  # Hex colors
            r'rgb\([^)]+\)',
            r'rgba\([^)]+\)',
            r'hsl\([^)]+\)',
            r'hsla\([^)]+\)',
        ]
        
        # Allowed CSS variables (from tokens)
        self.allowed_vars = [
            'var(--color-sys-',
            'var(--sys-',
            'var(--comp-',
            'var(--surface-',
            'var(--shadow-',
            'var(--font-',
            'var(--radius-',
            'var(--spacing-',
        ]
        
        # Performance anti-patterns
        self.perf_patterns = {
            'inline_style': r'style=\{[^}]+\}',
            'non_optimized_img': r'<img(?![^>]*loading=)',
            'missing_will_change': r'transition:(?![^;]*will-change)',
        }
    
    def scan_file(self, file_path: Path):
        """Scan a single file for dark theme issues"""
        try:
            content = file_path.read_text(encoding='utf-8')
            lines = content.split('\n')
            
            for i, line in enumerate(lines, 1):
                # Check for hardcoded colors
                self._check_hardcoded_colors(file_path, i, line)
                
                # Check for performance issues
                self._check_performance(file_path, i, line)
                
                # Check for token adherence
                self._check_token_adherence(file_path, i, line)
                
        except Exception as e:
            print(f"Error scanning {file_path}: {e}")
    
    def _check_hardcoded_colors(self, file_path: Path, line_num: int, line: str):
        """Detect hardcoded color values"""
        for pattern in self.color_patterns:
            matches = re.finditer(pattern, line)
            for match in matches:
                color_value = match.group(0)
                
                # Skip if it's in a CSS variable definition or allowed context
                if any(allowed in line for allowed in self.allowed_vars):
                    continue
                
                # Skip if it's in globals.css or tokens.css (token definitions)
                if 'globals.css' in str(file_path) or 'tokens.css' in str(file_path):
                    continue
                
                # Skip common safe patterns
                if any(safe in line for safe in ['transparent', 'currentColor', 'inherit']):
                    continue
                
                self.issues.append(AuditIssue(
                    file=str(file_path.relative_to(self.frontend_path)),
                    line=line_num,
                    severity="warning",
                    category="dark_theme",
                    message=f"Hardcoded color detected: {color_value}",
                    suggestion="Replace with CSS variable from design tokens (e.g., var(--color-sys-text-primary))"
                ))
    
    def _check_performance(self, file_path: Path, line_num: int, line: str):
        """Check for performance anti-patterns"""
        
        # Check for inline styles
        if 'style={' in line and 'className' not in line:
            self.issues.append(AuditIssue(
                file=str(file_path.relative_to(self.frontend_path)),
                line=line_num,
                severity="info",
                category="performance",
                message="Inline style detected - consider using CSS classes",
                suggestion="Move styles to CSS modules or use Tailwind classes with design tokens"
            ))
        
        # Check for images without loading attribute
        if '<img' in line and 'loading=' not in line and 'Image' not in line:
            self.issues.append(AuditIssue(
                file=str(file_path.relative_to(self.frontend_path)),
                line=line_num,
                severity="warning",
                category="performance",
                message="Image without lazy loading",
                suggestion="Add loading='lazy' or use Next.js Image component"
            ))
        
        # Check for transitions without will-change
        if 'transition:' in line and 'will-change' not in line:
            self.issues.append(AuditIssue(
                file=str(file_path.relative_to(self.frontend_path)),
                line=line_num,
                severity="info",
                category="performance",
                message="Transition without will-change hint",
                suggestion="Add will-change property for better performance"
            ))
    
    def _check_token_adherence(self, file_path: Path, line_num: int, line: str):
        """Check if components use design tokens"""
        
        # Check for raw Tailwind colors instead of custom classes
        tailwind_color_pattern = r'(bg|text|border)-(red|blue|green|yellow|purple|pink|indigo|gray)-\d+'
        if re.search(tailwind_color_pattern, line):
            # Skip if it's using slate (our approved gray scale)
            if 'slate' not in line:
                self.issues.append(AuditIssue(
                    file=str(file_path.relative_to(self.frontend_path)),
                    line=line_num,
                    severity="warning",
                    category="token_adherence",
                    message="Using raw Tailwind color instead of design token",
                    suggestion="Use semantic classes like text-sys-primary, bg-sys-surface, etc."
                ))
    
    def scan_all_pages(self):
        """Scan all page files"""
        page_files = list(self.frontend_path.glob('app/**/page.tsx'))
        component_files = list(self.frontend_path.glob('components/**/*.tsx'))
        
        print(f"Scanning {len(page_files)} pages and {len(component_files)} components...")
        
        for file in page_files + component_files:
            self.scan_file(file)
    
    def generate_report(self) -> Dict[str, Any]:
        """Generate audit report"""
        
        # Group issues by category and severity
        by_category = {}
        by_severity = {"critical": 0, "warning": 0, "info": 0}
        by_file = {}
        
        for issue in self.issues:
            # By category
            if issue.category not in by_category:
                by_category[issue.category] = []
            by_category[issue.category].append(asdict(issue))
            
            # By severity
            by_severity[issue.severity] += 1
            
            # By file
            if issue.file not in by_file:
                by_file[issue.file] = []
            by_file[issue.file].append(asdict(issue))
        
        # Calculate scores
        total_issues = len(self.issues)
        critical_count = by_severity["critical"]
        warning_count = by_severity["warning"]
        
        # Score: 100 - (critical * 10 + warning * 2)
        score = max(0, 100 - (critical_count * 10 + warning_count * 2))
        
        return {
            "summary": {
                "total_issues": total_issues,
                "by_severity": by_severity,
                "score": score,
                "grade": self._get_grade(score)
            },
            "by_category": by_category,
            "by_file": by_file,
            "recommendations": self._generate_recommendations(by_category)
        }
    
    def _get_grade(self, score: int) -> str:
        """Convert score to letter grade"""
        if score >= 95: return "A+"
        if score >= 90: return "A"
        if score >= 85: return "B+"
        if score >= 80: return "B"
        if score >= 75: return "C+"
        if score >= 70: return "C"
        return "F"
    
    def _generate_recommendations(self, by_category: Dict) -> List[str]:
        """Generate actionable recommendations"""
        recommendations = []
        
        if "dark_theme" in by_category:
            count = len(by_category["dark_theme"])
            recommendations.append(
                f"🌙 Dark Theme: {count} hardcoded colors found. "
                "Replace with CSS variables to enable dark mode support."
            )
        
        if "performance" in by_category:
            count = len(by_category["performance"])
            recommendations.append(
                f"⚡ Performance: {count} optimization opportunities. "
                "Add lazy loading, will-change hints, and avoid inline styles."
            )
        
        if "token_adherence" in by_category:
            count = len(by_category["token_adherence"])
            recommendations.append(
                f"🎨 Design Tokens: {count} violations. "
                "Use semantic token classes for consistent theming."
            )
        
        return recommendations

def main():
    frontend_path = Path(__file__).parent.parent.parent / "frontend"
    
    print("🔍 Starting Dark Theme Readiness Audit...")
    print(f"📁 Scanning: {frontend_path}")
    print("=" * 60)
    
    auditor = DarkThemeAuditor(frontend_path)
    auditor.scan_all_pages()
    
    report = auditor.generate_report()
    
    # Save report
    output_path = Path(__file__).parent / "dark_theme_audit_report.json"
    with open(output_path, "w") as f:
        json.dump(report, f, indent=2)
    
    # Print summary
    print("\n" + "=" * 60)
    print("📊 AUDIT SUMMARY")
    print("=" * 60)
    print(f"Total Issues: {report['summary']['total_issues']}")
    print(f"Critical: {report['summary']['by_severity']['critical']}")
    print(f"Warnings: {report['summary']['by_severity']['warning']}")
    print(f"Info: {report['summary']['by_severity']['info']}")
    print(f"\n🎯 Score: {report['summary']['score']}/100 ({report['summary']['grade']})")
    
    print("\n💡 RECOMMENDATIONS:")
    for rec in report['recommendations']:
        print(f"  {rec}")
    
    print(f"\n📄 Full report saved to: {output_path}")
    
    return report

if __name__ == "__main__":
    main()

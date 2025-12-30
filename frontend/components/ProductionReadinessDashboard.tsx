"use client";

import { useEffect, useState } from "react";
import { Activity, Zap, Palette, Shield, CheckCircle2, AlertTriangle, XCircle, RefreshCcw } from "lucide-react";
import { SmallText } from "@/components/design-system";

interface AuditScore {
    category: string;
    score: number;
    grade: string;
    issues: number;
    icon: any;
    color: string;
}

interface ProductionReadinessData {
    overall_score: number;
    overall_grade: string;
    categories: AuditScore[];
    last_updated: string;
}

export function ProductionReadinessDashboard() {
    const [data, setData] = useState<ProductionReadinessData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        loadAuditData();
    }, []);

    const loadAuditData = async () => {
        try {
            // In production, this would fetch from an API
            const mockData: ProductionReadinessData = {
                overall_score: 95,
                overall_grade: "A+",
                categories: [
                    {
                        category: "Typography Compliance",
                        score: 100,
                        grade: "A+",
                        issues: 0,
                        icon: Activity,
                        color: "var(--color-sys-status-success)",
                    },
                    {
                        category: "Performance",
                        score: 100,
                        grade: "A+",
                        issues: 0,
                        icon: Zap,
                        color: "var(--color-sys-status-success)",
                    },
                    {
                        category: "Token Adherence",
                        score: 96,
                        grade: "A",
                        issues: 11,
                        icon: Palette,
                        color: "var(--color-sys-status-success)",
                    },
                    {
                        category: "Database Integrity",
                        score: 100,
                        grade: "A+",
                        issues: 0,
                        icon: Shield,
                        color: "var(--color-sys-status-success)",
                    },
                ],
                last_updated: new Date().toISOString(),
            };
            setData(mockData);
            setIsLoading(false);
        } catch {
            // console.error("Failed to load audit data:", error);
            setIsLoading(false);
        }
    };

    if (process.env.NODE_ENV !== "development") return null;
    if (isLoading || !data) return null;

    const getScoreColor = (score: number) => {
        if (score >= 90) return "var(--color-sys-status-success)";
        if (score >= 70) return "var(--color-sys-status-warning)";
        return "var(--color-sys-status-error)";
    };

    const getStatusIcon = (score: number) => {
        if (score >= 90) return CheckCircle2;
        if (score >= 70) return AlertTriangle;
        return XCircle;
    };

    const StatusIcon = getStatusIcon(data.overall_score);

    return (
        <div className={`prod-readiness-panel ${isExpanded ? "expanded" : ""}`}>
            <div className="prod-readiness-header" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="prod-readiness-title">
                    <StatusIcon className="w-5 h-5" style={{ color: getScoreColor(data.overall_score) }} />
                    <span>Production Readiness</span>
                </div>
                <div className="prod-readiness-score">
                    <span className="score-value" style={{ color: getScoreColor(data.overall_score) }}>
                        {data.overall_score}
                    </span>
                    <span className="score-grade">{data.overall_grade}</span>
                </div>
            </div>

            {isExpanded && (
                <div className="prod-readiness-content">
                    <div className="categories-grid">
                        {data.categories.map((category) => {
                            const Icon = category.icon;
                            return (
                                <div key={category.category} className="category-card">
                                    <div className="category-header">
                                        <Icon className="w-4 h-4" style={{ color: category.color }} />
                                        <span className="category-name">{category.category}</span>
                                    </div>
                                    <div className="category-stats">
                                        <div className="category-score">
                                            <span className="score-large" style={{ color: category.color }}>
                                                {category.score}
                                            </span>
                                            <span className="grade-badge">{category.grade}</span>
                                        </div>
                                        <div className="category-issues">
                                            {category.issues === 0 ? (
                                                <span className="issues-none">✓ Clean</span>
                                            ) : (
                                                <span className="issues-count">{category.issues} issues</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="category-progress">
                                        <div className="progress-bar" style={{ width: `${category.score}%`, background: category.color }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="readiness-footer">
                        <SmallText>Last updated: {new Date(data.last_updated).toLocaleTimeString()}</SmallText>
                        <button onClick={loadAuditData} className="refresh-btn">
                            <RefreshCcw size={12} className="mr-1 inline" /> Refresh
                        </button>
                    </div>
                </div>
            )}

            <style jsx>{`
        .prod-readiness-panel {
          position: fixed;
          top: 1rem;
          right: 1rem;
          background: var(--color-sys-surface-glass);
          backdrop-filter: blur(12px);
          border: 1px solid var(--color-sys-surface-glass_border);
          border-radius: 1rem;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
          z-index: 9999;
          min-width: 280px;
        }
        .prod-readiness-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          cursor: pointer;
        }
        .prod-readiness-title { display: flex; align-items: center; gap: 0.5rem; font-weight: 600; }
        .score-value { font-family: var(--font-mono); font-size: 1.25rem; font-weight: 700; }
        .prod-readiness-content { padding: 0 1rem 1rem; }
        .categories-grid { display: grid; gap: 0.5rem; }
        .category-card { background: rgba(255,255,255,0.05); padding: 0.75rem; border-radius: 0.5rem; }
        .category-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; }
        .category-stats { display: flex; justify-content: space-between; align-items: center; }
        .score-large { font-weight: 700; }
        .category-progress { height: 2px; background: rgba(255,255,255,0.1); margin-top: 0.5rem; }
        .progress-bar { height: 100%; transition: width 1s ease; }
        .refresh-btn { background: none; border: none; font-size: 0.75rem; color: var(--color-sys-brand-primary); cursor: pointer; }
      `}</style>
        </div>
    );
}
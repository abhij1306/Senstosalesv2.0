
import React from "react";
import {
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    CheckCircle,
} from "lucide-react";

export interface KPIData {
    label: string;
    value: string | number;
    unit?: string;
    trend?: number; // percentage change
    status?: "success" | "warning" | "error" | "neutral";
    subtitle?: string;
    onClick?: () => void;
}

interface CompactKPIProps {
    kpis: KPIData[];
}

export function CompactKPIRow({ kpis }: CompactKPIProps) {
    const getStatusColor = (status?: string) => {
        switch (status) {
            case "success":
                return "text-sys-success bg-sys-success-subtle";
            case "warning":
                return "text-amber-600 bg-amber-50";
            case "error":
                return "text-sys-error bg-sys-error-subtle";
            default:
                return "text-sys-brand bg-sys-brand-subtle";
        }
    };

    const getTrendIcon = (trend?: number) => {
        if (!trend) return null;
        return trend > 0 ? (
            <TrendingUp className="w-3 h-3 text-sys-success" />
        ) : (
            <TrendingDown className="w-3 h-3 text-sys-error" />
        );
    };

    return (
        <div className="grid grid-cols-5 gap-3 mb-4">
            {kpis.map((kpi, idx) => (
                <div
                    key={idx}
                    className="bg-sys-bg-white rounded-lg border border-sys-tertiary/20 p-3 hover:shadow-md transition-shadow"
                >
                    <div className="flex items-start justify-between mb-1">
                        <span className="text-[10px] font-semibold text-sys-secondary uppercase tracking-wide">
                            {kpi.label}
                        </span>
                        {kpi.status === "error" && (
                            <AlertTriangle className="w-3 h-3 text-sys-error" />
                        )}
                        {kpi.status === "success" && (
                            <CheckCircle className="w-3 h-3 text-sys-success" />
                        )}
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className="font-bold text-sys-primary">{kpi.value}</span>
                        {kpi.unit && <span className="text-sys-secondary">{kpi.unit}</span>}
                    </div>
                    {(kpi.trend !== undefined || kpi.subtitle) && (
                        <div className="flex items-center gap-1 mt-1">
                            {getTrendIcon(kpi.trend)}
                            <span
                                className={`text-[10px] font-medium ${kpi.trend && kpi.trend > 0
                                        ? "text-sys-success"
                                        : kpi.trend && kpi.trend < 0
                                            ? "text-sys-error"
                                            : "text-sys-secondary"
                                    }`}
                            >
                                {kpi.subtitle || (kpi.trend ? `${Math.abs(kpi.trend)}%` : "")}
                            </span>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

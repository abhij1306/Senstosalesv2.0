
import React from "react";
import {
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    CheckCircle,
} from "lucide-react";

import { Card, Label, Body, Accounting } from "@/components/design-system";
import { cn } from "@/lib/utils";

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
                return "text-app-status-success bg-app-status-success/10";
            case "warning":
                return "text-app-status-warning bg-app-status-warning/10";
            case "error":
                return "text-app-status-error bg-app-status-error/10";
            default:
                return "text-app-accent bg-app-accent/10";
        }
    };

    const getTrendIcon = (trend?: number) => {
        if (!trend) return null;
        return trend > 0 ? (
            <TrendingUp className="w-2.5 h-2.5 text-app-status-success" />
        ) : (
            <TrendingDown className="w-2.5 h-2.5 text-app-status-error" />
        );
    };

    return (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
            {kpis.map((kpi, idx) => (
                <Card
                    key={idx}
                    className="p-3 bg-app-surface/50 border border-app-border/30 hover:border-app-accent/30 transition-all group cursor-pointer"
                    onClick={kpi.onClick}
                >
                    <div className="flex items-start justify-between mb-1">
                        <Label className="m-0 text-[9px] truncate max-w-[80%]">
                            {kpi.label}
                        </Label>
                        {kpi.status === "error" && (
                            <AlertTriangle className="w-3 h-3 text-app-status-error animate-pulse" />
                        )}
                        {kpi.status === "success" && (
                            <CheckCircle className="w-3 h-3 text-app-status-success" />
                        )}
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className="font-black text-lg text-app-fg tracking-tight">
                            {kpi.value}
                        </span>
                        {kpi.unit && (
                            <span className="text-[10px] font-bold text-app-fg-muted uppercase">
                                {kpi.unit}
                            </span>
                        )}
                    </div>
                    {(kpi.trend !== undefined || kpi.subtitle) && (
                        <div className="flex items-center gap-1.5 mt-1.5 pt-1.5 border-t border-app-border/10">
                            {getTrendIcon(kpi.trend)}
                            <span
                                className={cn(
                                    "text-[9px] font-bold uppercase tracking-widest",
                                    kpi.trend && kpi.trend > 0
                                        ? "text-app-status-success"
                                        : kpi.trend && kpi.trend < 0
                                            ? "text-app-status-error"
                                            : "text-app-fg-muted"
                                )}
                            >
                                {kpi.subtitle || (kpi.trend ? `${Math.abs(kpi.trend)}%` : "")}
                            </span>
                        </div>
                    )}
                </Card>
            ))}
        </div>
    );
}

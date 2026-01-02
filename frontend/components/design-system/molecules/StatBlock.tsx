import React from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatBlockProps {
    label: string;
    value: string | number;
    delta?: {
        value: string;
        trend: "up" | "down" | "neutral";
    };
    icon?: React.ReactNode;
    className?: string;
    variant?: "default" | "primary" | "teal" | "navy";
}

export const StatBlock = ({
    label,
    value,
    delta,
    icon,
    className,
    variant = "default",
}: StatBlockProps) => {
    const variantStyles = {
        default: "bg-app-surface shadow-sm text-app-fg",
        primary: "bg-gradient-to-br from-app-accent to-app-accent/80 text-white",
        teal: "bg-gradient-to-br from-emerald-500 via-teal-500 to-app-status-success text-white",
        navy: "bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 text-white",
    };

    const isColored = variant !== "default";

    return (
        <div
            className={cn(
                "rounded-2xl p-5 flex items-center gap-4 transition-all duration-300 hover:shadow-lg backdrop-blur-md border border-app-border/10",
                variantStyles[variant],
                className
            )}
        >
            {/* Icon */}
            {icon && (
                <div
                    className={cn(
                        "p-3 rounded-full shrink-0",
                        isColored ? "bg-white/20" : "bg-app-accent/10"
                    )}
                >
                    <div className={isColored ? "text-white" : "text-app-accent"}>
                        {icon}
                    </div>
                </div>
            )}

            {/* Content */}
            <div className="flex-1">
                <div
                    className={cn(
                        "text-xl font-bold tabular-nums leading-none mb-1",
                        isColored ? "text-white" : "text-app-fg"
                    )}
                >
                    {value}
                </div>
                <div
                    className={cn(
                        "text-[11px] font-medium uppercase tracking-wider",
                        isColored ? "text-white/70" : "text-app-fg-muted"
                    )}
                >
                    {label}
                </div>
            </div>

            {/* Delta */}
            {delta && (
                <div
                    className={cn(
                        "flex items-center gap-1 text-xs font-bold",
                        delta.trend === "up" && (isColored ? "text-white" : "text-app-status-success"),
                        delta.trend === "down" && (isColored ? "text-white" : "text-app-status-error"),
                        delta.trend === "neutral" && (isColored ? "text-white/70" : "text-app-fg-muted")
                    )}
                >
                    {delta.trend === "up" && <TrendingUp size={14} />}
                    {delta.trend === "down" && <TrendingDown size={14} />}
                    {delta.trend === "neutral" && <Minus size={14} />}
                    <span>{delta.value}</span>
                </div>
            )}
        </div>
    );
};


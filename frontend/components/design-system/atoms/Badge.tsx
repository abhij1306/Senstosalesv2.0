"use client";

import React from "react";
import { cn } from "@/lib/utils";

/**
 * Badge Atom - Atomic Design System v5.0
 * High-density, professional indicators.
 * Font: 10px, Semibold, Uppercase.
 */
export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "secondary" | "success" | "warning" | "error" | "outline" | "accent";
}

const BadgeInternal = React.forwardRef<HTMLDivElement, BadgeProps>(
    ({ className, variant = "default", ...props }, ref) => {
        const variants = {
            // Updated to Glass Style
            default: "status-badge-delivered drop-shadow-[0_0_8px_rgba(0,113,227,0.1)]",
            secondary: "status-badge-closed",
            success: "status-badge-closed",
            warning: "status-badge-pending",
            error: "bg-rose-500/12 text-rose-500",
            outline: "bg-transparent text-app-fg/40 border border-app-border/50",
            accent: "bg-app-accent/10 text-app-accent border border-app-accent/20 hover:bg-app-accent/20 transition-all",
        };

        return (
            <div
                ref={ref}
                className={cn(
                    "status-badge tabular-nums truncate",
                    variants[variant],
                    className
                )}
                {...props}
            />
        );
    }
);

BadgeInternal.displayName = "Badge";

export const Badge = React.memo(BadgeInternal);

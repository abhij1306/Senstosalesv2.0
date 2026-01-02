"use client";

import React, { memo } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import * as LucideIcons from "lucide-react";

/**
 * StatusBadge Atom - Atomic Design System v6.0
 * Consolidates StatusTag and legacy StatusBadge into a unified, chromatic atom.
 * Includes automatic variant mapping and optional icon support.
 */

const statusBadgeVariants = cva(
    "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-200 border shadow-sm backdrop-blur-md",
    {
        variants: {
            variant: {
                success: "bg-system-green/20 text-system-green border-system-green/30",
                warning: "bg-system-yellow/20 text-[#B38F00] dark:text-system-yellow border-system-yellow/30",
                error: "bg-system-red/20 text-system-red border-system-red/30",
                info: "bg-system-blue/20 text-system-blue border-system-blue/30",
                neutral: "bg-system-gray/20 border-system-gray/30 text-system-gray",
                // Mappings for common statuses
                pending: "bg-system-yellow/20 text-[#B38F00] dark:text-system-yellow border-system-yellow/30",
                closed: "bg-system-green/20 text-system-green border-system-green/30",
                delivered: "bg-system-blue/20 text-system-blue border-system-blue/30",
                draft: "bg-system-gray/20 border-system-gray/30 text-system-gray",
            },
        },
        defaultVariants: {
            variant: "info",
        },
    }
);

// Map common statuses to variants automatically
const getVariantFromStatus = (status: string) => {
    const lower = String(status || "").toLowerCase();
    if (["received", "completed", "closed", "paid", "approved", "valid", "active", "fulfilled"].includes(lower)) return "success";
    if (["delivered", "processing", "open", "shipped"].includes(lower)) return "info";
    if (["pending", "partial", "awaiting"].includes(lower)) return "warning";
    if (["draft", "inactive", "hold"].includes(lower)) return "neutral";
    if (["rejected", "failed", "cancelled", "overdue", "missing", "error"].includes(lower)) return "error";
    return "info";
};

export interface StatusBadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statusBadgeVariants> {
    status?: string;
    icon?: keyof typeof LucideIcons;
}

const StatusBadgeInternal = React.forwardRef<HTMLDivElement, StatusBadgeProps>(
    ({ className, status, variant, icon, children, ...props }, ref) => {
        const finalVariant = variant || (status ? (getVariantFromStatus(status) as any) : "info");
        const displayLabel = children || status;

        const IconComponent = icon ? (LucideIcons[icon] as React.ComponentType<LucideIcons.LucideProps>) : null;

        return (
            <div
                ref={ref}
                className={cn(statusBadgeVariants({ variant: finalVariant, className }))}
                {...props}
            >
                {IconComponent && <IconComponent size={12} strokeWidth={3} className="shrink-0" />}
                <span className="truncate tabular-nums">{displayLabel}</span>
            </div>
        );
    }
);

StatusBadgeInternal.displayName = "StatusBadge";

export const StatusBadge = memo(StatusBadgeInternal);
export { statusBadgeVariants };

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
    "inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-medium uppercase tracking-[0.1em] transition-all duration-300 border cursor-default active:scale-[0.97] hover:bg-white/5",
    {
        variants: {
            variant: {
                success: "bg-transparent text-text-primary border-black/80 dark:border-white/80",
                warning: "bg-transparent text-[#B38F00] dark:text-system-yellow border-[#B38F00]/60 dark:border-system-yellow/60",
                error: "bg-transparent text-system-red border-system-red/60",
                info: "bg-transparent text-system-blue border-system-blue/60",
                neutral: "bg-transparent border-black/20 dark:border-white/20 text-text-tertiary",
                // Mappings for common statuses
                pending: "bg-transparent text-[#B38F00] dark:text-system-yellow border-[#B38F00]/60 dark:border-system-yellow/60",
                closed: "bg-transparent text-text-primary border-black/80 dark:border-white/80",
                delivered: "bg-transparent text-system-blue border-system-blue/60",
                draft: "bg-transparent border-black/20 dark:border-white/20 text-text-tertiary",
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
    outline?: boolean;
}

const StatusBadgeInternal = React.forwardRef<HTMLDivElement, StatusBadgeProps>(
    ({ className, status, variant, icon, outline, children, ...props }, ref) => {
        const finalVariant = variant || (status ? (getVariantFromStatus(status) as any) : "info");
        const displayLabel = children || status;

        const IconComponent = icon ? (LucideIcons[icon] as React.ComponentType<LucideIcons.LucideProps>) : null;

        return (
            <div
                ref={ref}
                className={cn(
                    statusBadgeVariants({ variant: finalVariant, className }),
                    outline && "bg-transparent border-2" // Outline override
                )}
                {...props}
            >
                {IconComponent && <IconComponent size={10} strokeWidth={2} className="shrink-0" />}
                <span className="truncate tabular-nums">{displayLabel}</span>
            </div>
        );
    }
);

StatusBadgeInternal.displayName = "StatusBadge";

export const StatusBadge = memo(StatusBadgeInternal);
export { statusBadgeVariants };

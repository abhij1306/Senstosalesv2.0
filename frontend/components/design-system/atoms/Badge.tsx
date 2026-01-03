"use client";

import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Badge Atom - MacOS Tahoe Edition
 * Subtle semantic indicators using system colors.
 */
const badgeVariants = cva(
    "inline-flex items-center rounded-md px-2 py-0.5 m3-label-small transition-colors focus:outline-none border-none shadow-sm",
    {
        variants: {
            variant: {
                default: "bg-surface-variant text-secondary",
                secondary: "bg-secondary-container text-on-secondary-container",
                destructive: "bg-status-error/15 text-status-error",
                outline: "bg-transparent text-primary shadow-none", // Purposefully clean
                success: "bg-status-success/15 text-status-success",
                warning: "bg-status-warning/15 text-status-warning",
                info: "bg-status-info/15 text-status-info",
                accent: "bg-primary-container text-on-primary-container",
                glass: "bg-surface/90 backdrop-blur-sm text-primary",
                error: "bg-status-error/15 text-status-error",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> { }

const BadgeInternal = React.forwardRef<HTMLDivElement, BadgeProps>(
    ({ className, variant, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(badgeVariants({ variant, className }))}
                {...props}
            />
        );
    }
);

BadgeInternal.displayName = "Badge";

export const Badge = React.memo(BadgeInternal);
export { badgeVariants };

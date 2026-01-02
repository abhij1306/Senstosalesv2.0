"use client";

import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Badge Atom - MacOS Tahoe Edition
 * Subtle semantic indicators using system colors.
 */
const badgeVariants = cva(
    "inline-flex items-center px-2 py-0.5 rounded-full text-caption-2 font-regular transition-colors focus:outline-none border border-transparent",
    {
        variants: {
            variant: {
                default: "bg-system-gray/15 text-text-secondary hover:bg-system-gray/25",
                secondary: "bg-surface-secondary text-text-secondary border-border-quaternary",
                destructive: "bg-system-red/15 text-system-red hover:bg-system-red/25",
                outline: "text-text-primary border-border-tertiary",
                success: "bg-system-green/15 text-system-green hover:bg-system-green/25",
                warning: "bg-system-orange/15 text-system-orange hover:bg-system-orange/25",
                info: "bg-system-blue/15 text-system-blue hover:bg-system-blue/25",
                accent: "bg-system-blue/15 text-system-blue hover:bg-system-blue/25",
                glass: "bg-surface-primary/50 backdrop-blur-md border-white/20 text-text-primary shadow-sm",
                error: "bg-system-red/15 text-system-red hover:bg-system-red/25", // Alias for destructive
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

"use client";

import React from "react";
import { cn } from "../utils";
import { surfaces, elevation, radius, borders } from "../tokens";

export interface TahoeCardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "elevated" | "glass";
}

export const TahoeCard = React.forwardRef<HTMLDivElement, TahoeCardProps>(
    ({ className, variant = "default", children, ...props }, ref) => {
        const variantStyles = {
            default: `${surfaces.regular} border ${borders.default} ${elevation.raised}`,
            elevated: `${surfaces.thick} border ${borders.subtle} ${elevation.floating}`,
            glass: `${surfaces.ultraThin} border ${borders.subtle} ${elevation.raised}`,
        };

        return (
            <div
                ref={ref}
                className={cn(
                    "p-6",
                    radius.lg,
                    variantStyles[variant],
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }
);

TahoeCard.displayName = "TahoeCard";

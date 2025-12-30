"use client";

import React from "react";
import { cn } from "@/lib/utils";

/**
 * Card Atom - Atomic Design System v1.0
 * Spec: 8px radius, 20px padding, white background, subtle shadow
 */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

const CardInternal = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    "surface-card",
                    className
                )}
            >
                <div>
                    {children}
                </div>
            </div>
        );
    }
);

CardInternal.displayName = "CardInternal";

export const Card = React.memo(CardInternal);

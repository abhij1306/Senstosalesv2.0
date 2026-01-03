"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";

/**
 * Card Atom - Semantic Design System
 * Uses CSS utility classes from utilities.css
 */

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'elevated' | 'glass' | 'muted' | 'flat';
    padding?: 'none' | 'sm' | 'md' | 'lg';
    onClick?: () => void;
    asChild?: boolean;
}

const variantClasses = {
    elevated: 'bg-surface rounded-xl shadow-1 hover:shadow-2',
    glass: 'bg-surface/90 backdrop-blur-md rounded-xl shadow-1',
    muted: 'bg-surface-variant rounded-xl shadow-sm',
    flat: 'bg-surface rounded-xl shadow-1',
};

const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
};

const CardInternal = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, variant = 'elevated', padding = 'md', asChild = false, children, onClick, ...props }, ref) => {
        const Comp = asChild ? Slot : "div";
        return (
            <Comp
                ref={ref}
                className={cn(
                    variantClasses[variant],
                    paddingClasses[padding],
                    onClick && "cursor-pointer active:scale-[0.99]",
                    "transition-all duration-200",
                    className
                )}
                onClick={onClick}
                {...props}
            >
                {children}
            </Comp>
        );
    }
);

CardInternal.displayName = "Card";

export const Card = React.memo(CardInternal);


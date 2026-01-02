"use client";

import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Card Atom - MacOS Tahoe Edition
 * Fundamental surface component with native glass materials.
 */
const cardVariants = cva(
    "rounded-2xl transition-smooth overflow-hidden",
    {
        variants: {
            variant: {
                default: "bg-surface-primary/80 backdrop-blur-xl border border-border-quaternary shadow-sm",
                glass: "bg-surface-primary/40 backdrop-blur-2xl border border-white/20 shadow-lg ring-1 ring-white/10",
                elevated: "bg-surface-elevated/90 backdrop-blur-xl border border-border-tertiary shadow-xl hover:shadow-2xl hover:bg-surface-elevated",
                flat: "bg-surface-secondary border border-transparent",
                outline: "bg-transparent border border-border-tertiary",
            },
            padding: {
                none: "",
                sm: "p-3",
                md: "p-5",
                lg: "p-8",
                xl: "p-10",
            },
        },
        defaultVariants: {
            variant: "default",
            padding: "md",
        },
    }
);

import { Slot } from "@radix-ui/react-slot";

export interface CardProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
    onClick?: () => void;
    asChild?: boolean;
}

const CardInternal = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, variant, padding, asChild = false, children, ...props }, ref) => {
        const Comp = asChild ? Slot : "div";
        return (
            <Comp
                ref={ref}
                className={cn(cardVariants({ variant, padding, className }), props.onClick && "cursor-pointer active:scale-[0.99]")}
                {...props}
            >
                {children}
            </Comp>
        );
    }
);

CardInternal.displayName = "Card";

export const Card = React.memo(CardInternal);
export { cardVariants };

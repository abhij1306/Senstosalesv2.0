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
                default: "bg-white/70 dark:bg-surface-primary/60 backdrop-blur-[50px] backdrop-saturate-[200%] elevation-1",
                glass: "bg-white/65 dark:bg-[rgba(35,35,40,0.55)] backdrop-blur-[45px] backdrop-saturate-[180%] elevation-2",
                elevated: "bg-white/75 dark:bg-surface-elevated/70 backdrop-blur-[60px] backdrop-saturate-[200%] elevation-3 hover:elevation-3 hover:bg-white/80 dark:hover:bg-surface-elevated/75",
                flat: "bg-surface-secondary/50",
                outline: "bg-transparent border border-white/10 dark:border-white/5",
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

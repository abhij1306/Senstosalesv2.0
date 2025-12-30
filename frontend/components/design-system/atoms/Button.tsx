"use client";

import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

/**
 * Button Atom - Atomic Design System v5.0
 * High-density, Enterprise styling.
 */
const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-[13px] font-semibold transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-accent focus-visible:ring-offset-2 active:scale-[0.98] hover:scale-[1.02]",
    {
        variants: {
            variant: {
                default: "active-glow bg-gradient-to-b from-sys-brand-primary to-sys-brand-primary/90 text-white shadow-xl shadow-app-accent/20 border border-white/10",
                primary: "active-glow bg-gradient-to-b from-sys-brand-primary to-sys-brand-primary/90 text-white shadow-xl shadow-app-accent/20 border border-white/10",
                secondary: "bg-sys-bg-surface/50 backdrop-blur-md text-app-fg hover:bg-sys-bg-surface/80 border border-app-border/50 shadow-sm hover:shadow-md",
                destructive: "bg-gradient-to-b from-rose-500 to-rose-600 text-white hover:from-rose-600 hover:to-rose-700 shadow-xl shadow-rose-500/20 border border-rose-400/20",
                ghost: "bg-transparent text-app-fg/60 hover:bg-app-fg/5 hover:text-app-fg border-none hover:backdrop-blur-sm",
                outline: "bg-transparent text-app-fg border border-app-border/50 hover:bg-app-fg/5 backdrop-blur-sm",
                link: "text-app-accent underline-offset-4 hover:underline border-none p-0 rounded-none",
                excel: "bg-gradient-to-b from-[#1D6F42] to-[#155734] text-white hover:brightness-110 shadow-xl shadow-[#1D6F42]/20 border border-[#48C774]/20",
            },
            size: {
                default: "h-10 px-6",
                sm: "h-8 px-4 text-[11px]",
                lg: "h-12 px-8 text-sm",
                icon: "h-10 w-10 px-0",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean;
}

const ButtonInternal = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button";
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        );
    }
);

ButtonInternal.displayName = "ButtonInternal";

export const Button = React.memo(ButtonInternal);
export { buttonVariants };

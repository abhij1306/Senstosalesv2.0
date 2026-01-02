"use client";

import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

/**
 * Button Atom - MacOS Tahoe Edition
 * Follows Apple Human Interface Guidelines for controls.
 */
const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-callout font-medium transition-smooth disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] focus-ring ring-offset-2",
    {
        variants: {
            variant: {
                primary: "bg-system-blue text-white hover:bg-system-blue/90 shadow-sm active:shadow-inner",
                secondary: "bg-app-surface text-app-fg border border-app-border/20 shadow-sm hover:bg-app-surface-hover active:bg-app-surface-active",
                ghost: "text-text-primary hover:bg-surface-secondary active:bg-surface-tertiary",
                destructive: "bg-system-red text-white hover:bg-system-red/90 shadow-sm active:shadow-inner",
                outline: "bg-transparent border border-system-blue text-system-blue hover:bg-system-blue/10",
                link: "text-system-blue underline-offset-4 hover:underline p-0 h-auto",
                // Legacy variants mapped to new system
                glass: "bg-surface-primary/60 backdrop-blur-md border border-white/20 text-text-primary shadow-sm hover:bg-surface-primary/80",
                excel: "bg-system-green text-white hover:bg-system-green/90 shadow-sm",
                default: "bg-system-blue text-white hover:bg-system-blue/90 shadow-sm", // Fallback for 'default' variant
            },
            size: {
                default: "h-10 px-4 py-2",
                sm: "h-8 px-3 text-caption-1",
                lg: "h-12 px-8 text-body",
                icon: "h-10 w-10",
                compact: "h-7 px-2 text-caption-2",
            },
        },
        defaultVariants: {
            variant: "primary",
            size: "default",
        },
    }
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean;
    loading?: boolean;
}

const ButtonInternal = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, loading = false, children, ...props }, ref) => {
        if (asChild) {
            return (
                <Slot
                    className={cn(buttonVariants({ variant, size, className }))}
                    ref={ref}
                    {...props}
                >
                    {children}
                </Slot>
            );
        }

        return (
            <button
                className={cn(buttonVariants({ variant, size, className }), loading && "relative !text-transparent transition-none")}
                ref={ref}
                disabled={props.disabled || loading}
                {...props}
            >
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center text-current">
                        <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                )}
                {children}
            </button>
        );
    }
);

ButtonInternal.displayName = "Button";

export const Button = React.memo(ButtonInternal);
export { buttonVariants };

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
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-footnote font-medium transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] select-none",
    {
        variants: {
            variant: {
                primary: "bg-system-blue text-white shadow-lg elevation-2 hover:elevation-3 hover:brightness-110 active:brightness-95 active:shadow-inner font-semibold",
                secondary: "bg-blue-50 text-blue-900 border border-blue-100 shadow-sm hover:bg-blue-100 active:bg-blue-200 font-medium",
                ghost: "text-blue-700 hover:bg-blue-50 active:bg-blue-100",
                glass: "bg-white/20 dark:bg-white/10 backdrop-blur-xl text-app-fg border-none shadow-lg elevation-1 hover:bg-white/30 dark:hover:bg-white/20 font-medium",
                destructive: "bg-system-red text-white shadow-lg elevation-2 hover:brightness-110 active:brightness-95 font-semibold",
                outline: "bg-transparent border-2 border-app-fg/30 text-app-fg hover:bg-app-fg/10 hover:border-app-fg/50 font-medium",
                link: "text-system-blue underline-offset-4 hover:underline p-0 h-auto font-medium",
                excel: "bg-[#1D6F42] text-white shadow-lg elevation-2 hover:brightness-110 active:brightness-95 font-semibold",
                default: "bg-system-blue text-white shadow-lg elevation-2 font-semibold",
            },
            size: {
                default: "h-9 px-4 py-2",  /* Compact ERP Standard */
                sm: "h-7.5 px-3 text-[11px] tracking-tight", /* Row actions */
                lg: "h-11 px-7 text-subhead tracking-tight", /* Hero actions */
                xl: "h-13 px-8 text-body font-semibold tracking-tight", /* Onboarding */
                icon: "h-9 w-9",
                compact: "h-6 px-2 text-[10px] uppercase font-bold tracking-widest",
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

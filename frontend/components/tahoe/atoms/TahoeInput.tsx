"use client";

import React from "react";
import { cn } from "../utils";
import { surfaces, elevation, radius, text, interactive, borders } from "../tokens";

export interface TahoeInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    variant?: "default" | "ghost";
}

export const TahoeInput = React.forwardRef<HTMLInputElement, TahoeInputProps>(
    ({ className, variant = "default", ...props }, ref) => {
        const variantStyles = {
            default: `${surfaces.regular} border ${borders.default} ${elevation.flat}`,
            ghost: `bg-transparent border ${borders.subtle}`,
        };

        return (
            <input
                ref={ref}
                className={cn(
                    "flex h-10 w-full px-3 py-2 text-sm",
                    "transition-all duration-150",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-500",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    "placeholder:text-black/40 dark:placeholder:text-white/40",
                    radius.md,
                    text.primary,
                    variantStyles[variant],
                    className
                )}
                {...props}
            />
        );
    }
);

TahoeInput.displayName = "TahoeInput";

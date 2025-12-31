"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "../utils";
import { surfaces, elevation, radius, text, interactive } from "../tokens";
import { spring } from "../motion";

export interface TahoeButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "ghost" | "destructive";
    size?: "sm" | "md" | "lg";
    asChild?: boolean;
    children: React.ReactNode;
}

/**
 * Tahoe Button - macOS inspired button with translucent surface and spring animations
 * 100% compatible with existing Button props
 */
export const TahoeButton = React.forwardRef<HTMLButtonElement, TahoeButtonProps>(
    ({ variant = "primary", size = "md", className, children, disabled, ...props }, ref) => {
        const Component = motion.button;

        const variantStyles = {
            primary: `bg-blue-500 text-white ${elevation.raised} hover:bg-blue-600 active:bg-blue-700`,
            secondary: `${surfaces.regular} border ${text.primary} ${interactive.hover} ${interactive.active}`,
            ghost: `${text.secondary} ${interactive.hover} ${interactive.active}`,
            destructive: `bg-red-500 text-white ${elevation.raised} hover:bg-red-600 active:bg-red-700`,
        };

        const sizeStyles = {
            sm: "h-8 px-3 text-xs",
            md: "h-10 px-4 text-sm",
            lg: "h-12 px-6 text-base",
        };

        return (
            <Component
                ref={ref}
                whileHover={{ scale: disabled ? 1 : 1.02 }}
                whileTap={{ scale: disabled ? 1 : 0.98 }}
                transition={spring.snappy}
                className={cn(
                    "inline-flex items-center justify-center gap-2 font-semibold",
                    "transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20",
                    radius.md,
                    variantStyles[variant],
                    sizeStyles[size],
                    disabled && "opacity-50 cursor-not-allowed",
                    className
                )}
                disabled={disabled}
                {...props}
            >
                {children}
            </Component>
        );
    }
);

TahoeButton.displayName = "TahoeButton";

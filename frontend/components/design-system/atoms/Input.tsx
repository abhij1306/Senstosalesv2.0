"use client";

import React from "react";
import { cn } from "@/lib/utils";

/**
 * Input Atom - Atomic Design System v1.0
 * Spec: 38px height, 6px radius, 12px padding
 * Border: #D1D5DB, Focus: #1A3D7C
 */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    icon?: React.ReactNode;
    error?: string;
    variant?: "default" | "glass" | "ghost" | "neumorphic";
}

const InputInternal = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, icon, error, required, variant = "default", ...props }, ref) => {
        return (
            <div className="w-full">
                <div className="relative group">
                    {icon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-app-fg-muted group-focus-within:text-app-accent transition-colors duration-300 pointer-events-none">
                            {icon}
                        </div>
                    )}
                    <input
                        type={type}
                        className={cn(
                            "flex w-full transition-all duration-300 border-none outline-none",
                            "text-[14px] font-medium text-app-fg placeholder:text-gray-500/80",
                            // Variant mappings
                            variant === "default" && "glass-input h-11 rounded-2xl px-4 focus:ring-2 focus:ring-primary/40 focus:bg-white/60 dark:focus:bg-gray-800/60 shadow-sm",
                            variant === "glass" && "glass-input h-11 rounded-2xl px-4 focus:ring-2 focus:ring-primary/40",
                            variant === "ghost" && "bg-transparent h-auto p-0",
                            variant === "neumorphic" && "h-11 rounded-2xl neumorphic-inset px-4 focus:ring-2 focus:ring-primary/20",
                            icon && variant !== "ghost" && "pl-11",
                            error && "ring-1 ring-app-status-error/50",
                            className
                        )}
                        ref={ref}
                        required={required}
                        {...props}
                        value={props.value ?? ""}
                    />
                </div>
                {error && <p className="mt-1 text-[11px] font-bold text-app-status-error uppercase tracking-wider">{error}</p>}
            </div>
        );
    }
);

InputInternal.displayName = "Input";

export const Input = React.memo(InputInternal);

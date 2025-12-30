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
    variant?: "default" | "glass" | "ghost";
}

const InputInternal = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, icon, error, required, variant = "default", ...props }, ref) => {
        return (
            <div className="w-full">
                <div className="relative group">
                    {icon && (
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-app-fg/30 group-focus-within:text-app-accent transition-colors duration-300 pointer-events-none">
                            {icon}
                        </div>
                    )}
                    <input
                        type={type}
                        className={cn(
                            "flex w-full transition-all duration-300 border-none outline-none",
                            "text-[13px] font-semibold text-app-fg placeholder:text-app-fg/30",
                            // Variant mappings
                            variant === "default" && "h-[38px] rounded-xl bg-app-surface border border-app-border/30 focus:shadow-lg focus:ring-1 focus:ring-app-accent/20 px-3.5",
                            variant === "glass" && "h-[38px] rounded-xl bg-app-overlay backdrop-blur-xl border border-app-border/40 px-3.5",
                            variant === "ghost" && "bg-transparent h-auto p-0",
                            icon && variant !== "ghost" && "pl-11",
                            error && "ring-1 ring-rose-500/50",
                            className
                        )}
                        ref={ref}
                        required={required}
                        {...props}
                        value={props.value ?? ""}
                    />
                </div>
                {error && <p className="mt-1 text-[11px] font-bold text-rose-500 uppercase tracking-wider">{error}</p>}
            </div>
        );
    }
);

InputInternal.displayName = "Input";

export const Input = React.memo(InputInternal);

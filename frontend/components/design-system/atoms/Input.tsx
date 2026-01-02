"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Caption2 } from "./Typography";

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
                            "flex transition-all duration-300 outline-none",
                            "input-standard",
                            variant === "glass" && "glass-input",
                            variant === "ghost" && "bg-transparent h-auto p-0 border-none",
                            icon && variant !== "ghost" && "pl-10",
                            error && "ring-1 ring-app-status-error/50",
                            className
                        )}
                        ref={ref}
                        required={required}
                        {...props}
                        value={props.value ?? ""}
                    />
                </div>
                {error && <Caption2 className="mt-1 text-app-status-error uppercase tracking-wider">{error}</Caption2>}
            </div>
        );
    }
);

InputInternal.displayName = "Input";

export const Input = React.memo(InputInternal);

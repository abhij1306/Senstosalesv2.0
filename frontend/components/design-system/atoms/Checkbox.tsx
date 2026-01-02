"use client";

import React from "react";
import { cn } from "@/lib/utils";

/**
 * Checkbox Atom - Atomic Design System v1.0
 * Spec: 18px size, 4px radius, #1A3D7C selected
 */
export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
    label?: string;
}

const CheckboxInternal = React.forwardRef<HTMLInputElement, CheckboxProps>(
    ({ className, label, id, ...props }, ref) => {
        const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;
        return (
            <div className="flex items-center gap-2">
                <input
                    type="checkbox"
                    id={checkboxId}
                    ref={ref}
                    className={cn(
                        "h-4 w-4 rounded border-app-border text-app-accent",
                        "focus:ring-2 focus:ring-app-accent/40 focus:ring-offset-0",
                        "disabled:cursor-not-allowed disabled:opacity-50",
                        "cursor-pointer transition-all duration-200",
                        className
                    )}
                    {...props}
                />
                {label && (
                    <label
                        htmlFor={checkboxId}
                        className="text-sm font-medium text-app-fg-muted hover:text-app-fg transition-colors cursor-pointer select-none"
                    >
                        {label}
                    </label>
                )}
            </div>
        );
    }
);

CheckboxInternal.displayName = "Checkbox";

export const Checkbox = React.memo(CheckboxInternal);

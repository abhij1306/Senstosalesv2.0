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
                        "h-[18px] w-[18px] rounded border-[var(--color-sys-text-tertiary)]/50 text-[var(--color-sys-brand-primary)]",
                        "focus:ring-2 focus:ring-[var(--color-sys-brand-primary)]/40 focus:ring-offset-0",
                        "disabled:cursor-not-allowed disabled:opacity-50",
                        "cursor-pointer",
                        className
                    )}
                    {...props}
                />
                {label && (
                    <label
                        htmlFor={checkboxId}
                        className="text-[14px] font-medium text-[var(--color-sys-text-primary)] cursor-pointer select-none"
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

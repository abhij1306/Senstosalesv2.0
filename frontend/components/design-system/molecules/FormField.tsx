"use client";
import React from "react";
import { Input, InputProps } from "../atoms/Input";
import { Label } from "../atoms/Typography";
import { cn } from "@/lib/utils";

/**
 * FormField Molecule - Atomic Design System v1.0
 * Composition: Label (16px) + Input + Error Message
 */
export interface FormFieldProps extends InputProps {
    label?: string;
    error?: string;
    helperText?: string;
    required?: boolean;
    floating?: boolean;
}

export const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
    (
        { label, error, helperText, required, floating, className, ...inputProps },
        ref
    ) => {
        if (floating) {
            return (
                <div className={cn("relative space-y-0", className)}>
                    <Input
                        ref={ref}
                        error={error}
                        required={required}
                        className={cn(
                            "peer pt-6 pb-2 h-14 bg-app-surface/50 border-app-border/20 focus:bg-app-surface placeholder:text-transparent",
                            error && "border-app-status-error"
                        )}
                        placeholder="" // Required for peer-placeholder-shown
                        {...inputProps}
                    />
                    {label && (
                        <Label
                            htmlFor={inputProps.id}
                            className={cn(
                                "absolute left-3 top-4 z-10 origin-[0] -translate-y-2.5 scale-75 transform text-app-fg-muted duration-200",
                                "peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-placeholder-shown:text-app-fg-muted",
                                "peer-focus:-translate-y-2.5 peer-focus:scale-75 peer-focus:text-app-accent",
                                error && "text-app-status-error peer-focus:text-app-status-error"
                            )}
                        >
                            {label}{" "}
                            {required && <span className="ml-1 text-app-status-error">*</span>}
                        </Label>
                    )}
                    {helperText && !error && (
                        <p className="mt-1 text-[11px] text-app-fg-muted pl-1">
                            {helperText}
                        </p>
                    )}
                </div>
            );
        }

        return (
            <div className={cn("space-y-1.5", className)}>
                {label && (
                    <Label htmlFor={inputProps.id} className="block">
                        {label} {required && <span className="text-app-status-error ml-1">*</span>}
                    </Label>
                )}
                <Input ref={ref} error={error} required={required} {...inputProps} />
                {helperText && !error && (
                    <p className="text-[12px] text-app-fg-muted">{helperText}</p>
                )}
            </div>
        );
    }
);
FormField.displayName = "FormField";

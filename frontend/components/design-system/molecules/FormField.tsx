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
                            "peer pt-6 pb-2 h-14 bg-sys-bg-white/50 border-sys-tertiary/20/60 focus:bg-sys-bg-white placeholder:text-transparent",
                            error && "border-sys-error"
                        )}
                        placeholder="" // Required for peer-placeholder-shown
                        {...inputProps}
                    />
                    {label && (
                        <Label
                            htmlFor={inputProps.id}
                            className={cn(
                                "absolute left-3 top-4 z-10 origin-[0] -translate-y-2.5 scale-75 transform text-sys-secondary duration-200",
                                "peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-placeholder-shown:text-sys-secondary",
                                "peer-focus:-translate-y-2.5 peer-focus:scale-75 peer-focus:text-sys-brand",
                                error && "text-sys-error peer-focus:text-sys-error"
                            )}
                        >
                            {label}{" "}
                            {required && <span className="ml-1 text-sys-error">*</span>}
                        </Label>
                    )}
                    {helperText && !error && (
                        <p className="mt-1 text-[11px] text-sys-tertiary pl-1">
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
                        {label} {required && <span className="text-[#DC2626] ml-1">*</span>}
                    </Label>
                )}
                <Input ref={ref} error={error} required={required} {...inputProps} />
                {helperText && !error && (
                    <p className="text-[12px] text-[#6B7280]">{helperText}</p>
                )}
            </div>
        );
    }
);
FormField.displayName = "FormField";

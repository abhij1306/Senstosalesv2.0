"use client";

import React, { memo } from "react";
import { cn, formatIndianCurrency } from "@/lib/utils";

/**
 * Typography Atoms - Enterprise UI Standardization (Google M3)
 * Strict Weight Enforcement: 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold)
 * Strict Size Scale: text-xs to text-3xl
 */

interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
    children?: React.ReactNode;
}

// Heading (H1): text-2xl (24px), font-bold (700), tracking-tight
export const H1 = memo(React.forwardRef<HTMLHeadingElement, TypographyProps>(
    ({ className, children, ...props }, ref) => (
        <h1
            ref={ref}
            className={cn(
                "text-2xl font-bold leading-tight text-app-fg tracking-tight",
                className
            )}
            {...props}
        >
            {children}
        </h1>
    )
));
H1.displayName = "H1";

// Subheading (H2): text-xl (20px), font-semibold (600)
export const H2 = memo(React.forwardRef<HTMLHeadingElement, TypographyProps>(
    ({ className, children, ...props }, ref) => (
        <h2
            ref={ref}
            className={cn(
                "text-xl font-semibold leading-tight text-app-fg tracking-tight",
                className
            )}
            {...props}
        >
            {children}
        </h2>
    )
));
H2.displayName = "H2";

// Section heading (H3): text-lg (18px), font-semibold (600)
export const H3 = memo(React.forwardRef<HTMLHeadingElement, TypographyProps>(
    ({ className, children, ...props }, ref) => (
        <h3
            ref={ref}
            className={cn(
                "text-lg font-semibold leading-normal text-app-fg",
                className
            )}
            {...props}
        >
            {children}
        </h3>
    )
));
H3.displayName = "H3";

// Sub-section heading (H4): text-[10px], font-semibold (600), uppercase (Used for table headers/labels)
export const H4 = memo(React.forwardRef<HTMLHeadingElement, TypographyProps>(
    ({ className, children, ...props }, ref) => (
        <h4
            ref={ref}
            className={cn(
                "text-[10px] font-semibold uppercase tracking-widest text-app-fg-muted",
                className
            )}
            {...props}
        >
            {children}
        </h4>
    )
));
H4.displayName = "H4";

// Body text: text-sm (14px), font-normal (400)
export const Body = memo(React.forwardRef<HTMLParagraphElement, TypographyProps>(
    ({ className, children, ...props }, ref) => (
        <p
            ref={ref}
            className={cn(
                "text-sm font-normal leading-relaxed text-app-fg",
                className
            )}
            {...props}
        >
            {children}
        </p>
    )
));
Body.displayName = "Body";

// Label text: text-[10px], font-semibold (600), uppercase, tracking-wider
// Replaces previous "font-black" usage
export const Label = memo(React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
    ({ className, children, ...props }, ref) => (
        <label
            ref={ref}
            className={cn(
                "text-[10px] font-semibold text-app-fg-muted uppercase tracking-wider block mb-1.5",
                className
            )}
            {...props}
        >
            {children}
        </label>
    )
));
Label.displayName = "Label";

// Small text: text-xs (12px), font-medium (500)
export const SmallText = memo(({ className, children, ...props }: TypographyProps) => (
    <small
        className={cn("text-xs font-medium text-app-fg-muted", className)}
        {...props}
    >
        {children}
    </small>
));
SmallText.displayName = "SmallText";


// Accounting/Numeric: text-sm (14px), font-mono, tabular-nums
export interface AccountingProps extends TypographyProps {
    isCurrency?: boolean;
    short?: boolean;
    variant?: "default" | "highlight" | "success" | "warning" | "error";
}

export const Accounting = memo(({ className, children, isCurrency, short, variant = "default", ...props }: AccountingProps) => {
    let content = children;
    if (isCurrency && typeof children === "number") {
        content = formatIndianCurrency(children);
    } else if (typeof children === "number") {
        content = children.toLocaleString("en-IN");
    }

    const variantStyles = {
        default: "text-sys-primary", // Inter grey-900
        highlight: "text-sys-brand", // Cobalt Blue
        success: "text-sys-status-success", // Green
        warning: "text-amber-600", // Amber (Partial)
        error: "text-red-600 font-bold", // Red (Overdue)
    };

    return (
        <span
            className={cn(
                "font-mono font-medium text-right leading-none tabular-nums",
                variantStyles[variant],
                className
            )}
            style={{ fontFeatureSettings: '"tnum"' }}
            suppressHydrationWarning
            {...props}
        >
            {content}
        </span>
    );
});
Accounting.displayName = "Accounting";

// Mono/Code text: text-xs (12px)
export const MonoCode = memo(React.forwardRef<HTMLElement, TypographyProps>(
    ({ className, children, ...props }, ref) => (
        <code
            ref={ref}
            className={cn(
                "text-xs font-mono font-medium bg-app-fg/5 px-1.5 py-0.5 rounded text-app-fg",
                className
            )}
            {...props}
        >
            {children}
        </code>
    )
));
MonoCode.displayName = "MonoCode";

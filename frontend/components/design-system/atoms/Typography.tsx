import { cn } from '@/lib/utils';
import { type HTMLAttributes, type ReactNode } from 'react';

/* ============================================
   TYPOGRAPHY COMPONENT SYSTEM
   macOS Semantic Text Styles
   ============================================ */

interface TypographyProps extends HTMLAttributes<HTMLElement> {
    children: ReactNode;
    className?: string;
}

/* ==========================================
   DISPLAY TYPOGRAPHY
   ========================================== */

/**
 * LargeTitle - Hero sections, main navigation (34px, Bold)
 * Usage: Primary app title, hero headers
 */
export function LargeTitle({ children, className, ...props }: TypographyProps) {
    return (
        <h1
            className={cn(
                'font-display text-large-title font-regular tracking-tight text-text-primary text-vibrancy',
                className
            )}
            {...props}
        >
            {children}
        </h1>
    );
}

/**
 * Title1 - Page titles (28px, Semibold)
 * Usage: "Purchase Orders", "Dashboard", "Invoice #1222"
 */
export function Title1({ children, className, ...props }: TypographyProps) {
    return (
        <h1
            className={cn(
                'font-display text-[26px] font-regular tracking-tight text-text-primary text-vibrancy leading-tight',
                className
            )}
            {...props}
        >
            {children}
        </h1>
    );
}

/**
 * Title2 - Section headers (22px, Medium)
 * Usage: "Transaction Ledger", "Execution Center", major sections
 */
export function Title2({ children, className, ...props }: TypographyProps) {
    return (
        <h2
            className={cn(
                'font-display text-title-2 font-regular text-text-primary text-vibrancy',
                className
            )}
            {...props}
        >
            {children}
        </h2>
    );
}

/**
 * Title3 - Subsection titles (20px, Medium)
 * Usage: Card titles, widget headers, "Basic Info", "Financial Details"
 */
export function Title3({ children, className, ...props }: TypographyProps) {
    return (
        <h3
            className={cn(
                'font-text text-title-3 font-regular text-text-primary text-vibrancy',
                className
            )}
            {...props}
        >
            {children}
        </h3>
    );
}

/**
 * Headline - Emphasized body text (17px, Medium)
 * Usage: List item titles, emphasized content
 */
export function Headline({ children, className, ...props }: TypographyProps) {
    return (
        <p
            className={cn(
                'font-text text-headline font-regular text-text-primary text-vibrancy',
                className
            )}
            {...props}
        >
            {children}
        </p>
    );
}

/* ==========================================
   BODY TEXT
   ========================================== */

/**
 * Body - PRIMARY text style (17px, Regular)
 * Usage: Paragraphs, descriptions, most content
 * THIS IS THE MOST COMMON TEXT STYLE
 */
export function Body({ children, className, ...props }: TypographyProps) {
    return (
        <p
            className={cn(
                'font-text text-body font-regular text-text-primary text-vibrancy',
                className
            )}
            {...props}
        >
            {children}
        </p>
    );
}

/**
 * Callout - Slightly smaller (16px, Regular)
 * Usage: Secondary content, button labels, form values
 */
export function Callout({ children, className, ...props }: TypographyProps) {
    return (
        <p
            className={cn(
                'font-text text-callout font-regular text-text-primary text-vibrancy',
                className
            )}
            {...props}
        >
            {children}
        </p>
    );
}

/**
 * Subhead - Tertiary content (15px, Regular)
 * Usage: Subtitles, less important descriptions
 */
export function Subhead({ children, className, ...props }: TypographyProps) {
    return (
        <p
            className={cn(
                'font-text text-subhead font-regular text-text-secondary text-vibrancy',
                className
            )}
            {...props}
        >
            {children}
        </p>
    );
}

/* ==========================================
   SMALL TEXT / METADATA
   ========================================== */

/**
 * Footnote - Small text (13px, Regular)
 * Usage: Timestamps, helper text, metadata, "10-Sep-2020"
 */
export function Footnote({ children, className, ...props }: TypographyProps) {
    return (
        <p
            className={cn(
                'font-text text-footnote font-regular text-text-secondary text-vibrancy',
                className
            )}
            {...props}
        >
            {children}
        </p>
    );
}

/**
 * Caption1 - Tiny labels (12px, Medium)
 * Usage: Badge text, small labels, card headers
 */
export function Caption1({ children, className, ...props }: TypographyProps) {
    return (
        <p
            className={cn(
                'font-text text-caption-1 font-regular text-text-tertiary text-vibrancy tracking-loose',
                className
            )}
            {...props}
        >
            {children}
        </p>
    );
}

/**
 * Caption2 - Ultra-tiny (11px, Medium)
 * Usage: Very small metadata, legal text
 */
export function Caption2({ children, className, ...props }: TypographyProps) {
    return (
        <p
            className={cn(
                'font-text text-caption-2 font-regular text-text-tertiary text-vibrancy tracking-looser',
                className
            )}
            {...props}
        >
            {children}
        </p>
    );
}

/* ==========================================
   SPECIALIZED COMPONENTS
   ========================================== */

interface MonospacedProps extends TypographyProps {
    size?: 'small' | 'body' | 'large';
}

/**
 * Monospaced - Numbers, dates, codes (SF Mono)
 * Usage: Financial figures, quantities, dates
 * ALWAYS use for numbers in tables/cards
 */
export function Monospaced({ children, className, size = 'body', ...props }: MonospacedProps) {
    return (
        <span
            className={cn(
                'font-text tabular-nums text-text-primary text-vibrancy',
                size === 'small' && 'text-footnote',
                size === 'body' && 'text-callout',
                size === 'large' && 'text-title-3',
                className
            )}
            {...props}
        >
            {children}
        </span>
    );
}

/* ============================================
   LEGACY ALIASES (Transition Support)
   ============================================ */

export const Label = ({ className, children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
    <label
        className={cn(
            'font-text text-subhead font-regular text-text-secondary text-vibrancy',
            className
        )}
        {...props}
    >
        {children}
    </label>
);

export const H1 = Title1;
export const H2 = Title2;
export const H3 = Title3;
export const H4 = ({ className, children, ...props }: TypographyProps) => (
    <Caption2 className={cn("uppercase tracking-widest font-medium", className)} {...props}>
        {children}
    </Caption2>
);
export const SmallText = Caption1;
export const TableText = Body;
export const Mono = Monospaced;
export const MonoCode = ({ className, children, ...props }: TypographyProps) => (
    <code
        className={cn(
            "text-[11px] font-mono font-regular bg-white/5 border-none px-1 rounded text-text-primary opacity-80",
            className
        )}
        {...props}
    >
        {children}
    </code>
);

export interface AccountingProps extends TypographyProps {
    isCurrency?: boolean;
    short?: boolean;
    precision?: number;
    variant?: "default" | "highlight" | "success" | "warning" | "error";
    size?: any;
    value?: number;
}

export const Accounting = ({ className, children, value, isCurrency, short, precision, variant = "default", ...props }: AccountingProps) => {
    const rawValue = value !== undefined ? value : children;

    let content = rawValue;
    if (typeof rawValue === "number") {
        if (isCurrency) {
            content = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(rawValue);
        } else {
            content = rawValue.toLocaleString("en-IN", {
                minimumFractionDigits: 0,
                maximumFractionDigits: precision ?? 3,
            });
        }
    }

    const variantStyles = {
        default: "text-text-primary",
        highlight: "text-text-link",
        success: "text-app-success",
        warning: "text-app-warning",
        error: "text-app-error",
    };

    return (
        <Monospaced
            className={cn(
                variantStyles[variant as keyof typeof variantStyles] || "text-text-primary",
                className
            )}
            {...props}
        >
            {content as ReactNode}
        </Monospaced>
    );
};

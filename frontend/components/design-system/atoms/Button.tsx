import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Slot } from "@radix-ui/react-slot";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'glass' | 'elevated' | 'tonal' | 'success';
    size?: 'sm' | 'md' | 'lg' | 'compact' | 'icon';
    asChild?: boolean;
    loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ variant = 'elevated', size = 'md', className, asChild = false, loading = false, children, ...props }, ref) => {
        const Comp = asChild ? Slot : "button";
        return (
            <Comp
                ref={ref}
                className={cn(
                    // Base styles
                    'inline-flex items-center justify-center gap-2',
                    'font-medium',
                    'transition-all duration-150 ease-out',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',

                    // Token-based Radius - M3 Standard (Rounded Rectangle)
                    'rounded-lg',

                    // Size variants - Optimized for M3 Touch Targets
                    (size === 'sm' || size === 'compact') && 'h-8 px-4 text-[var(--text-caption-1)]',
                    size === 'md' && 'h-10 px-6 text-[var(--text-footnote)]',
                    size === 'lg' && 'h-12 px-8 text-[var(--text-subhead)]',
                    size === 'icon' && 'h-10 w-10 p-0 rounded-full',

                    // Variant styles - M3 SPECIFIC
                    variant === 'primary' && [
                        'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)]',
                        'shadow-1',
                        'hover:bg-[var(--action-primary-hover)] hover:shadow-2',
                        'focus-visible:ring-[var(--action-primary)]',
                    ],

                    variant === 'success' && [
                        'bg-emerald-600 text-white',
                        'shadow-1',
                        'hover:bg-emerald-700 hover:shadow-2',
                        'focus-visible:ring-emerald-600',
                    ],

                    variant === 'elevated' && [
                        'bg-[var(--btn-elevated-bg)] text-[var(--btn-elevated-text)]',
                        'shadow-1',
                        'hover:bg-[var(--bg-surface-sunken)] hover:shadow-2',
                        'active:shadow-1',
                        'focus-visible:ring-[var(--action-primary)]',
                    ],

                    variant === 'tonal' && [
                        'bg-[var(--btn-tonal-bg)] text-[var(--btn-tonal-text)]',
                        'hover:bg-[rgba(var(--primary-container), 0.8)]',
                        'focus-visible:ring-[var(--action-primary)]',
                    ],

                    variant === 'secondary' && [
                        'bg-[var(--btn-secondary-bg)] text-[var(--btn-secondary-text)]',
                        'shadow-1',
                        'hover:bg-[var(--bg-surface-sunken)] hover:shadow-2',
                        'active:shadow-1',
                        'focus-visible:ring-[var(--border-strong)]',
                    ],

                    variant === 'ghost' && [
                        'bg-transparent text-[var(--text-primary)]',
                        'hover:bg-[var(--bg-surface-sunken)]',
                        'focus-visible:ring-[var(--action-primary)]',
                    ],

                    variant === 'destructive' && [
                        'bg-[var(--action-destructive)] text-[var(--action-destructive-fg)]',
                        'shadow-1',
                        'hover:opacity-90 hover:shadow-2',
                        'focus-visible:ring-[var(--action-destructive)]',
                    ],

                    variant === 'glass' && [
                        'bg-[var(--input-glass-bg)] backdrop-blur-md',
                        'text-[var(--text-primary)] shadow-sm',
                        'hover:bg-[rgba(255,255,255,0.6)]'
                    ],

                    // Disabled state
                    'disabled:opacity-40 disabled:pointer-events-none',

                    className
                )}
                {...props}
            >
                {loading ? (
                    <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {children}
                    </span>
                ) : (
                    children
                )}
            </Comp>
        );
    }
);

Button.displayName = 'Button';

import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
    error?: boolean;
    variant?: 'default' | 'sunken';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ error, variant = 'default', className, ...props }, ref) => {
        return (
            <input
                ref={ref}
                className={cn(
                    // Base styles - Component Token
                    'text-sm transition-all duration-150 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed',

                    variant === 'default' && [
                        'bg-[var(--input-bg)]',
                        'border border-[var(--input-border)]',
                        'placeholder:text-[var(--input-placeholder)]',
                        'focus:ring-[var(--action-primary)]',
                        'focus:border-[var(--action-primary)]',
                        'text-[var(--input-text)]',
                    ],

                    variant === 'sunken' && [
                        'bg-surface-sunken/60',
                        'border-none shadow-inner',
                        'placeholder:text-text-tertiary/50',
                        'focus:bg-surface-sunken',
                        'focus:ring-brand-primary/20',
                    ],

                    // Error state
                    error && [
                        'border-[var(--status-error)]',
                        'focus:ring-[var(--status-error)]',
                        'focus:border-[var(--status-error)]',
                    ],

                    className
                )}
                {...props}
            />
        );
    }
);

Input.displayName = 'Input';

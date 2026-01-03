import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
    error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ error, className, ...props }, ref) => {
        return (
            <input
                ref={ref}
                className={cn(
                    // Base styles - Component Token
                    'bg-[var(--input-bg)]',
                    'border border-[var(--input-border)]',
                    'text-sm', /* Fallback/Base */

                    // Placeholder
                    'placeholder:text-[var(--input-placeholder)]',

                    // Focus state
                    'focus:outline-none',
                    'focus:ring-2 focus:ring-[var(--action-primary)]',
                    'focus:border-[var(--action-primary)]',

                    // Transitions
                    'transition-all duration-150',

                    // Error state
                    error && [
                        'border-[var(--status-error)]',
                        'focus:ring-[var(--status-error)]',
                        'focus:border-[var(--status-error)]',
                    ],

                    // Disabled state
                    'disabled:opacity-50 disabled:cursor-not-allowed',

                    className
                )}
                {...props}
            />
        );
    }
);

Input.displayName = 'Input';

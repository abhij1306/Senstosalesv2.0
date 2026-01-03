import { TextareaHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    error?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ error, className, ...props }, ref) => {
        return (
            <textarea
                ref={ref}
                className={cn(
                    'surface-sunken',
                    'w-full min-h-[80px]',
                    'px-3 py-2',
                    'type-subhead', // 15px regular
                    'text-primary',
                    'placeholder:text-tertiary',
                    'rounded-[var(--radius-sm)]',
                    'resize-vertical',
                    'focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-interactive-primary))]',
                    'transition-all duration-150',
                    error && 'border-[rgb(var(--color-error))] focus:ring-[rgb(var(--color-error))]',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    className
                )}
                {...props}
            />
        );
    }
);

Textarea.displayName = 'Textarea';

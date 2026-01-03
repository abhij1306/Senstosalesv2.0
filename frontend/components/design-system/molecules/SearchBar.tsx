"use client";

import { Input } from '@/components/design-system/atoms/Input';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    onSearch?: () => void;
    placeholder?: string;
    className?: string;
}

export function SearchBar({
    value,
    onChange,
    onSearch,
    placeholder = 'Search...',
    className
}: SearchBarProps) {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <div className={cn('relative', className)}>
            {/* Search Icon */}
            <Search
                size={16}
                className={cn(
                    'absolute left-3 top-1/2 -translate-y-1/2',
                    'transition-colors duration-150',
                    isFocused ? 'text-action-primary' : 'text-tertiary'
                )}
            />

            {/* Input */}
            <Input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && onSearch) {
                        onSearch();
                    }
                }}
                placeholder={placeholder}
                className="pl-9 pr-9"
            />

            {/* Clear Button */}
            {value && (
                <button
                    onClick={() => onChange('')}
                    className={cn(
                        'absolute right-3 top-1/2 -translate-y-1/2',
                        'text-tertiary hover:text-primary',
                        'transition-colors duration-150'
                    )}
                >
                    <X size={16} />
                </button>
            )}

            {/* Keyboard Shortcut Hint */}
        </div>
    );
}

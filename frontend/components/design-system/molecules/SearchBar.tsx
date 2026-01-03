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
        <div className={cn(
            'relative flex items-center w-full transition-all duration-300',
            'bg-app-surface/60 backdrop-blur-md rounded-full shadow-sm',
            'focus-within:bg-app-surface/80 focus-within:shadow-md focus-within:ring-1 focus-within:ring-action-primary/20',
            className
        )}>
            {/* Search Icon */}
            <div className="pl-4 pr-2 flex items-center justify-center shrink-0">
                <Search
                    size={16}
                    className={cn(
                        'transition-colors duration-200',
                        isFocused ? 'text-action-primary' : 'text-app-fg-muted'
                    )}
                />
            </div>

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
                className="bg-transparent border-none shadow-none focus-visible:ring-0 h-10 pl-0 pr-10 text-[13px] font-medium placeholder:text-app-fg-muted/40"
            />

            {/* Clear Button */}
            {value && (
                <button
                    onClick={() => onChange('')}
                    className={cn(
                        'absolute right-3 top-1/2 -translate-y-1/2',
                        'w-6 h-6 rounded-full flex items-center justify-center',
                        'text-app-fg-muted hover:bg-app-surface-sunken hover:text-app-fg',
                        'transition-all duration-200'
                    )}
                >
                    <X size={14} />
                </button>
            )}
        </div>
    );
}

"use client";

import React, { useState, useEffect } from "react";
import { Input } from "../atoms/Input";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/useDebounce";

/**
 * SearchBar Molecule - Atomic Design System v1.0
 * Composition: Input + Search Icon + Clear Button + Keyboard Shortcut
 * Performance: 300ms debounce to prevent excessive re-renders
 */
export interface SearchBarProps {
    id?: string;
    name?: string;
    value: string;
    onChange: (value: string) => void;
    onSearch?: () => void;
    placeholder?: string;
    shortcut?: string;
    className?: string;
    variant?: "default" | "neumorphic";
}

const SearchBarInternal = React.forwardRef<HTMLInputElement, SearchBarProps>(
    ({ id, name, value, onChange, onSearch, placeholder = "Search...", shortcut, className, variant = "default" }, ref) => {
        const [localValue, setLocalValue] = useState(value);
        const debouncedValue = useDebounce(localValue, 300);

        // Sync debounced value to parent
        useEffect(() => {
            if (debouncedValue !== value) {
                onChange(debouncedValue);
            }
        }, [debouncedValue, onChange, value]);

        // Sync external value changes back to local state
        useEffect(() => {
            if (value !== localValue) {
                setLocalValue(value);
            }
        }, [value]);

        const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter" && onSearch) {
                onSearch();
            }
        };

        const handleClear = () => {
            setLocalValue("");
            onChange(""); // Immediate clear
        };

        return (
            <div className={cn("relative group max-w-2xl w-full", className)}>
                <Input
                    ref={ref}
                    id={id}
                    name={name}
                    variant={variant === "neumorphic" ? "neumorphic" : "default"}
                    value={localValue}
                    onChange={(e) => setLocalValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    icon={<Search size={18} className="text-app-fg/40 group-focus-within:text-app-accent transition-colors" />}
                    className={cn(
                        "pr-20 h-[44px] rounded-full transition-all duration-300 !pl-14 border-none",
                        variant === "default" && "bg-blue-500/5 focus:shadow-xl focus:shadow-app-accent/5 focus:bg-blue-500/10 shadow-none"
                    )}
                />
                {/* Actions Group */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    {localValue && (
                        <button
                            onClick={handleClear}
                            className="text-app-fg/30 hover:text-rose-500 transition-colors p-1.5 hover:bg-rose-500/5 rounded-full"
                            aria-label="Clear search"
                        >
                            <X size={16} />
                        </button>
                    )}
                    {shortcut && !localValue && (
                        <kbd className="hidden sm:flex px-2 py-0.5 text-[9px] font-black text-app-fg/40 bg-blue-500/5 rounded-md border border-app-border/20 pointer-events-none tracking-widest uppercase">
                            {shortcut}
                        </kbd>
                    )}
                </div>
            </div>
        );
    }
);

SearchBarInternal.displayName = "SearchBar";

export const SearchBar = React.memo(SearchBarInternal);

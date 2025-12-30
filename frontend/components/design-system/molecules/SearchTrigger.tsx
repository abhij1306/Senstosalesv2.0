"use client";

import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchTriggerProps {
    className?: string;
}

export const SearchTrigger = ({ className }: SearchTriggerProps) => {
    return (
        <button
            onClick={() => document.dispatchEvent(new CustomEvent("open-command-palette"))}
            className={cn(
                "group relative flex items-center gap-2 px-4 py-2 rounded-xl",
                "bg-sys-bg-white/50 hover:bg-sys-bg-white hover:shadow-sm", // Subtle glass input look
                "border border-sys-bg-tertiary",
                "transition-all duration-200",
                "text-sys-secondary hover:text-sys-primary w-full md:w-64 lg:w-80",
                className
            )}
        >
            <Search className="w-4 h-4 text-sys-tertiary group-hover:text-sys-primary transition-colors" />
            <span className="text-sm text-sys-tertiary group-hover:text-sys-secondary flex-1 text-left">
                Search...
            </span>
            <div className="hidden md:flex items-center gap-1 border border-sys-bg-tertiary/50 rounded px-1.5 py-0.5 bg-sys-bg-tertiary/20">
                <span className="text-[10px] font-medium text-sys-tertiary">⌘ K</span>
            </div>
        </button>
    );
};

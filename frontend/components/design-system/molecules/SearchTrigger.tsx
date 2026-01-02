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
                "bg-app-surface/50 hover:bg-app-surface hover:shadow-app-spotlight", // Subtle glass input look
                "border border-app-border",
                "transition-all duration-200",
                "text-app-fg-muted hover:text-app-fg w-full md:w-64 lg:w-80",
                className
            )}
        >
            <Search className="w-4 h-4 text-app-fg-muted group-hover:text-app-fg transition-colors" />
            <span className="text-sm text-app-fg-muted group-hover:text-app-fg/80 flex-1 text-left">
                Search...
            </span>
            <div className="hidden md:flex items-center gap-1 border border-app-border/50 rounded px-1.5 py-0.5 bg-app-overlay/20">
                <span className="text-[10px] font-medium text-app-fg-muted">⌘ K</span>
            </div>
        </button>
    );
};

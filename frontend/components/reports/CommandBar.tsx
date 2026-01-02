"use client";

import React, { useState } from "react";
import { Mic, Search, Sparkles } from "lucide-react";
import { Card, Flex, Stack, Badge, Box } from "@/components/design-system";
import { cn } from "@/lib/utils";

interface CommandBarProps {
    onVoiceStart: () => void;
    onSearch: (query: string) => void;
}

export function CommandBar({ onVoiceStart, onSearch }: CommandBarProps) {
    const [query, setQuery] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) onSearch(query);
    };

    const suggestions = [
        "Monthly summary",
        "Pending issues",
        "Uninvoiced challans",
        "Compare quarters",
    ];

    return (
        <div className="relative mb-8">
            {/* Main Input */}
            <form onSubmit={handleSubmit} className="relative group">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none transition-colors duration-300">
                    <Search className="w-5 h-5 text-app-fg-muted group-focus-within:text-app-accent" />
                </div>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ask anything about orders, dispatch, or billing..."
                    className="w-full pl-14 pr-16 py-5 bg-app-surface border border-app-border/30 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-app-accent/20 focus:border-app-accent transition-all placeholder:text-app-fg-muted font-bold text-sm ring-1 ring-app-accent/5"
                />

                {/* Voice Button */}
                <button
                    type="button"
                    onClick={onVoiceStart}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 bg-app-overlay/5 hover:bg-app-accent/10 rounded-xl transition-all text-app-accent border border-app-border/20 active:scale-95 group/voice"
                    title="Start Voice Mode"
                >
                    <Mic className="w-5 h-5 transition-transform group-hover/voice:scale-110" />
                </button>
            </form>

            {/* Chips */}
            <Flex gap={2} wrap className="mt-4 px-2">
                <Flex align="center" gap={1.5} className="mr-2 px-1">
                    <Sparkles className="w-3 h-3 text-app-accent animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-app-accent/80">Suggested</span>
                </Flex>
                {suggestions.map((s) => (
                    <button
                        key={s}
                        onClick={() => onSearch(s)}
                        className="px-4 py-1.5 bg-app-overlay/5 border border-app-border/30 rounded-full font-bold text-[10px] uppercase tracking-wider text-app-fg-muted hover:border-app-accent/50 hover:text-app-accent hover:bg-app-accent/5 transition-all active:scale-95"
                    >
                        {s}
                    </button>
                ))}
            </Flex>
        </div>
    );
}

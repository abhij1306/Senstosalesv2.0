"use client";

import React, { useState } from "react";
import { Search, Mic, ChevronDown, ChevronUp, Sparkles, X } from "lucide-react";
import { H1, Badge, Button, Flex, Stack, Box } from "@/components/design-system";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface CollapsibleVoiceHeaderProps {
    onVoiceStart: () => void;
    onSearch: (query: string) => void;
}

export function CollapsibleVoiceHeader({
    onVoiceStart,
    onSearch,
}: CollapsibleVoiceHeaderProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [query, setQuery] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            onSearch(query);
            setIsExpanded(false);
        }
    };

    const suggestions = [
        "Monthly summary",
        "Pending issues",
        "Uninvoiced challans",
        "Compare quarters",
    ];

    return (
        <div className="bg-app-surface border-b border-app-border/30 sticky top-0 z-50 backdrop-blur-xl bg-app-surface/80">
            {/* Compact Header */}
            <div className="px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <H1 className="text-xl font-black tracking-tight text-app-fg">
                        Intelligence Hub
                    </H1>
                    <Badge variant="default" className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 opacity-60">
                        LIVE ANALYTICS
                    </Badge>
                </div>

                <Flex align="center" gap={2}>
                    {/* Compact Search Trigger */}
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className={cn(
                            "flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-300 border shadow-sm",
                            isExpanded
                                ? "bg-app-accent text-white border-app-accent shadow-app-accent/20"
                                : "bg-app-overlay/10 text-app-fg border-app-border/30 hover:bg-app-overlay/20"
                        )}
                    >
                        <Search className={cn("w-4 h-4", isExpanded ? "text-white" : "text-app-accent")} />
                        <span className="text-[11px] font-bold uppercase tracking-widest hidden sm:inline">
                            {isExpanded ? "Active Query" : "System Inquiry"}
                        </span>
                        {isExpanded ? (
                            <X className="w-3.5 h-3.5" />
                        ) : (
                            <ChevronDown className="w-3.5 h-3.5 opacity-40" />
                        )}
                    </button>

                    <Button
                        onClick={onVoiceStart}
                        variant="ghost"
                        className="w-10 h-10 p-0 rounded-xl hover:bg-app-accent/10 text-app-accent group"
                        title="Voice Analysis"
                    >
                        <Mic className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    </Button>
                </Flex>
            </div>

            {/* Expanded Search Bar */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "circOut" }}
                        className="overflow-hidden"
                    >
                        <div className="px-6 pb-6 pt-2">
                            <form onSubmit={handleSubmit} className="relative group">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                    <Sparkles className="w-4 h-4 text-app-accent opacity-40 group-focus-within:opacity-100 transition-opacity" />
                                </div>
                                <input
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Inquire about orders, dispatch velocity, or billing discrepancies..."
                                    className="w-full pl-12 pr-14 py-4 bg-app-overlay/10 border border-app-border/30 rounded-2xl focus:outline-none focus:ring-4 focus:ring-app-accent/10 focus:border-app-accent transition-all text-[13px] font-bold placeholder:text-app-fg-muted/30"
                                    autoFocus
                                />
                                <button
                                    type="button"
                                    onClick={onVoiceStart}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-app-accent text-white rounded-xl hover:bg-app-accent-hover active:scale-95 transition-all shadow-lg shadow-app-accent/20"
                                >
                                    <Mic className="w-4 h-4" />
                                </button>
                            </form>

                            {/* Suggestions */}
                            <div className="flex flex-wrap items-center gap-2 mt-4">
                                <div className="flex items-center gap-2 px-2 py-1 text-[10px] font-black text-app-accent uppercase tracking-[0.2em] opacity-50">
                                    <Sparkles className="w-3 h-3" />
                                    <span>SUGGESTED PATTERNS:</span>
                                </div>
                                {suggestions.map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => {
                                            onSearch(s);
                                            setIsExpanded(false);
                                        }}
                                        className="px-3 py-1.5 bg-app-surface border border-app-border/30 rounded-xl text-[10px] font-black uppercase tracking-widest text-app-fg-muted hover:border-app-accent hover:text-app-accent hover:bg-app-accent/5 transition-all active:scale-95 shadow-sm"
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

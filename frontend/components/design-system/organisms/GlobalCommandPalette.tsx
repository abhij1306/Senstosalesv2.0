"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    Loader2,
    FileText,
    Truck,
    Receipt,
    Package,
    LayoutDashboard,
    Settings,
    PlusCircle,
    X,
} from "lucide-react";
import { api, SearchResult } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Card } from "../atoms/Card";

type NavItem = {
    type: "NAV";
    id: string;
    label: string;
    subLabel?: string;
    keywords: string[];
    icon: any;
    path: string;
};

type GlobalItem = SearchResult | NavItem;

const NAV_COMMANDS: NavItem[] = [
    {
        type: "NAV",
        id: "nav-new-inv",
        label: "Create New Invoice",
        subLabel: "Go to invoice creation",
        keywords: ["invoice", "new", "create", "bill"],
        icon: PlusCircle,
        path: "/invoice/create",
    },
    {
        type: "NAV",
        id: "nav-dashboard",
        label: "Dashboard",
        subLabel: "View overview & stats",
        keywords: ["home", "main", "stats"],
        icon: LayoutDashboard,
        path: "/",
    },
    {
        type: "NAV",
        id: "nav-pos",
        label: "Purchase Orders",
        subLabel: "View all POs",
        keywords: ["po", "order", "purchase"],
        icon: Package,
        path: "/po",
    },
    {
        type: "NAV",
        id: "nav-settings",
        label: "Settings",
        subLabel: "App configuration",
        keywords: ["config", "admin"],
        icon: Settings,
        path: "/settings",
    },
];

export const GlobalCommandPalette = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [mounted, setMounted] = useState(false);

    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    // Toggle listener
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "/") {
                if (e.key === "/") {
                    // Prevent search input from typing '/'
                    if (document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
                        e.preventDefault();
                        setIsOpen((open) => !open);
                    }
                } else {
                    e.preventDefault();
                    setIsOpen((open) => !open);
                }
            }
        };

        const onCustomOpen = () => setIsOpen(true);

        document.addEventListener("keydown", onKeyDown);
        document.addEventListener("open-command-palette", onCustomOpen);
        return () => {
            document.removeEventListener("keydown", onKeyDown);
            document.removeEventListener("open-command-palette", onCustomOpen);
        };
    }, []);

    // Focus input on open
    useEffect(() => {
        if (isOpen && inputRef.current) {
            // Tiny delay to allow animation mount
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    // Search Logic
    useEffect(() => {
        if (query.trim().length === 0) {
            setResults([]);
            return;
        }

        const search = async () => {
            setLoading(true);
            try {
                const data = await api.searchGlobal(query);
                setResults(data);
            } catch (error) {
                setResults([]);
            } finally {
                setLoading(false);
            }
        };

        const debounce = setTimeout(search, 300);
        return () => clearTimeout(debounce);
    }, [query]);

    const filteredNavItems = useMemo(() => {
        if (!query) return NAV_COMMANDS; // Show default navs on empty query? Or maybe just some. 
        // Showing all NAV_COMMANDS when empty is good for discovery.
        const q = query.toLowerCase();
        return NAV_COMMANDS.filter(
            (cmd) =>
                cmd.label.toLowerCase().includes(q) ||
                cmd.keywords.some((k) => k.toLowerCase().includes(q))
        );
    }, [query]);

    const allItems = useMemo<GlobalItem[]>(() => {
        // When query is empty, show Nav items.
        // When query exists, show merged.
        const raw = [...filteredNavItems, ...results];
        const seen = new Set<string>();
        return raw.filter((item) => {
            const key = `${item.type}-${item.id}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }, [filteredNavItems, results]);

    useEffect(() => {
        setSelectedIndex(0);
    }, [allItems.length]);

    const handleItemSelect = (item: GlobalItem) => {
        setIsOpen(false);
        setQuery("");
        if (item.type === "NAV") {
            router.push(item.path);
        } else {
            if (item.type === "PO") router.push(`/po/${item.number}`);
            else if (item.type === "DC") router.push(`/dc/${item.number}`);
            else if (item.type === "Invoice")
                router.push(`/invoice/${encodeURIComponent(item.number)}`);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setSelectedIndex((prev) => (prev + 1) % allItems.length);
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setSelectedIndex(
                (prev) => (prev - 1 + allItems.length) % allItems.length
            );
        } else if (e.key === "Enter" && allItems[selectedIndex]) {
            e.preventDefault();
            handleItemSelect(allItems[selectedIndex]);
        } else if (e.key === "Escape") {
            setIsOpen(false);
        }
    };

    const renderIcon = (item: GlobalItem) => {
        const className = "w-4 h-4";
        if (item.type === "NAV") {
            const Icon = item.icon;
            return <Icon className={className} />;
        }
        if (item.type === "PO") return <Package className={className} />;
        if (item.type === "DC") return <Truck className={className} />;
        if (item.type === "Invoice") return <Receipt className={className} />;
        return <FileText className={className} />;
    };

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="fixed inset-0 bg-app-overlay/20 backdrop-blur-[2px] z-[100]" // Light dimming
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="fixed inset-0 z-[101] flex items-start justify-center pt-[15vh] pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -20 }}
                            transition={{ duration: 0.2, type: "spring", damping: 25, stiffness: 300 }}
                            className="w-full max-w-2xl px-4 pointer-events-auto"
                        >
                            <Card className="flex flex-col overflow-hidden shadow-app-spotlight border-app-border/50 bg-app-surface/95 backdrop-blur-xl ring-1 ring-app-accent/5">
                                <div className="flex items-center px-4 py-3 border-b border-app-border/50">
                                    <Search className="w-5 h-5 text-app-fg-muted mr-3" />
                                    <input
                                        ref={inputRef}
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Type a command or search..."
                                        className="flex-1 bg-transparent border-none outline-none text-[16px] text-app-fg placeholder:text-app-fg-muted/60"
                                    />
                                    {loading && <Loader2 className="w-4 h-4 animate-spin text-app-fg-muted ml-2" />}
                                    <div className="flex items-center gap-2 ml-4">
                                        <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                                            <span className="text-xs">ESC</span>
                                        </kbd>
                                    </div>
                                </div>
                                <div className="max-h-[300px] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-app-overlay/20">
                                    {allItems.length === 0 ? (
                                        <div className="py-6 text-center text-app-fg-muted">
                                            <p className="text-sm">No results found.</p>
                                        </div>
                                    ) : (
                                        allItems.map((item, idx) => (
                                            <button
                                                key={`${item.type}-${item.id}`}
                                                onClick={() => handleItemSelect(item)}
                                                onMouseEnter={() => setSelectedIndex(idx)}
                                                className={cn(
                                                    "w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-colors duration-100",
                                                    selectedIndex === idx
                                                        ? "bg-app-accent/10 text-app-fg"
                                                        : "text-app-fg-muted hover:bg-app-overlay"
                                                )}
                                            >
                                                <div
                                                    className={cn(
                                                        "flex h-8 w-8 items-center justify-center rounded-md border shadow-sm",
                                                        selectedIndex === idx
                                                            ? "bg-app-surface border-app-accent/20 text-app-accent"
                                                            : "bg-app-surface border-app-border text-app-fg-muted"
                                                    )}
                                                >
                                                    {renderIcon(item)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className={cn("text-sm font-medium", selectedIndex === idx ? "text-app-accent" : "")}>
                                                            {item.type === "NAV" ? item.label : item.number}
                                                        </span>
                                                        {item.type !== "NAV" && (
                                                            <span className="text-[10px] uppercase tracking-wider text-app-fg-muted border border-app-border px-1 rounded-sm">
                                                                {item.type}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-app-fg-muted truncate">
                                                        {item.type === "NAV" ? item.subLabel : item.party}
                                                    </div>
                                                </div>
                                                {selectedIndex === idx && (
                                                    <div className="text-xs text-app-fg-muted/50">
                                                        Jump to
                                                    </div>
                                                )}
                                            </button>
                                        ))
                                    )}
                                </div>
                                <div className="px-4 py-2 bg-app-overlay/30 border-t border-app-border/50 flex items-center justify-between text-[10px] text-app-fg-muted">
                                    <div className="flex gap-2">
                                        <span>Protip: Press <kbd className="font-bold">Ctrl K</kbd> anywhere</span>
                                    </div>
                                    <div>SenstoSales Search</div>
                                </div>
                            </Card>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
};

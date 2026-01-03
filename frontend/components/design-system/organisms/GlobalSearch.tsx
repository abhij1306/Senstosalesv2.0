"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import {
  Search,
  Loader2,
  FileText,
  Truck,
  Receipt,
  Package,
  ArrowRight,
  X,
  Settings,
  PlusCircle,
  LayoutDashboard,
} from "lucide-react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { api, SearchResult } from "@/lib/api";
import { cn } from "@/lib/utils";
import { StatusBadge } from "../atoms/StatusBadge";
import { Title3, Body, SmallText, Label, MonoCode, Accounting, Caption1 } from "../atoms/Typography";

// --- Types ---
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

// --- Static Navigation Commands ---
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
    path: "/dashboard",
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
    id: "nav-invs",
    label: "All Invoices",
    subLabel: "View invoice register",
    keywords: ["bill", "history"],
    icon: Receipt,
    path: "/invoice",
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

export default function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);

  // --- Logic: Load/Save Recents ---
  useEffect(() => {
    const saved = localStorage.getItem("senstosales-recent-searches");
    if (saved) setRecentSearches(JSON.parse(saved));
  }, []);

  const saveRecentSearch = (term: string) => {
    if (!term) return;
    const newRecents = [
      term,
      ...recentSearches.filter((r) => r !== term),
    ].slice(0, 5);
    setRecentSearches(newRecents);
    localStorage.setItem(
      "senstosales-recent-searches",
      JSON.stringify(newRecents),
    );
  };

  const clearRecents = () => {
    setRecentSearches([]);
    localStorage.removeItem("senstosales-recent-searches");
  };

  // --- Logic: Search ---
  useEffect(() => {
    if (query.trim().length === 0) {
      setResults([]);
      return;
    }
    const search = async () => {
      setLoading(true);
      try {
        const data = await api.searchGlobal(query);
        setResults(data || []);
      } catch (error) {
        setResults([]);
      } finally {
        setLoading(false);
      }
    };
    const debounce = setTimeout(search, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  // --- Logic: Combined Items (Nav + Data) ---
  const filteredNavItems = useMemo(() => {
    if (!query) return [];
    const q = (query || "").toLowerCase();
    return NAV_COMMANDS.filter(
      (cmd) =>
        (cmd.label || "").toLowerCase().includes(q) ||
        (cmd.keywords || []).some((k) => k.toLowerCase().includes(q)),
    );
  }, [query]);

  const allItems = useMemo<GlobalItem[]>(() => {
    const raw = [...filteredNavItems, ...results];
    const seen = new Set<string>();
    return raw.filter((item) => {
      const key = `${item.type}-${item.id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [filteredNavItems, results]);

  // Reset selected index when items change
  useEffect(() => {
    setSelectedIndex(0);
  }, [allItems.length]);

  // --- Scroll to Active Item ---
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.children[selectedIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }
  }, [selectedIndex]);

  // --- Logic: Handlers ---
  const handleItemSelect = (item: GlobalItem) => {
    setIsOpen(false);
    setQuery("");

    if (item.type === "NAV") {
      router.push(item.path);
    } else {
      // Search Result
      saveRecentSearch(query);
      if (item.type === "PO") router.push(`/po/${item.number}`);
      else if (item.type === "DC") router.push(`/dc/${item.number}`);
      else if (item.type === "Invoice")
        router.push(`/invoice/${encodeURIComponent(item.number)}`);
      else if (item.type === "SRV")
        router.push(`/reports?tab=reconciliation&search=${item.number}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % allItems.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(
        (prev) => (prev - 1 + allItems.length) % allItems.length,
      );
    } else if (e.key === "Enter" && allItems[selectedIndex]) {
      e.preventDefault();
      handleItemSelect(allItems[selectedIndex]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  // --- Global Ctrl+K ---
  useEffect(() => {
    const handleGlobalK = (e: KeyboardEvent) => {
      if (e.key?.toLowerCase() === "k" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        e.stopPropagation();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    };
    document.addEventListener("keydown", handleGlobalK);
    return () => document.removeEventListener("keydown", handleGlobalK);
  }, []);

  // --- Click Outside ---
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const clickedMain = searchRef.current?.contains(e.target as Node);
      const clickedPortal = portalRef.current?.contains(e.target as Node);
      if (!clickedMain && !clickedPortal) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Calculate Portal Position ---
  const [position, setPosition] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  useEffect(() => {
    if (isOpen && searchRef.current) {
      const rect = searchRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width,
      });
    }
  }, [isOpen]);

  // --- Render Helpers ---
  const selectedItem = allItems[selectedIndex];

  const renderIcon = (item: GlobalItem, className?: string) => {
    if (item.type === "NAV") {
      const Icon = item.icon;
      return <Icon className={className || "w-4 h-4"} />;
    }
    if (item.type === "PO") return <Package className={className} />;
    if (item.type === "DC") return <Truck className={className} />;
    if (item.type === "Invoice") return <Receipt className={className} />;
    return <FileText className={className} />;
  };

  const portalContent = position ? (
    <div
      ref={portalRef}
      className="fixed z-[9999] flex flex-col bg-app-surface/90 backdrop-blur-3xl elevation-4 border-none rounded-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      style={{
        top: position.top,
        left: position.left,
        width: position.width,
        height: 520,
        transformOrigin: "top center",
      }}
    >
      {/* 2-Pane Layout */}
      <div className="flex flex-1 overflow-hidden h-full">
        {/* Left Pane: List */}
        <div className="w-[50%] flex flex-col bg-blue-50/30 dark:bg-blue-950/20 border-none">
          {/* Empty State */}
          {query && allItems.length === 0 && !loading && (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
              <Search className="w-8 h-8 opacity-20 mb-2" />
              <span className="text-xs">No results found</span>
            </div>
          )}

          {/* Initial Empty State */}
          {!query && allItems.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center text-app-fg-muted/40 p-8 text-center">
              <Search className="w-8 h-8 opacity-20 mb-4" />
              <Body className="text-text-primary uppercase tracking-wide">
                Type to search...
              </Body>
              <Caption1 className="mt-1 text-text-tertiary">
                Find POs, Invoices, or jump to pages
              </Caption1>

              {/* Show Recents if any within empty state */}
              {recentSearches.length > 0 && (
                <div className="mt-8 w-full">
                  <div className="text-[10px] font-black uppercase tracking-widest text-app-fg-muted mb-4 text-left px-4">
                    Recent Activity
                  </div>
                  {recentSearches.map((term) => (
                    <button
                      key={term}
                      onClick={() => {
                        setQuery(term);
                        inputRef.current?.focus();
                      }}
                      className="block w-full text-left px-4 py-2.5 text-footnote text-text-secondary hover:text-app-accent hover:bg-app-accent/5 rounded-xl transition-all"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Items List */}
          {allItems.length > 0 && (
            <div
              ref={listRef}
              className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-slate-200"
            >
              {/* Header for Nav if present */}
              {filteredNavItems.length > 0 && (
                <div className="px-4 py-2 sticky top-0 bg-app-surface/80 backdrop-blur z-10">
                  <Caption1 className="text-text-tertiary uppercase tracking-wider">Commands</Caption1>
                </div>
              )}

              {allItems.map((item, idx) => {
                const isSelected = selectedIndex === idx;
                return (
                  <button
                    key={`${item.type}-${item.id}`}
                    onClick={() => handleItemSelect(item)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all duration-150 mb-0.5",
                      isSelected
                        ? "active-glow text-white"
                        : "hover:bg-app-fg/5 text-app-fg",
                    )}
                  >
                    {renderIcon(
                      item,
                      cn(
                        "w-4 h-4",
                        isSelected ? "text-white" : "text-app-fg/40",
                      ),
                    )}
                    <div className="flex-1 min-w-0">
                      <Body
                        className={cn(
                          "truncate",
                          isSelected ? "text-white" : "text-app-fg",
                        )}
                      >
                        {item.type === "NAV" ? item.label : item.number}
                      </Body>
                      <SmallText
                        className={cn(
                          "truncate text-[11px]",
                          isSelected ? "text-white/80" : "text-app-fg/60",
                        )}
                      >
                        {item.type === "NAV"
                          ? item.subLabel
                          : (item as SearchResult).party}
                      </SmallText>
                    </div>
                    {isSelected && (
                      <ArrowRight size={14} className="text-white opacity-80" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Pane: Preview */}
        <div className="w-[50%] bg-app-surface/20 backdrop-blur-md p-8 flex flex-col">
          {selectedItem ? (
            <div className="animate-in fade-in zoom-in-95 duration-150">
              <div className="w-14 h-14 rounded-2xl bg-app-fg/5 flex items-center justify-center mb-6 border border-app-border/50">
                {renderIcon(selectedItem, "w-7 h-7 text-app-fg")}
              </div>

              <Title3 className="text-text-primary mb-1 uppercase tracking-tight">
                {selectedItem.type === "NAV"
                  ? selectedItem.label
                  : selectedItem.number}
              </Title3>
              <Body className="text-app-fg-muted mb-8">
                {selectedItem.type === "NAV"
                  ? "Navigation Command"
                  : selectedItem.type_label}
              </Body>

              {/* Metadata Grid */}
              <div className="space-y-5">
                {selectedItem.type !== "NAV" && (
                  <>
                    {/* Removed Party Row completely as requested */}
                    <div className="flex justify-between py-2 border-b border-app-border/10">
                      <Caption1 className="text-text-tertiary uppercase tracking-wider">
                        Date
                      </Caption1>
                      <span className="text-footnote text-text-secondary font-regular">
                        {(selectedItem as SearchResult).date || "-"}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-app-border/10">
                      <Caption1 className="text-text-tertiary uppercase tracking-wider">
                        Amount
                      </Caption1>
                      <span className="text-footnote text-text-primary font-mono">
                        {(selectedItem as SearchResult).amount
                          ? `₹${(selectedItem as SearchResult).amount?.toLocaleString()}`
                          : "-"}
                      </span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-xs text-app-fg/40 font-medium uppercase tracking-wider">
                        Status
                      </span>
                      <StatusBadge
                        status={
                          (selectedItem as SearchResult).status as any || "Active"
                        }
                        className="text-[10px] py-0.5 px-2"
                      />
                    </div>
                  </>
                )}
                {selectedItem.type === "NAV" && (
                  <div className="p-4 bg-app-accent/10 rounded-xl text-sm text-app-accent leading-relaxed">
                    {selectedItem.subLabel}. <br />
                    Press <strong className="font-semibold">Enter</strong> to
                    navigate immediately.
                  </div>
                )}
              </div>

              <div className="mt-auto pt-8 flex gap-3">
                <button
                  onClick={() => handleItemSelect(selectedItem)}
                  className="flex-1 active-glow hover:brightness-110 text-white text-sm font-bold py-3 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <ArrowRight size={16} />
                  Open{" "}
                  {selectedItem.type === "NAV" ? "Page" : selectedItem.type}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <SmallText className="text-app-fg-muted">Select an item to preview</SmallText>
            </div>
          )}
        </div>
      </div>

      {/* Footer / Shortcuts Hint */}
      <div className="bg-app-surface px-4 py-2.5 flex items-center justify-between text-[10px] text-app-fg/40 border-none">
        <div className="flex gap-4">
          <span className="flex items-center gap-1.5">
            <kbd className="bg-app-surface shadow-sm rounded px-1.5 py-0.5 font-sans min-w-[20px] text-center">
              ↵
            </kbd>{" "}
            Select
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="bg-app-surface shadow-sm rounded px-1.5 py-0.5 font-sans min-w-[20px] text-center">
              ↓
            </kbd>{" "}
            Navigate
          </span>
        </div>
        <div className="font-regular opacity-50">SenstoSales Raycast</div>
      </div>
    </div >
  ) : null;

  return (
    <>
      <div ref={searchRef} className="relative max-w-[700px] w-full group z-50">
        <div
          className={cn(
            "flex items-center gap-4 px-6 py-2 transition-all duration-300 ease-out",
            "rounded-xl border-none shadow-lg shadow-black/10 dark:shadow-black/30",
            isOpen && "shadow-xl shadow-black/15 dark:shadow-black/40",
          )}
        >
          {loading ? (
            <Loader2 className="w-5 h-5 text-app-accent animate-spin" />
          ) : (
            <Search
              className={cn(
                "w-5 h-5 transition-colors",
                isOpen ? "text-app-accent" : "text-app-fg/40",
              )}
            />
          )}

          <input
            ref={inputRef}
            id="global-search"
            name="global-search"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search items, vendors, invoices..."
            className="flex-1 bg-transparent border-none outline-none text-footnote font-regular text-text-primary placeholder:text-text-tertiary"
          />

          {query && (
            <button
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="p-1 hover:bg-app-overlay rounded-lg transition-colors"
            >
              <X size={14} className="text-app-fg-muted" />
            </button>
          )}

          <div className="hidden lg:flex items-center gap-1.5 px-2 py-1 bg-app-surface-elevated/50 rounded-lg shadow-sm pointer-events-none select-none">
            <kbd className="font-mono text-[9px] font-bold text-app-fg-muted">
              CTRL K
            </kbd>
          </div>
        </div>
      </div>

      {mounted && isOpen && createPortal(portalContent, document.body)}
    </>
  );
}

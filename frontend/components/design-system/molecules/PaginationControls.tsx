"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationControlsProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    itemName?: string;
}

export default function PaginationControls({
    currentPage,
    totalPages,
    onPageChange,
    itemName = "Items",
}: PaginationControlsProps) {
    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-between px-6 py-4 border-t border-app-border bg-app-overlay/30 backdrop-blur-md rounded-b-2xl">
            <div className="text-[10px] font-bold uppercase tracking-widest text-app-fg-muted">
                Page <span className="text-app-fg">{currentPage}</span> of{" "}
                <span className="text-app-fg">{totalPages}</span>
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-xl hover:bg-app-surface hover:shadow-app-spotlight disabled:opacity-20 disabled:cursor-not-allowed transition-all text-app-fg-muted hover:text-app-accent border border-transparent hover:border-app-accent/20"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className="p-2 rounded-xl hover:bg-app-surface hover:shadow-app-spotlight disabled:opacity-20 disabled:cursor-not-allowed transition-all text-app-fg-muted hover:text-app-accent border border-transparent hover:border-app-accent/20"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}

"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { memo } from "react";
import { SmallText } from "@/components/design-system";

/**
 * Pagination Component - Atomic Design System v1.0
 * Standardized to "Apple-level" high-contrast design.
 */
interface PaginationProps {
    currentPage: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    className?: string;
}

export const Pagination = memo(({
    currentPage,
    totalItems,
    itemsPerPage,
    onPageChange,
    className,
}: PaginationProps) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    if (totalItems === 0 || totalPages <= 1) return null;

    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    const handlePrevious = () => {
        if (currentPage > 1) onPageChange(currentPage - 1);
    };

    const handleNext = () => {
        if (currentPage < totalPages) onPageChange(currentPage + 1);
    };

    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (currentPage <= 4) {
                for (let i = 1; i <= 5; i++) pages.push(i);
                pages.push("...");
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 3) {
                pages.push(1);
                pages.push("...");
                for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
            } else {
                pages.push(1);
                pages.push("...");
                pages.push(currentPage - 1);
                pages.push(currentPage);
                pages.push(currentPage + 1);
                pages.push("...");
                pages.push(totalPages);
            }
        }
        return pages;
    };

    return (
        <div className={cn("flex flex-col sm:flex-row items-center justify-between gap-6 px-4 py-8 mt-12", className)}>
            <div className="flex-1">
                <SmallText className="text-[12px] font-black uppercase tracking-[0.2em] opacity-40">
                    Showing <span className="text-app-fg opacity-100">{startItem}</span> to <span className="text-app-fg opacity-100">{endItem}</span> of <span className="text-app-accent opacity-100">{totalItems}</span> entries
                </SmallText>
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={handlePrevious}
                    disabled={currentPage === 1}
                    className="h-10 px-4 flex items-center gap-2 rounded-xl bg-app-surface border border-app-border/30 text-app-fg font-black text-[11px] uppercase tracking-widest transition-all hover:bg-app-fg/5 disabled:opacity-30 disabled:pointer-events-none active:scale-95"
                >
                    <ChevronLeft className="w-4 h-4" />
                    <SmallText className="hidden sm:inline font-bold">Prev</SmallText>
                </button>

                <div className="flex items-center gap-1.5 px-2">
                    {getPageNumbers().map((page, idx) => (
                        <button
                            key={idx}
                            onClick={() => typeof page === "number" && onPageChange(page)}
                            disabled={typeof page !== "number"}
                            className={cn(
                                "w-10 h-10 flex items-center justify-center rounded-xl font-black text-[11px] transition-all duration-300",
                                typeof page !== "number" && "pointer-events-none text-app-fg/20",
                                typeof page === "number" && currentPage === page
                                    ? "active-glow text-white scale-110 shadow-lg shadow-app-accent/20"
                                    : "bg-transparent text-app-fg/40 hover:bg-app-fg/5 hover:text-app-fg"
                            )}
                        >
                            {page}
                        </button>
                    ))}
                </div>

                <button
                    onClick={handleNext}
                    disabled={currentPage === totalPages}
                    className="h-10 px-4 flex items-center gap-2 rounded-xl bg-app-surface border border-app-border/30 text-app-fg font-black text-[11px] uppercase tracking-widest transition-all hover:bg-app-fg/5 disabled:opacity-30 disabled:pointer-events-none active:scale-95"
                >
                    <SmallText className="hidden sm:inline font-bold">Next</SmallText>
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
});

Pagination.displayName = "Pagination";
export default Pagination;

"use client";

import React from "react";
import { Button } from "@/components/design-system/atoms/Button";
import { Flex } from "@/components/design-system/atoms/Layout";
import { FileSpreadsheet, Calendar, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * ReportsToolbar Organism - Atomic Design System v1.0
 * Date range selector + Module selector + Export buttons
 * Used in Reports page
 */
export interface ReportsToolbarProps {
    startDate: string;
    endDate: string;
    onDateChange: (start: string, end: string) => void;
    onExport?: () => void;
    loading?: boolean;
    className?: string;
}

export const ReportsToolbar: React.FC<ReportsToolbarProps> = ({
    startDate,
    endDate,
    onDateChange,
    onExport,
    loading = false,
    className,
}) => {
    return (
        <div
            className={cn(
                "flex flex-col sm:flex-row items-center justify-between gap-4 py-2 px-3",
                "bg-app-surface/40 backdrop-blur-md rounded-xl border border-app-border/30 shadow-sm shadow-app-accent/5",
                className
            )}
        >
            {/* Date Range Selection */}
            <Flex align="center" gap={2} className="bg-app-overlay/10 px-3 py-1.5 rounded-xl border border-app-border/20 shadow-inner group focus-within:border-app-accent/30 focus-within:bg-app-overlay/20 transition-all duration-300">
                <Calendar size={14} className="text-app-accent opacity-60 group-hover:opacity-100 transition-opacity" />
                <input
                    type="date"
                    value={startDate}
                    onChange={(e) => onDateChange(e.target.value, endDate)}
                    className="bg-transparent border-none p-0 text-[12px] font-black text-app-fg focus:ring-0 w-[110px] cursor-pointer"
                />
                <ArrowRight size={10} className="text-app-fg-muted opacity-30 mx-1" />
                <input
                    type="date"
                    value={endDate}
                    onChange={(e) => onDateChange(startDate, e.target.value)}
                    className="bg-transparent border-none p-0 text-[12px] font-black text-app-fg focus:ring-0 w-[110px] cursor-pointer"
                />
            </Flex>

            {/* Export Action */}
            {onExport && (
                <Button
                    onClick={onExport}
                    variant="secondary"
                    size="sm"
                    loading={loading}
                    className="h-8 px-4 gap-2 bg-app-overlay/10 border-app-border/30 text-app-fg hover:bg-app-overlay/20 active-glow transition-all rounded-xl"
                >
                    <FileSpreadsheet size={13} className="text-app-status-success" />
                    <span className="text-[10px] font-black uppercase tracking-[0.15em]">
                        Export Ledger
                    </span>
                </Button>
            )}
        </div>
    );
};

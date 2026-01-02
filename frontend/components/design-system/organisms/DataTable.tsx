"use client";

import React, { useState, useMemo, useCallback } from "react";
import { Card } from "../atoms/Card";
import { Button } from "../atoms/Button";
import { Checkbox } from "../atoms/Checkbox";
import { Body, Caption1, Accounting, Caption2 } from "../atoms/Typography";
import { ChevronLeft, ChevronRight, FileDown, Inbox, ChevronDown } from "lucide-react"; // Replaced custom sort icon with lucide
import { TableRowSkeleton } from "../atoms/Skeleton";
import { cn } from "@/lib/utils";

export interface Column<T = any> {
    key: string;
    label: string;
    sortable?: boolean;
    align?: "left" | "center" | "right";
    render?: (value: any, row: T) => React.ReactNode;
    width?: string;
    isNumeric?: boolean;
    isCurrency?: boolean;
}

export interface DataTableProps<T = any> {
    columns: Column<T>[];
    data: T[];
    keyField?: string;
    page?: number;
    pageSize?: number;
    totalItems?: number;
    onPageChange?: (page: number) => void;
    renderSubRow?: (row: T) => React.ReactNode;
    onRowExpand?: (row: T, isExpanded: boolean) => void;
    onRowClick?: (row: T) => void;
    density?: "compact" | "normal";
    sortKey?: string;
    sortDirection?: "asc" | "desc";
    onSort?: (key: string) => void;
    selectable?: boolean;
    selectedRows?: string[];
    onSelectionChange?: (selected: string[]) => void;
    exportable?: boolean;
    onExport?: () => void;
    exportLabel?: string;
    loading?: boolean;
    error?: string;
    emptyMessage?: string;
    emptyIcon?: React.ReactNode;
    className?: string;
    hideHeader?: boolean;
    no_subrow_padding?: boolean;
}

const DataTableComponent = <T extends Record<string, any>,>({
    columns,
    data,
    keyField = "id",
    page,
    pageSize = 10,
    totalItems,
    onPageChange,
    sortKey,
    sortDirection,
    onSort,
    selectable = false,
    selectedRows = [],
    onSelectionChange,
    exportable = false,
    onExport,
    exportLabel = "Export",
    loading = false,
    error,
    emptyMessage = "No data available",
    emptyIcon,
    className,
    renderSubRow,
    onRowExpand,
    onRowClick,
    density = "normal",
    hideHeader = false,
    no_subrow_padding = false,
}: DataTableProps<T>): React.ReactNode => {
    const [internalSort, setInternalSort] = useState<{
        key: string;
        direction: "asc" | "desc";
    } | null>(null);
    const [internalPage, setInternalPage] = useState(1);
    const [expandedRows, setExpandedRows] = useState<string[]>([]);

    const currentPage = (page !== undefined) ? page : internalPage;
    const currentSortKey = sortKey || internalSort?.key;
    const currentSortDirection = sortDirection || internalSort?.direction;

    const total = totalItems || (data ? data.length : 0);
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, total);

    const processedData = useMemo(() => {
        let result = data ? [...data] : [];
        if (currentSortKey) {
            result.sort((a, b) => {
                const aVal = a[currentSortKey];
                const bVal = b[currentSortKey];
                if (aVal < bVal) return currentSortDirection === "asc" ? -1 : 1;
                if (aVal > bVal) return currentSortDirection === "asc" ? 1 : -1;
                return 0;
            });
        }
        if (!totalItems || (data && totalItems === data.length)) {
            result = result.slice(startIndex, endIndex);
        }
        return result;
    }, [data, currentSortKey, currentSortDirection, startIndex, endIndex, totalItems]);

    const handlePageChange = useCallback((newPage: number) => {
        if (onPageChange) onPageChange(newPage);
        else setInternalPage(newPage);
    }, [onPageChange]);

    const handleSort = useCallback((key: string) => {
        if (onSort) onSort(key);
        else {
            setInternalSort((prev) => ({
                key,
                direction: prev?.key === key && prev.direction === "asc" ? "desc" : "asc",
            }));
        }
    }, [onSort]);

    const handleSelectAll = useCallback((checked: boolean) => {
        if (!onSelectionChange) return;
        if (checked) onSelectionChange(processedData.map((row) => String(row[keyField])));
        else onSelectionChange([]);
    }, [onSelectionChange, processedData, keyField]);

    const handleSelectRow = useCallback((rowKey: string, checked: boolean) => {
        if (!onSelectionChange) return;
        if (checked) onSelectionChange([...selectedRows, rowKey]);
        else onSelectionChange(selectedRows.filter((key) => key !== rowKey));
    }, [onSelectionChange, selectedRows]);

    const toggleRowExpansion = useCallback((rowKey: string, row: T) => {
        const isCurrentlyExpanded = expandedRows.includes(rowKey);
        const willBeExpanded = !isCurrentlyExpanded;
        setExpandedRows(prev => isCurrentlyExpanded ? prev.filter(k => k !== rowKey) : [...prev, rowKey]);
        if (onRowExpand) onRowExpand(row, willBeExpanded);
    }, [expandedRows, onRowExpand]);

    const allSelected = selectable && processedData.length > 0 && processedData.every((row) => selectedRows.includes(String(row[keyField])));
    const selectedCount = selectedRows.length;

    if (!loading && !error && (!data || data.length === 0)) {
        return (
            <Card variant="glass" className={cn("p-12 text-center border-border-quaternary", className)}>
                <div className="flex flex-col items-center gap-4">
                    <div className="p-4 rounded-[20px] bg-surface-secondary border border-border-quaternary shadow-sm">
                        {emptyIcon || <Inbox size={32} className="text-text-tertiary" />}
                    </div>
                    <Body className="font-medium text-text-secondary">{emptyMessage}</Body>
                </div>
            </Card>
        );
    }

    if (error) {
        return (
            <Card variant="glass" className={cn("p-8 min-h-[140px] flex items-center justify-center border-system-red/20 bg-system-red/5 backdrop-blur-md", className)}>
                <div className="text-system-red flex items-center gap-2 font-bold text-[14px]">
                    <Inbox className="opacity-70" size={18} />
                    {error}
                </div>
            </Card>
        );
    }

    return (
        <div className={cn("w-full space-y-4", className)}>
            {(exportable || selectable) && (
                <div className="flex items-center justify-between px-2">
                    <div>
                        {selectable && selectedCount > 0 && (
                            <Caption2 className="text-system-blue font-bold uppercase tracking-widest opacity-90">
                                {selectedCount} row{selectedCount !== 1 ? "s" : ""} selected
                            </Caption2>
                        )}
                    </div>
                    {exportable && onExport && (
                        <Button variant="secondary" size="compact" onClick={onExport} className="font-bold tracking-widest px-4 h-8 bg-white/50 backdrop-blur-sm border-white/20">
                            <FileDown size={14} className="mr-2" />
                            {exportLabel}
                        </Button>
                    )}
                </div>
            )}
            <div className={cn("tahoe-glass-card overflow-visible shadow-glass", className)}>
                <div className="overflow-x-auto no-scrollbar rounded-2xl" style={{ minHeight: "300px" }}>
                    <table className="w-full border-collapse finder-table">
                        {!hideHeader && (
                            <thead>
                                <tr className="border-b border-white/10 header-glass">
                                    {renderSubRow && <th className="w-12 sticky top-0 z-10 bg-inherit backdrop-blur-md"></th>}
                                    {selectable && (
                                        <th className={cn("px-6 w-14 sticky top-0 z-10 bg-inherit backdrop-blur-md", density === "compact" ? "h-10" : "h-12")}>
                                            <Checkbox checked={allSelected} onChange={(e) => handleSelectAll(e.target.checked)} aria-label="Select all rows" />
                                        </th>
                                    )}
                                    {columns.map((column) => (
                                        <th
                                            key={column.key}
                                            className={cn(
                                                "sticky top-0 z-10 py-3 px-6 bg-inherit backdrop-blur-md text-left transition-colors border-b border-white/5",
                                                (column.isNumeric || column.isCurrency) ? "text-right" :
                                                    column.align === "right" ? "text-right" :
                                                        column.align === "center" ? "text-center" : "text-left",
                                                column.sortable && (currentSortKey === column.key ?
                                                    "text-system-blue opacity-100" :
                                                    "hover:text-text-primary cursor-pointer")
                                            )}
                                            style={{ width: column.width }}
                                            onClick={column.sortable ? () => handleSort(column.key) : undefined}
                                        >
                                            <div className={cn("flex items-center gap-1.5", column.align === 'right' && "justify-end", column.align === 'center' && "justify-center")}>
                                                <Caption1 className="font-semibold text-text-secondary uppercase tracking-wider text-[12px] opacity-100">
                                                    {column.label}
                                                </Caption1>
                                                {column.sortable && (
                                                    <span className="opacity-50 text-[10px] transform transition-transform duration-200">
                                                        {currentSortKey === column.key ? (currentSortDirection === "asc" ? "↑" : "↓") : ""}
                                                    </span>
                                                )}
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                        )}
                        <tbody className="bg-transparent">
                            {loading ? Array.from({ length: Math.min(pageSize, 10) }).map((_, i) => (
                                <tr key={`skeleton-${i}`}>
                                    <td colSpan={columns.length + (selectable ? 1 : 0) + (renderSubRow ? 1 : 0)}>
                                        <TableRowSkeleton columns={columns.length} />
                                    </td>
                                </tr>
                            )) : processedData.map((row, index) => {
                                const rowKey = (row[keyField] !== undefined && row[keyField] !== null)
                                    ? String(row[keyField])
                                    : `row-${index}`;
                                const isSelected = selectedRows.includes(rowKey);
                                const isExpanded = expandedRows.includes(rowKey);
                                return (
                                    <React.Fragment key={rowKey}>
                                        <tr
                                            onClick={() => onRowClick?.(row)}
                                            className={cn(
                                                "group border-b border-white/5 transition-colors duration-200",
                                                isSelected && "bg-system-blue/10",
                                                isExpanded && "bg-system-blue/5",
                                                "hover:bg-white/5 dark:hover:bg-white/5",
                                                onRowClick && "cursor-pointer active:scale-[0.995]"
                                            )}>
                                            {renderSubRow && (
                                                <td className="w-12 px-0 pl-5">
                                                    <Button
                                                        variant="ghost"
                                                        size="compact"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleRowExpansion(rowKey, row);
                                                        }}
                                                        className="w-7 h-7 p-0 text-text-tertiary hover:text-system-blue transition-all duration-300"
                                                    >
                                                        <ChevronDown
                                                            size={16}
                                                            className={cn("transition-transform duration-300", isExpanded ? "rotate-0" : "-rotate-90")}
                                                        />
                                                    </Button>
                                                </td>
                                            )}
                                            {selectable && (
                                                <td className="px-6 py-2">
                                                    <Checkbox checked={isSelected} onChange={(e) => handleSelectRow(rowKey, e.target.checked)} onClick={(e) => e.stopPropagation()} aria-label={`Select row`} />
                                                </td>
                                            )}
                                            {columns.map((column) => (
                                                <td
                                                    key={column.key}
                                                    className={cn(
                                                        "px-6 py-3.5",
                                                        "align-middle",
                                                        (column.isNumeric || column.isCurrency) ? "text-right tabular-nums font-mono text-opacity-90" : "text-left",
                                                        column.align === "right" ? "text-right" :
                                                            column.align === "center" ? "text-center" : "text-left"
                                                    )}
                                                >
                                                    {column.render ? (column.render(row[column.key], row)) :
                                                        column.isNumeric || column.isCurrency ? (
                                                            <Accounting className="font-medium text-[13px] font-mono tracking-tight text-text-primary" isCurrency={column.isCurrency}>{row[column.key]}</Accounting>
                                                        ) : (
                                                            <Body className="text-text-primary text-[13px] font-normal tracking-normal leading-relaxed">
                                                                {row[column.key]}
                                                            </Body>
                                                        )}
                                                </td>
                                            ))}
                                        </tr>
                                        {renderSubRow && isExpanded && (
                                            <tr className="bg-surface-secondary/50 border-b border-border-quaternary">
                                                <td colSpan={columns.length + (selectable ? 1 : 0) + 1} className="p-0">
                                                    <div className={cn(!no_subrow_padding && "p-6 pl-14 shadow-inner")}>
                                                        {renderSubRow(row)}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-2.5 bg-white/30 dark:bg-black/20 border-t border-white/10 backdrop-blur-md rounded-b-[22px]">
                        <Caption2 className="text-text-tertiary font-bold uppercase tracking-widest opacity-80 text-[10px]">
                            Showing {startIndex + 1} to {endIndex} of {total} results
                        </Caption2>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="compact"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="h-8 px-3 font-medium bg-white/50"
                            >
                                <ChevronLeft size={14} className="mr-1" /> Previous
                            </Button>
                            <div className="flex items-center gap-1 mx-2">
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum: number;
                                    if (totalPages <= 5) pageNum = i + 1;
                                    else if (currentPage <= 3) pageNum = i + 1;
                                    else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                                    else pageNum = currentPage - 2 + i;
                                    return (
                                        <Button
                                            key={pageNum}
                                            variant={currentPage === pageNum ? "primary" : "ghost"}
                                            size="compact"
                                            onClick={() => handlePageChange(pageNum)}
                                            className={cn(
                                                "w-8 h-8 p-0 font-medium rounded-lg transition-all duration-200",
                                                currentPage === pageNum ? "shadow-sm" : "hover:bg-black/5"
                                            )}
                                        >
                                            {pageNum}
                                        </Button>
                                    );
                                })}
                            </div>
                            <Button
                                variant="outline"
                                size="compact"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="h-8 px-3 font-medium bg-white/50"
                            >
                                Next <ChevronRight size={14} className="ml-1" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export const DataTable = React.memo(DataTableComponent) as unknown as <T extends Record<string, any>>(props: DataTableProps<T>) => React.ReactNode;

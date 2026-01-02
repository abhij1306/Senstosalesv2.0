"use client";

import React, { useState, useMemo, useCallback } from "react";
import { Card } from "../atoms/Card";
import { Button } from "../atoms/Button";
import { Checkbox } from "../atoms/Checkbox";
import { Body, SmallText, Accounting } from "../atoms/Typography";
import { ChevronLeft, ChevronRight, FileDown, Inbox } from "lucide-react";
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
    no_borders?: boolean;
    table_surface_solid?: boolean;
    hideHeader?: boolean;
    no_subrow_padding?: boolean;
}

const DataTableComponent = <T extends Record<string, any>>({
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
    no_borders = true,
    table_surface_solid = true,
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
            <Card className={cn("p-12 text-center", className)}>
                <div className="flex flex-col items-center gap-4">
                    <div className="p-4 rounded-full bg-[var(--color-sys-bg-tertiary)]">
                        {emptyIcon || <Inbox size={32} className="text-[var(--color-sys-text-tertiary)]" />}
                    </div>
                    <Body className="text-[var(--color-sys-text-secondary)]">{emptyMessage}</Body>
                </div>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className={cn("p-8 min-h-[140px] flex items-center justify-center", className)}>
                <Body className="text-[var(--color-sys-status-error)] flex items-center gap-2">
                    <Inbox className="opacity-50" size={16} />
                    {error}
                </Body>
            </Card>
        );
    }

    return (
        <div className={cn("w-full", className)}>
            {(exportable || selectable) && (
                <div className="flex items-center justify-between mb-4">
                    <div>
                        {selectable && selectedCount > 0 && (
                            <SmallText className="text-app-fg-muted">
                                {selectedCount} row{selectedCount !== 1 ? "s" : ""} selected
                            </SmallText>
                        )}
                    </div>
                    {exportable && onExport && (
                        <Button variant="secondary" size="sm" onClick={onExport}>
                            <FileDown size={16} />
                            {exportLabel}
                        </Button>
                    )}
                </div>
            )}
            <div className="surface-card bg-app-surface/50 backdrop-blur-xl border border-app-border/30 rounded-3xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-app-accent/5">
                <div className="overflow-x-auto hover-scrollbar" style={{ minHeight: "300px" }}>
                    <table className="w-full border-collapse">
                        {!hideHeader && (
                            <thead>
                                <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)]">
                                    {renderSubRow && <th className="w-10 sticky top-0 z-10 bg-[var(--bg-surface-elevated)]"></th>}
                                    {selectable && (
                                        <th className={cn("px-6 w-12 sticky top-0 z-10 bg-[var(--bg-surface-elevated)]", density === "compact" ? "h-[40px]" : "h-12")}>
                                            <Checkbox checked={allSelected} onChange={(e) => handleSelectAll(e.target.checked)} aria-label="Select all rows" />
                                        </th>
                                    )}
                                    {columns.map((column) => (
                                        <th
                                            key={column.key}
                                            className={cn(
                                                "sticky top-0 z-10 py-3 px-6 text-[11px] font-bold font-heading text-app-fg-muted uppercase tracking-wider transition-colors bg-[var(--bg-surface-elevated)]",
                                                (column.isNumeric || column.isCurrency) ? "text-right" :
                                                    column.align === "right" ? "text-right" :
                                                        column.align === "center" ? "text-center" : "text-left",
                                                column.sortable && (currentSortKey === column.key ?
                                                    "text-app-accent" :
                                                    "hover:bg-[var(--bg-overlay)] cursor-pointer")
                                            )}
                                            style={{ width: column.width }}
                                            onClick={column.sortable ? () => handleSort(column.key) : undefined}
                                        >
                                            {column.sortable ? (
                                                <div className={cn("flex items-center gap-1", column.align === 'right' && "justify-end", column.align === 'center' && "justify-center")}>
                                                    {column.label}
                                                    <span className="opacity-40">{currentSortKey === column.key ? (currentSortDirection === "asc" ? "↑" : "↓") : "↕"}</span>
                                                </div>
                                            ) : column.label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                        )}
                        <tbody className="bg-transparent">
                            {loading ? Array.from({ length: pageSize }).map((_, i) => (
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
                                            onClick={(e) => {
                                                if (onRowClick) {
                                                    onRowClick(row);
                                                }
                                            }}
                                            className={cn(
                                                "group border-b border-[var(--border-subtle)] transition-all duration-150",
                                                processedData.indexOf(row) % 2 === 0 ? "bg-transparent" : "bg-app-surface-hover/30",
                                                isSelected && "bg-app-accent/5",
                                                isExpanded && "bg-app-accent/10",
                                                "hover:bg-blue-50/50 dark:hover:bg-white/5",
                                                onRowClick && "cursor-pointer"
                                            )}>
                                            {renderSubRow && (
                                                <td className="w-10 px-0 pl-4">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => toggleRowExpansion(rowKey, row)}
                                                        className="w-6 h-6 p-0 text-app-fg-muted hover:text-app-accent"
                                                    >
                                                        <ChevronRight
                                                            size={16}
                                                            className={cn("transition-transform duration-200", isExpanded && "rotate-90")}
                                                        />
                                                    </Button>
                                                </td>
                                            )}
                                            {selectable && (
                                                <td className="px-6 py-3">
                                                    <Checkbox checked={isSelected} onChange={(e) => handleSelectRow(rowKey, e.target.checked)} aria-label={`Select row`} />
                                                </td>
                                            )}
                                            {columns.map((column) => (
                                                <td
                                                    key={column.key}
                                                    className={cn(
                                                        "px-6 py-3",
                                                        density === "compact" ? "h-[44px]" : "h-14",
                                                        "align-middle text-[13px] font-medium font-sans",
                                                        (column.isNumeric || column.isCurrency) ? "text-right table-cell-number" :
                                                            typeof column.render === "function" ?
                                                                (column.align === "right" ? "text-right" :
                                                                    column.align === "center" ? "text-center" : "text-left") :
                                                                "table-cell-text",
                                                        column.align === "right" ? "text-right" :
                                                            column.align === "center" ? "text-center" : "text-left"
                                                    )}
                                                >
                                                    {column.render ? (column.render(row[column.key], row)) :
                                                        column.isNumeric || column.isCurrency ? (
                                                            <Accounting isCurrency={column.isCurrency}>{row[column.key]}</Accounting>
                                                        ) : row[column.key]}
                                                </td>
                                            ))}
                                        </tr>
                                        {renderSubRow && isExpanded && (
                                            <tr className="bg-app-accent/5 border-b border-[var(--border-subtle)]">
                                                <td colSpan={columns.length + (selectable ? 1 : 0) + 1} className="p-0">
                                                    <div className={cn(!no_subrow_padding && "p-6 pl-12")}>
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
                    <div className="flex items-center justify-between px-6 py-4 bg-app-surface-hover/20 border-t border-[var(--border-subtle)]">
                        <SmallText className="text-app-fg-muted">
                            Showing {startIndex + 1} to {endIndex} of {total} results
                        </SmallText>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft size={16} /> Previous
                            </Button>
                            <div className="flex items-center gap-1">
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
                                            size="sm"
                                            onClick={() => handlePageChange(pageNum)}
                                            className="w-8 h-8 p-0"
                                        >
                                            {pageNum}
                                        </Button>
                                    );
                                })}
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                Next <ChevronRight size={16} />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export const DataTable = React.memo(DataTableComponent) as unknown as <T extends Record<string, any>>(props: DataTableProps<T>) => React.ReactNode;

"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Pagination } from "../molecules/Pagination";

/**
 * DataTable Component - Information Dense
 * 
 * Design Principles:
 * - 4px base usage: cell padding strictly px-3 (12px) py-2 (8px)
 * - Headers: M3 Label Large / Surface Variant
 * - Typography: M3 Body Medium
 * - Elevation: Shadow 1 (M3 Standard)
 * */

export interface Column<T = any> {
    key: string;
    label: string;
    align?: "left" | "center" | "right";
    width?: string;
    render?: (value: any, item: T) => React.ReactNode;
    isNumeric?: boolean;
    isCurrency?: boolean;
    sortable?: boolean;
}

export interface DataTableProps<T = any> {
    columns: Column<T>[];
    data: T[];
    className?: string;
    keyField?: string;
    onRowClick?: (row: T) => void;
    loading?: boolean;
    error?: string;
    emptyMessage?: string;
    pageSize?: number;
    density?: "compact" | "normal";
    // Pagination
    page?: number;
    totalItems?: number;
    onPageChange?: (page: number) => void;
    onPageSizeChange?: (size: number) => void;
    // Sorting
    sortKey?: string;
    sortDirection?: "asc" | "desc";
    onSort?: (key: string) => void;
    // Selection
    selectable?: boolean;
    selectedRows?: string[];
    onSelectionChange?: (selected: string[]) => void;
    // Export
    exportable?: boolean;
    onExport?: () => void;
    emptyIcon?: React.ReactNode;
    renderSubRow?: (row: T) => React.ReactNode;
    onRowExpand?: (row: T, isExpanded: boolean) => void;
    no_subrow_padding?: boolean;
}

export const DataTable = <T extends Record<string, any>>({
    columns,
    data,
    className,
    keyField = "id",
    onRowClick,
    loading = false,
    emptyMessage = "No records found",
    page,
    totalItems,
    pageSize,
    onPageChange,
    onPageSizeChange,
}: DataTableProps<T>) => {

    if (loading) {
        return (
            <div className="p-8 text-center bg-surface-variant/20 rounded-lg">
                <span className="m3-body-medium text-secondary italic">Loading data...</span>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="p-8 text-center bg-surface-variant/20 rounded-lg">
                <span className="m3-body-medium text-secondary italic">{emptyMessage}</span>
            </div>
        );
    }

    const totalPages = totalItems && pageSize ? Math.ceil(totalItems / pageSize) : 0;

    return (
        <div className={cn("tahoe-glass-card overflow-hidden flex flex-col transition-all duration-300", className)}>
            <div className="overflow-x-auto overflow-y-auto max-h-[70vh] custom-scrollbar flex-1">
                <table className="w-full border-collapse text-left table-standard table-fixed">
                    {/* Header - Fixed Height 48px */}
                    <thead className="sticky top-0 z-20">
                        <tr className="bg-surface-sunken/80 backdrop-blur-md">
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    className={cn(
                                        "h-12 px-4 whitespace-nowrap transition-colors border-none",
                                        "m3-label-large uppercase tracking-widest text-text-tertiary opacity-70 font-semibold",
                                        "bg-transparent", // Background comes from <tr> for blur
                                        column.align === 'center' && 'text-center',
                                        column.align === 'right' && 'text-right'
                                    )}
                                    style={{ width: column.width }}
                                >
                                    {column.label}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    {/* Body - Alternating Rows */}
                    <tbody>
                        {data.map((row, rowIndex) => (
                            <TableRow
                                key={row[keyField] || rowIndex}
                                row={row}
                                rowIndex={rowIndex}
                                columns={columns}
                                onRowClick={onRowClick}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// Memoized Row for performance
const TableRow = React.memo(({ row, rowIndex, columns, onRowClick }: any) => {
    return (
        <tr
            onClick={() => onRowClick && onRowClick(row)}
            className={cn(
                "transition-all duration-200 group relative",
                onRowClick ? "cursor-pointer" : "",
                "hover:shadow-md hover:z-10 hover:bg-surface-elevated/50"
            )}
        >
            {columns.map((column: any) => (
                <td
                    key={`${column.key}-${rowIndex}`}
                    className={cn(
                        "h-[52px] px-4 m3-body-medium text-primary transition-colors truncate",
                        column.align === 'center' && 'text-center',
                        column.align === 'right' && 'text-right'
                    )}
                    style={{ width: column.width }}
                >
                    {column.render
                        ? column.render(row[column.key], row)
                        : (row[column.key] !== null && row[column.key] !== undefined ? row[column.key] : "-")
                    }
                </td>
            ))}
        </tr>
    );
});

TableRow.displayName = "TableRow";

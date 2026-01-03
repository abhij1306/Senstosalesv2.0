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
        <div className={cn("bg-surface rounded-xl overflow-hidden shadow-1 flex flex-col", className)}>
            <div className="overflow-x-auto overflow-y-auto max-h-[70vh] custom-scrollbar flex-1">
                <table className="w-full border-collapse text-left">
                    {/* Header - Glassmorphic Blue (Solid for readability) */}
                    <thead className="sticky top-0 z-20 shadow-sm bg-primary-container text-on-primary-container backdrop-blur-md">
                        <tr className="bg-primary-container border-none">
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    className={cn(
                                        // Standard M3 Header height: 44px (h-11)
                                        "h-11 px-4 whitespace-nowrap",
                                        "m3-label-large text-on-primary-container/90 contrast-more:text-on-primary-container",
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

                    {/* Body - M3 Body Medium */}
                    <tbody className="">
                        {data.map((row, rowIndex) => (
                            <tr
                                key={row[keyField] || rowIndex}
                                onClick={() => onRowClick && onRowClick(row)}
                                className={cn(
                                    "transition-all duration-300 relative group",
                                    "hover:z-10 hover:shadow-3 hover:scale-[1.002] hover:bg-surface-elevated/80",
                                    onRowClick ? "cursor-pointer" : ""
                                )}
                            >
                                {columns.map((column) => (
                                    <td
                                        key={`${column.key}-${rowIndex}`}
                                        className={cn(
                                            // Standard M3 Row height: 52px (h-[52px]) -> Reduced to h-10 (40px)
                                            "h-10 px-4",
                                            "m3-body-medium text-primary",
                                            column.align === 'center' && 'text-center',
                                            column.align === 'right' && 'text-right'
                                        )}
                                    >
                                        {column.render
                                            ? column.render(row[column.key], row)
                                            : (row[column.key] !== null && row[column.key] !== undefined ? row[column.key] : "-")
                                        }
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>


        </div>
    );
};

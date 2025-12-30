"use client";

import React from "react";
import { H1, SmallText } from "../atoms/Typography";
import { SummaryCards, type SummaryCardProps } from "../organisms/SummaryCards";
import { DataTable, type Column } from "../organisms/DataTable";
import { cn } from "@/lib/utils";

/**
 * ListPageTemplate - Atomic Design System v1.0
 * Standard layout for list pages (PO, DC, Invoice, SRV)
 * Layout: Heading → Toolbar → Summary Cards (optional) → DataTable
 */
export interface ListPageTemplateProps<T = any> {
    // Header
    title: string;
    subtitle?: string;
    toolbar?: React.ReactNode;
    // Summary Row (KPI Cards)
    summaryCards?: SummaryCardProps[];
    // Table
    columns: Column<T>[];
    data: T[];
    keyField?: string;
    page?: number;
    pageSize?: number;
    totalItems?: number;
    onPageChange?: (page: number) => void;
    sortKey?: string;
    sortDirection?: "asc" | "desc";
    onSort?: (key: string) => void;
    selectable?: boolean;
    selectedRows?: string[];
    onSelectionChange?: (selected: string[]) => void;
    exportable?: boolean;
    onExport?: () => void;
    loading?: boolean;
    error?: string;
    emptyMessage?: string;
    density?: "compact" | "normal"; // Pass through to DataTable
    // Customization
    no_borders?: boolean;
    table_surface_solid?: boolean;
    renderSubRow?: (row: T) => React.ReactNode;
    onRowExpand?: (row: T, isExpanded: boolean) => void;
    className?: string;
    children?: React.ReactNode;
}

import { DocumentTemplate } from "./DocumentTemplate";

export function ListPageTemplate<T extends Record<string, any>>({
    title,
    subtitle,
    toolbar,
    summaryCards,
    columns,
    data,
    keyField = "id",
    page,
    pageSize,
    totalItems,
    onPageChange,
    sortKey,
    sortDirection,
    onSort,
    selectable,
    selectedRows,
    onSelectionChange,
    exportable,
    onExport,
    loading,
    error,
    emptyMessage,
    density = "normal",
    className,
    children,
    no_borders,
    table_surface_solid,
    renderSubRow,
    onRowExpand,
}: ListPageTemplateProps<T>) {
    return (
        <DocumentTemplate
            title={title}
            description={subtitle}
            actions={toolbar}
            className={className}
        >
            <div className="space-y-6">
                {/* Summary Cards */}
                {summaryCards && summaryCards.length > 0 && (
                    <SummaryCards cards={summaryCards} loading={loading} />
                )}

                <div className="pb-6 min-h-[500px]">
                    {children ? (
                        <div className="min-h-[400px]">{children}</div>
                    ) : (
                        <DataTable
                            columns={columns}
                            data={data}
                            keyField={keyField}
                            page={page}
                            pageSize={pageSize}
                            totalItems={totalItems}
                            onPageChange={onPageChange}
                            sortKey={sortKey}
                            sortDirection={sortDirection}
                            onSort={onSort}
                            selectable={selectable}
                            selectedRows={selectedRows}
                            onSelectionChange={onSelectionChange}
                            exportable={exportable}
                            onExport={onExport}
                            loading={loading}
                            error={error}
                            emptyMessage={emptyMessage}
                            emptyIcon={null}
                            no_borders={no_borders}
                            table_surface_solid={table_surface_solid}
                            renderSubRow={renderSubRow}
                            onRowExpand={onRowExpand}
                            density={density}
                        />
                    )}
                </div>
            </div>
        </DocumentTemplate>
    );
}

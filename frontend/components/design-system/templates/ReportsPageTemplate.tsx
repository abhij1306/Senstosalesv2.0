"use client";

import React from "react";
import { H1, Body, SmallText } from "../atoms/Typography";
import { SummaryCards, SummaryCardProps } from "../organisms/SummaryCards";
import { ReportsToolbar, ReportsToolbarProps } from "@/components/reports/organisms/ReportsToolbar";
import { DataTable, Column } from "../organisms/DataTable";
import { cn } from "@/lib/utils";

/**
 * ReportsPageTemplate - Atomic Design System v1.0
 * Standard layout for reports page
 * Layout: Heading → Reports Toolbar → KPI Cards → Charts → Data Table
 */
export interface ReportsPageTemplateProps<T = any> {
    // Page header
    title: string;
    subtitle?: string;
    // Toolbar (Optional as it might be in header)
    toolbar?: Partial<Omit<ReportsToolbarProps, "className">>;
    // KPI Summary cards
    kpiCards?: SummaryCardProps[];
    // Charts section
    charts?: React.ReactNode;
    // Data table
    tableTitle?: React.ReactNode;
    columns?: Column<T>[];
    data?: T[];
    keyField?: string;
    // Table features
    page?: number;
    pageSize?: number;
    totalItems?: number;
    onPageChange?: (page: number) => void;
    exportable?: boolean;
    onExport?: () => void;
    // States
    loading?: boolean;
    error?: string;
    emptyMessage?: string;
    className?: string;
}

import { DocumentTemplate } from "./DocumentTemplate";

export const ReportsPageTemplate = React.memo(
    <T extends Record<string, any>>({
        title,
        subtitle,
        kpiCards,
        charts,
        tableTitle,
        columns,
        data,
        keyField = "id",
        page,
        pageSize,
        totalItems,
        onPageChange,
        loading,
        error,
        emptyMessage,
        className,
    }: ReportsPageTemplateProps<T>) => {
        return (
            <DocumentTemplate
                title={title}
                description={subtitle}
                className={className}
            >
                <div className="space-y-6">
                    {/* KPI Summary Cards */}
                    {((kpiCards && kpiCards.length > 0) || loading) && (
                        <SummaryCards cards={kpiCards || []} loading={loading} />
                    )}

                    {/* Main Content: Charts or Table */}
                    <div className="space-y-4 w-full">
                        {charts && (
                            <div className="bg-app-surface/30 backdrop-blur-sm border border-app-border/30 rounded-3xl p-6 w-full overflow-hidden shadow-sm">
                                <div className="mb-6 shadow-none pb-2 border-b border-app-border/20">
                                    <h3 className="font-black text-app-fg uppercase tracking-[0.2em] text-[11px]">
                                        Analytics Overview
                                    </h3>
                                </div>
                                {charts}
                            </div>
                        )}

                        {columns && data && (
                            <div className="space-y-4 w-full">
                                {tableTitle && (
                                    <div className="flex items-center justify-between px-1 mb-2">
                                        <h2 className="font-black text-app-fg uppercase tracking-[0.2em] text-[11px]">
                                            {tableTitle}
                                        </h2>
                                    </div>
                                )}
                                <div className="surface-card p-0 overflow-hidden w-full">
                                    <div className="w-full overflow-x-auto">
                                        <DataTable
                                            columns={columns}
                                            data={data}
                                            keyField={keyField}
                                            page={page}
                                            pageSize={pageSize}
                                            totalItems={totalItems}
                                            onPageChange={onPageChange}
                                            loading={loading}
                                            error={error}
                                            emptyMessage={emptyMessage}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </DocumentTemplate>
        );
    }
);

ReportsPageTemplate.displayName = "ReportsPageTemplate";

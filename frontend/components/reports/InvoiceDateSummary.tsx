"use client";

import React, { useState } from "react";
import { Receipt, FileText, TrendingUp, Download } from "lucide-react";
import { Card, H3, Label, Body, Badge, Stack, Flex, SmallText, Accounting, DownloadButton } from "@/components/design-system";
import PaginationControls from "@/components/design-system/molecules/PaginationControls";
import { API_BASE_URL } from "@/lib/api";

interface InvoiceRow {
    invoice_number: string;
    invoice_date: string;
    linked_dc_numbers: string;
    invoice_value: number;
}

interface InvoiceDateSummaryProps {
    data: {
        rows: InvoiceRow[];
        totals: {
            total_invoices: number;
            total_value: number;
            avg_value: number;
        };
        period: {
            start: string;
            end: string;
        };
    };
}

export default function InvoiceDateSummary({ data }: InvoiceDateSummaryProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    if (!data || !data.rows || data.rows.length === 0) {
        return (
            <Card className="p-12 text-center bg-app-surface/50 border-app-border/30">
                <Stack align="center" gap={3}>
                    <div className="w-12 h-12 rounded-full bg-app-overlay/5 flex items-center justify-center text-app-fg-muted">
                        <Receipt className="w-6 h-6" />
                    </div>
                    <p className="text-app-fg-muted font-black text-xs uppercase tracking-[0.2em]">Zero Billing Trace for Period</p>
                </Stack>
            </Card>
        );
    }

    const totalPages = Math.ceil(data.rows.length / ITEMS_PER_PAGE);
    const paginatedRows = data.rows.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    return (
        <Card className="p-0 overflow-hidden bg-app-surface border border-app-border shadow-sm">
            <div className="p-5 border-b border-app-border bg-app-overlay/5 flex justify-between items-center">
                <Stack gap={1}>
                    <H3 className="text-sm">Invoice Registry Summary</H3>
                    <SmallText className="opacity-60">{data.period.start} to {data.period.end}</SmallText>
                </Stack>
                <DownloadButton
                    url={`${API_BASE_URL}/api/reports/register/invoice?export=true&start_date=${data.period.start}&end_date=${data.period.end}`}
                    filename={`Invoice_Summary_${data.period.start}_to_${data.period.end}.xlsx`}
                    label="Export Registry"
                />
            </div>

            {/* Metrics Overview */}
            <div className="grid grid-cols-3 divide-x divide-app-border border-b border-app-border/50">
                <div className="p-5 hover:bg-app-overlay/5 transition-colors group">
                    <Label className="m-0 text-[10px] tracking-widest opacity-50 uppercase">Issued Invoices</Label>
                    <p className="text-2xl font-black text-app-fg mt-1 group-hover:text-app-accent transition-colors">{data.totals.total_invoices}</p>
                </div>
                <div className="p-5 hover:bg-app-overlay/5 transition-colors group">
                    <Label className="m-0 text-[10px] tracking-widest opacity-50 uppercase">Total Revenue</Label>
                    <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-2xl font-black text-app-fg group-hover:text-app-accent transition-colors">
                            <Accounting>{data.totals.total_value}</Accounting>
                        </span>
                    </div>
                </div>
                <div className="p-5 hover:bg-app-overlay/5 transition-colors group">
                    <Label className="m-0 text-[10px] tracking-widest opacity-50 uppercase">Mean Invoice Value</Label>
                    <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-2xl font-black text-app-fg">
                            <Accounting>{data.totals.avg_value}</Accounting>
                        </span>
                    </div>
                </div>
            </div>

            {/* Registry Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-app-overlay/10 border-b border-app-border/50">
                        <tr>
                            <th className="px-6 py-4 text-left"><Label className="m-0 text-[9px] tracking-widest">INV IDENTIFIER</Label></th>
                            <th className="px-6 py-4 text-left"><Label className="m-0 text-[9px] tracking-widest">DATE</Label></th>
                            <th className="px-6 py-4 text-left"><Label className="m-0 text-[9px] tracking-widest">REFERENCED DC'S</Label></th>
                            <th className="px-6 py-4 text-right"><Label className="m-0 text-[9px] tracking-widest">NET VALUE</Label></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-app-border/30">
                        {paginatedRows.map((row, idx) => (
                            <tr key={idx} className="hover:bg-app-overlay/5 transition-colors group">
                                <td className="px-6 py-4">
                                    <span className="text-xs font-black text-app-fg group-hover:text-app-accent transition-colors">#{row.invoice_number}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <SmallText className="font-bold opacity-60 uppercase tracking-tighter">{row.invoice_date}</SmallText>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-wrap gap-1">
                                        {row.linked_dc_numbers.split(",").map((dc, i) => (
                                            <Badge key={i} variant="default" className="text-[9px] bg-app-overlay/10 border-app-border/10 font-mono">
                                                {dc.trim()}
                                            </Badge>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <Accounting className="text-xs font-bold">{row.invoice_value}</Accounting>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="p-4 bg-app-overlay/5 border-t border-app-border/50">
                <PaginationControls
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    itemName="INVOICE RECORDS"
                />
            </div>
        </Card>
    );
}

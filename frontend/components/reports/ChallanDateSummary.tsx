"use client";

import React, { useState } from "react";
import { Truck, FileText, AlertTriangle, Download } from "lucide-react";
import { Card, H3, Label, Body, Badge, Stack, Flex, SmallText, Accounting, DownloadButton } from "@/components/design-system";
import PaginationControls from "@/components/design-system/molecules/PaginationControls";
import { API_BASE_URL } from "@/lib/api";

interface ChallanRow {
    dc_number: string;
    dc_date: string;
    po_number: string;
    dispatched_qty: number;
    invoice_status: string;
}

interface ChallanDateSummaryProps {
    data: {
        rows: ChallanRow[];
        totals: {
            total_challans: number;
            total_dispatched: number;
            uninvoiced_count: number;
        };
        period: {
            start: string;
            end: string;
        };
    };
}

export default function ChallanDateSummary({ data }: ChallanDateSummaryProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    if (!data || !data.rows || data.rows.length === 0) {
        return (
            <Card className="p-12 text-center bg-app-surface/50 border-app-border/30">
                <Stack align="center" gap={3}>
                    <div className="w-12 h-12 rounded-full bg-app-overlay/5 flex items-center justify-center text-app-fg-muted">
                        <FileText className="w-6 h-6" />
                    </div>
                    <p className="text-app-fg-muted font-black text-xs uppercase tracking-[0.2em]">Zero Trace in Selected Interval</p>
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
                    <H3 className="text-sm">Challan Summary Ledger</H3>
                    <SmallText className="opacity-60">{data.period.start} to {data.period.end}</SmallText>
                </Stack>
                <DownloadButton
                    url={`${API_BASE_URL}/api/reports/register/dc?export=true&start_date=${data.period.start}&end_date=${data.period.end}`}
                    filename={`Challan_Summary_${data.period.start}_to_${data.period.end}.xlsx`}
                    label="Export Ledger"
                />
            </div>

            {/* Metrics Overview */}
            <div className="grid grid-cols-3 divide-x divide-app-border border-b border-app-border/50">
                <div className="p-5 hover:bg-app-overlay/5 transition-colors group">
                    <Label className="m-0 text-[10px] tracking-widest opacity-50 uppercase">Total Challans</Label>
                    <p className="text-2xl font-black text-app-fg mt-1 group-hover:text-app-accent transition-colors">{data.totals.total_challans}</p>
                </div>
                <div className="p-5 hover:bg-app-overlay/5 transition-colors group">
                    <Label className="m-0 text-[10px] tracking-widest opacity-50 uppercase">Dispatched Volume</Label>
                    <div className="flex items-baseline gap-1 mt-1">
                        <Accounting className="text-2xl font-black text-app-fg group-hover:text-app-accent transition-colors">
                            {data.totals.total_dispatched}
                        </Accounting>
                        <span className="text-[10px] font-bold text-app-fg-muted uppercase">Units</span>
                    </div>
                </div>
                <div className="p-5 hover:bg-app-overlay/5 transition-colors group">
                    <Label className="m-0 text-[10px] tracking-widest text-app-status-warning uppercase">Uninvoiced Leakage</Label>
                    <p className="text-2xl font-black text-app-status-warning mt-1">{data.totals.uninvoiced_count}</p>
                </div>
            </div>

            {/* Ledger Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-app-overlay/10 border-b border-app-border/50">
                        <tr>
                            <th className="px-6 py-4 text-left"><Label className="m-0 text-[9px] tracking-widest">DC IDENTIFIER</Label></th>
                            <th className="px-6 py-4 text-left"><Label className="m-0 text-[9px] tracking-widest">TIMESTAMPS</Label></th>
                            <th className="px-6 py-4 text-left"><Label className="m-0 text-[9px] tracking-widest">LINKED PO</Label></th>
                            <th className="px-6 py-4 text-right"><Label className="m-0 text-[9px] tracking-widest">VOLUME</Label></th>
                            <th className="px-6 py-4 text-left"><Label className="m-0 text-[9px] tracking-widest">BILLING STATUS</Label></th>
                            <th className="px-6 py-4 text-center"><Label className="m-0 text-[9px] tracking-widest">ACTIONS</Label></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-app-border/30">
                        {paginatedRows.map((row, idx) => (
                            <tr key={idx} className="hover:bg-app-overlay/5 transition-colors group">
                                <td className="px-6 py-4">
                                    <span className="text-xs font-black text-app-fg group-hover:text-app-accent transition-colors">#{row.dc_number}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <SmallText className="font-bold opacity-60 uppercase tracking-tighter">{row.dc_date}</SmallText>
                                </td>
                                <td className="px-6 py-4">
                                    <Badge variant="default" className="text-[10px] bg-app-overlay/10 border-app-border/20 font-mono">PO {row.po_number}</Badge>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <Accounting className="text-xs font-bold">{row.dispatched_qty}</Accounting>
                                </td>
                                <td className="px-6 py-4">
                                    <Badge variant={row.invoice_status === "Invoiced" ? "success" : "warning"} className="uppercase tracking-widest text-[9px]">
                                        {row.invoice_status}
                                    </Badge>
                                </td>
                                <td className="px-6 py-4">
                                    <Flex justify="center" gap={2}>
                                        <DownloadButton
                                            url={`${API_BASE_URL}/api/dc/${row.dc_number}/download`}
                                            filename={`DC_${row.dc_number}.xlsx`}
                                            label="DC"
                                            variant="ghost"
                                        />
                                        <DownloadButton
                                            url={`${API_BASE_URL}/api/reports/guarantee-certificate?dc_number=${row.dc_number}`}
                                            filename={`GC_${row.dc_number}.xlsx`}
                                            label="GC"
                                            variant="outline"
                                        />
                                    </Flex>
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
                    itemName="DC RECORDS"
                />
            </div>
        </Card>
    );
}

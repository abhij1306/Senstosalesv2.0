"use client";

import React, { useState } from "react";
import { ShoppingCart, FileText, Activity, Download } from "lucide-react";
import { Card, H3, Label, Body, Badge, Stack, Flex, SmallText, Accounting, DownloadButton } from "@/components/design-system";
import PaginationControls from "@/components/design-system/molecules/PaginationControls";
import { API_BASE_URL } from "@/lib/api";

interface PORow {
    po_number: string;
    po_date: string;
    total_ordered: number;
    total_dispatched: number;
    pending_qty: number;
    status: string;
}

interface PODateSummaryProps {
    data: {
        rows: PORow[];
        totals: {
            total_pos: number;
            total_ordered: number;
            total_dispatched: number;
            total_pending: number;
        };
        period: {
            start: string;
            end: string;
        };
    };
}

export default function PODateSummary({ data }: PODateSummaryProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    if (!data || !data.rows || data.rows.length === 0) {
        return (
            <Card className="p-12 text-center bg-app-surface/50 border-app-border/30">
                <Stack align="center" gap={3}>
                    <div className="w-12 h-12 rounded-full bg-app-overlay/5 flex items-center justify-center text-app-fg-muted">
                        <ShoppingCart className="w-6 h-6" />
                    </div>
                    <p className="text-app-fg-muted font-black text-xs uppercase tracking-[0.2em]">Zero Purchase Activity for Period</p>
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
                    <H3 className="text-sm">Purchase Order Summary Register</H3>
                    <SmallText className="opacity-60">{data.period.start} to {data.period.end}</SmallText>
                </Stack>
                <DownloadButton
                    url={`${API_BASE_URL}/api/reports/register/po?export=true&start_date=${data.period.start}&end_date=${data.period.end}`}
                    filename={`PO_Summary_${data.period.start}_to_${data.period.end}.xlsx`}
                    label="Export Register"
                />
            </div>

            {/* Metrics Overview */}
            <div className="grid grid-cols-4 divide-x divide-app-border border-b border-app-border/50">
                <div className="p-5 hover:bg-app-overlay/5 transition-colors group">
                    <Label className="m-0 text-[10px] tracking-widest opacity-50 uppercase">Tracked POs</Label>
                    <p className="text-2xl font-black text-app-fg mt-1 group-hover:text-app-accent transition-colors">{data.totals.total_pos}</p>
                </div>
                <div className="p-5 hover:bg-app-overlay/5 transition-colors group">
                    <Label className="m-0 text-[10px] tracking-widest opacity-50 uppercase">Total Demand</Label>
                    <div className="flex items-baseline gap-1 mt-1">
                        <Accounting className="text-2xl font-black text-app-fg group-hover:text-app-accent transition-colors">
                            {data.totals.total_ordered}
                        </Accounting>
                    </div>
                </div>
                <div className="p-5 hover:bg-app-overlay/5 transition-colors group">
                    <Label className="m-0 text-[10px] tracking-widest opacity-50 uppercase">Dispatched Volume</Label>
                    <div className="flex items-baseline gap-1 mt-1">
                        <Accounting className="text-2xl font-black text-app-fg group-hover:text-app-accent transition-colors">
                            {data.totals.total_dispatched}
                        </Accounting>
                    </div>
                </div>
                <div className="p-5 hover:bg-app-overlay/5 transition-colors group">
                    <Label className="m-0 text-[10px] tracking-widest text-app-status-warning uppercase">Pipeline Deficit</Label>
                    <div className="flex items-baseline gap-1 mt-1">
                        <Accounting variant="warning" className="text-2xl font-black">
                            {data.totals.total_pending}
                        </Accounting>
                    </div>
                </div>
            </div>

            {/* Register Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-app-overlay/10 border-b border-app-border/50">
                        <tr>
                            <th className="px-6 py-4 text-left"><Label className="m-0 text-[9px] tracking-widest">PO IDENTIFIER</Label></th>
                            <th className="px-6 py-4 text-left"><Label className="m-0 text-[9px] tracking-widest">ISSUANCE DATE</Label></th>
                            <th className="px-6 py-4 text-right"><Label className="m-0 text-[9px] tracking-widest">ORD QTY</Label></th>
                            <th className="px-6 py-4 text-right"><Label className="m-0 text-[9px] tracking-widest">DISP QTY</Label></th>
                            <th className="px-6 py-4 text-right"><Label className="m-0 text-[9px] tracking-widest">DEFICIT</Label></th>
                            <th className="px-6 py-4 text-left"><Label className="m-0 text-[9px] tracking-widest">LIFECYCLE STATUS</Label></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-app-border/30">
                        {paginatedRows.map((row, idx) => (
                            <tr key={idx} className="hover:bg-app-overlay/5 transition-colors group">
                                <td className="px-6 py-4">
                                    <span className="text-xs font-black text-app-fg group-hover:text-app-accent transition-colors">#{row.po_number}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <SmallText className="font-bold opacity-60 uppercase tracking-tighter">{row.po_date}</SmallText>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <Accounting className="text-xs font-bold">{row.total_ordered}</Accounting>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <Accounting className="text-xs font-bold">{row.total_dispatched}</Accounting>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <Accounting variant={row.pending_qty > 0 ? "warning" : "default"} className="text-xs font-bold">
                                        {row.pending_qty}
                                    </Accounting>
                                </td>
                                <td className="px-6 py-4">
                                    <Badge
                                        variant={row.status === "Completed" ? "success" : row.status === "In Progress" ? "warning" : "default"}
                                        className="uppercase tracking-widest text-[9px]"
                                    >
                                        {row.status}
                                    </Badge>
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
                    itemName="PO RECORDS"
                />
            </div>
        </Card>
    );
}

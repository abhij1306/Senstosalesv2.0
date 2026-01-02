"use client";

import React from "react";
import { Sparkles, TrendingUp, TrendingDown, MinusCircle } from "lucide-react";
import { Card, H3, Title3, Label, Body, Badge, Stack, Flex, SmallText, Accounting, Box } from "@/components/design-system";
import { cn } from "@/lib/utils";

/**
 * PO Fulfillment Efficiency Report Component
 */
interface POEfficiencyData {
    period: string;
    pos: Array<{
        po_number: string;
        supplier_name: string;
        ordered: number;
        dispatched: number;
        fulfillment_pct: number;
    }>;
    insights: {
        best_po: {
            po_number: string | null;
            fulfillment_pct: number;
        };
        worst_po: {
            po_number: string | null;
            fulfillment_pct: number;
        };
        zero_fulfillment_count: number;
        zero_fulfillment_pos: string[];
    };
}

interface POEfficiencyReportProps {
    data: POEfficiencyData;
    aiSummary?: string;
}

export default function POEfficiencyReport({
    data,
    aiSummary,
}: POEfficiencyReportProps) {
    return (
        <Stack gap={6}>
            {/* Header Section */}
            <Flex justify="between" align="end" className="px-1">
                <Stack gap={1}>
                    <Title3>PO Fulfillment Efficiency</Title3>
                    <Label className="m-0 opacity-60">Performance audit per purchase order</Label>
                </Stack>
                <Badge variant="default" className="bg-app-overlay/5 border-app-border/30 text-[11px] font-black uppercase tracking-widest px-4 py-1.5 h-auto">
                    Analysis Period: {data.period}
                </Badge>
            </Flex>

            {/* Performance Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-5 bg-app-status-success/5 border border-app-status-success/20">
                    <Flex align="center" gap={2} className="mb-3">
                        <TrendingUp className="w-3.5 h-3.5 text-app-status-success" />
                        <Label className="m-0 text-app-status-success uppercase text-[9px]">Peak Performer</Label>
                    </Flex>
                    <Stack gap={1}>
                        <span className="text-2xl font-black text-app-fg tracking-tight">
                            #{data.insights.best_po.po_number || "N/A"}
                        </span>
                        <SmallText className="text-app-status-success font-bold">
                            {data.insights.best_po.fulfillment_pct}% FULFILLED
                        </SmallText>
                    </Stack>
                </Card>

                <Card className="p-5 bg-app-status-error/5 border border-app-status-error/20">
                    <Flex align="center" gap={2} className="mb-3">
                        <TrendingDown className="w-3.5 h-3.5 text-app-status-error" />
                        <Label className="m-0 text-app-status-error uppercase text-[9px]">Critical Lag</Label>
                    </Flex>
                    <Stack gap={1}>
                        <span className="text-2xl font-black text-app-fg tracking-tight">
                            #{data.insights.worst_po.po_number || "N/A"}
                        </span>
                        <SmallText className="text-app-status-error font-bold">
                            {data.insights.worst_po.fulfillment_pct}% FULFILLED
                        </SmallText>
                    </Stack>
                </Card>

                <Card className="p-5 bg-app-overlay/10 border border-app-border/30">
                    <Flex align="center" gap={2} className="mb-3">
                        <MinusCircle className="w-3.5 h-3.5 text-app-fg-muted" />
                        <Label className="m-0 text-app-fg-muted uppercase text-[9px]">Zero Activity</Label>
                    </Flex>
                    <Stack gap={1}>
                        <span className="text-2xl font-black text-app-fg tracking-tight">
                            {data.insights.zero_fulfillment_count}
                        </span>
                        <SmallText className="text-app-fg-muted font-bold">
                            NULL DISPATCH ORDERS
                        </SmallText>
                    </Stack>
                </Card>
            </div>

            {/* AI Summary Block */}
            {aiSummary && (
                <Card className="p-4 bg-app-accent/5 border border-app-accent/20">
                    <Flex align="start" gap={3}>
                        <div className="w-8 h-8 rounded-lg bg-app-accent/10 flex items-center justify-center text-app-accent">
                            <Sparkles className="w-4 h-4" />
                        </div>
                        <Stack gap={1}>
                            <Label className="m-0 text-app-accent">Operational Intelligence</Label>
                            <p className="text-[12px] text-app-fg font-medium italic opacity-90">
                                {aiSummary}
                            </p>
                        </Stack>
                    </Flex>
                </Card>
            )}

            {/* Performance Ledger */}
            <Card className="p-0 overflow-hidden bg-app-surface border border-app-border shadow-sm">
                <div className="p-4 border-b border-app-border bg-app-overlay/5">
                    <H3 className="text-sm">Granular Efficiency Ledger</H3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-app-overlay/10 border-b border-app-border/50">
                            <tr>
                                <th className="px-6 py-4 text-left">
                                    <Label className="m-0 text-[10px] tracking-[0.2em]">IDENTIFIER</Label>
                                </th>
                                <th className="px-6 py-4 text-right">
                                    <Label className="m-0 text-[10px] tracking-[0.2em]">ORD. QTY</Label>
                                </th>
                                <th className="px-6 py-4 text-right">
                                    <Label className="m-0 text-[10px] tracking-[0.2em]">DISP. QTY</Label>
                                </th>
                                <th className="px-6 py-4 text-right">
                                    <Label className="m-0 text-[10px] tracking-[0.2em]">VARIANCE</Label>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-app-border/30">
                            {data.pos.slice(0, 25).map((po) => (
                                <tr key={po.po_number} className="hover:bg-app-overlay/5 transition-colors group">
                                    <td className="px-6 py-4">
                                        <Stack gap={0.5}>
                                            <span className="text-xs font-black text-app-fg group-hover:text-app-accent transition-colors">#{po.po_number}</span>
                                            <SmallText className="text-[9px] uppercase tracking-tighter opacity-50">{po.supplier_name}</SmallText>
                                        </Stack>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Accounting className="text-xs font-bold">{po.ordered}</Accounting>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Accounting className="text-xs font-bold">{po.dispatched}</Accounting>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Badge
                                            variant={po.fulfillment_pct >= 90 ? "success" : po.fulfillment_pct >= 50 ? "warning" : "error"}
                                            className="font-mono text-[10px] min-w-[3.5rem] justify-center"
                                        >
                                            {po.fulfillment_pct}%
                                        </Badge>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {data.pos.length > 25 && (
                    <div className="px-6 py-4 bg-app-overlay/5 border-t border-app-border/50 flex justify-center">
                        <SmallText className="font-bold opacity-40 uppercase tracking-[0.3em]">
                            Truncated at 25 of {data.pos.length} Recorded Triggers
                        </SmallText>
                    </div>
                )}
            </Card>
        </Stack>
    );
}

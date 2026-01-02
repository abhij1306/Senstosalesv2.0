"use client";

import React from "react";
import { Sparkles, Activity, Clock, ShieldAlert } from "lucide-react";
import { Card, H3, Title3, Label, Body, Badge, Stack, Flex, SmallText, Accounting, Box } from "@/components/design-system";
import { cn } from "@/lib/utils";

/**
 * PO Aging & Risk Report Component
 */
interface POAgingData {
    period: string;
    age_buckets: {
        "0_7_days": {
            po_count: number;
            pending_qty: number;
            percentage: number;
            pos: string[];
        };
        "8_30_days": {
            po_count: number;
            pending_qty: number;
            percentage: number;
            pos: string[];
        };
        "30_plus_days": {
            po_count: number;
            pending_qty: number;
            percentage: number;
            pos: string[];
        };
    };
    total_pending_qty: number;
}

interface POAgingReportProps {
    data: POAgingData;
    aiSummary?: string;
}

export default function POAgingReport({
    data,
    aiSummary,
}: POAgingReportProps) {
    const buckets = [
        {
            key: "0_7_days",
            label: "Current (0-7d)",
            status: "success" as const,
            data: data.age_buckets["0_7_days"],
        },
        {
            key: "8_30_days",
            label: "At Risk (8-30d)",
            status: "warning" as const,
            data: data.age_buckets["8_30_days"],
        },
        {
            key: "30_plus_days",
            label: "Overdue (30d+)",
            status: "error" as const,
            data: data.age_buckets["30_plus_days"],
        },
    ];

    return (
        <Stack gap={6}>
            {/* Header Section */}
            <Flex justify="between" align="end" className="px-1">
                <Stack gap={1}>
                    <Title3>PO Aging & Risk Analysis</Title3>
                    <Label className="m-0 opacity-60">Distribution across delivery timeline</Label>
                </Stack>
                <Badge variant="default" className="bg-app-overlay/5 border-app-border/30 text-[11px] font-black uppercase tracking-widest px-4 py-1.5 h-auto">
                    Total Pending: {data.total_pending_qty.toLocaleString()} Units
                </Badge>
            </Flex>

            {/* AI Summary - Premium Insight Block */}
            {aiSummary && (
                <Card className="p-5 bg-app-accent/5 border border-app-accent/20 overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Sparkles className="w-12 h-12 text-app-accent" />
                    </div>
                    <Flex align="start" gap={4}>
                        <div className="w-10 h-10 rounded-2xl bg-app-accent/10 flex items-center justify-center text-app-accent shadow-sm ring-1 ring-app-accent/20">
                            <Activity className="w-5 h-5" />
                        </div>
                        <Stack gap={1.5} className="flex-1 pr-12">
                            <Label className="m-0 text-app-accent">Predictive Insight</Label>
                            <p className="text-[13px] text-app-fg font-medium leading-relaxed italic opacity-90">
                                "{aiSummary}"
                            </p>
                        </Stack>
                    </Flex>
                </Card>
            )}

            {/* Grid Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {buckets.map((bucket) => (
                    <Card
                        key={bucket.key}
                        className={cn(
                            "p-5 bg-app-surface/50 border border-app-border/30 relative transition-all hover:shadow-app-spotlight",
                            bucket.status === "error" && "border-app-status-error/20 bg-app-status-error/5"
                        )}
                    >
                        <Flex justify="between" align="center" className="mb-4">
                            <Label className={cn(
                                "m-0",
                                bucket.status === "success" && "text-app-status-success",
                                bucket.status === "warning" && "text-app-status-warning",
                                bucket.status === "error" && "text-app-status-error"
                            )}>
                                {bucket.label}
                            </Label>
                            <div className={cn(
                                "w-2 h-2 rounded-full",
                                bucket.status === "success" && "bg-app-status-success animate-pulse",
                                bucket.status === "warning" && "bg-app-status-warning",
                                bucket.status === "error" && "bg-app-status-error shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                            )} />
                        </Flex>
                        <Stack gap={1}>
                            <span className="text-3xl font-black text-app-fg tracking-tighter">
                                {bucket.data.pending_qty.toLocaleString()}
                            </span>
                            <Flex align="center" gap={1.5}>
                                <Badge variant="default" className="text-[9px] px-1.5 py-0 bg-app-overlay/10">
                                    {bucket.data.po_count} POs
                                </Badge>
                                <span className="text-[10px] font-bold text-app-fg-muted uppercase tracking-widest">
                                    • {bucket.data.percentage}% Share
                                </span>
                            </Flex>
                        </Stack>
                    </Card>
                ))}
            </div>

            {/* Detailed Breakdown Table/List */}
            <Card className="p-0 overflow-hidden bg-app-surface border border-app-border shadow-sm">
                <div className="p-4 border-b border-app-border bg-app-overlay/5">
                    <H3 className="text-sm">Granular Risk Distribution</H3>
                </div>
                <div className="divide-y divide-app-border/50">
                    {buckets.map((bucket) => (
                        <div key={bucket.key} className="p-4 hover:bg-app-overlay/5 transition-colors">
                            <Flex justify="between" align="center" className="mb-4">
                                <Flex align="center" gap={2}>
                                    <Clock className={cn("w-3.5 h-3.5",
                                        bucket.status === "error" ? "text-app-status-error" : "text-app-fg-muted"
                                    )} />
                                    <span className="font-black text-[11px] uppercase tracking-widest text-app-fg">
                                        {bucket.label}
                                    </span>
                                </Flex>
                                <Badge variant={bucket.status} className="uppercase tracking-widest text-[9px]">
                                    {bucket.data.po_count} TRACKED ORDERS
                                </Badge>
                            </Flex>

                            {bucket.data.pos.length > 0 ? (
                                <Flex gap={2} wrap>
                                    {bucket.data.pos.slice(0, 15).map((po) => (
                                        <Badge
                                            key={po}
                                            variant="default"
                                            className="bg-app-overlay/10 border-app-border/20 text-app-fg hover:bg-app-accent/10 transition-colors cursor-pointer"
                                        >
                                            #{po}
                                        </Badge>
                                    ))}
                                    {bucket.data.pos.length > 15 && (
                                        <span className="text-[10px] font-bold text-app-fg-muted self-center uppercase tracking-widest px-2">
                                            + {bucket.data.pos.length - 15} More
                                        </span>
                                    )}
                                </Flex>
                            ) : (
                                <SmallText className="italic opacity-30 uppercase tracking-[0.2em] px-1">
                                    No pending orders in this cycle.
                                </SmallText>
                            )}
                        </div>
                    ))}
                </div>
            </Card>
        </Stack>
    );
}

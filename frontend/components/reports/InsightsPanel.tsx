"use client";

import React from "react";
import { AlertTriangle, FileText, ArrowRight } from "lucide-react";
import { Card, H3, Label, Body, Badge, Stack, Flex, SmallText } from "@/components/design-system";
import { cn } from "@/lib/utils";

interface PendingItem {
    category: string;
    count: number;
    percentage: number;
    action?: string;
}

interface TopItem {
    name: string;
    units: number;
    trend: number;
}

interface InsightsPanelProps {
    pendingItems: PendingItem[];
    uninvoicedCount: number;
    topItems?: TopItem[];
    onAction?: (action: string, data?: any) => void;
}

export function InsightsPanel({
    pendingItems,
    uninvoicedCount,
    topItems = [],
    onAction,
}: InsightsPanelProps) {
    return (
        <Stack gap={4}>
            {/* Pending Breakdown */}
            <Card className="p-4 bg-app-surface border border-app-border/30">
                <Flex align="center" gap={2} className="mb-4">
                    <AlertTriangle className="w-4 h-4 text-app-status-warning" />
                    <H3 className="text-sm">Pending Breakdown</H3>
                </Flex>
                <Stack gap={4}>
                    {pendingItems.map((item, idx) => (
                        <div key={idx}>
                            <Flex justify="between" className="mb-1.5">
                                <span className="text-[11px] font-bold text-app-fg uppercase tracking-tight">{item.category}</span>
                                <span className="text-[11px] font-bold text-app-fg">{item.count} items</span>
                            </Flex>
                            <div className="h-1.5 w-full bg-app-overlay/10 rounded-full overflow-hidden border border-app-border/10">
                                <div
                                    className={cn(
                                        "h-full rounded-full transition-all duration-500",
                                        item.percentage > 50 ? "bg-app-status-error" : item.percentage > 30 ? "bg-app-status-warning" : "bg-app-status-success"
                                    )}
                                    style={{ width: `${item.percentage}%` }}
                                />
                            </div>
                            {item.action && (
                                <button
                                    onClick={() => onAction?.(item.action!, item)}
                                    className="text-[9px] font-black uppercase tracking-widest text-app-accent hover:text-app-accent/80 mt-2 flex items-center gap-1 transition-colors"
                                >
                                    {item.action}
                                    <ArrowRight className="w-2.5 h-2.5" />
                                </button>
                            )}
                        </div>
                    ))}
                </Stack>
            </Card>

            {/* Uninvoiced Challans - Actionable */}
            {uninvoicedCount > 0 && (
                <Card className="bg-app-status-error/5 border border-app-status-error/20 p-4">
                    <Flex align="start" gap={3} className="mb-4">
                        <div className="w-8 h-8 rounded-lg bg-app-status-error/10 flex items-center justify-center text-app-status-error shrink-0">
                            <FileText className="w-4 h-4" />
                        </div>
                        <Stack gap={1}>
                            <h4 className="font-black text-xs text-app-status-error uppercase tracking-widest leading-tight">
                                {uninvoicedCount} {uninvoicedCount === 1 ? "Challan" : "Challans"} Pending Invoice
                            </h4>
                            <p className="text-[11px] text-app-status-error/80 font-medium italic">
                                Overdue by 14+ days. Revenue at risk.
                            </p>
                        </Stack>
                    </Flex>
                    <Flex gap={2}>
                        <button
                            onClick={() => onAction?.("draft_invoice_all")}
                            className="flex-1 h-9 bg-app-status-error text-white font-black text-[10px] uppercase tracking-widest rounded-lg hover:shadow-lg hover:shadow-app-status-error/20 transition-all active:scale-95 active-glow"
                        >
                            Draft Invoices
                        </button>
                        <button
                            onClick={() => onAction?.("view_details")}
                            className="h-9 px-4 bg-transparent border border-app-status-error/30 text-app-status-error font-black text-[10px] uppercase tracking-widest rounded-lg hover:bg-app-status-error/5 transition-all"
                        >
                            View Details
                        </button>
                    </Flex>
                </Card>
            )}

            {/* Top Selling Items */}
            {topItems && topItems.length > 0 && (
                <Card className="p-4 bg-app-surface border border-app-border/30">
                    <H3 className="text-sm mb-4">Top Performance</H3>
                    <Stack gap={3}>
                        {topItems.slice(0, 3).map((item, idx) => (
                            <Flex key={idx} justify="between" align="center">
                                <Flex align="center" gap={3} className="max-w-[70%]">
                                    <Label className="m-0 text-app-fg-muted font-mono">{idx + 1}.</Label>
                                    <span className="font-bold text-xs text-app-fg truncate" title={item.name}>
                                        {item.name}
                                    </span>
                                </Flex>
                                <Flex align="center" gap={2}>
                                    <span className="font-black text-xs text-app-fg">
                                        {item.units}
                                    </span>
                                    {item.trend !== 0 && (
                                        <Badge
                                            variant={item.trend > 0 ? "success" : "error"}
                                            className="text-[9px] uppercase tracking-tighter px-1 py-0 min-w-[3.5rem] justify-center"
                                        >
                                            {item.trend > 0 ? "↑" : "↓"} {Math.abs(item.trend)}%
                                        </Badge>
                                    )}
                                </Flex>
                            </Flex>
                        ))}
                    </Stack>
                </Card>
            )}
        </Stack>
    );
}

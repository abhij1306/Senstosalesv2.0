"use client";

import React from "react";
import { Sparkles, ArrowRight, Layers, Layout, Target } from "lucide-react";
import { Card, H3, Title3, Label, Body, Badge, Stack, Flex, SmallText, Box } from "@/components/design-system";
import { cn } from "@/lib/utils";

/**
 * PO Dependency Analysis Report Component
 */
interface PODependencyData {
    period: string;
    coverage: {
        no_dc: {
            count: number;
            pos: Array<{ po_number: string; supplier: string }>;
        };
        dc_but_no_invoice: {
            count: number;
            pos: Array<{ po_number: string; supplier: string }>;
        };
        fully_invoiced: {
            count: number;
            pos: Array<{ po_number: string; supplier: string }>;
        };
    };
    total_pos: number;
}

interface PODependencyReportProps {
    data: PODependencyData;
    aiSummary?: string;
}

export default function PODependencyReport({
    data,
    aiSummary,
}: PODependencyReportProps) {
    const categories = [
        {
            key: "no_dc",
            title: "Pending Dispatch",
            description: "Blocked at DC stage",
            status: "error" as const,
            icon: Layers,
            data: data.coverage.no_dc,
        },
        {
            key: "dc_but_no_invoice",
            title: "Pending Billing",
            description: "DC exists, No Invoice",
            status: "warning" as const,
            icon: Target,
            data: data.coverage.dc_but_no_invoice,
        },
        {
            key: "fully_invoiced",
            title: "Lifecycle Complete",
            description: "Fully Invoiced",
            status: "success" as const,
            icon: Layout,
            data: data.coverage.fully_invoiced,
        },
    ];

    return (
        <Stack gap={6}>
            {/* Header */}
            <Flex justify="between" align="end" className="px-1">
                <Stack gap={1}>
                    <Title3>PO Dependency Analysis</Title3>
                    <Label className="m-0 opacity-60">Visibility into operational bottlenecks</Label>
                </Stack>
                <Badge variant="default" className="bg-app-overlay/5 border-app-border/30 text-[11px] font-black uppercase tracking-widest px-4 py-1.5 h-auto">
                    Analyzed: {data.total_pos} Purchase Orders
                </Badge>
            </Flex>

            {/* AI Summary Block */}
            {aiSummary && (
                <Card className="p-4 bg-app-accent/5 border border-app-accent/20">
                    <Flex align="start" gap={3}>
                        <div className="w-8 h-8 rounded-lg bg-app-accent/10 flex items-center justify-center text-app-accent">
                            <Sparkles className="w-4 h-4" />
                        </div>
                        <Stack gap={1}>
                            <Label className="m-0 text-app-accent">Cycle Optimization Insight</Label>
                            <p className="text-[12px] text-app-fg font-medium italic opacity-90">
                                {aiSummary}
                            </p>
                        </Stack>
                    </Flex>
                </Card>
            )}

            {/* Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {categories.map((cat) => (
                    <Card
                        key={cat.key}
                        className={cn(
                            "p-5 bg-app-surface/50 border border-app-border/30 transition-all hover:bg-app-surface",
                            cat.key === "no_dc" && "border-app-status-error/10 bg-app-status-error/5"
                        )}
                    >
                        <Flex justify="between" align="start" className="mb-4">
                            <div className={cn(
                                "p-2.5 rounded-xl bg-app-overlay/5 text-app-fg-muted border border-app-border/10",
                                cat.status === "error" && "text-app-status-error",
                                cat.status === "warning" && "text-app-status-warning",
                                cat.status === "success" && "text-app-status-success"
                            )}>
                                <cat.icon className="w-4 h-4" />
                            </div>
                            <span className={cn(
                                "text-3xl font-black tracking-tighter",
                                cat.status === "error" && "text-app-status-error",
                                cat.status === "warning" && "text-app-status-warning",
                                cat.status === "success" && "text-app-status-success"
                            )}>
                                {cat.data.count}
                            </span>
                        </Flex>
                        <Stack gap={1}>
                            <Label className="m-0 text-app-fg">{cat.title}</Label>
                            <SmallText className="text-[10px] opacity-60">{cat.description}</SmallText>
                        </Stack>
                        <div className="mt-4 h-1.5 bg-app-overlay/10 rounded-full overflow-hidden">
                            <div
                                className={cn(
                                    "h-full transition-all duration-700",
                                    cat.status === "error" && "bg-app-status-error",
                                    cat.status === "warning" && "bg-app-status-warning",
                                    cat.status === "success" && "bg-app-status-success"
                                )}
                                style={{ width: `${(cat.data.count / data.total_pos) * 100}%` }}
                            />
                        </div>
                    </Card>
                ))}
            </div>

            {/* Detailed Lists */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.filter(c => c.key !== "fully_invoiced").map((cat) => (
                    <Card key={cat.key} className="p-0 overflow-hidden bg-app-surface border border-app-border shadow-sm">
                        <div className="p-4 border-b border-app-border bg-app-overlay/5 flex justify-between items-center">
                            <H3 className="text-sm">{cat.title} Bucket</H3>
                            <Badge variant={cat.status} className="uppercase tracking-widest text-[9px] px-2 py-0.5">
                                {cat.data.count} Items
                            </Badge>
                        </div>
                        <div className="p-3 max-h-[300px] overflow-y-auto scrollbar-thin">
                            {cat.data.pos.length > 0 ? (
                                <Stack gap={2}>
                                    {cat.data.pos.slice(0, 15).map((po, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-2.5 bg-app-overlay/5 rounded-xl border border-app-border/10 hover:border-app-accent/20 transition-colors group cursor-pointer">
                                            <Stack gap={1}>
                                                <span className="text-[11px] font-black text-app-fg group-hover:text-app-accent transition-colors">
                                                    PO #{po.po_number}
                                                </span>
                                                <SmallText className="text-[9px] truncate max-w-[180px]">{po.supplier}</SmallText>
                                            </Stack>
                                            <ArrowRight className="w-3 h-3 text-app-fg-muted opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                                        </div>
                                    ))}
                                    {cat.data.pos.length > 15 && (
                                        <p className="text-[10px] font-bold text-app-fg-muted text-center py-2 uppercase tracking-widest">
                                            + {cat.data.pos.length - 15} More Blocked Orders
                                        </p>
                                    )}
                                </Stack>
                            ) : (
                                <SmallText className="italic opacity-30 uppercase tracking-[0.2em] px-2 py-8 text-center w-full">
                                    Zero Blockage in this stage.
                                </SmallText>
                            )}
                        </div>
                    </Card>
                ))}
            </div>
        </Stack>
    );
}

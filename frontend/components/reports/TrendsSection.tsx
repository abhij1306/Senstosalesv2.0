"use client";

import React from "react";
import { ArrowUpRight, TrendingUp } from "lucide-react";
import { Card, H3, Label, Body, Badge, Stack, Flex, Accounting, SmallText } from "@/components/design-system";
import { cn } from "@/lib/utils";

interface TrendItem {
    month: string;
    ordered_value: number;
    invoiced_value: number;
}

interface TrendsSectionProps {
    data: TrendItem[];
    range: string;
}

export function TrendsSection({ data, range }: TrendsSectionProps) {
    if (!data || data.length === 0) return null;

    // Find max value for scaling
    const maxValue = Math.max(
        ...data.map((d) => Math.max(d.ordered_value, d.invoiced_value)),
    );
    const scale = maxValue > 0 ? 100 / maxValue : 1;

    return (
        <div className="space-y-6 mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Main Trend Chart */}
                <Card className="p-6 bg-app-surface border border-app-border shadow-sm">
                    <Flex justify="between" align="center" className="mb-8">
                        <H3 className="text-sm">Velocity Analysis: Order vs Invoice</H3>
                        <Flex gap={4}>
                            <Flex align="center" gap={2}>
                                <div className="w-2.5 h-2.5 rounded-full bg-app-accent shadow-[0_0_8px_rgba(var(--color-app-accent-rgb),0.4)]"></div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-app-fg-muted">Ordered</span>
                            </Flex>
                            <Flex align="center" gap={2}>
                                <div className="w-2.5 h-2.5 rounded-full bg-app-status-success shadow-[0_0_8px_rgba(var(--color-app-status-success-rgb),0.4)]"></div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-app-fg-muted">Invoiced</span>
                            </Flex>
                        </Flex>
                    </Flex>

                    <div className="relative h-64 w-full flex items-end justify-between px-2 gap-3 group/chart">
                        {/* Grid Lines */}
                        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                            {[0, 1, 2, 3, 4].map((i) => (
                                <div key={i} className="border-b border-app-border w-full h-px last:border-0" />
                            ))}
                        </div>

                        {data.map((item, idx) => (
                            <div key={idx} className="relative flex flex-col items-center flex-1 h-full justify-end group z-10">
                                <div className="absolute bottom-0 w-full flex justify-center gap-1.5 h-full items-end pb-8">
                                    {/* Bar for Ordered */}
                                    <div
                                        style={{ height: `${item.ordered_value * scale}%` }}
                                        className="w-3 md:w-5 bg-app-accent/20 rounded-t-lg group-hover:bg-app-accent transition-all duration-500 relative"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-t from-app-accent/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    {/* Bar for Invoiced */}
                                    <div
                                        style={{ height: `${item.invoiced_value * scale}%` }}
                                        className="w-3 md:w-5 bg-app-status-success/20 rounded-t-lg group-hover:bg-app-status-success transition-all duration-500 relative"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-t from-app-status-success/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </div>
                                <span className="text-[9px] font-black text-app-fg-muted mt-2 absolute bottom-0 uppercase tracking-tighter opacity-40 group-hover:opacity-100 transition-opacity">
                                    {item.month}
                                </span>

                                {/* Tooltip */}
                                <div className="opacity-0 group-hover:opacity-100 absolute -top-16 bg-app-fg text-app-surface p-2.5 rounded-xl shadow-xl pointer-events-none transition-all scale-95 group-hover:scale-100 z-20 whitespace-nowrap border border-app-border/10">
                                    <div className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-50">{item.month} Performance</div>
                                    <div className="flex flex-col gap-0.5">
                                        <Flex justify="between" gap={4}>
                                            <span className="text-[10px] font-medium opacity-70">Ordered</span>
                                            <Accounting className="font-black text-app-surface">
                                                {item.ordered_value}
                                            </Accounting>
                                        </Flex>
                                        <Flex justify="between" gap={4}>
                                            <span className="text-[10px] font-medium opacity-70">Invoiced</span>
                                            <Accounting className="font-black text-app-status-success">
                                                {item.invoiced_value}
                                            </Accounting>
                                        </Flex>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 p-4 bg-app-accent/5 rounded-2xl border border-app-accent/10 flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl bg-app-accent/10 flex items-center justify-center text-app-accent shrink-0">
                            <TrendingUp className="w-4 h-4" />
                        </div>
                        <Stack gap={1}>
                            <Label className="m-0 text-app-accent">Operational Insight</Label>
                            <Body className="text-[12px] leading-relaxed text-app-fg opacity-80">
                                Invoicing trailing orders by <span className="font-black">12%</span> this quarter. Bottleneck detected in dispatch queue.
                            </Body>
                        </Stack>
                    </div>
                </Card>

                {/* Efficiency & Breakdown */}
                <div className="grid grid-cols-1 gap-6">
                    <Card className="p-6 bg-app-surface border border-app-border shadow-sm flex flex-col justify-center relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-app-status-success/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-app-status-success/10 transition-colors" />

                        <Label className="mb-4 text-app-fg-muted tracking-widest uppercase text-[10px]">Quarterly Liquidity Score</Label>
                        <Flex align="end" gap={3} className="mb-2">
                            <span className="text-5xl font-black text-app-fg tracking-tighter">92%</span>
                            <Badge variant="success" className="mb-2 font-black tracking-widest uppercase flex items-center gap-1">
                                <ArrowUpRight className="w-3 h-3" /> 4.5%
                            </Badge>
                        </Flex>
                        <SmallText className="text-app-fg-muted font-bold opacity-50 uppercase tracking-widest">vs Previous Interval (87.5%)</SmallText>

                        <div className="mt-8 h-2.5 w-full bg-app-overlay/10 rounded-full overflow-hidden border border-app-border/10">
                            <div className="h-full bg-gradient-to-r from-app-status-success/60 to-app-status-success w-[92%] relative">
                                <div className="absolute inset-0 bg-white/20 animate-[pulse_2s_infinite] opacity-30" />
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6 bg-app-surface border border-app-border shadow-sm">
                        <Label className="mb-6 text-app-fg-muted tracking-widest uppercase text-[10px]">Critical Bottlenecks</Label>
                        <Stack gap={5}>
                            <Stack gap={1.5}>
                                <Flex justify="between" className="px-0.5">
                                    <span className="text-xs font-black text-app-fg uppercase tracking-tight">Material Shortage</span>
                                    <Badge variant="error" className="text-[9px] font-black">HIGH RISK</Badge>
                                </Flex>
                                <div className="h-1.5 w-full bg-app-overlay/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-app-status-error w-[30%]" />
                                </div>
                            </Stack>

                            <Stack gap={1.5}>
                                <Flex justify="between" className="px-0.5">
                                    <span className="text-xs font-black text-app-fg uppercase tracking-tight">Inspection Backlog</span>
                                    <Badge variant="warning" className="text-[9px] font-black">MODERATE</Badge>
                                </Flex>
                                <div className="h-1.5 w-full bg-app-overlay/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-app-status-warning w-[50%]" />
                                </div>
                            </Stack>

                            <Stack gap={1.5}>
                                <Flex justify="between" className="px-0.5">
                                    <span className="text-xs font-black text-app-fg uppercase tracking-tight">Queue Latency</span>
                                    <Badge variant="success" className="text-[9px] font-black">LOW</Badge>
                                </Flex>
                                <div className="h-1.5 w-full bg-app-overlay/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-app-status-success w-[20%]" />
                                </div>
                            </Stack>
                        </Stack>
                    </Card>
                </div>
            </div>
        </div>
    );
}

"use client";

import React from "react";
import { Card, H3, Flex, Stack, Label, SmallText } from "@/components/design-system";
import { cn } from "@/lib/utils";

interface TrendData {
    month: string;
    ordered_value: number;
    invoiced_value: number;
}

interface DualAxisChartProps {
    data: TrendData[];
}

export function DualAxisLineChart({ data }: DualAxisChartProps) {
    if (!data || data.length === 0) return null;

    // Calculate scales
    const maxOrdered = Math.max(...data.map((d) => d.ordered_value));
    const maxInvoiced = Math.max(...data.map((d) => d.invoiced_value));
    const scaleOrdered = maxOrdered > 0 ? 100 / maxOrdered : 1;
    const scaleInvoiced = maxInvoiced > 0 ? 100 / maxInvoiced : 1;

    // Generate SVG path for line charts
    const generatePath = (values: number[], scale: number) => {
        const width = 100;
        const step = width / (values.length - 1 || 1);
        return values
            .map((val, idx) => {
                const x = idx * step;
                const y = 100 - val * scale;
                return `${idx === 0 ? "M" : "L"} ${x} ${y}`;
            })
            .join(" ");
    };

    const orderedPath = generatePath(
        data.map((d) => d.ordered_value),
        scaleOrdered,
    );
    const invoicedPath = generatePath(
        data.map((d) => d.invoiced_value),
        scaleInvoiced,
    );

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    return (
        <Card className="p-5 bg-app-surface border border-app-border shadow-sm">
            <Flex justify="between" align="center" className="mb-6">
                <H3 className="text-sm">Velocity Matrix: Order vs Dispatch</H3>
                <Flex gap={4}>
                    <Flex align="center" gap={2}>
                        <div className="w-3 h-0.5 bg-app-accent rounded-full shadow-[0_0_8px_rgba(var(--color-app-accent-rgb),0.5)]"></div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-app-fg-muted">Ordered</span>
                    </Flex>
                    <Flex align="center" gap={2}>
                        <div className="w-3 h-0.5 bg-app-status-success rounded-full shadow-[0_0_8px_rgba(var(--color-app-status-success-rgb),0.5)]"></div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-app-fg-muted">Invoiced</span>
                    </Flex>
                </Flex>
            </Flex>

            <div className="relative h-48 w-full group">
                {/* SVG Baseline */}
                <svg className="absolute inset-0 w-full h-full p-1" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="orderedGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="var(--color-app-accent)" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="var(--color-app-accent)" stopOpacity="0" />
                        </linearGradient>
                        <linearGradient id="invoicedGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="var(--color-app-status-success)" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="var(--color-app-status-success)" stopOpacity="0" />
                        </linearGradient>
                    </defs>

                    {/* Grid Lines */}
                    <g className="opacity-10">
                        {[0, 25, 50, 75, 100].map((tick) => (
                            <line key={tick} x1="0" y1={tick} x2="100" y2={tick} stroke="currentColor" strokeWidth="0.5" />
                        ))}
                    </g>

                    {/* Ordered Line & Area */}
                    <path d={`${orderedPath} L 100 100 L 0 100 Z`} fill="url(#orderedGradient)" className="opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <path d={orderedPath} fill="none" stroke="var(--color-app-accent)" strokeWidth="2" vectorEffect="non-scaling-stroke" />

                    {/* Invoiced Line & Area */}
                    <path d={`${invoicedPath} L 100 100 L 0 100 Z`} fill="url(#invoicedGradient)" className="opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <path d={invoicedPath} fill="none" stroke="var(--color-app-status-success)" strokeWidth="2" vectorEffect="non-scaling-stroke" />

                    {/* Data Points */}
                    {data.map((d, idx) => {
                        const x = (idx / (data.length - 1 || 1)) * 100;
                        const yOrdered = 100 - d.ordered_value * scaleOrdered;
                        const yInvoiced = 100 - d.invoiced_value * scaleInvoiced;
                        return (
                            <g key={idx} className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <circle cx={x} cy={yOrdered} r="1.5" fill="var(--color-app-accent)" className="ring-2 ring-app-surface" />
                                <circle cx={x} cy={yInvoiced} r="1.5" fill="var(--color-app-status-success)" className="ring-2 ring-app-surface" />
                            </g>
                        );
                    })}
                </svg>

                {/* X-axis labels */}
                <div className="absolute bottom-[-20px] left-0 right-0 flex justify-between px-1">
                    {months.map((month, idx) => (
                        <span key={idx} className={cn(
                            "text-[8px] font-black uppercase tracking-tighter transition-all duration-300",
                            data[idx] ? "text-app-fg opacity-60" : "text-app-fg-muted opacity-10"
                        )}>
                            {month}
                        </span>
                    ))}
                </div>
            </div>

            {/* AI Insight Strip */}
            <div className="mt-8 p-3 bg-app-accent/5 rounded-xl border border-app-border/20 flex items-start gap-2.5 group/insight cursor-help">
                <div className="w-7 h-7 rounded-lg bg-app-accent/10 flex items-center justify-center text-[10px] shrink-0 transform group-hover/insight:rotate-12 transition-transform">
                    ✨
                </div>
                <p className="text-[11px] font-bold text-app-fg opacity-80 leading-relaxed">
                    <span className="text-app-accent">Insight:</span> Invoicing traits orders by <span className="text-app-status-error font-black">12%</span> this quarter. Bottleneck detected in dispatch reconciliation.
                </p>
            </div>
        </Card>
    );
}

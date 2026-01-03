"use client";

import React from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    PieChart,
    Pie,
    LabelList,
} from "recharts";
import { Activity } from "lucide-react";
import { motion } from "framer-motion";
import { Flex, Stack, Box, Grid } from "@/components/design-system/atoms/Layout";
import { Body } from "@/components/design-system/atoms/Typography";
import { SummaryCard } from "@/components/design-system/organisms/SummaryCards";
import { cn } from "@/lib/utils";

interface ReportsChartsProps {
    activeTab: string;
    chartData: any[];
}

const ReportsCharts = ({ activeTab, chartData }: ReportsChartsProps) => {
    // Calculate dynamic stats from chartData
    const kpiStats = React.useMemo(() => {
        if (!chartData || chartData.length === 0) return [];

        if (activeTab === "sales") {
            const totalOrdered = chartData.reduce((acc, curr) => acc + (curr.ordered_value || 0), 0);
            const totalDelivered = chartData.reduce((acc, curr) => acc + (curr.delivered_value || 0), 0);
            const fulfillmentRate = totalOrdered > 0 ? (totalDelivered / totalOrdered) * 100 : 0;
            const variance = totalOrdered - totalDelivered;

            return [
                { label: "Total Revenue", value: totalOrdered, type: "currency", color: "text-action-primary" },
                { label: "Delivered Value", value: totalDelivered, type: "currency", color: "text-status-success" },
                { label: "Fulfillment", value: fulfillmentRate, type: "percentage", color: "text-brand" },
                { label: "Variance", value: variance, type: "currency", color: "text-status-warning" }
            ];
        }

        if (activeTab === "reconciliation") {
            const accepted = chartData.find(d => d.name === "Accepted")?.value || 0;
            const rejected = chartData.find(d => d.name === "Rejected")?.value || 0;
            const pending = chartData.find(d => d.name === "Pending")?.value || 0;
            const total = accepted + rejected + pending;
            const acceptanceRate = total > 0 ? (accepted / total) * 100 : 0;

            return [
                { label: "Items Processed", value: total, type: "number", color: "text-action-primary" },
                { label: "Accepted", value: accepted, type: "number", color: "text-status-success" },
                { label: "Acceptance Rate", value: acceptanceRate, type: "percentage", color: "text-brand" },
                { label: "Pending Audit", value: pending, type: "number", color: "text-status-warning" }
            ];
        }
        return [];
    }, [chartData, activeTab]);

    const formatValue = (val: number, type: string) => {
        if (type === "currency") {
            if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)}Cr`;
            if (val >= 100000) return `₹${(val / 100000).toFixed(2)}L`;
            return `₹${val.toLocaleString()}`;
        }
        if (type === "percentage") return `${val.toFixed(1)}%`;
        return val.toLocaleString();
    };

    return (
        <motion.div
            key={`chart-${activeTab}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
        >
            <Grid cols="1" gap={4} className="lg:grid-cols-4 items-stretch">
                {/* Main Chart Container - Left Side (Bento) */}
                <Box className="lg:col-span-3 p-7 rounded-[28px] bg-app-surface/40 backdrop-blur-xl shadow-md">
                    <Flex align="center" justify="between" className="mb-6">
                        <Body className="text-[10px] font-bold text-app-fg-muted uppercase tracking-[0.15em] opacity-60">
                            {activeTab === "sales" ? "Momentum Trends" : "Audit Distribution"}
                        </Body>
                    </Flex>

                    <Box className="h-[320px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            {activeTab === "sales" ? (
                                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <CartesianGrid
                                        strokeDasharray="4 4"
                                        vertical={false}
                                        stroke="rgba(var(--text-primary), 0.05)"
                                    />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fill: "rgba(var(--text-primary), 0.5)" }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fill: "rgba(var(--text-primary), 0.5)" }}
                                        tickFormatter={(value) => {
                                            if (value >= 10000000) return `${(value / 10000000).toFixed(0)}Cr`;
                                            if (value >= 100000) return `${(value / 100000).toFixed(0)}L`;
                                            return value;
                                        }}
                                    />
                                    <Bar
                                        name="Ordered"
                                        dataKey="ordered_value"
                                        fill="rgb(var(--action-primary))"
                                        radius={[6, 6, 0, 0]}
                                        maxBarSize={40}
                                    >
                                        <LabelList
                                            dataKey="ordered_value"
                                            position="top"
                                            formatter={(value: any) => {
                                                if (value >= 10000000) return `${(value / 10000000).toFixed(1)}Cr`;
                                                if (value >= 100000) return `${(value / 100000).toFixed(1)}L`;
                                                if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
                                                return value === 0 ? "" : value;
                                            }}
                                            style={{ fontSize: 9, fontWeight: 600, fill: "rgba(var(--text-primary), 0.6)" }}
                                        />
                                    </Bar>
                                    <Bar
                                        name="Delivered"
                                        dataKey="delivered_value"
                                        fill="rgb(var(--status-success))"
                                        radius={[6, 6, 0, 0]}
                                        maxBarSize={40}
                                    >
                                        <LabelList
                                            dataKey="delivered_value"
                                            position="top"
                                            formatter={(value: any) => {
                                                if (value >= 10000000) return `${(value / 10000000).toFixed(1)}Cr`;
                                                if (value >= 100000) return `${(value / 100000).toFixed(1)}L`;
                                                if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
                                                return value === 0 ? "" : value;
                                            }}
                                            style={{ fontSize: 9, fontWeight: 600, fill: "rgba(var(--text-primary), 0.6)" }}
                                        />
                                    </Bar>
                                </BarChart>
                            ) : (
                                <BarChart data={chartData} layout="vertical" margin={{ left: 40, right: 20 }}>
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 11, fontWeight: 500, fill: "rgba(var(--text-primary), 0.7)" }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: "16px",
                                            background: "rgba(var(--bg-surface-elevated), 0.95)",
                                            backdropFilter: "blur(8px)",
                                            border: "none",
                                            boxShadow: "0 8px 24px rgba(0,0,0,0.12)"
                                        }}
                                    />
                                    <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={36}>
                                        {chartData.map((entry: any, index: number) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={entry.color || "rgb(var(--action-primary))"}
                                                fillOpacity={0.85}
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            )}
                        </ResponsiveContainer>
                    </Box>
                </Box>

                {/* Dynamic KPI Column - Right Side (Bento) */}
                <Stack gap={3} className="lg:col-span-1 h-full">
                    {kpiStats.map((stat, idx) => (
                        <SummaryCard
                            key={idx}
                            title={stat.label}
                            value={formatValue(stat.value, stat.type)}
                            variant={
                                stat.color.includes("action-primary") ? "primary" :
                                    stat.color.includes("status-success") ? "success" :
                                        stat.color.includes("status-warning") ? "warning" :
                                            "default"
                            }
                            className="w-full"
                        />
                    ))}
                </Stack>
            </Grid>
        </motion.div>
    );
};

export default ReportsCharts;

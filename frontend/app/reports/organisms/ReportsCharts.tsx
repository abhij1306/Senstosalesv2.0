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
} from "recharts";
import { Activity } from "lucide-react";
import { motion } from "framer-motion";
import { Flex, Stack, Box, Grid } from "@/components/design-system/atoms/Layout";
import { Body, SmallText } from "@/components/design-system/atoms/Typography";

interface ReportsChartsProps {
    activeTab: string;
    chartData: any[];
}

const ReportsCharts = ({ activeTab, chartData }: ReportsChartsProps) => {
    return (
        <motion.div
            key={`chart-${activeTab}`}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
        >
            <Grid cols="1" gap={6} className="lg:grid-cols-3">
                {/* Main Chart Card */}
                <Box className="lg:col-span-2 p-6 rounded-2xl bg-app-surface/40 backdrop-blur-md shadow-clay-surface transition-all duration-300 hover:shadow-premium-hover">
                    <Flex
                        align="center"
                        justify="between"
                        className="mb-4 shadow-none pb-2"
                    >
                        <Box>
                            <Body className="font-regular text-app-accent uppercase tracking-wide text-xs">
                                {activeTab === "sales" ? "Revenue Momentum" : "Quality Distribution"}
                            </Body>
                        </Box>
                    </Flex>
                    <Box className="h-[240px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            {activeTab === "sales" ? (
                                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        vertical={false}
                                        stroke="hsl(var(--system-blue) / 0.2)"
                                        opacity={0.3}
                                    />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{
                                            fontSize: 10,
                                            fontWeight: 600,
                                            fill: "rgb(var(--app-fg-secondary))",
                                        }}
                                        dy={8}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{
                                            fontSize: 10,
                                            fontWeight: 600,
                                            fill: "rgb(var(--app-fg-secondary))",
                                        }}
                                        tickFormatter={(value) => {
                                            if (value >= 10000000) return `${(value / 10000000).toFixed(1)}Cr`;
                                            if (value >= 100000) return `${(value / 100000).toFixed(1)}L`;
                                            if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
                                            return String(value);
                                        }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: "12px",
                                            border: "1px solid hsl(var(--system-blue) / 0.2)",
                                            boxShadow: "var(--shadow-lg)",
                                            color: "rgb(var(--app-fg-primary))",
                                            fontSize: "11px",
                                            marginBottom: "4px",
                                        }}
                                        itemStyle={{
                                            fontSize: "10px",
                                            fontWeight: 600,
                                        }}
                                    />
                                    <Bar
                                        name="Ordered"
                                        dataKey="ordered_value"
                                        fill="#2563EB" // blue-600
                                        radius={[6, 6, 0, 0]}
                                        maxBarSize={40}
                                        opacity={0.9}
                                    />
                                    <Bar
                                        name="Delivered"
                                        dataKey="delivered_value"
                                        fill="#16A34A" // green-600
                                        radius={[6, 6, 0, 0]}
                                        maxBarSize={40}
                                        opacity={0.9}
                                    />
                                </BarChart>
                            ) : (
                                <BarChart data={chartData} layout="vertical" margin={{ left: 40, right: 10 }}>
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{
                                            fontSize: 10,
                                            fontWeight: 600,
                                            fill: "#64748B",
                                        }}
                                    />
                                    <Tooltip
                                        formatter={(value: any) => [
                                            typeof value === "number" ? Math.round(value) : value,
                                            "",
                                        ]}
                                        contentStyle={{
                                            borderRadius: "12px",
                                            border: "1px solid #E2E8F0",
                                            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                                            background: "#FFFFFF",
                                            padding: "8px 12px",
                                        }}
                                        itemStyle={{
                                            fontSize: "10px",
                                            fontWeight: 600,
                                            color: "#1E293B"
                                        }}
                                    />
                                    <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={28}>
                                        {chartData.map((entry: any, index: number) => {
                                            // Use specific colors
                                            const colors = [
                                                "#16A34A", // green
                                                "#DC2626", // red
                                                "#D97706", // amber
                                            ];
                                            const color = entry.color || colors[index % colors.length];

                                            return (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={color}
                                                    fillOpacity={0.9}
                                                />
                                            );
                                        })}
                                    </Bar>
                                </BarChart>
                            )}
                        </ResponsiveContainer>
                    </Box>
                </Box>

                {/* Secondary Charts Stack */}
                <Stack gap={4}>
                    <Flex
                        align="center"
                        justify="center"
                        direction="col"
                        className="p-5 rounded-2xl bg-app-surface/40 backdrop-blur-md shadow-clay-surface text-center"
                    >
                        <Flex align="center" justify="center" className="relative w-28 h-28">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={[
                                            { name: "Growth", value: 75, fill: "rgb(var(--app-accent))" },
                                            { name: "Remaining", value: 25, fill: "hsl(var(--system-blue) / 0.15)" },
                                        ]}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={42}
                                        outerRadius={56}
                                        dataKey="value"
                                        startAngle={90}
                                        endAngle={-270}
                                        stroke="transparent"
                                        strokeWidth={0}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            <Stack align="center" justify="center" className="absolute inset-0">
                                <Body className="font-regular text-app-accent text-lg">
                                    75%
                                </Body>
                                <SmallText className="text-[9px] text-app-accent font-regular uppercase tracking-wider leading-none">
                                    Margin
                                </SmallText>
                            </Stack>
                        </Flex>
                        <Box className="mt-3">
                            <Body className="text-[10px] font-regular text-app-fg-muted uppercase tracking-widest">
                                Gross Profit Margin
                            </Body>
                        </Box>
                    </Flex>

                    <Flex
                        justify="between"
                        direction="col"
                        className="p-5 rounded-2xl bg-app-surface/40 backdrop-blur-md shadow-clay-surface transition-all duration-300 hover:shadow-premium-hover"
                    >
                        <Flex align="center" justify="between">
                            <Stack>
                                <SmallText className="text-[9px] font-regular text-app-fg-muted uppercase tracking-widest leading-none">
                                    Quick Ratio
                                </SmallText>
                                <Body className="font-regular text-app-fg mt-1 text-sm">
                                    0.9:8
                                </Body>
                            </Stack>
                            <Box className="w-9 h-9 rounded-xl flex items-center justify-center bg-app-status-warning/10 text-app-status-warning">
                                <Activity size={18} />
                            </Box>
                        </Flex>
                        <Box className="mt-3">
                            <Box className="w-full bg-app-border/30 h-2 rounded-full overflow-hidden">
                                <Box className="bg-gradient-to-r from-amber-400 to-amber-600 h-full rounded-full w-[45%]" />
                            </Box>
                            <SmallText className="text-[9px] text-app-fg-muted/70 font-medium mt-2 leading-relaxed">
                                Liquid assets vs Current liabilities
                            </SmallText>
                        </Box>
                    </Flex>
                </Stack>
            </Grid>
        </motion.div>
    );
};

export default ReportsCharts;

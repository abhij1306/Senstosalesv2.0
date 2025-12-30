"use client";

import React from "react";
import {
    LineChart,
    Line,
    BarChart as ReBarChart,
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
                        className="mb-6 shadow-none pb-2"
                    >
                        <Box>
                            <Body className="font-bold text-app-accent uppercase tracking-wide">
                                {activeTab === "sales" ? "Revenue Momentum" : "Quality Distribution"}
                            </Body>
                        </Box>
                    </Flex>
                    <Box className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            {activeTab === "sales" ? (
                                <LineChart data={chartData}>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        vertical={false}
                                        stroke="rgba(0,0,0,0.05)"
                                    />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{
                                            fontSize: 10,
                                            fontWeight: 700,
                                            fill: "var(--app-fg-muted)",
                                        }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{
                                            fontSize: 10,
                                            fontWeight: 700,
                                            fill: "var(--app-fg-muted)",
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
                                            borderRadius: "16px",
                                            border: "none",
                                            boxShadow: "var(--shadow-3d-lifted)",
                                            background: "var(--app-surface)",
                                            backdropFilter: "blur(12px)",
                                            padding: "12px",
                                        }}
                                        labelStyle={{
                                            fontWeight: 800,
                                            color: "var(--app-fg)",
                                            fontSize: "12px",
                                            marginBottom: "4px",
                                        }}
                                    />
                                    <Line
                                        type="monotone"
                                        name="Ordered"
                                        dataKey="ordered_value"
                                        stroke="var(--app-accent)"
                                        strokeWidth={3}
                                        dot={{ r: 3, fill: "var(--app-accent)" }}
                                        activeDot={{ r: 5, strokeWidth: 0 }}
                                    />
                                    <Line
                                        type="monotone"
                                        name="Delivered"
                                        dataKey="delivered_value"
                                        stroke="var(--app-status-success)"
                                        strokeWidth={3}
                                        dot={{ r: 3, fill: "var(--app-status-success)" }}
                                        activeDot={{ r: 5, strokeWidth: 0 }}
                                    />
                                </LineChart>
                            ) : (
                                <ReBarChart data={chartData} layout="vertical" margin={{ left: 40 }}>
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{
                                            fontSize: 10,
                                            fontWeight: 700,
                                            fill: "var(--app-fg-muted)",
                                        }}
                                    />
                                    <Tooltip
                                        formatter={(value: any) => [
                                            typeof value === "number" ? Math.round(value) : value,
                                            "",
                                        ]}
                                        contentStyle={{
                                            borderRadius: "16px",
                                            border: "none",
                                            boxShadow: "0 8px 32px rgba(0,0,0,0.05)",
                                            background: "var(--app-surface)",
                                            backdropFilter: "blur(10px)",
                                        }}
                                    />
                                    <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={32}>
                                        {chartData.map((entry: any, index: number) => {
                                            // Use theme-aware colors with gradient effect
                                            const colors = [
                                                'hsl(142, 76%, 36%)',  // Green for Accepted
                                                'hsl(0, 84%, 60%)',    // Red for Rejected  
                                                'hsl(38, 92%, 50%)',   // Amber for Pending
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
                                </ReBarChart>
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
                        className="p-6 rounded-2xl bg-app-surface/40 backdrop-blur-md shadow-clay-surface text-center"
                    >
                        <Flex align="center" justify="center" className="relative w-32 h-32">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={[
                                            { name: "Growth", value: 75, fill: "var(--app-accent)" },
                                            { name: "Remaining", value: 25, fill: "#e2e8f0" },
                                        ]}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={65}
                                        dataKey="value"
                                        startAngle={90}
                                        endAngle={-270}
                                        stroke="#ffffff"
                                        strokeWidth={2}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            <Stack align="center" justify="center" className="absolute inset-0">
                                <Body className="font-black text-app-accent">
                                    75%
                                </Body>
                                <SmallText className="text-[10px] text-app-accent font-bold uppercase tracking-wider leading-none">
                                    Margin
                                </SmallText>
                            </Stack>
                        </Flex>
                        <Box className="mt-4">
                            <Body className="text-[11px] font-black text-app-fg-muted uppercase tracking-widest">
                                Gross Profit Margin
                            </Body>
                        </Box>
                    </Flex>

                    <Flex
                        justify="between"
                        direction="col"
                        className="p-6 rounded-2xl bg-app-surface/40 backdrop-blur-md shadow-clay-surface transition-all duration-300 hover:shadow-premium-hover"
                    >
                        <Flex align="center" justify="between">
                            <Stack>
                                <SmallText className="text-[10px] font-black text-app-fg-muted uppercase tracking-widest leading-none">
                                    Quick Ratio
                                </SmallText>
                                <Body className="font-black text-app-fg mt-1">
                                    0.9:8
                                </Body>
                            </Stack>
                            <Box className="w-10 h-10 rounded-xl flex items-center justify-center bg-app-status-warning/10 text-app-status-warning">
                                <Activity size={20} />
                            </Box>
                        </Flex>
                        <Box className="mt-4">
                            <Box className="w-full bg-[var(--bg-tertiary)]/50 h-2.5 rounded-full overflow-hidden p-[2px]">
                                <Box className="bg-gradient-to-r from-amber-400 to-amber-600 h-full rounded-full w-[45%]" />
                            </Box>
                            <SmallText className="text-[10px] text-app-fg-muted/50 font-medium mt-3 italic leading-relaxed">
                                Liquid assets vs Current liabilities dashboard.
                            </SmallText>
                        </Box>
                    </Flex>
                </Stack>
            </Grid>
        </motion.div>
    );
};

export default ReportsCharts;

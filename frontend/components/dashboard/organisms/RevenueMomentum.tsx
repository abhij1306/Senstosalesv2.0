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
} from "recharts";
import { TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { Flex, Stack, Box } from "@/components/design-system/atoms/Layout";
import { Body, SmallText, H3 } from "@/components/design-system/atoms/Typography";

interface RevenueMomentumProps {
    data: any[];
    loading?: boolean;
}

export function RevenueMomentum({ data, loading }: RevenueMomentumProps) {
    if (loading) {
        return (
            <Box className="h-[400px] w-full rounded-3xl bg-[var(--color-sys-bg-surface)]/40 animate-pulse" />
        );
    }

    return (
        <Box className="p-6 rounded-3xl surface-claymorphic shadow-clay-surface overflow-hidden border border-[var(--color-sys-surface-glass_border_light)]">
            <Flex
                align="center"
                justify="between"
                className="mb-8"
            >
                <Stack gap={1}>
                    <Flex align="center" gap={2}>
                        <div className="p-1.5 bg-[var(--color-sys-brand-primary)]/10 rounded-lg text-[var(--color-sys-brand-primary)]">
                            <TrendingUp size={14} />
                        </div>
                        <SmallText className="text-[var(--color-sys-brand-primary)] uppercase tracking-[0.2em] font-bold text-[10px]">
                            Revenue Analytics
                        </SmallText>
                    </Flex>
                    <H3 className="text-h3 font-black tracking-tight uppercase">Revenue Momentum</H3>
                </Stack>
                <Flex align="center" gap={2} className="px-3 py-1.5 bg-[var(--color-sys-bg-tertiary)] rounded-full shadow-inner">
                    <div className="w-2 h-2 rounded-full bg-[var(--color-sys-brand-primary)] animate-pulse" />
                    <SmallText className="font-bold text-[var(--color-sys-text-secondary)]">Live Forecast</SmallText>
                </Flex>
            </Flex>

            <Box className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                                fill: "var(--color-sys-text-tertiary)",
                            }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{
                                fontSize: 10,
                                fontWeight: 700,
                                fill: "var(--color-sys-text-tertiary)",
                            }}
                            tickFormatter={(value) => {
                                if (value === 0) return "0";
                                // Convert to Crores (1 Cr = 1,00,00,000)
                                const crValue = value / 10000000;
                                return `${crValue.toFixed(1)}Cr`;
                            }}
                        />
                        <Tooltip
                            cursor={{ fill: 'rgba(var(--color-sys-brand-primary-rgb), 0.05)', radius: 8 }}
                            contentStyle={{
                                borderRadius: "16px",
                                border: "none",
                                boxShadow: "0 8px 32px rgba(0,0,0,0.05)",
                                background: "var(--color-sys-bg-surface)",
                                backdropFilter: "blur(10px)",
                                padding: "12px",
                            }}
                            labelStyle={{
                                fontWeight: 800,
                                color: "var(--color-sys-text-primary)",
                                fontSize: "12px",
                                marginBottom: "4px",
                            }}
                            formatter={(value: any) => [
                                `${(value / 10000000).toFixed(2)} Cr`,
                                "Revenue"
                            ]}
                        />
                        <Bar
                            dataKey="value"
                            radius={[8, 8, 0, 0]}
                            barSize={40}
                            animationDuration={1500}
                        >
                            {data.map((entry, index) => {
                                const isLast = index === data.length - 1;

                                // Use CSS variable for blue color
                                const color = 'var(--color-sys-brand-primary)';
                                const opacity = isLast ? 1 : 0.7 + (index / Math.max(data.length - 1, 1)) * 0.3;

                                return (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={color}
                                        fillOpacity={opacity}
                                    />
                                );
                            })}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </Box>
        </Box>
    );
}

"use client";

import React from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { Flex, Stack, Box } from "@/components/design-system/atoms/Layout";
import { SmallText, Title3 } from "@/components/design-system/atoms/Typography";
import { Button } from "@/components/design-system/atoms/Button";

interface RevenueMomentumProps {
    data: any[];
    loading?: boolean;
}

export function RevenueMomentum({ data, loading }: RevenueMomentumProps) {
    if (loading) {
        return (
            <Box className="h-[400px] w-full rounded-3xl bg-app-surface/40 animate-pulse" />
        );
    }

    return (
        <div className="tahoe-glass-card p-6 h-full flex flex-col">
            <Flex
                align="center"
                justify="between"
                className="mb-8"
            >
                <Stack gap={1}>
                    <Flex align="center" gap={2}>
                        <div className="p-1.5 bg-system-blue/10 rounded-lg text-system-blue">
                            <TrendingUp size={14} />
                        </div>
                        <SmallText className="text-system-blue uppercase tracking-[0.2em] font-bold text-[10px]">
                            Revenue Analytics
                        </SmallText>
                    </Flex>
                    <Title3 className="text-h3 font-black tracking-tight uppercase text-vibrancy">Revenue Momentum</Title3>
                </Stack>
                <Button variant="glass" size="sm" className="h-8 gap-1 text-app-accent p-0 px-3 py-1.5 rounded-full shadow-inner border border-white/10">
                    <div className="w-2 h-2 rounded-full bg-system-green animate-pulse shadow-[0_0_8px_rgba(var(--system-green-rgb),0.8)]" />
                    <SmallText className="font-bold text-text-secondary">Live Forecast</SmallText>
                </Button>
            </Flex>

            <div className="flex-1 min-h-0 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="var(--system-blue)" stopOpacity={0.8} />
                                <stop offset="100%" stopColor="var(--system-blue)" stopOpacity={0.2} />
                            </linearGradient>
                        </defs>
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{
                                fontSize: 10,
                                fontWeight: 700,
                                fill: "var(--text-tertiary)",
                            }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{
                                fontSize: 10,
                                fontWeight: 700,
                                fill: "var(--text-tertiary)",
                            }}
                            tickFormatter={(value) => {
                                if (value === 0) return "0";
                                const crValue = value / 10000000;
                                return `${crValue.toFixed(1)}Cr`;
                            }}
                        />
                        <Tooltip
                            cursor={{ fill: 'rgba(255,255,255,0.05)', radius: 8 }}
                            contentStyle={{
                                borderRadius: "16px",
                                border: "1px solid rgba(255,255,255,0.2)",
                                boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                                background: "rgba(255,255,255,0.4)",
                                backdropFilter: "blur(25px) saturate(180%)",
                                padding: "12px",
                                color: "var(--text-primary)"
                            }}
                            itemStyle={{ color: "var(--text-primary)" }}
                            labelStyle={{
                                fontWeight: 800,
                                color: "var(--text-secondary)",
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
                            radius={[6, 6, 6, 6]}
                            barSize={40}
                            animationDuration={1500}
                            fill="url(#barGradient)"
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

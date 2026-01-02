"use client";

import React from "react";
import {
    AlertCircle,
    TrendingDown,
    CheckCircle,
    ArrowRight,
    Zap
} from "lucide-react";
import { Card, Flex, Label, Body, Stack } from "@/components/design-system";
import { cn } from "@/lib/utils";

export interface Insight {
    type: "warning" | "error" | "success";
    text: string;
    action?: string;
}

interface InsightStripProps {
    insights: Insight[];
    onAction?: (action: string) => void;
}

export function InsightStrip({ insights, onAction }: InsightStripProps) {
    if (!insights || insights.length === 0) return null;

    const getIcon = (type: Insight["type"]) => {
        switch (type) {
            case "warning":
                return <AlertCircle className="w-4 h-4 text-app-status-warning" />;
            case "error":
                return <TrendingDown className="w-4 h-4 text-app-status-error" />;
            case "success":
                return <CheckCircle className="w-4 h-4 text-app-status-success" />;
        }
    };

    const getColors = (type: Insight["type"]) => {
        switch (type) {
            case "warning":
                return "bg-app-status-warning/5 border-app-status-warning/20 text-app-fg";
            case "error":
                return "bg-app-status-error/5 border-app-status-error/20 text-app-fg";
            case "success":
                return "bg-app-status-success/5 border-app-status-success/20 text-app-fg";
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {insights.map((insight, idx) => (
                <Card
                    key={idx}
                    onClick={() => onAction && insight.action && onAction(insight.action)}
                    className={cn(
                        "p-4 flex items-start gap-3 cursor-pointer transition-all duration-300",
                        "hover:shadow-lg hover:shadow-app-accent/5 hover:-translate-y-0.5 active:scale-95 group",
                        getColors(insight.type)
                    )}
                >
                    <div className={cn(
                        "p-2 rounded-xl shrink-0 group-hover:scale-110 transition-transform",
                        insight.type === "warning" && "bg-app-status-warning/10",
                        insight.type === "error" && "bg-app-status-error/10",
                        insight.type === "success" && "bg-app-status-success/10"
                    )}>
                        {getIcon(insight.type)}
                    </div>
                    <Stack gap={2} className="flex-1">
                        <Body className="text-[12px] font-bold leading-relaxed tracking-tight">
                            {insight.text}
                        </Body>
                        {insight.action && (
                            <Flex align="center" gap={1.5} className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-[9px] font-black uppercase tracking-widest text-app-accent">Execute Response</span>
                                <ArrowRight className="w-3 h-3 text-app-accent" />
                            </Flex>
                        )}
                    </Stack>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-20 transition-opacity">
                        <Zap className="w-12 h-12 text-app-accent" />
                    </div>
                </Card>
            ))}
        </div>
    );
}

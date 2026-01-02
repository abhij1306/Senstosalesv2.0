"use client";

import React, { useState } from "react";
import { Calendar, Download, Eye } from "lucide-react";
import { Button, Input, Label, Flex, Stack, Card } from "@/components/design-system";
import { cn } from "@/lib/utils";

interface DateSummaryControlsProps {
    onViewSummary: (entity: string, startDate: string, endDate: string) => void;
    onExport: () => void;
    exportEnabled: boolean;
    loading: boolean;
}

export default function DateSummaryControls({
    onViewSummary,
    onExport,
    exportEnabled,
    loading,
}: DateSummaryControlsProps) {
    const [entity, setEntity] = useState("po");
    const [startDate, setStartDate] = useState("2019-01-01");
    const [endDate, setEndDate] = useState("2019-12-31");

    const handleView = () => {
        onViewSummary(entity, startDate, endDate);
    };

    return (
        <Flex align="center" gap={4} className="flex-wrap bg-app-surface/30 backdrop-blur-md p-3 rounded-2xl border border-app-border/30 shadow-sm ring-1 ring-app-accent/5">
            {/* Entity Selection */}
            <Flex align="center" gap={3}>
                <Label className="m-0 whitespace-nowrap">Report Type</Label>
                <select
                    value={entity}
                    onChange={(e) => setEntity(e.target.value)}
                    className="h-9 px-4 bg-app-overlay/10 border border-app-border/30 rounded-xl font-bold text-xs text-app-fg focus:outline-none focus:ring-2 focus:ring-app-accent/20 transition-all cursor-pointer hover:bg-app-overlay/20"
                >
                    <option value="po" className="bg-app-surface text-app-fg">Purchase Orders</option>
                    <option value="challan" className="bg-app-surface text-app-fg">Delivery Challans</option>
                    <option value="invoice" className="bg-app-surface text-app-fg">Sales Invoices</option>
                </select>
            </Flex>

            {/* Date Range Picker */}
            <Flex align="center" gap={2} className="bg-app-overlay/10 px-3 py-1 rounded-xl border border-app-border/20">
                <Calendar className="w-3.5 h-3.5 text-app-accent" />
                <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-transparent border-none font-bold text-xs text-app-fg focus:ring-0 w-32 cursor-pointer h-7"
                />
                <span className="text-app-fg-muted font-black px-1 text-[10px]">→</span>
                <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-transparent border-none font-bold text-xs text-app-fg focus:ring-0 w-32 cursor-pointer h-7"
                />
            </Flex>

            {/* Actions */}
            <Flex align="center" gap={2} className="ml-auto">
                <Button
                    onClick={handleView}
                    loading={loading}
                    size="sm"
                    className="h-9 px-5 rounded-xl font-black text-[10px] uppercase tracking-widest active-glow"
                >
                    <Eye className="w-3.5 h-3.5 mr-2" />
                    Query Status
                </Button>
                <Button
                    variant="secondary"
                    onClick={onExport}
                    disabled={!exportEnabled || loading}
                    size="sm"
                    className="h-9 px-5 rounded-xl font-black text-[10px] uppercase tracking-widest border border-app-border/30 hover:bg-app-overlay/20"
                >
                    <Download className="w-3.5 h-3.5 mr-2" />
                    Excel Report
                </Button>
            </Flex>
        </Flex>
    );
}

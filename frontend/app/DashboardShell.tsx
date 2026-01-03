"use client";

import { useMemo, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardSummary, ActivityItem } from "@/lib/api";
import {
    Receipt,
    Activity,
    Plus,
    BarChart3,
    ArrowRight,
    Truck,
    FileText,
    LayoutDashboard,
} from "lucide-react";
import { formatIndianCurrency, cn } from "@/lib/utils";
import {
    SmallText,
    Body,
    Accounting,
    Button,
    SummaryCards,
    DataTable,
    StatusBadge,
    Flex,
    Stack,
    Box,
    Title1,
    Title2,
    Title3,
    Caption1,
    Footnote,
    Card,
} from "@/components/design-system";
import { type Column } from "@/components/design-system";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { motion } from "framer-motion";

// --- CLIENT COMPONENT: Interactive Dashboard Shell ---

const createActivityColumns = (router: AppRouterInstance): Column<ActivityItem>[] => [
    {
        key: "number",
        label: "Record",
        width: "40%",
        render: (_value, item) => (
            <Flex
                align="center"
                gap={3}
                className="cursor-pointer group py-1.5"
                onClick={() => {
                    const path =
                        item.type === "PO"
                            ? `/po/${item.number}`
                            : item.type === "DC"
                                ? `/dc/${item.number}`
                                : `/invoice/${item.number}`;
                    router.push(path);
                }}
            >
                <div
                    className={cn(
                        "p-1.5 rounded-lg transition-all duration-300 shrink-0",
                        item.type === "Invoice"
                            ? "bg-system-blue/10 text-system-blue"
                            : item.type === "PO"
                                ? "bg-surface-secondary/50 text-text-secondary"
                                : "bg-system-green/10 text-system-green"
                    )}
                >
                    {item.type === "Invoice" ? (
                        <Receipt size={14} />
                    ) : item.type === "PO" ? (
                        <FileText size={14} />
                    ) : (
                        <Truck size={14} />
                    )}
                </div>
                <Footnote className="text-text-primary group-hover:text-system-blue transition-colors whitespace-nowrap font-regular">
                    {item.number}
                </Footnote>
            </Flex>
        ),
    },
    {
        key: "amount",
        label: "Amount",
        width: "25%",
        align: "right",
        render: (_value, item) => (
            <Accounting
                isCurrency
                className="text-text-primary text-right block font-regular pr-2"
            >
                {item.amount || 0}
            </Accounting>
        ),
    },
    {
        key: "status",
        label: "Status",
        width: "20%",
        align: "center",
        render: (_value, item) => (
            <div className="flex justify-center">
                <StatusBadge status={String(item.status).toLowerCase() as any} className="border-none shadow-none bg-app-overlay/5" />
            </div>
        ),
    },
    {
        key: "date",
        label: "Date",
        width: "15%",
        align: "right",
        render: (_value, item) => (
            <Footnote className="text-text-secondary whitespace-nowrap leading-none font-regular tabular-nums">
                {item.date}
            </Footnote>
        ),
    },
];

interface QuickActionCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    onClick: () => void;
}

function QuickActionCard({
    title,
    description,
    icon,
    onClick,
}: QuickActionCardProps) {
    return (
        <Card
            variant="elevated"
            padding="none"
            onClick={onClick}
            className="cursor-pointer group relative overflow-hidden transition-all duration-300 active:scale-[0.98] hover:scale-[1.02] hover:shadow-3 p-6 min-h-[88px]"
        >
            <Flex align="center" gap={4} className="w-full">
                {/* Icon Container - M3 Tonal */}
                <motion.div
                    whileHover={{ scale: 1.05, rotate: 2 }}
                    className="p-3 rounded-2xl bg-primary-container text-on-primary-container shadow-1 flex items-center justify-center shrink-0 transition-transform"
                >
                    {icon}
                </motion.div>

                {/* Content */}
                <Stack gap={1} className="flex-1 min-w-0">
                    <Title3 className="text-primary leading-tight font-medium">
                        {title}
                    </Title3>
                    <Footnote className="text-secondary leading-snug">
                        {description}
                    </Footnote>
                </Stack>

                {/* Arrow Indicator - M3 Subhead */}
                <motion.div
                    whileHover={{ x: 2 }}
                    className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center transition-colors group-hover:bg-primary-container shrink-0"
                >
                    <ArrowRight
                        size={14}
                        className="text-secondary transition-colors group-hover:text-on-primary-container"
                    />
                </motion.div>
            </Flex>
        </Card>
    );
}

interface DashboardShellProps {
    summary: DashboardSummary | null;
    activity: ActivityItem[];
}

export function DashboardShell({ summary, activity }: DashboardShellProps) {
    const router = useRouter();
    const activityColumns = useMemo(() => createActivityColumns(router), [router]);

    const handleAnalytics = useCallback(() => router.push("/reports"), [router]);
    const handleNewPO = useCallback(() => router.push("/po/create"), [router]);
    const handleNewDC = useCallback(() => router.push("/dc/create"), [router]);
    const handleNewInvoice = useCallback(() => router.push("/invoice/create"), [router]);



    return (
        <div className="relative z-0 min-h-screen flex flex-col gap-6">
            {/* Header Section - macOS Style */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center justify-between"
            >
                <Flex align="center" gap={5}>
                    <motion.div
                        layoutId="dashboard-icon"
                        whileHover={{ scale: 1.05 }}
                        className="w-12 h-12 rounded-2xl bg-surface shadow-2 flex items-center justify-center text-primary backdrop-blur-xl transition-smooth"
                    >
                        <LayoutDashboard size={22} />
                    </motion.div>
                    <Stack gap={0.5}>
                        <motion.div layoutId="dashboard-title">
                            <Title1 className="text-primary font-medium tracking-tight">
                                Dashboard
                            </Title1>
                        </motion.div>
                        <Footnote className="text-secondary uppercase tracking-wider font-medium opacity-70">
                            Business intelligence overview
                        </Footnote>
                    </Stack>
                </Flex>
            </motion.div>

            {/* Summary Cards Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
            >
                <SummaryCards
                    loading={!summary}
                    cards={[
                        {
                            title: "Morning Briefing",
                            value: (
                                <Stack gap={1.5} className="pb-2">
                                    <Footnote className="text-text-primary leading-snug font-medium">
                                        {summary?.pending_pos || 0} POs pending
                                    </Footnote>
                                    <Footnote className="text-text-primary leading-snug font-medium">
                                        {summary?.active_challans || 0} DCs in transit
                                    </Footnote>
                                </Stack>
                            ),
                            icon: <Activity size={22} />,
                            variant: "primary",
                        },
                        {
                            title: "Invoiced Sales",
                            value: (
                                <Accounting className="text-text-primary font-semibold">
                                    {formatIndianCurrency(summary?.total_sales_month || 0)}
                                </Accounting>
                            ),
                            icon: <Receipt size={22} />,
                            variant: "success",
                        },
                        {
                            title: "Purchase Commitment",
                            value: (
                                <Accounting className="text-text-primary font-semibold">
                                    {formatIndianCurrency(summary?.total_po_value || 0)}
                                </Accounting>
                            ),
                            icon: <FileText size={22} />,
                            variant: "primary",
                        },
                        {
                            title: "Active Orders",
                            value: (
                                <Accounting className="text-text-primary font-semibold">
                                    {summary?.active_po_count || 0}
                                </Accounting>
                            ),
                            icon: <Activity size={22} />,
                            variant: "warning",
                        },
                    ]}
                    className="lg:grid-cols-2 xl:grid-cols-4"
                />
            </motion.div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Transaction Ledger Section */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="lg:col-span-2 space-y-5"
                >
                    <Flex align="center" justify="between" className="px-1">
                        <Title2 className="text-text-primary text-[15px] font-medium tracking-tight">
                            Transaction Ledger
                        </Title2>
                        <Button
                            variant="ghost"
                            size="compact"
                            onClick={handleAnalytics}
                            className="text-[10px] font-bold text-text-tertiary hover:text-system-blue uppercase tracking-widest bg-transparent hover:bg-transparent"
                        >
                            VIEW ALL
                        </Button>
                    </Flex>

                    {/* Transaction Ledger Table - Scroll Enabled */}
                    <div className="overflow-y-auto h-[360px] rounded-2xl bg-surface shadow-1 hover:shadow-2 transition-all duration-300 custom-scrollbar">
                        <DataTable
                            columns={activityColumns}
                            data={activity}
                            keyField="number"
                            className="h-full border-none shadow-none"
                            density="compact"
                        />
                    </div>
                </motion.div>

                {/* Execution Center Section */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                    className="flex flex-col gap-6"
                >
                    <Title2 className="text-text-primary font-medium tracking-tight">
                        Execution Center
                    </Title2>
                    <Stack gap={3}>
                        <QuickActionCard
                            title="New Purchase Order"
                            description="Initiate procurement lifecycle"
                            icon={<Plus size={18} />}
                            onClick={handleNewPO}
                        />
                        <QuickActionCard
                            title="Issue Delivery Challan"
                            description="Commit inventory to logistics"
                            icon={<Truck size={18} />}
                            onClick={handleNewDC}
                        />
                        <QuickActionCard
                            title="Generate Invoice"
                            description="Finalize financial reconciliation"
                            icon={<Receipt size={18} />}
                            onClick={handleNewInvoice}
                        />
                    </Stack>
                </motion.div>
            </div>
        </div>
    );
}

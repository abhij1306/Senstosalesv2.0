"use client";

import { useMemo, useCallback } from "react";
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
} from "lucide-react";
import { formatIndianCurrency, cn } from "@/lib/utils";
import {
    H1,
    H3,
    SmallText,
    Body,
    Accounting,
    Button,
    SummaryCards,
    DataTable,
    StatusBadge,
    Flex,
    Stack,
    Grid,
    Box,
    Card,           // Added
    LargeTitle,     // Added
    Title2,         // Added
    Caption1        // Added
} from "@/components/design-system";
import { type Column } from "@/components/design-system";
// import { SummaryCardSkeleton, TableRowSkeleton } from "@/components/design-system/atoms/Skeleton";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { motion } from "framer-motion";

// --- CLIENT COMPONENT: Interactive Dashboard Shell ---

const createActivityColumns = (router: AppRouterInstance): Column<ActivityItem>[] => [
    {
        key: "number",
        label: "RECORD",
        width: "40%",
        render: (_value, item) => (
            <Flex
                align="center"
                gap={3}
                className="cursor-pointer group py-1"
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
                <motion.div
                    layoutId={
                        item.type === "PO"
                            ? `po-icon-${item.number}`
                            : item.type === "DC"
                                ? `dc-icon-${item.number}`
                                : `inv-icon-${item.number}`
                    }
                    className={cn(
                        "p-2 rounded-lg transition-colors shrink-0",
                        item.type === "Invoice"
                            ? "bg-app-accent/10 text-app-accent"
                            : item.type === "PO"
                                ? "bg-app-overlay/50 text-app-fg-muted"
                                : "bg-app-status-success/10 text-app-status-success"
                    )}
                >
                    {item.type === "Invoice" ? (
                        <Receipt size={16} />
                    ) : item.type === "PO" ? (
                        <FileText size={16} />
                    ) : (
                        <Truck size={16} />
                    )}
                </motion.div>
                <div className="text-h3 font-medium text-app-fg group-hover:text-app-accent transition-colors whitespace-nowrap">
                    {item.number}
                </div>
            </Flex>
        ),
    },
    {
        key: "amount",
        label: "AMOUNT",
        width: "20%",
        align: "right",
        render: (_value, item) => (
            <Accounting
                isCurrency
                className="text-app-fg text-right block"
            >
                {item.amount || 0}
            </Accounting>
        ),
    },
    {
        key: "status",
        label: "STATUS",
        width: "20%",
        render: (_value, item) => <StatusBadge status={item.status} className="w-24 justify-center" />,
    },
    {
        key: "date",
        label: "DATE",
        width: "20%",
        align: "right",
        render: (_value, item) => (
            <SmallText className="text-app-fg-muted whitespace-nowrap leading-none">
                {item.date}
            </SmallText>
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
        <div
            className="tahoe-glass-card cursor-pointer group relative overflow-hidden transition-all duration-300 hover:bg-white/60 dark:hover:bg-white/10 active:scale-[0.98] p-0"
            onClick={onClick}
        >
            <div className="flex items-center gap-4 p-4">
                <div className="p-3 rounded-[14px] bg-gradient-to-br from-system-blue to-system-cyan text-white shadow-sm ring-1 ring-white/20 transition-transform duration-300 group-hover:scale-110">
                    {icon}
                </div>

                <div className="flex-1 min-w-0">
                    <Body className="font-medium text-text-primary leading-tight text-vibrancy">
                        {title}
                    </Body>
                    <Caption1 className="text-text-secondary mt-1">{description}</Caption1>
                </div>

                <div className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center transition-colors group-hover:bg-system-blue/10">
                    <ArrowRight
                        size={14}
                        className="text-text-tertiary transition-transform group-hover:translate-x-1 group-hover:text-system-blue"
                    />
                </div>
            </div>
        </div>
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
        <div className="relative z-0 min-h-screen space-y-8">
            <div className="flex items-center justify-between mb-8">
                <div className="space-y-1">
                    <LargeTitle className="text-text-primary">DASHBOARD</LargeTitle>
                    <Body className="text-text-secondary">Business intelligence overview</Body>
                </div>
            </div>

            <Box className="min-h-[140px]">
                <SummaryCards
                    loading={!summary}
                    cards={[
                        {
                            title: "Morning Briefing",
                            value: (
                                <Stack gap={2} className="pb-5">
                                    <Body className="text-app-fg font-semibold text-[13px] leading-relaxed">
                                        {summary?.pending_pos || 0} POs pending
                                    </Body>
                                    <Body className="text-app-fg font-semibold text-[13px] leading-relaxed">
                                        {summary?.active_challans || 0} DCs in transit
                                    </Body>
                                </Stack>
                            ),
                            icon: <Activity size={24} />,
                            variant: "primary",
                        },
                        {
                            title: "Invoiced Sales",
                            value: (
                                <Accounting className="text-app-accent">
                                    {formatIndianCurrency(summary?.total_sales_month || 0)}
                                </Accounting>
                            ),
                            icon: <Receipt size={24} />,
                            variant: "success",
                        },
                        {
                            title: "Purchase Commitment",
                            value: (
                                <Accounting className="text-app-accent">
                                    {formatIndianCurrency(summary?.total_po_value || 0)}
                                </Accounting>
                            ),
                            icon: <FileText size={24} />,
                            variant: "primary",
                        },
                        {
                            title: "Active Orders",
                            value: (
                                <Accounting className="text-app-fg">{summary?.active_po_count || 0}</Accounting>
                            ),
                            icon: <Activity size={24} />,
                            variant: "warning",
                        },
                    ]}
                    className="lg:grid-cols-2 xl:grid-cols-4"
                />
            </Box >

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center gap-4">
                        <Title2>Transaction Ledger</Title2>
                        <Button variant="ghost" size="compact" onClick={handleAnalytics}>
                            View All
                        </Button>
                    </div>

                    <div className="rounded-[20px] overflow-hidden">
                        <DataTable
                            columns={activityColumns}
                            data={activity}
                            keyField="number"
                            pageSize={8}
                            className="h-full border-none shadow-none bg-transparent"
                            density="compact"
                        />
                    </div>
                </div>

                <div className="space-y-6">
                    <Title2>Execution Center</Title2>
                    <div className="space-y-4">
                        <QuickActionCard
                            title="New Purchase Order"
                            description="Initiate procurement lifecycle"
                            icon={<Plus size={20} />}
                            onClick={handleNewPO}
                        />
                        <QuickActionCard
                            title="Issue Delivery Challan"
                            description="Commit inventory to logistics"
                            icon={<Truck size={20} />}
                            onClick={handleNewDC}
                        />
                        <QuickActionCard
                            title="Generate Invoice"
                            description="Finalize financial reconciliation"
                            icon={<Receipt size={20} />}
                            onClick={handleNewInvoice}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

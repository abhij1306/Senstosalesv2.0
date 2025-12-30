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
                            ? "bg-[var(--color-sys-brand-primary)]/10 text-[var(--color-sys-brand-primary)]"
                            : item.type === "PO"
                                ? "bg-[var(--color-sys-bg-tertiary)]/50 text-[var(--color-sys-text-secondary)]"
                                : "bg-[var(--color-sys-status-success)]/10 text-[var(--color-sys-status-success)]"
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
                <div className="text-h3 font-semibold text-app-fg group-hover:text-app-accent transition-colors whitespace-nowrap">
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

function QuickActionCard({
    title,
    description,
    icon,
    onClick,
    // layoutId,
}: {
    title: string;
    description: string;
    icon: React.ReactNode;
    onClick: () => void;
    // layoutId?: string;
}) {
    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
            <div
                className="surface-card cursor-pointer group relative overflow-hidden"
                onClick={onClick}
            >
                <div className="p-5">
                    <Flex align="center" gap={4}>
                        <div className="p-3 rounded-2xl bg-app-accent/10 text-app-accent group-hover:scale-110 transition-transform duration-300">
                            {icon}
                        </div>

                        <Stack className="flex-1 min-w-0">
                            <Body className="text-app-fg leading-none font-bold">
                                {title}
                            </Body>
                            <SmallText className="text-app-fg/60 mt-1.5">{description}</SmallText>
                        </Stack>

                        <div className="w-8 h-8 rounded-full bg-app-fg/5 flex items-center justify-center">
                            <ArrowRight
                                size={14}
                                className="text-app-accent transition-transform group-hover:translate-x-1"
                            />
                        </div>
                    </Flex>
                </div>
            </div>
        </motion.div>
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
        <Stack gap={8} className="relative z-0">
            <Flex align="center" justify="between" className="mb-2">
                <Stack gap={1}>
                    <H1 className="text-app-fg">DASHBOARD</H1>
                    <Body className="text-app-fg-muted">Business intelligence overview</Body>
                </Stack>
                <Flex align="center" gap={3}>
                    <Button variant="secondary" onClick={handleAnalytics}>
                        Analytics
                    </Button>
                    <Button variant="primary" onClick={handleNewPO}>
                        New Purchase Order
                    </Button>
                </Flex>
            </Flex>

            <Box className="min-h-[140px]">
                <SummaryCards
                    loading={!summary}
                    cards={[
                        {
                            title: "Morning Briefing",
                            value: (
                                <Stack gap={2} className="mt-1">
                                    <Body className="text-app-fg font-semibold text-[15px] leading-relaxed">
                                        {summary?.pending_pos || 0} POs pending
                                    </Body>
                                    <Body className="text-app-fg font-semibold text-[15px] leading-relaxed">
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
            </Box>

            <Grid cols="1" className="lg:grid-cols-12" gap={8}>
                <Stack className="lg:col-span-8" gap={4}>
                    <Flex align="center" justify="between">
                        <H3>Transaction Ledger</H3>
                        <Button variant="ghost" size="sm" onClick={handleAnalytics}>
                            View All
                        </Button>
                    </Flex>

                    <div className="min-h-[400px] surface-card p-2">
                        <DataTable
                            columns={activityColumns}
                            data={activity}
                            keyField="number"
                            pageSize={8}
                        />
                    </div>
                </Stack>

                <Stack className="lg:col-span-4" gap={4}>
                    <Flex align="center" justify="between">
                        <H3>Execution Center</H3>
                    </Flex>
                    <Stack gap={4}>
                        <QuickActionCard
                            title="New Purchase Order"
                            description="Initiate procurement lifecycle"
                            icon={<Plus size={20} />}
                            onClick={handleNewPO}
                        // layoutId="create-po-icon"
                        />
                        <QuickActionCard
                            title="Issue Delivery Challan"
                            description="Commit inventory to logistics"
                            icon={<Truck size={20} />}
                            onClick={handleNewDC}
                        // layoutId="create-dc-icon"
                        />
                        <QuickActionCard
                            title="Generate Invoice"
                            description="Finalize financial reconciliation"
                            icon={<Receipt size={20} />}
                            onClick={handleNewInvoice}
                        // layoutId="create-invoice-icon"
                        />
                    </Stack>
                </Stack>
            </Grid>
        </Stack>
    );
}

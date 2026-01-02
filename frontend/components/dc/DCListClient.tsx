"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Truck, Plus, CheckCircle, Clock, Download, Activity, FileStack, PackageCheck, Ship } from "lucide-react";
import { api, DCListItem, DCStats } from "@/lib/api";
import { formatDate, formatIndianCurrency } from "@/lib/utils";
import { useDebouncedValue } from "@/lib/hooks/useDebounce";
import {
    Body,
    Accounting,
    StatusBadge,
    ListPageTemplate,
    type SummaryCardProps,
    type Column,
    Button,
    Flex,
    Label,
    SmallText,
} from "@/components/design-system";
import { SearchBar } from "@/components/design-system/molecules/SearchBar";

const columns: Column<DCListItem>[] = [
    {
        key: "dc_number",
        label: "CHALLAN #",
        sortable: true,
        width: "15%",
        render: (_value, dc) => (
            <Link href={`/dc/${encodeURIComponent(dc.dc_number)}`} className="block group">
                <Accounting className="text-app-accent tracking-tight group-hover:underline underline-offset-4 decoration-2">
                    {dc.dc_number}
                </Accounting>
            </Link>
        ),
    },
    {
        key: "dc_date",
        label: "DATE",
        sortable: true,
        width: "12%",
        render: (v) => (
            <Body className="text-app-fg-muted font-bold text-[13px] whitespace-nowrap">
                {formatDate(String(v))}
            </Body>
        ),
    },
    {
        key: "po_number",
        label: "CONTRACT",
        sortable: true,
        width: "12%",
        render: (v) => (
            <Link href={`/po/${v}`} className="block group">
                <Accounting className="text-app-fg-muted text-[11px] group-hover:text-app-fg transition-colors">
                    {String(v) || "---"}
                </Accounting>
            </Link>
        ),
    },
    {
        key: "total_ordered_quantity",
        label: "ORD",
        align: "right",
        width: "10%",
        isNumeric: true,
        render: (v) => (
            <Accounting className="text-right pr-2">{v || 0}</Accounting>
        ),
    },
    {
        key: "total_dispatched_quantity",
        label: "DISPATCHED",
        align: "right",
        width: "10%",
        isNumeric: true,
        render: (v) => (
            <Accounting variant="success" className="text-right pr-2">
                {v || 0}
            </Accounting>
        ),
    },
    {
        key: "total_pending_quantity",
        label: "BAL",
        align: "right",
        width: "10%",
        isNumeric: true,
        render: (v) => (
            <Accounting variant="warning" className="text-right pr-2">
                {v || 0}
            </Accounting>
        ),
    },
    {
        key: "total_received_quantity",
        label: "RECD",
        sortable: true,
        align: "right",
        width: "10%",
        isNumeric: true,
        render: (v) => (
            <Accounting variant="highlight" className="text-app-accent text-right pr-2">{v || 0}</Accounting>
        ),
    },
    {
        key: "status",
        label: "STATUS",
        sortable: true,
        align: "center",
        width: "11%",
        render: (v) => (
            <div className="flex justify-center">
                <StatusBadge status={String(v)} className="w-24 shadow-sm" />
            </div>
        ),
    },
];

interface DCListClientProps {
    initialDCs: DCListItem[];
    initialStats: DCStats | null;
}

export function DCListClient({ initialDCs, initialStats }: DCListClientProps) {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearch = useDebouncedValue(searchQuery, 300);
    const [page, setPage] = useState(1);
    const pageSize = 10;

    const filteredDCs = useMemo(() => {
        const term = debouncedSearch.toLowerCase();
        return initialDCs.filter(
            (dc) =>
                dc.dc_number.toLowerCase().includes(term) ||
                (dc.po_number?.toString() || "").includes(term) ||
                (dc.consignee_name && dc.consignee_name.toLowerCase().includes(term))
        );
    }, [initialDCs, debouncedSearch]);

    const summaryCards = useMemo(
        (): SummaryCardProps[] => [
            {
                title: "Active Shipments",
                value: initialStats?.total_challans || initialDCs.length,
                icon: <Ship size={20} />,
                variant: "primary",
            },
            {
                title: "Fully Delivered",
                value: initialStats?.completed_delivery || 0,
                icon: <PackageCheck size={20} />,
                variant: "success",
            },
            {
                title: "Contract Capacity",
                value: formatIndianCurrency(initialStats?.total_value || 0),
                icon: <FileStack size={20} />,
                variant: "primary",
            },
            {
                title: "Awaiting Receipt",
                value: initialStats?.pending_delivery || 0,
                icon: <Activity size={20} />,
                variant: "warning",
            },
        ],
        [initialDCs.length, initialStats]
    );

    const handleSearch = useCallback((val: string) => {
        setSearchQuery(val);
        setPage(1);
    }, []);

    const toolbar = (
        <Flex align="center" justify="between" className="w-full" gap={4}>
            <SearchBar
                id="dc-search"
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Search challans or contracts..."
                className="w-full max-w-sm"
            />

            <Button
                color="primary"
                size="sm"
                onClick={() => router.push("/dc/create")}
                className="min-w-[120px] shadow-premium active:scale-95 transition-all"
            >
                <Plus size={16} className="mr-2" />
                <Body className="text-app-fg-inverse uppercase tracking-widest">New Challan</Body>
            </Button>
        </Flex>
    );

    return (
        <ListPageTemplate
            title="DELIVERY CHALLANS"
            subtitle="Manage and track all delivery documentation"
            toolbar={toolbar}
            summaryCards={summaryCards}
            columns={columns}
            data={filteredDCs}
            keyField="dc_number"
            page={page}
            pageSize={pageSize}
            totalItems={filteredDCs.length}
            onPageChange={(newPage) => setPage(newPage)}
            emptyMessage="No delivery challans found"
            density="compact"
        />
    );
}

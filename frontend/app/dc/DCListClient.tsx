"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Activity, FileStack, PackageCheck, Ship, Truck } from "lucide-react";
import { DCListItem, DCStats } from "@/lib/api";
import { formatDate, formatIndianCurrency } from "@/lib/utils";
import { useDebouncedValue } from "@/lib/hooks/useDebounce";
import {
    Footnote,
    Accounting,
    StatusBadge,
    ListPageTemplate,
    type SummaryCardProps,
    type Column,
    Button,
    Flex,
} from "@/components/design-system";
import { SearchBar } from "@/components/design-system/molecules/SearchBar";

const columns: Column<DCListItem>[] = [
    {
        key: "dc_number",
        label: "Challan #",
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
        label: "Date",
        sortable: true,
        width: "12%",
        render: (v) => (
            <Footnote className="text-text-tertiary whitespace-nowrap leading-none">
                {formatDate(String(v))}
            </Footnote>
        ),
    },
    {
        key: "po_number",
        label: "Contract",
        sortable: true,
        width: "12%",
        render: (v) => (
            <Link href={`/po/${v}`} className="block group">
                <Accounting className="text-text-tertiary group-hover:text-text-primary transition-colors">
                    {String(v) || "---"}
                </Accounting>
            </Link>
        ),
    },
    {
        key: "total_ordered_quantity",
        label: "Ordered",
        align: "right",
        width: "10%",
        isNumeric: true,
        render: (v) => (
            <Accounting className="text-app-fg pr-2">{v || 0}</Accounting>
        ),
    },
    {
        key: "total_dispatched_quantity",
        label: "QTY",
        align: "right",
        width: "10%",
        isNumeric: true,
        render: (v) => (
            <Accounting className="text-app-accent pr-2">
                {v || 0}
            </Accounting>
        ),
    },
    {
        key: "total_value",
        label: "Value",
        align: "right",
        width: "15%",
        isNumeric: true,
        render: (v) => (
            <Accounting className="text-app-fg font-medium pr-2">
                {formatIndianCurrency(Number(v))}
            </Accounting>
        ),
    },
    {
        key: "status",
        label: "Status",
        sortable: true,
        align: "center",
        width: "15%",
        render: (v) => (
            <div className="flex justify-center">
                <StatusBadge status={String(v).toUpperCase()} className="w-24 border-none shadow-none bg-app-overlay/5" />
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
                icon: <Ship size={18} />,
                variant: "primary",
            },
            {
                title: "Fully Delivered",
                value: initialStats?.completed_delivery || 0,
                icon: <PackageCheck size={18} />,
                variant: "success",
            },
            {
                title: "Contract Capacity",
                value: formatIndianCurrency(initialStats?.total_value || 0),
                icon: <FileStack size={18} />,
                variant: "primary",
            },
            {
                title: "Awaiting Receipt",
                value: initialStats?.pending_delivery || 0,
                icon: <Activity size={18} />,
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
                variant="primary"
                onClick={() => router.push("/dc/create")}
                className="min-w-[140px] border-none rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/25"
            >
                <Plus size={18} />
                Create Challan
            </Button>
        </Flex>
    );

    return (
        <ListPageTemplate
            title="Delivery Challans"
            subtitle="Manage and track all delivery documentation"
            icon={<Truck size={22} />}
            iconLayoutId="dc-icon"
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
            density="normal"
        />
    );
}

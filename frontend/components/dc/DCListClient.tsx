"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Truck, Plus, CheckCircle, Clock, Download, Activity } from "lucide-react";
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
} from "@/components/design-system";
import { SearchBar } from "@/components/design-system/molecules/SearchBar";

const columns: Column<DCListItem>[] = [
    {
        key: "dc_number",
        label: "DC NUMBER",
        sortable: true,
        width: "15%",
        render: (_value, dc) => (
            <Link href={`/dc/${dc.dc_number}`} className="block">
                <Body className="text-app-accent hover:underline font-semibold">
                    {dc.dc_number}
                </Body>
            </Link>
        ),
    },
    {
        key: "dc_date",
        label: "CHALLAN DATE",
        sortable: true,
        width: "12%",
        render: (v) => (
            <Body className="text-[var(--color-sys-text-tertiary)]">
                {formatDate(String(v))}
            </Body>
        ),
    },
    {
        key: "po_number",
        label: "PO REFERENCE",
        sortable: true,
        width: "12%",
        render: (v) => (
            <Link href={`/po/${v}`} className="block">
                <Body className="text-app-accent hover:underline">
                    {String(v) || "N/A"}
                </Body>
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
            <Accounting className="text-right block">{Number(v) || 0}</Accounting>
        ),
    },
    {
        key: "total_dispatched_quantity",
        label: "DLV",
        align: "right",
        width: "10%",
        isNumeric: true,
        render: (v) => (
            <Accounting variant="success" className="text-right block">
                {Number(v) || 0}
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
            <Accounting variant="warning" className="text-right block">
                {Number(v) || 0}
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
            <Accounting className="font-semibold text-right block">{Number(v) || 0}</Accounting>
        ),
    },
    {
        key: "status",
        label: "STATUS",
        sortable: true,
        align: "center",
        width: "11%",
        render: (v) => <StatusBadge status={String(v)} className="w-24 justify-center" />,
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
                title: "Total Challans",
                value: initialStats?.total_challans || initialDCs.length,
                icon: <Truck size={20} />,
                variant: "primary",
            },
            {
                title: "Delivered",
                value: initialStats?.completed_delivery || 0,
                icon: <CheckCircle size={20} />,
                variant: "success",
            },
            {
                title: "Total Value",
                value: formatIndianCurrency(initialStats?.total_value || 0),
                icon: <Download size={20} />,
                variant: "primary",
            },
            {
                title: "In Transit",
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
        <Flex align="center" gap={3}>
            <SearchBar
                id="dc-search"
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Search DCs..."
                className="w-full max-w-sm"
            />

            <Button
                variant="default"
                size="sm"
                onClick={() => router.push("/dc/create")}
                className="bg-app-accent text-white hover:brightness-110 shadow-md"
            >
                <Flex align="center" gap={2}>
                    <Plus size={16} />
                    <Body className="text-inherit">New DC</Body>
                </Flex>
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

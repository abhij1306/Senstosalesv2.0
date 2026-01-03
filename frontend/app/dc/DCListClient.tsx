"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Activity, FileStack, PackageCheck, Ship, Truck, FileDown } from "lucide-react";
import { api, API_BASE_URL, DCListItem, DCStats } from "@/lib/api";
import { formatDate, formatIndianCurrency } from "@/lib/utils";
import { useDebouncedValue } from "@/lib/hooks/useDebounce";
import {
    Footnote,
    Accounting,
} from "@/components/design-system/atoms/Typography";
import { Button } from "@/components/design-system/atoms/Button";
import { Flex } from "@/components/design-system/atoms/Layout";
import { StatusBadge } from "@/components/design-system/atoms/StatusBadge";
import { ListPageTemplate } from "@/components/design-system/templates/ListPageTemplate";
import { type SummaryCardProps } from "@/components/design-system/organisms/SummaryCards";
import { type Column } from "@/components/design-system/organisms/DataTable";
import { SearchBar } from "@/components/design-system/molecules/SearchBar";

const columns: Column<DCListItem>[] = [
    {
        key: "dc_number",
        label: "Challan #",
        sortable: true,
        width: "15%",
        align: "left",
        render: (_value, dc) => (
            <Link href={`/dc/${encodeURIComponent(dc.dc_number)}`} className="block group">
                <Accounting className="text-action-primary tracking-tight group-hover:underline underline-offset-4 decoration-2">
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
        align: "right",
        render: (v) => (
            <Link href={`/po/${v}`} className="block group">
                <Accounting className="text-text-tertiary group-hover:text-text-primary transition-colors pr-2">
                    {String(v) || "---"}
                </Accounting>
            </Link>
        ),
    },
    {
        key: "total_ordered_quantity",
        label: "Ord",
        align: "right",
        width: "10%",
        isNumeric: true,
        render: (v) => (
            <Accounting className="text-text-primary pr-2">{v || 0}</Accounting>
        ),
    },
    {
        key: "total_dispatched_quantity",
        label: "Dlv",
        align: "right",
        width: "10%",
        isNumeric: true,
        render: (v) => (
            <Accounting className="text-action-primary pr-2">
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
            <Accounting className="text-text-primary font-medium pr-2">
                {formatIndianCurrency(Number(v))}
            </Accounting>
        ),
    },
    {
        key: "actions" as any,
        label: "Actions",
        width: "10%",
        align: "right",
        render: (_: any, dc: DCListItem) => (
            <Flex justify="end" gap={2}>
                <a
                    href={`${API_BASE_URL}/api/dc/${encodeURIComponent(dc.dc_number)}/download`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg hover:bg-app-accent/10 text-app-accent transition-all"
                    title="Download Excel"
                >
                    <FileDown size={14} />
                </a>
            </Flex>
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
    const [isExporting, setIsExporting] = useState(false);
    const pageSize = 10;

    const handleExportExcel = useCallback(async () => {
        setIsExporting(true);
        try {
            const params = new URLSearchParams({
                start_date: "2024-04-01",
                end_date: new Date().toISOString().split("T")[0],
            });
            api.exportReport("dc_register", params.toString());
        } catch (e) {
            console.error(e);
        } finally {
            setIsExporting(false);
        }
    }, []);

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
        <div className="surface-glass p-3 rounded-2xl shadow-lg border border-white/20 mb-6 backdrop-blur-xl">
            <Flex align="center" justify="between" className="w-full" gap={4}>
                <SearchBar
                    value={searchQuery}
                    onChange={handleSearch}
                    placeholder="Search DCs, Suppliers or PO Ref..."
                    className="w-full max-w-sm bg-surface-sunken/40 border-none shadow-inner"
                />

                <Flex align="center" gap={3}>
                    <Button
                        variant="success"
                        onClick={handleExportExcel}
                        disabled={isExporting}
                        className="min-w-[140px] whitespace-nowrap shadow-sm text-white"
                    >
                        <FileDown size={16} />
                        Excel
                    </Button>

                    <Button
                        variant="primary"
                        onClick={() => router.push("/dc/create")}
                        className="min-w-[140px] whitespace-nowrap shadow-md"
                    >
                        <Plus size={18} />
                        Create Challan
                    </Button>
                </Flex>
            </Flex>
        </div>
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
            emptyMessage="No delivery challans found"
            density="normal"
        />
    );
}

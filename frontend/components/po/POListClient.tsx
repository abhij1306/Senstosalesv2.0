"use client";

import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { POListItem, POStats } from "@/lib/api";
import {
    FileText,
    Activity,
    Clock,
    Plus,
    ShoppingCart,
} from "lucide-react";
import { formatDate, formatIndianCurrency } from "@/lib/utils";
import { useDebouncedValue } from "@/lib/hooks/useDebounce";

import { Button } from "@/components/design-system/atoms/Button";
import { Body, Accounting } from "@/components/design-system/atoms/Typography";
import { StatusBadge } from "@/components/design-system/organisms/StatusBadge";
import { useUpload } from "@/components/providers/UploadContext";
import { SearchBar } from "@/components/design-system/molecules/SearchBar";
import { ListPageTemplate } from "@/components/design-system/templates/ListPageTemplate";
import { type Column } from "@/components/design-system/organisms/DataTable";
import { type SummaryCardProps } from "@/components/design-system/organisms/SummaryCards";
import { Flex } from "@/components/design-system/atoms/Layout";

const columns: Column<POListItem>[] = [
    {
        key: "po_number",
        label: "NUMBER",
        width: "10%",
        render: (_value, po) => (
            <Link href={`/po/${po.po_number}`} className="block">
                <Body className="table-cell-text text-[var(--color-sys-brand-primary)] font-semibold hover:underline">
                    {po.po_number}
                </Body>
            </Link>
        ),
    },
    {
        key: "po_date",
        label: "DATE",
        width: "12%",
        render: (v) => (
            <Body className="table-cell-date text-[var(--color-sys-text-secondary)] whitespace-nowrap">
                {formatDate(String(v))}
            </Body>
        ),
    },
    {
        key: "po_value",
        label: "VALUE",
        width: "13%",
        align: "right",
        isCurrency: true,
    },
    {
        key: "total_items_count",
        label: "ITM",
        width: "7%",
        align: "center",
        isNumeric: true,
    },
    {
        key: "total_ordered_quantity",
        label: "ORD",
        width: "9%",
        align: "right",
        isNumeric: true,
    },
    {
        key: "total_dispatched_quantity",
        label: "DLV",
        width: "10%",
        align: "right",
        isNumeric: true,
        render: (v) => (
            <Accounting className="table-cell-number text-[var(--color-sys-status-success)]">
                {Number(v)}
            </Accounting>
        ),
    },
    {
        key: "total_pending_quantity",
        label: "BAL",
        width: "9%",
        align: "right",
        isNumeric: true,
        render: (v) => (
            <Accounting className="table-cell-number text-[var(--color-sys-status-warning)]">
                {Number(v)}
            </Accounting>
        ),
    },
    {
        key: "total_received_quantity",
        label: "RECD",
        width: "10%",
        align: "right",
        isNumeric: true,
        render: (v) => (
            <Accounting className="table-cell-number text-[var(--color-sys-brand-primary)]">
                {Number(v)}
            </Accounting>
        ),
    },
    {
        key: "po_status",
        label: "Status",
        width: "12%",
        render: (v) => <StatusBadge status={String(v)} className="w-24 justify-center" />,
    },
];

interface POListClientProps {
    initialPOs: POListItem[];
    initialStats: POStats;
}

export function POListClient({ initialPOs, initialStats }: POListClientProps) {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearch = useDebouncedValue(searchQuery, 300);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);

    // Global Upload Hook
    const { startUpload, isUploading } = useUpload();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Refresh data when upload completes
    const prevUploading = useRef(false);

    useEffect(() => {
        if (prevUploading.current && !isUploading) {
            router.refresh();
        }
        prevUploading.current = isUploading;
    }, [isUploading, router]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            startUpload(files, "PO");
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const filteredPOs = useMemo(() => {
        return initialPOs.filter(
            (po) =>
                po.po_number.toString().toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                po.supplier_name?.toLowerCase().includes(debouncedSearch.toLowerCase())
        );
    }, [initialPOs, debouncedSearch]);

    const summaryCards = useMemo(
        (): SummaryCardProps[] => [
            {
                title: "Total Orders",
                value: initialPOs.length,
                icon: <FileText size={20} />,
                variant: "primary",
            },
            {
                title: "Open Orders",
                value: initialStats?.open_orders_count || 0,
                icon: <Activity size={20} />,
                variant: "success",
            },
            {
                title: "Pending Approval",
                value: initialStats?.pending_approval_count || 0,
                icon: <Clock size={20} />,
                variant: "warning",
            },
            {
                title: "Total Value",
                value: formatIndianCurrency(initialStats?.total_value_ytd || 0),
                icon: <ShoppingCart size={20} />,
                variant: "primary",
            },
        ],
        [initialPOs.length, initialStats]
    );

    const handleSearch = useCallback((val: string) => {
        setSearchQuery(val);
        setPage(1); // Reset to first page on search
    }, []);

    const toolbar = (
        <Flex align="center" justify="between" className="w-full" gap={4}>
            <SearchBar
                id="po-search"
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Search POs..."
                className="w-full max-w-sm"
            />
            <Flex align="center" gap={3}>
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.html"
                    onChange={handleFileSelect}
                    className="hidden"
                />

                <Button
                    variant="ghost"
                    onClick={handleUploadClick}
                    className="shadow-sm border-sys-brand-primary/20 text-sys-brand-primary hover:bg-sys-brand-primary/5"
                >
                    <Flex align="center" gap={2}>
                        <FileText size={16} />
                        <Body className="text-inherit font-semibold">Upload POs</Body>
                    </Flex>
                </Button>

                <Button
                    variant="default"
                    size="sm"
                    onClick={() => router.push("/po/create")}
                    className="bg-[var(--color-sys-brand-primary)] text-sys-bg-white hover:brightness-110 shadow-md"
                >
                    <Flex align="center" gap={2}>
                        <Plus size={16} />
                        <Body className="text-inherit">New PO</Body>
                    </Flex>
                </Button>
            </Flex>
        </Flex>
    );

    return (
        <ListPageTemplate
            title="PURCHASE ORDERS"
            subtitle="Track procurement contracts and delivery schedules"
            toolbar={toolbar}
            summaryCards={summaryCards}
            columns={columns}
            data={filteredPOs}
            keyField="po_number"
            page={page}
            pageSize={pageSize}
            totalItems={filteredPOs.length}
            onPageChange={(newPage) => setPage(newPage)}
            emptyMessage="No purchase orders found"
            density="compact"
        />
    );
}

"use client";

import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { POListItem, POStats } from "@/lib/api";
import {
    FileText,
    Clock,
    Plus,
    IndianRupee,
    Upload,
    TrendingUp,
    Package,
} from "lucide-react";
import { formatDate, formatIndianCurrency } from "@/lib/utils";
import { useDebouncedValue } from "@/lib/hooks/useDebounce";

import { Button } from "@/components/design-system/atoms/Button";
import { Body, Accounting, Label, SmallText } from "@/components/design-system/atoms/Typography";
import { StatusBadge } from "@/components/design-system/atoms/StatusBadge";
import { useUpload } from "@/components/providers/UploadContext";
import { SearchBar } from "@/components/design-system/molecules/SearchBar";
import { ListPageTemplate } from "@/components/design-system/templates/ListPageTemplate";
import { type Column } from "@/components/design-system/organisms/DataTable";
import { type SummaryCardProps } from "@/components/design-system/organisms/SummaryCards";
import { Flex } from "@/components/design-system/atoms/Layout";

const columns: Column<POListItem>[] = [
    {
        key: "po_number",
        label: "Number",
        width: "12%",
        render: (_value, po) => (
            <Link href={`/po/${po.po_number}`} className="block group">
                <Accounting className="tracking-tight group-hover:text-app-accent transition-colors font-black">
                    #{po.po_number}
                </Accounting>
            </Link>
        ),
    },
    {
        key: "po_date",
        label: "Date",
        width: "12%",
        render: (v) => (
            <Body className="text-app-fg-secondary font-bold">
                {formatDate(String(v))}
            </Body>
        ),
    },
    {
        key: "total_items_count",
        label: "Itm",
        width: "6%",
        align: "center",
        render: (v) => (
            <Body className="text-app-fg-secondary font-bold">{v || 1}</Body>
        )
    },
    {
        key: "total_ordered_quantity",
        label: "Ord",
        width: "10%",
        align: "right",
        isNumeric: true,
        render: (v) => (
            <Accounting className="text-app-fg-secondary pr-2 font-bold">
                {v}
            </Accounting>
        ),
    },
    {
        key: "total_dispatched_quantity",
        label: "Dlv",
        width: "10%",
        align: "right",
        isNumeric: true,
        render: (v) => (
            <Accounting className="text-app-success pr-2 font-black">
                {v}
            </Accounting>
        ),
    },
    {
        key: "total_pending_quantity",
        label: "Bal",
        width: "10%",
        align: "right",
        isNumeric: true,
        render: (v) => (
            <Accounting
                variant={Number(v) > 0 ? "warning" : "success"}
                className="pr-2"
            >
                {v}
            </Accounting>
        ),
    },
    {
        key: "total_received_quantity",
        label: "Recd",
        width: "10%",
        align: "right",
        isNumeric: true,
        render: (v) => (
            <Accounting className="text-app-fg-secondary pr-2 font-bold">
                {v}
            </Accounting>
        ),
    },
    {
        key: "po_status",
        label: "Status",
        width: "14%",
        align: "center",
        render: (v) => (
            <div className="flex justify-center pr-4">
                <StatusBadge status={String(v).toUpperCase()} icon={String(v).toLowerCase() === 'closed' ? 'CheckCircle2' : 'Clock'} />
            </div>
        ),
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
                trend: { value: "+2", direction: "up" },
            },
            {
                title: "Open Orders",
                value: initialStats?.open_orders_count || 0,
                icon: <Package size={20} />,
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
                icon: <IndianRupee size={20} />,
                variant: "primary",
                progress: 75,
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
                placeholder="Search orders, items, or status..."
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
                    variant="glass"
                    onClick={handleUploadClick}
                    className="min-w-[140px] shadow-app-sm"
                >
                    <Upload size={16} className="mr-2" />
                    <Body className="font-semibold">Upload PO</Body>
                </Button>

                <Button
                    variant="primary"
                    onClick={() => router.push("/po/create")}
                    className="min-w-[180px]"
                >
                    <Plus size={18} className="mr-2" />
                    <Body className="text-white font-semibold">New Purchase Order</Body>
                </Button>
            </Flex>
        </Flex>
    );

    return (
        <ListPageTemplate
            title="Purchase Orders"
            subtitle="Manage procurement contracts and track delivery schedules."
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
            density="normal"
        />
    );
}

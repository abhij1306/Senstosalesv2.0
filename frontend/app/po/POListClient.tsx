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
    ShoppingCart,
} from "lucide-react";
import { formatDate, formatIndianCurrency } from "@/lib/utils";
import { useDebouncedValue } from "@/lib/hooks/useDebounce";

import { Button } from "@/components/design-system/atoms/Button";
import { Body, Footnote, Accounting, SmallText } from "@/components/design-system/atoms/Typography";
import { Label } from "@/components/design-system/atoms/Label";
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
        width: "15%",
        align: "left",
        render: (_value, po) => (
            <Link href={`/po/${po.po_number}`} className="block group">
                <Accounting className="group-hover:text-action-primary transition-colors">
                    #{po.po_number}
                </Accounting>
            </Link>
        ),
    },
    {
        key: "po_date",
        label: "Date",
        width: "15%",
        render: (v) => (
            <Footnote className="text-text-secondary">
                {formatDate(String(v))}
            </Footnote>
        ),
    },
    {
        key: "total_items_count",
        label: "Items",
        width: "8%",
        align: "right",
        render: (v) => (
            <Footnote className="text-text-secondary pr-2">{v || 1}</Footnote>
        )
    },
    {
        key: "total_ordered_quantity",
        label: "Ordered",
        width: "12%",
        align: "right",
        isNumeric: true,
        render: (v) => (
            <Accounting className="text-app-fg pr-2">
                {v}
            </Accounting>
        ),
    },
    {
        key: "total_dispatched_quantity",
        label: "Delivered",
        width: "12%",
        align: "right",
        isNumeric: true,
        render: (v) => (
            <Accounting className="text-app-fg pr-2">
                {v}
            </Accounting>
        ),
    },
    {
        key: "total_pending_quantity",
        label: "Balance",
        width: "12%",
        align: "right",
        isNumeric: true,
        render: (v) => (
            <Accounting
                className={Number(v) > 0 ? "text-app-fg pr-2" : "text-app-fg/30 pr-2"}
            >
                {v}
            </Accounting>
        ),
    },
    {
        key: "total_received_quantity",
        label: "Received",
        width: "12%",
        align: "right",
        isNumeric: true,
        render: (v) => (
            <Accounting className="text-text-primary pr-2">
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
            <div className="flex justify-center">
                <StatusBadge
                    status={String(v || "Pending").toLowerCase() as any}
                />
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
                icon: <FileText size={18} />,
                variant: "primary",
            },
            {
                title: "Open Orders",
                value: initialStats?.open_orders_count || 0,
                icon: <Package size={18} />,
                variant: "success",
            },
            {
                title: "Pending Approval",
                value: initialStats?.pending_approval_count || 0,
                icon: <Clock size={18} />,
                variant: "warning",
            },
            {
                title: "Total Value",
                value: formatIndianCurrency(initialStats?.total_value_ytd || 0),
                icon: <IndianRupee size={18} />,
                variant: "primary",
                // progress: 75, // Removed dummy data
            },
        ],
        [initialPOs.length, initialStats]
    );

    const handleSearch = useCallback((val: string) => {
        setSearchQuery(val);
        setPage(1); // Reset to first page on search
    }, []);

    const toolbar = (
        <div className="surface-glass p-3 rounded-2xl shadow-lg border border-white/20 mb-6 backdrop-blur-xl">
            <Flex align="center" justify="between" className="w-full" gap={4}>
                <SearchBar
                    value={searchQuery}
                    onChange={handleSearch}
                    placeholder="Search orders, items, or status..."
                    className="w-full max-w-sm bg-surface-sunken/40 border-none shadow-inner"
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
                        className="min-w-[140px] whitespace-nowrap shadow-sm"
                    >
                        <Upload size={16} />
                        Upload PO
                    </Button>

                    <Button
                        variant="primary"
                        onClick={() => router.push("/po/create")}
                        className="min-w-[170px] whitespace-nowrap shadow-md"
                    >
                        <Plus size={18} />
                        Create PO
                    </Button>
                </Flex>
            </Flex>
        </div>
    );

    return (
        <ListPageTemplate
            title="Purchase Orders"
            subtitle="Manage procurement contracts and track delivery schedules."
            icon={<ShoppingCart size={22} />}
            iconLayoutId="po-icon"
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

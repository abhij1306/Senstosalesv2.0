"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    Upload,
    CheckCircle2,
    XCircle,
    Trash2,
    Layers,
    AlertCircle,
    ChevronRight,
} from "lucide-react";
import { api, SRVListItem, SRVStats } from "@/lib/api";
import { formatDate, cn } from "@/lib/utils";
import { useUpload } from "@/components/providers/UploadContext";
import {
    Body,
    SmallText,
    Accounting,
    Button,
    ListPageTemplate,
    type Column,
    Flex,
} from "@/components/design-system";
import { SearchBar } from "@/components/design-system/molecules/SearchBar";
import { type SummaryCardProps } from "@/components/design-system/organisms/SummaryCards";

interface SRVListClientProps {
    initialSRVs: SRVListItem[];
    initialStats: SRVStats | null;
}

export function SRVListClient({ initialSRVs, initialStats }: SRVListClientProps) {
    // const router = useRouter();
    const [srvs, setSrvs] = useState<SRVListItem[]>(initialSRVs);
    const [stats, setStats] = useState<SRVStats | null>(initialStats);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const pageSize = 10;

    const { startUpload } = useUpload();
    const [searchQuery, setSearchQuery] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const [srvData, statsData] = await Promise.all([api.listSRVs(), api.getSRVStats()]);
            setSrvs(srvData);
            setStats(statsData);
        } catch {
            // console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files);
            startUpload(files, "SRV");
            e.target.value = "";
        }
    }, [startUpload]);

    const handleDelete = useCallback(
        async (srvNumber: string) => {
            if (!confirm(`Permanently delete SRV #${srvNumber}?`)) return;
            try {
                await api.deleteSRV(srvNumber);
                await loadData();
            } catch {
                // console.error(err);
            }
        },
        [loadData]
    );

    const columns: Column<SRVListItem>[] = useMemo(
        () => [
            {
                key: "srv_number",
                label: "SRV VOUCHER",
                width: "15%",
                render: (v) => (
                    <Link href={`/srv/${v}`} className="group flex items-center gap-1">
                        <Body className="font-semibold text-[var(--color-sys-brand-primary)] group-hover:underline">
                            {String(v)}
                        </Body>
                        <ChevronRight
                            size={12}
                            className="text-[var(--color-sys-brand-primary)]/50 group-hover:text-[var(--color-sys-brand-primary)] transition-colors"
                        />
                    </Link>
                ),
            },
            {
                key: "srv_date",
                label: "DATE",
                width: "12%",
                render: (v) => (
                    <Body className="text-[var(--color-sys-text-secondary)]">{formatDate(v as string)}</Body>
                ),
            },
            {
                key: "po_number",
                label: "PO REFERENCE",
                width: "12%",
                render: (v, row) => (
                    <Flex align="center" gap={2}>
                        <Link
                            href={`/po/${v}`}
                            className="px-2 py-1 rounded-full bg-[var(--color-sys-bg-tertiary)]/50 text-[var(--color-sys-text-secondary)] hover:bg-[var(--color-sys-bg-tertiary)] transition-colors border-none flex items-center gap-1.5"
                        >
                            <SmallText className="font-bold leading-none">
                                #{String(v)}
                            </SmallText>
                        </Link>
                        {!row.po_found && (
                            <AlertCircle size={14} className="text-[var(--color-sys-status-error)]" />
                        )}
                    </Flex>
                ),
            },
            {
                key: "total_accepted_qty",
                label: "ACCEPTED",
                align: "right",
                width: "12%",
                isNumeric: true,
                render: (v) => (
                    <Accounting variant="success" className="text-right block">
                        {v}
                    </Accounting>
                ),
            },
            {
                key: "total_rejected_qty",
                label: "REJECTED",
                align: "right",
                width: "12%",
                isNumeric: true,
                render: (v) => (
                    <Accounting
                        className={cn(
                            "text-right block",
                            Number(v) > 0
                                ? "text-[var(--color-sys-status-error)]"
                                : "text-[var(--color-sys-text-tertiary)]"
                        )}
                    >
                        {v}
                    </Accounting>
                ),
            },
            {
                key: "actions",
                label: "",
                width: "5%",
                render: (_, row) => (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(row.srv_number)}
                        className="text-[var(--color-sys-text-tertiary)] hover:text-white hover:bg-rose-500 transition-all"
                    >
                        <Trash2 size={14} />
                    </Button>
                ),
            },
        ],
        [handleDelete]
    );

    const summaryCards: SummaryCardProps[] = useMemo(
        () => [
            {
                title: "Active Vouchers",
                value: stats?.total_srvs || srvs.length,
                icon: <Layers size={20} />,
                variant: "primary",
            },
            {
                title: "Accepted Volume",
                value: stats?.total_received_qty || 0,
                icon: <CheckCircle2 size={20} />,
                variant: "success",
            },
            {
                title: "Rejection Rate",
                value: `${stats?.rejection_rate || 0}%`,
                icon: <XCircle size={20} />,
                variant: "error",
            },
        ],
        [stats, srvs.length]
    );

    const filteredData = useMemo(() => {
        if (!searchQuery) return srvs;
        const q = searchQuery.toLowerCase();
        return srvs.filter(
            (s) => s.srv_number?.toLowerCase().includes(q) || s.po_number?.toString().includes(q)
        );
    }, [srvs, searchQuery]);

    const handleUploadClick = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const handleSearch = useCallback((val: string) => {
        setSearchQuery(val);
        setPage(1);
    }, []);

    const toolbar = (
        <Flex align="center" justify="between" className="w-full" gap={4}>
            <SearchBar
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Filter by SRV or PO..."
                className="w-80"
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
                <Button variant="default" onClick={handleUploadClick} className="shadow-lg shadow-sys-brand-primary/20">
                    <Upload size={16} className="mr-2" />
                    Upload SRV
                </Button>
            </Flex>
        </Flex>
    );

    return (
        <ListPageTemplate
            title="MATERIAL RECEIPTS"
            subtitle="Comprehensive audit trail for Stores Receipt Vouchers (SRV)"
            columns={columns}
            data={filteredData}
            loading={loading}
            keyField="srv_number"
            summaryCards={summaryCards}
            toolbar={toolbar}
            page={page}
            pageSize={pageSize}
            totalItems={filteredData.length}
            onPageChange={(newPage) => setPage(newPage)}
            emptyMessage="No SRVs found"
            density="compact"
        />
    );
}

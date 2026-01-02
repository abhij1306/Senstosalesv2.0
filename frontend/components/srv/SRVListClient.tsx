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
    Badge,
    DataTable,
    Flex,
    Stack,
    SummaryCards,
    InspectionManifest,
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

    const groupedSRVs = useMemo(() => {
        const groups: Record<string, {
            po_number: string;
            po_found: boolean;
            total_ord: number;
            total_recd: number;
            total_rejd: number;
            last_srv_date: string;
            po_status: string;
            srvs: SRVListItem[];
        }> = {};

        srvs.forEach(s => {
            const po = String(s.po_number);
            if (!groups[po]) {
                groups[po] = {
                    po_number: po,
                    po_found: s.po_found ?? true,
                    total_ord: s.total_order_qty, // First SRV gives a baseline, though it might be partial.
                    // In a better system, we'd fetch PO totals directly.
                    total_recd: 0,
                    total_rejd: 0,
                    last_srv_date: s.srv_date,
                    po_status: s.total_received_qty >= s.total_order_qty ? "Closed" : (s.total_received_qty > 0 ? "Pending" : "Draft"),
                    srvs: []
                };
            }

            groups[po].total_recd += s.total_received_qty;
            groups[po].total_rejd += s.total_rejected_qty;
            if (new Date(s.srv_date) > new Date(groups[po].last_srv_date)) {
                groups[po].last_srv_date = s.srv_date;
            }
            groups[po].srvs.push(s);
        });

        return Object.values(groups).sort((a, b) =>
            new Date(b.last_srv_date).getTime() - new Date(a.last_srv_date).getTime()
        );
    }, [srvs]);

    const filteredData = useMemo(() => {
        if (!searchQuery) return groupedSRVs;
        const q = searchQuery.toLowerCase();
        return groupedSRVs.filter(
            (g) => g.po_number.toLowerCase().includes(q) ||
                g.srvs.some(s => s.srv_number.toLowerCase().includes(q))
        );
    }, [groupedSRVs, searchQuery]);

    const poColumns: Column<any>[] = useMemo(
        () => [
            {
                key: "po_number",
                label: "PO",
                width: "25%",
                render: (v, row) => (
                    <Flex align="center" gap={3}>
                        <Link href={`/po/${v}`} className="group flex items-center gap-1.5 p-1 px-2 rounded-lg bg-app-accent/5 border border-app-accent/10 transition-all hover:bg-app-accent/10">
                            <Body className="text-app-accent tracking-tight">#{v}</Body>
                            {!row.po_found && <AlertCircle size={14} className="text-app-status-error" />}
                        </Link>
                    </Flex>
                )
            },
            {
                key: "last_srv_date",
                label: "DATE",
                width: "15%",
                render: (v) => <SmallText className="font-mono text-app-fg-muted">{formatDate(v as string)}</SmallText>
            },
            {
                key: "total_ord",
                label: "ORD",
                width: "15%",
                align: "right",
                render: (v) => <Accounting className="text-right block">{v}</Accounting>
            },
            {
                key: "total_recd",
                label: "REC",
                width: "15%",
                align: "right",
                render: (v) => <Accounting variant="highlight" className="text-right block">{v}</Accounting>
            },
            {
                key: "total_rejd",
                label: "REJ",
                width: "15%",
                align: "right",
                render: (v) => (
                    <Accounting
                        className={cn("text-right block", Number(v) > 0 ? "text-app-status-error" : "text-app-fg-muted/40")}
                    >
                        {v}
                    </Accounting>
                )
            },
            {
                key: "po_status",
                label: "STATUS",
                width: "15%",
                align: "right",
                render: (v) => (
                    <Badge variant={
                        v === "Closed" ? "success" :
                            v === "Pending" ? "warning" :
                                v === "Delivered" ? "accent" : "secondary"
                    }>
                        {v}
                    </Badge>
                )
            }
        ],
        []
    );

    const renderSRVSubTable = (poGroup: any) => {
        const srvColumns: Column<SRVListItem>[] = [
            {
                key: "srv_number",
                label: "SRV #",
                width: "25%",
                render: (v) => (
                    <div className="flex items-center gap-2 pl-[42px]">
                        <span className="text-app-fg-muted opacity-30" style={{ fontSize: '10px' }}>↳</span>
                        <Link href={`/srv/${v}`} className="flex items-center gap-2 group">
                            <Body className="text-app-accent group-hover:underline font-mono">{v}</Body>
                            <ChevronRight size={10} className="text-app-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                    </div>
                )
            },
            {
                key: "srv_date",
                label: "DATE",
                width: "15%",
                render: (v) => <SmallText className="font-mono text-app-fg-muted/60">{formatDate(v as string)}</SmallText>
            },
            {
                key: "total_order_qty",
                label: "Order",
                width: "15%",
                align: "right",
                render: (v) => <Accounting className="text-app-fg-muted">{v}</Accounting>
            },
            {
                key: "total_received_qty",
                label: "Received",
                width: "15%",
                align: "right",
                render: (v) => <Accounting className="text-app-accent">{v}</Accounting>
            },
            {
                key: "total_rejected_qty",
                label: "Rejected",
                width: "15%",
                align: "right",
                render: (v) => <Accounting className={cn(Number(v) > 0 ? "text-app-status-error" : "text-app-fg-muted/20")}>{v}</Accounting>
            },
            {
                key: "status_spacer",
                label: "",
                width: "15%",
                render: () => <div />
            }
        ];

        return (
            <div className="bg-app-border/10 py-1 border-y border-app-border/10">
                <DataTable
                    columns={srvColumns}
                    data={poGroup.srvs}
                    keyField="srv_number"
                    density="compact"
                    hideHeader
                />
            </div>
        );
    };


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
                placeholder="Find PO or Voucher..."
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
                <Button
                    variant="primary"
                    onClick={handleUploadClick}
                    className="h-10 px-6 font-black uppercase tracking-widest active-glow shadow-lg shadow-app-accent/20 rounded-xl"
                >
                    <Upload size={16} className="mr-2" />
                    Provision SRV
                </Button>
            </Flex>
        </Flex>
    );

    const summaryCards = [
        {
            title: "Active Vouchers",
            value: stats?.total_srvs || 0,
            variant: "primary" as const
        },
        {
            title: "Receipt Volume",
            value: `${(stats?.total_received_qty || 0).toLocaleString()} MT`,
            variant: "success" as const,
            trend: { value: "Fully Received", direction: "neutral" as const }
        },
        {
            title: "Rejection Rate",
            value: `${stats?.rejection_rate || 0}%`,
            variant: Number(stats?.rejection_rate || 0) > 0 ? ("error" as const) : ("default" as const)
        },
    ];

    return (
        <ListPageTemplate
            title="MATERIAL RECEIPTS"
            subtitle="Order-centric audit trail for Stores Receipt Vouchers (SRV)"
            columns={poColumns}
            data={filteredData}
            loading={loading}
            keyField="po_number"
            toolbar={toolbar}
            summaryCards={summaryCards}
            page={page}
            pageSize={pageSize}
            totalItems={filteredData.length}
            onPageChange={(newPage) => setPage(newPage)}
            emptyMessage="No receipts found"
            density="compact"
            renderSubRow={renderSRVSubTable}
        />
    );
}

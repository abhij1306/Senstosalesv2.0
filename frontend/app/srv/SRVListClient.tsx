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
    Box,
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
    StatusBadge,
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
    const router = useRouter();
    const [srvs, setSrvs] = useState<SRVListItem[]>(initialSRVs);
    const [stats, setStats] = useState<SRVStats | null>(initialStats);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const pageSize = 20; // Increased for flat list

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

    // Flatten Data: Group by PO, then interleave PO Header + SRV Rows
    const flatData = useMemo(() => {
        const groups: Record<string, {
            type: "PO_HEADER";
            id: string; // Unique key
            po_number: string;
            po_found: boolean;
            total_ord: number;
            total_recd: number;
            total_rejd: number;
            last_srv_date: string;
            po_status: string;
            srvs: SRVListItem[];
        }> = {};

        // 1. Group
        srvs.forEach(s => {
            const po = String(s.po_number);
            if (!groups[po]) {
                groups[po] = {
                    type: "PO_HEADER",
                    id: `PO-${po}`,
                    po_number: po,
                    po_found: s.po_found ?? true,
                    total_ord: s.total_order_qty,
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

        // 2. Flatten
        const flatList: any[] = [];
        const sortedGroups = Object.values(groups).sort((a, b) =>
            new Date(b.last_srv_date).getTime() - new Date(a.last_srv_date).getTime()
        );

        sortedGroups.forEach(group => {
            // Add Header
            flatList.push(group);
            // Add Children (SRVs)
            // Filter by search if needed, but searching parent usually shows all children
            // If searching by SRV#, we might want to filter children?
            // Current logic: If PO matches OR any SRV matches.
            // Simplified: If group matches search, show all.
            group.srvs.forEach(srv => {
                flatList.push({
                    type: "SRV_ITEM",
                    id: `SRV-${srv.srv_number}`,
                    ...srv
                });
            });
        });

        return flatList;
    }, [srvs]);

    const filteredData = useMemo(() => {
        if (!searchQuery) return flatData;
        const q = searchQuery.toLowerCase();

        // Naive filter on flat data might break hierarchy. 
        // Better: Filter groups first, then flatten.
        // Re-implementing filter logic inside the flattened structure is complex.
        // Alternative: Filter the flat list but keep structure? 
        // Let's stick to: If PO matches, keep PO and all SRVs. If SRV matches, keep that SRV and its PO?
        // Simpler for now: Filter normally.
        return flatData.filter(item => {
            if (item.type === "PO_HEADER") {
                return item.po_number.toLowerCase().includes(q);
            }
            return item.srv_number.toLowerCase().includes(q) || String(item.po_number).toLowerCase().includes(q);
        });
    }, [flatData, searchQuery]);


    const columns: Column<any>[] = useMemo(
        () => [
            {
                key: "po_number",
                label: "PO / SRV Reference",
                width: "25%",
                render: (v, row) => {
                    if (row.type === "PO_HEADER") {
                        return (
                            <Flex align="center" gap={3}>
                                <Link href={`/po/${row.po_number}`} className="group flex items-center gap-1.5 p-1 px-2 rounded-lg bg-app-accent/5 border-none elevation-1 transition-all hover:bg-app-accent/10">
                                    <Body className="text-app-accent tracking-tight font-semibold">#{row.po_number}</Body>
                                    {!row.po_found && <AlertCircle size={14} className="text-app-status-error" />}
                                </Link>
                            </Flex>
                        );
                    } else {
                        return (
                            <div className="flex items-center gap-2 pl-[42px] relative">
                                <div className="absolute left-[20px] top-1/2 -translate-y-1/2 w-4 h-[1px] bg-app-border/40" />
                                <div className="absolute left-[20px] top-[-50%] bottom-1/2 w-[1px] bg-app-border/40" />
                                <Link href={`/srv/${row.srv_number}`} className="flex items-center gap-2 group">
                                    <Body className="text-app-fg-muted group-hover:text-app-accent group-hover:underline font-mono text-sm">{row.srv_number}</Body>
                                </Link>
                            </div>
                        );
                    }
                }
            },
            {
                key: "last_srv_date",
                label: "Date",
                width: "15%",
                render: (v, row) => {
                    const date = row.type === "PO_HEADER" ? row.last_srv_date : row.srv_date;
                    return <SmallText className="font-mono text-app-fg-muted">{formatDate(date)}</SmallText>;
                }
            },
            {
                key: "total_ord",
                label: "Ordered",
                width: "15%",
                align: "right",
                render: (v, row) => {
                    const val = row.type === "PO_HEADER" ? row.total_ord : row.total_order_qty;
                    return <Accounting className="text-right block text-app-fg-muted">{val}</Accounting>;
                }
            },
            {
                key: "total_recd",
                label: "Received", // Renamed from REC
                width: "15%",
                align: "right",
                render: (v, row) => {
                    const val = row.type === "PO_HEADER" ? row.total_recd : row.total_received_qty;
                    return <Accounting variant={row.type === "PO_HEADER" ? "highlight" : "default"} className={cn("text-right block", row.type === "SRV_ITEM" && "text-app-fg")}>{val}</Accounting>;
                }
            },
            {
                key: "total_rejd",
                label: "Rejected",
                width: "15%",
                align: "right",
                render: (v, row) => {
                    const val = row.type === "PO_HEADER" ? row.total_rejd : row.total_received_qty;
                    return (
                        <Accounting
                            className={cn("text-right block", Number(val) > 0 ? "text-app-status-error" : "text-app-fg-muted/40")}
                        >
                            {val}
                        </Accounting>
                    );
                }
            },
            {
                key: "po_status",
                label: "Status",
                width: "15%",
                align: "center",
                render: (v, row) => {
                    if (row.type === "PO_HEADER") {
                        return (
                            <div className="flex justify-center w-full">
                                <StatusBadge
                                    status={String(v).toUpperCase()}
                                    className="bg-app-overlay/5 border-none shadow-none"
                                />
                            </div>
                        );
                    }
                    return null;
                }
            }
        ],
        []
    );

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
                    className="h-9 px-6 font-medium active-glow shadow-lg shadow-blue-600/25 rounded-full bg-blue-600 hover:bg-blue-700"
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
            value: (stats?.total_received_qty || 0).toLocaleString(),
            variant: "success" as const,
        },
        {
            title: "Rejection Rate",
            value: `${stats?.rejection_rate || 0}%`,
            variant: Number(stats?.rejection_rate || 0) > 0 ? ("error" as const) : ("default" as const)
        },
    ];

    return (
        <ListPageTemplate
            title="SRV Ingestion"
            subtitle="Order-centric audit trail for Stores Receipt Vouchers (SRV)"
            icon={<Box size={22} />}
            iconLayoutId="srv-icon"
            columns={columns}
            data={filteredData}
            loading={loading}
            keyField="id"
            toolbar={toolbar}
            summaryCards={summaryCards}
            page={page}
            pageSize={pageSize}
            totalItems={filteredData.length}
            onPageChange={(newPage) => setPage(newPage)}
            emptyMessage="No receipts found"
            density="normal"
        />
    );
}

"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    Receipt,
    Plus,
    TrendingUp,
    Clock,
    Activity,
    CheckCircle,
    Boxes,
    FileCheck,
} from "lucide-react";
import { api, InvoiceListItem, InvoiceStats } from "@/lib/api";
import { formatDate, formatIndianCurrency } from "@/lib/utils";
import { useDebouncedValue } from "@/lib/hooks/useDebounce";
import {
    Body,
    SmallText,
    Accounting,
    StatusBadge,
    ListPageTemplate,
    type SummaryCardProps,
    type Column,
    Button,
    Flex,
    Box,
    Label,
} from "@/components/design-system";
import { SearchBar } from "@/components/design-system/molecules/SearchBar";

const columns: Column<InvoiceListItem>[] = [
    {
        key: "invoice_number",
        label: "INVOICE #",
        sortable: true,
        width: "12%",
        render: (_value, inv) => (
            <Link
                href={`/invoice/${encodeURIComponent(inv.invoice_number)}`}
                className="block group"
            >
                <Accounting className="text-app-accent tracking-tight group-hover:underline underline-offset-4 decoration-2">
                    {inv.invoice_number}
                </Accounting>
            </Link>
        ),
    },
    {
        key: "invoice_date",
        label: "DATE",
        sortable: true,
        width: "10%",
        render: (v) => (
            <Body className="text-app-fg-muted font-bold text-[13px] whitespace-nowrap">
                {formatDate(String(v))}
            </Body>
        ),
    },
    {
        key: "dc_number",
        label: "LINKED DCS",
        width: "14%",
        render: (v) => (
            <Flex wrap gap={1}>
                {String(v) && String(v) !== "null" && String(v) !== "undefined" ? (
                    String(v)
                        .split(",")
                        .map((dc: string, i: number) => (
                            <Link
                                key={i}
                                href={`/dc/${dc.trim()}`}
                                className="no-underline"
                            >
                                <Box className="px-2 py-0.5 rounded-lg bg-app-accent/10 text-app-accent cursor-pointer hover:bg-app-accent/20 transition-all shadow-sm">
                                    <Accounting className="text-inherit leading-none text-[10px] tracking-tight">{dc.trim()}</Accounting>
                                </Box>
                            </Link>
                        ))
                ) : (
                    <SmallText className="italic font-medium text-app-fg-muted/50">Direct</SmallText>
                )}
            </Flex>
        ),
    },
    {
        key: "po_numbers",
        label: "LINKED POS",
        width: "14%",
        render: (v) => (
            <Flex wrap gap={1}>
                {String(v) && String(v) !== "null" ? (
                    String(v)
                        .split(",")
                        .map((po: string, i: number) => (
                            <Link
                                key={i}
                                href={`/po/${po.trim()}`}
                                className="no-underline"
                            >
                                <Box className="px-2 py-0.5 rounded-lg bg-app-overlay/5 text-app-fg-muted border border-app-border/10 cursor-pointer hover:bg-app-overlay/10 transition-all shadow-sm">
                                    <Accounting className="text-inherit leading-none text-[10px] tracking-tight">{po.trim()}</Accounting>
                                </Box>
                            </Link>
                        ))
                ) : (
                    <SmallText className="italic font-medium text-app-fg-muted/50">Direct</SmallText>
                )}
            </Flex>
        ),
    },
    {
        key: "total_items",
        label: "ITEMS",
        width: "6%",
        align: "right",
        isNumeric: true,
        render: (v) => (
            <Accounting className="text-right pr-2">
                {v}
            </Accounting>
        ),
    },
    {
        key: "total_dispatched_quantity",
        label: "DLV",
        width: "8%",
        align: "right",
        isNumeric: true,
        render: (v) => (
            <Accounting variant="success" className="text-right pr-2">
                {v}
            </Accounting>
        ),
    },
    {
        key: "total_received_quantity",
        label: "RECD",
        width: "8%",
        align: "right",
        isNumeric: true,
        render: (v) => (
            <Accounting variant="highlight" className="text-app-accent text-right pr-2">
                {v}
            </Accounting>
        ),
    },
    {
        key: "total_invoice_value",
        label: "VALUE",
        sortable: true,
        align: "right",
        width: "12%",
        isCurrency: true,
        render: (v) => (
            <Accounting className="text-app-fg text-right pr-2" isCurrency>
                {v}
            </Accounting>
        ),
    },
    {
        key: "status",
        label: "STATUS",
        sortable: true,
        width: "10%",
        align: "center",
        render: (v) => (
            <div className="flex justify-center">
                <StatusBadge status={String(v || "Pending")} className="w-24 shadow-sm" />
            </div>
        ),
    },
];

interface InvoiceListClientProps {
    initialInvoices: InvoiceListItem[];
    initialStats: InvoiceStats | null;
}

export function InvoiceListClient({ initialInvoices, initialStats }: InvoiceListClientProps) {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearch = useDebouncedValue(searchQuery, 300);
    const [page, setPage] = useState(1);
    const pageSize = 10;

    const filteredInvoices = useMemo(() => {
        const term = debouncedSearch.toLowerCase();
        return initialInvoices.filter(
            (inv) =>
                inv.invoice_number.toLowerCase().includes(term) ||
                (inv.customer_gstin && inv.customer_gstin.toLowerCase().includes(term))
        );
    }, [initialInvoices, debouncedSearch]);

    const summaryCards = useMemo(
        (): SummaryCardProps[] => [
            {
                title: "Total Documents",
                value: initialInvoices.length,
                icon: <Boxes size={20} />,
                variant: "primary",
            },
            {
                title: "Revenue Confirmed",
                value: formatIndianCurrency(initialStats?.total_invoiced || 0),
                icon: <FileCheck size={20} />,
                variant: "success",
            },
            {
                title: "Outstanding",
                value: formatIndianCurrency(initialStats?.pending_payments || 0),
                icon: <Clock size={20} />,
                variant: "warning",
            },
            {
                title: "YTD Billings",
                value: formatIndianCurrency(initialStats?.total_invoiced || 0),
                icon: <TrendingUp size={20} />,
                variant: "primary",
            },
        ],
        [initialInvoices.length, initialStats]
    );

    const handleSearch = useCallback((val: string) => {
        setSearchQuery(val);
        setPage(1);
    }, []);

    const toolbar = (
        <Flex align="center" justify="between" className="w-full" gap={4}>
            <SearchBar
                id="invoice-search"
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Search invoices or GSTIN..."
                className="w-full max-w-sm"
            />

            <Button
                color="primary"
                size="sm"
                onClick={() => router.push("/invoice/create")}
                className="min-w-[140px] shadow-premium active:scale-95 transition-all"
            >
                <Plus size={16} className="mr-2" />
                <Body className="text-app-fg-inverse uppercase tracking-widest">New Invoice</Body>
            </Button>
        </Flex>
    );

    return (
        <ListPageTemplate
            title="GST INVOICES"
            subtitle="Manage all billing documentation and compliance"
            toolbar={toolbar}
            summaryCards={summaryCards}
            columns={columns}
            data={filteredInvoices}
            keyField="invoice_number"
            page={page}
            pageSize={pageSize}
            totalItems={filteredInvoices.length}
            onPageChange={(newPage) => setPage(newPage)}
            emptyMessage="No invoices found"
            density="compact"
        />
    );
}

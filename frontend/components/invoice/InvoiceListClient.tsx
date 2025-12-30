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
                className="block"
            >
                <Body className="text-app-accent hover:underline font-semibold">
                    {inv.invoice_number}
                </Body>
            </Link>
        ),
    },
    {
        key: "invoice_date",
        label: "DATE",
        sortable: true,
        width: "10%",
        render: (v) => (
            <Body className="text-[var(--color-sys-text-tertiary)] whitespace-nowrap">
                {formatDate(String(v))}
            </Body>
        ),
    },
    {
        key: "linked_dc_numbers",
        label: "Linked DCs",
        width: "14%",
        render: (v) => (
            <Flex wrap gap={1}>
                {String(v) && String(v) !== "null" ? (
                    String(v)
                        .split(",")
                        .map((dc: string, i: number) => (
                            <Link
                                key={i}
                                href={`/dc/${dc.trim()}`}
                                className="no-underline"
                            >
                                <Box className="px-1.5 py-0.5 rounded-full bg-[var(--color-sys-brand-primary)]/10 text-[var(--color-sys-brand-primary)] cursor-pointer hover:bg-[var(--color-sys-brand-primary)]/20 transition-colors">
                                    <SmallText className="text-inherit leading-none font-bold">{dc.trim()}</SmallText>
                                </Box>
                            </Link>
                        ))
                ) : (
                    <SmallText className="italic">Direct</SmallText>
                )}
            </Flex>
        ),
    },
    {
        key: "po_numbers",
        label: "Linked POs",
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
                                <Box className="px-1.5 py-0.5 rounded-full bg-[var(--color-sys-bg-tertiary)]/50 text-[var(--color-sys-text-secondary)] border-none cursor-pointer hover:bg-[var(--color-sys-bg-tertiary)] transition-colors">
                                    <SmallText className="text-inherit leading-none font-bold">{po.trim()}</SmallText>
                                </Box>
                            </Link>
                        ))
                ) : (
                    <SmallText className="italic">Direct</SmallText>
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
            <Accounting className="text-right block">
                {Number(v) || 0}
            </Accounting>
        ),
    },
    {
        key: "total_ordered_quantity",
        label: "ORD",
        width: "8%",
        align: "right",
        isNumeric: true,
        render: (v) => (
            <Accounting className="text-[var(--color-sys-text-tertiary)] text-right block">
                {v || "-"}
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
            <Accounting variant="success" className="text-right block">
                {Number(v) || "-"}
            </Accounting>
        ),
    },
    {
        key: "total_pending_quantity",
        label: "BAL",
        width: "8%",
        align: "right",
        isNumeric: true,
        render: (v) => (
            <Accounting variant="warning" className="text-right block">
                {Number(v) || "-"}
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
            <Accounting variant="highlight" className="text-right block">
                {Number(v) || "-"}
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
            <Accounting className="text-sys-primary text-right block">
                {Number(v)}
            </Accounting>
        ),
    },
    {
        key: "status",
        label: "STATUS",
        sortable: true,
        width: "10%",
        align: "center",
        render: (v) => <StatusBadge status={String(v || "Pending")} className="w-24 justify-center" />,
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
                title: "Total Invoices",
                value: initialInvoices.length,
                icon: <Receipt size={20} />,
                variant: "primary",
            },
            {
                title: "Paid Invoices",
                value: formatIndianCurrency(initialStats?.total_invoiced || 0),
                icon: <CheckCircle size={20} />,
                variant: "success",
            },
            {
                title: "Pending Payments",
                value: formatIndianCurrency(initialStats?.pending_payments || 0),
                icon: <Clock size={20} />,
                variant: "warning",
            },
            {
                title: "Total Invoiced",
                value: formatIndianCurrency(initialStats?.total_invoiced || 0),
                icon: <Activity size={20} />,
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
        <Flex align="center" gap={3}>
            <SearchBar
                id="invoice-search"
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Search Invoices..."
                className="w-full max-w-sm"
            />

            <Button
                variant="default"
                size="sm"
                onClick={() => router.push("/invoice/create")}
                className="bg-app-accent text-white hover:brightness-110 shadow-md"
            >
                <Flex align="center" gap={2}>
                    <Plus size={16} />
                    <Body className="text-inherit">New Invoice</Body>
                </Flex>
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

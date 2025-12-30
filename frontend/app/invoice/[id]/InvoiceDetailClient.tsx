"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Printer, FileDown, Receipt } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";
import { formatDate, formatIndianCurrency, amountInWords } from "@/lib/utils";
import { dcRoute } from "@/lib/routes";
import {
    Body,
    SmallText,
    Label,
    Accounting,
    Button,
    Card,
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
    DocumentTemplate,
    type Column,
} from "@/components/design-system";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";

const DataTable = dynamic(
    () =>
        import("@/components/design-system/organisms/DataTable").then(
            (mod) => mod.DataTable,
        ),
    {
        loading: () => (
            <div className="h-64 w-full bg-app-surface-hover rounded-xl animate-pulse" />
        ),
        ssr: false,
    },
);

const DocumentJourney = dynamic(
    () =>
        import("@/components/design-system/molecules/DocumentJourney").then(
            (mod) => mod.DocumentJourney,
        ),
    {
        loading: () => null,
        ssr: false,
    },
);

interface InvoiceDetailClientProps {
    data: any;
}

export default function InvoiceDetailClient({ data }: InvoiceDetailClientProps) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("buyer");

    if (!data || !data.header) return null;

    const { header, items = [] } = data;

    const topActions = (
        <div className="flex gap-3">
            <Button
                variant="secondary"
                size="sm"
                asChild
                className="bg-app-status-success/10 text-app-status-success hover:bg-app-status-success/20"
            >
                <a
                    href={`${API_BASE_URL}/api/invoice/${encodeURIComponent(header.invoice_number)}/download`}
                    target="_blank"
                    rel="noreferrer"
                >
                    <FileDown size={16} className="mr-2" /> Excel
                </a>
            </Button>
            <Button variant="secondary" size="sm" onClick={() => window.print()}>
                <Printer size={16} /> Print
            </Button>
        </div>
    );

    const itemColumns: Column<any>[] = [
        {
            key: "material_code",
            label: "Code",
            width: "12%",
            render: (v) => <Accounting className="text-app-fg-muted">{v}</Accounting>,
        },
        {
            key: "description",
            label: "Description",
            width: "32%",
            render: (_v, row) => (
                <div className="space-y-0.5">
                    <Body className="text-app-fg">
                        {row.material_description || row.description}
                    </Body>
                    {row.drg_no && (
                        <SmallText className="text-app-accent">
                            DRG: {row.drg_no}
                        </SmallText>
                    )}
                </div>
            ),
        },
        {
            key: "ordered_quantity",
            label: "Ord",
            align: "right",
            width: "8%",
            isNumeric: true,
            render: (v: any) => (
                <Accounting className="table-cell-number text-right block">
                    {v}
                </Accounting>
            ),
        },
        {
            key: "dispatched_quantity",
            label: "Dlv",
            align: "right",
            width: "8%",
            isNumeric: true,
            render: (v: any) => (
                <Accounting className="table-cell-number text-right block">
                    {v}
                </Accounting>
            ),
        },
        {
            key: "quantity",
            label: "Inv",
            align: "right",
            width: "8%",
            isNumeric: true,
            render: (v) => (
                <Accounting variant="success" className="text-right block">
                    {v || 0}
                </Accounting>
            ),
        },
        {
            key: "unit",
            label: "Unit",
            width: "6%",
            render: (v) => (
                <SmallText className="text-app-fg-muted uppercase font-bold tracking-[0.1em]">
                    {v}
                </SmallText>
            ),
        },
        {
            key: "rate",
            label: "Rate",
            align: "right",
            width: "10%",
            isCurrency: true,
            render: (v: any) => (
                <Accounting className="table-cell-number text-right block">
                    {formatIndianCurrency(v)}
                </Accounting>
            ),
        },
        {
            key: "amount",
            label: "Amount",
            align: "right",
            width: "10%",
            isCurrency: true,
            render: (v: any) => (
                <Accounting className="table-cell-number text-right block">
                    {formatIndianCurrency(v)}
                </Accounting>
            ),
        },
    ];

    return (
        <DocumentTemplate
            title={`Invoice #${header?.invoice_number || 'N/A'}`}
            description={`${header?.buyer_name || 'N/A'} • ${formatDate(header?.invoice_date || '')}`}
            actions={topActions}
            onBack={() => router.back()}
            layoutId={`inv-title-${header?.invoice_number}`}
            icon={<Receipt size={20} className="text-app-accent" />}
            iconLayoutId={`inv-icon-${header?.invoice_number}`}
        >
            <div className="space-y-6">
                <DocumentJourney currentStage="Invoice" className="mb-2" />

                {/* Invoice Info Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="mb-4 bg-transparent p-0 border-none shadow-none">
                        <TabsTrigger value="buyer">Buyer</TabsTrigger>
                        <TabsTrigger value="references">Order Refs</TabsTrigger>
                        <TabsTrigger value="logistics">Logistics</TabsTrigger>
                    </TabsList>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                        >
                            <Card className="p-6 mt-0 border-none shadow-sm bg-app-surface/50 backdrop-blur-sm relative top-[-1px]">
                                <TabsContent value="buyer" className="mt-0">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-1.5">
                                            <Label>Buyer Name</Label>
                                            <Body className="text-app-fg font-medium">
                                                {header.buyer_name || "-"}
                                            </Body>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label>Buyer GSTIN</Label>
                                            <Accounting>{header.buyer_gstin || "-"}</Accounting>
                                        </div>
                                        <div className="space-y-1.5 col-span-2">
                                            <Label>Buyer Address</Label>
                                            <Body className="text-app-fg font-medium">
                                                {header.buyer_address || "-"}
                                            </Body>
                                        </div>
                                    </div>
                                </TabsContent>
                                <TabsContent value="references" className="mt-0">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-1.5">
                                            <Label>Buyer&apos;s Order No</Label>
                                            <Accounting>{header.buyers_order_no || "-"}</Accounting>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label>Order Date</Label>
                                            <Body className="text-app-fg font-medium">
                                                {header.buyers_order_date
                                                    ? formatDate(header.buyers_order_date)
                                                    : "-"}
                                            </Body>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label>Challan Number</Label>
                                            <Accounting
                                                className="text-app-accent cursor-pointer hover:underline"
                                                onClick={() => router.push(dcRoute(header.dc_number))}
                                            >
                                                {header.dc_number || "-"}
                                            </Accounting>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label>GEMC Number</Label>
                                            <Body className="text-app-fg font-medium">
                                                {header.gemc_number || "-"}
                                            </Body>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label>GEMC Date</Label>
                                            <Body className="text-app-fg font-medium">
                                                {header.gemc_date
                                                    ? formatDate(header.gemc_date)
                                                    : "-"}
                                            </Body>
                                        </div>
                                        <div className="space-y-1.5">
                                            {/* Spacer */}
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label>SRV Number</Label>
                                            <Body className="text-app-fg font-medium">
                                                {header.srv_no || "-"}
                                            </Body>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label>SRV Date</Label>
                                            <Body className="text-app-fg font-medium">
                                                {header.srv_date
                                                    ? formatDate(header.srv_date)
                                                    : "-"}
                                            </Body>
                                        </div>
                                    </div>
                                </TabsContent>
                                <TabsContent value="logistics" className="mt-0">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-1.5">
                                            <Label>Dispatch Through</Label>
                                            <Body className="text-app-fg font-medium">
                                                {header.dispatch_through || "-"}
                                            </Body>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label>Destination</Label>
                                            <Body className="text-app-fg font-medium">
                                                {header.destination || "-"}
                                            </Body>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label>Terms of Delivery</Label>
                                            <Body className="text-app-fg font-medium">
                                                {header.terms_of_delivery || "-"}
                                            </Body>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label>Despatch Document No</Label>
                                            <Body className="text-app-fg font-medium">
                                                {header.despatch_doc_no || "-"}
                                            </Body>
                                        </div>
                                        <div className="space-y-1.5 col-span-2">
                                            <Label>Payment Terms</Label>
                                            <Body className="text-app-fg font-medium">
                                                {header.payment_terms ||
                                                    header.mode_of_payment ||
                                                    "45 Days"}
                                            </Body>
                                        </div>
                                    </div>
                                </TabsContent>
                            </Card>
                        </motion.div>
                    </AnimatePresence>
                </Tabs>

                {/* Items Table */}
                <div className="space-y-3">
                    <SmallText className="m-0 mb-3 text-app-fg-muted uppercase tracking-wider font-bold block">
                        Invoice Items ({items.length})
                    </SmallText>
                    <div className="surface-card bg-app-border/30">
                        <div className="bg-app-surface">
                            <DataTable
                                columns={itemColumns}
                                data={items.map((item: any, idx: number) => ({
                                    ...item,
                                    _uniqueKey: `item-${idx}-${item.id || idx}`,
                                }))}
                                keyField="_uniqueKey"
                                density="compact"
                            />
                        </div>
                    </div>
                </div>

                {/* Totals */}
                <Card className="p-6 bg-[var(--color-sys-bg-secondary)]/50 border-none shadow-sm">
                    <div className="grid grid-cols-2 gap-4 max-w-sm ml-auto">
                        <Label className="uppercase tracking-widest text-app-fg-muted flex items-center">
                            Taxable Value:
                        </Label>
                        <Accounting className="text-right">
                            {formatIndianCurrency(header.total_taxable_value)}
                        </Accounting>
                        <Label className="uppercase tracking-widest text-app-fg-muted flex items-center">
                            CGST @ 9%:
                        </Label>
                        <Accounting className="text-right">
                            {formatIndianCurrency(header.cgst_total)}
                        </Accounting>
                        <Label className="uppercase tracking-widest text-app-fg-muted flex items-center">
                            SGST @ 9%:
                        </Label>
                        <Accounting className="text-right">
                            {formatIndianCurrency(header.sgst_total)}
                        </Accounting>
                        <div className="col-span-2 shadow-inner my-2 h-px bg-app-border/20" />
                        <Label className="text-sys-secondary flex items-center">
                            Grand Total:
                        </Label>
                        <Accounting className="text-right text-app-fg">
                            {formatIndianCurrency(header.total_invoice_value)}
                        </Accounting>
                        <div className="col-span-2 mt-4 space-y-1 bg-[var(--color-sys-bg-surface)]/50 p-3 rounded-lg shadow-sm">
                            <Label className="text-sys-tertiary"> Amount in words </Label>
                            <Body className="text-app-fg-muted italic lowercase first-letter:uppercase">
                                {amountInWords(header.total_invoice_value)} Only
                            </Body>
                        </div>
                    </div>
                </Card>
            </div>
        </DocumentTemplate>
    );
}

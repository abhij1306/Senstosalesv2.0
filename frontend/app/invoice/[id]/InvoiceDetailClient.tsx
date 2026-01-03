"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Printer, FileDown, Receipt, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";
import { formatDate, formatIndianCurrency, cn, amountInWords } from "@/lib/utils";
import { dcRoute } from "@/lib/routes";
import {
    H3,
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
    MonoCode,
} from "@/components/design-system";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { useInvoiceStore } from "@/store/invoiceStore";
import { InvoiceDetail } from "@/types";

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
    data: InvoiceDetail;
}

export default function InvoiceDetailClient({ data: initialData }: InvoiceDetailClientProps) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("buyer");
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

    const {
        data,
        setInvoice,
    } = useInvoiceStore();

    useEffect(() => {
        if (initialData) {
            setInvoice(initialData);
        }
    }, [initialData, setInvoice]);

    // Group items for Parent-Lot hierarchy
    const groupedItems = useMemo(() => {
        if (!data?.items) return [];
        const items = data.items;
        return Object.values(items.reduce((acc, item) => {
            const key = item.description || "item";
            if (!acc[key]) acc[key] = [];
            acc[key].push(item);
            return acc;
        }, {} as Record<string, typeof items>));
    }, [data?.items]);

    const toggleItem = (key: string) => {
        const newSet = new Set(expandedItems);
        if (newSet.has(key)) newSet.delete(key);
        else newSet.add(key);
        setExpandedItems(newSet);
    };

    if (!data || !data.header) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="animate-spin text-app-accent" size={32} />
        </div>
    );

    const { header, items = [] } = data;

    const topActions = (
        <div className="flex gap-3">
            <Button
                variant="excel"
                asChild
            >
                <a
                    href={`${API_BASE_URL}/api/invoice/${encodeURIComponent(header.invoice_number)}/download`}
                    target="_blank"
                    rel="noreferrer"
                >
                    <FileDown size={16} /> Excel
                </a>
            </Button>
            <Button variant="secondary" onClick={() => window.print()}>
                <Printer size={16} /> Print
            </Button>
        </div>
    );

    return (
        <DocumentTemplate
            title={`Invoice #${header?.invoice_number || 'N/A'}`}
            description={`${header?.buyer_name || 'N/A'} • ${formatDate(header?.invoice_date || '')}`}
            actions={topActions}
            onBack={() => router.back()}
            layoutId={`inv-title-${header?.invoice_number}`}
            icon={<Receipt size={22} className="text-system-blue" />}
            iconLayoutId={`inv-icon-${header?.invoice_number}`}
        >
            <div className="space-y-6">
                <DocumentJourney currentStage="Invoice" className="mb-2" />

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="mb-4 bg-blue-500/5 p-1 rounded-xl inline-flex border-none">
                        <TabsTrigger value="buyer">Buyer</TabsTrigger>
                        <TabsTrigger value="references">References</TabsTrigger>
                        <TabsTrigger value="logistics">Logistics</TabsTrigger>
                    </TabsList>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            transition={{ duration: 0.15 }}
                        >
                            <Card className="p-4 mt-0 border-none elevation-2 bg-blue-500/5 backdrop-blur-md">
                                <TabsContent value="buyer" className="mt-0">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-1">
                                            <Label className="uppercase tracking-widest text-app-fg-muted text-[9px] opacity-70">Buyer Name</Label>
                                            <div className="text-text-primary px-3 py-1.5 bg-blue-500/5 rounded-lg border-none text-[12px] font-medium transition-all">
                                                {header.buyer_name || "-"}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="uppercase tracking-widest text-app-fg-muted text-[9px] opacity-70">Buyer GSTIN</Label>
                                            <div className="text-text-primary px-3 py-1.5 bg-blue-500/5 rounded-lg border-none text-[12px] font-medium transition-all">
                                                {header.buyer_gstin || "-"}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="uppercase tracking-widest text-app-fg-muted text-[9px] opacity-70">Billing Address</Label>
                                            <div className="text-text-primary px-3 py-1.5 bg-blue-500/5 rounded-lg border-none min-h-[50px] text-[12px] leading-snug transition-all">
                                                {header.buyer_address || "-"}
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="references" className="mt-0">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-6">
                                        <div className="space-y-1.5"><Label className="uppercase tracking-widest text-app-fg-muted text-[9px] opacity-70">Order Number</Label><Accounting className="text-app-fg text-[12px] font-mono block transition-all">{header.buyers_order_no || "-"}</Accounting></div>
                                        <div className="space-y-1.5"><Label className="uppercase tracking-widest text-app-fg-muted text-[9px] opacity-70">Order Date</Label><Body className="text-app-fg text-[12px] block transition-all">{header.buyers_order_date ? formatDate(header.buyers_order_date) : "-"}</Body></div>
                                        <div className="space-y-1.5"><Label className="uppercase tracking-widest text-app-fg-muted text-[9px] opacity-70">Linked DC</Label><Accounting className="text-app-accent cursor-pointer hover:underline text-[12px] font-mono block transition-all" onClick={() => router.push(header.dc_number ? dcRoute(header.dc_number) : "#")}>{header.dc_number || "-"}</Accounting></div>
                                        <div className="space-y-1.5"><Label className="uppercase tracking-widest text-app-fg-muted text-[9px] opacity-70">Challan Date</Label><Body className="text-app-fg text-[12px] block transition-all">{header.dc_date ? formatDate(header.dc_date) : "-"}</Body></div>
                                        <div className="space-y-1.5"><Label className="uppercase tracking-widest text-app-fg-muted text-[9px] opacity-70">GEMC Number</Label><Body className="text-app-fg text-[12px] block transition-all">{header.gemc_number || "-"}</Body></div>
                                        <div className="space-y-1.5"><Label className="uppercase tracking-widest text-app-fg-muted text-[9px] opacity-70">SRV Number</Label><Body className="text-app-fg text-[12px] block transition-all">{header.srv_no || "-"}</Body></div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="logistics" className="mt-0">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                        <div className="space-y-1.5"><Label className="uppercase tracking-widest text-app-fg-muted text-[9px] opacity-70">Vehicle No</Label><Body className="text-app-fg text-[12px] transition-all">{header.vehicle_no || "-"}</Body></div>
                                        <div className="space-y-1.5"><Label className="uppercase tracking-widest text-app-fg-muted text-[9px] opacity-70">LR Number</Label><Body className="text-app-fg text-[12px] transition-all">{header.lr_no || "-"}</Body></div>
                                        <div className="space-y-1.5"><Label className="uppercase tracking-widest text-app-fg-muted text-[9px] opacity-70">Transporter</Label><Body className="text-app-fg text-[12px] transition-all">{header.transporter || "-"}</Body></div>
                                        <div className="space-y-1.5"><Label className="uppercase tracking-widest text-app-fg-muted text-[9px] opacity-70">Payment Terms</Label><Body className="text-app-fg text-app-accent text-[12px] transition-all">{header.payment_terms || "45 Days"}</Body></div>
                                    </div>
                                </TabsContent>
                            </Card>
                        </motion.div>
                    </AnimatePresence>
                </Tabs>

                {/* Items Table */}
                <div className="space-y-2">
                    <div className="tahoe-glass-card elevation-1 overflow-hidden">
                        <table className="table-standard w-full table-fixed">
                            <thead>
                                <tr className="header-glass">
                                    <th className="py-2.5 px-3 text-center w-[50px] border-none"><Label className="text-[11px] uppercase tracking-widest font-regular opacity-80">#</Label></th>
                                    <th className="py-2.5 px-3 text-left border-none"><Label className="text-[11px] uppercase tracking-widest font-regular opacity-80">Description</Label></th>
                                    <th className="py-2.5 px-3 text-left w-[120px] border-none"><Label className="text-[11px] uppercase tracking-widest font-regular opacity-80">HSN/SAC</Label></th>
                                    <th className="py-2.5 px-3 text-right w-[90px] bg-blue-600/5 dark:bg-blue-400/5 border-none"><Label className="text-app-accent text-[11px] uppercase tracking-widest font-regular opacity-80 block text-right">Qty</Label></th>
                                    <th className="py-2.5 px-3 text-right w-[110px] border-none"><Label className="text-[11px] uppercase tracking-widest font-regular opacity-80 block text-right">Rate</Label></th>
                                    <th className="py-2.5 px-3 text-right w-[130px] bg-blue-600/5 dark:bg-blue-400/5 border-none"><Label className="text-blue-600 dark:text-blue-400 text-[11px] uppercase tracking-widest font-regular opacity-80 block text-right">Taxable</Label></th>
                                    <th className="py-2.5 px-3 w-[50px] border-none"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {groupedItems.map((group, groupIdx) => {
                                    const parent = group[0];
                                    const parentKey = parent.description || `item-${groupIdx}`;
                                    const isExpanded = expandedItems.has(parentKey);
                                    const tQty = group.reduce((sum, i) => sum + (i.quantity || 0), 0);
                                    const tVal = group.reduce((sum, i) => sum + (i.taxable_value || i.amount || 0), 0);

                                    return (
                                        <React.Fragment key={parentKey}>
                                            <tr className={cn("transition-colors border-none", isExpanded ? "bg-blue-500/15" : "bg-blue-500/5")}>
                                                <td className="py-2.5 px-3 w-[50px] text-center border-none">
                                                    <MonoCode className="border-none bg-transparent p-0 text-[11px] opacity-70 font-regular">
                                                        #{groupIdx + 1}
                                                    </MonoCode>
                                                </td>
                                                <td className="py-2.5 px-3 text-left border-none">
                                                    <Body className="text-text-primary text-base font-regular opacity-100 truncate max-w-full" title={parent.description}>
                                                        {parent.description}
                                                    </Body>
                                                    {parent.material_code && (
                                                        <SmallText className="text-text-tertiary uppercase tracking-tighter text-[10px] block opacity-50 mt-0.5">
                                                            Code: {parent.material_code}
                                                        </SmallText>
                                                    )}
                                                </td>
                                                <td className="py-2.5 px-3 w-[120px] text-left border-none">
                                                    <SmallText className="text-text-tertiary uppercase tracking-widest text-[11px] font-regular">{parent.hsn_sac || "-"}</SmallText>
                                                </td>
                                                <td className="py-2.5 px-3 w-[90px] text-right bg-blue-600/5 dark:bg-blue-400/5 border-none">
                                                    <Accounting className="text-base text-app-accent font-regular pr-0 w-full text-right">{tQty}</Accounting>
                                                </td>
                                                <td className="py-2.5 px-3 w-[110px] text-right border-none">
                                                    <Accounting className="text-text-tertiary text-base font-regular pr-0 w-full text-right">{parent.rate?.toFixed(2) || parent.rate}</Accounting>
                                                </td>
                                                <td className="py-2.5 px-3 w-[130px] text-right bg-blue-600/5 dark:bg-blue-400/5 border-none">
                                                    <Accounting className="text-blue-600 dark:text-blue-400 text-base font-regular pr-0 w-full text-right">
                                                        {formatIndianCurrency(tVal)}
                                                    </Accounting>
                                                </td>
                                                <td className="py-2.5 px-3 w-[50px] text-center border-none">
                                                    <button
                                                        onClick={() => toggleItem(parentKey)}
                                                        className="p-1.5 rounded-lg hover:bg-app-accent/10 hover:text-app-accent transition-all text-app-fg-muted/30"
                                                    >
                                                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                    </button>
                                                </td>
                                            </tr>
                                            {isExpanded && group.map((item, idx) => (
                                                <tr key={`${parentKey}-lot-${idx}`} className="bg-transparent border-none">
                                                    <td className="py-2 px-3 text-center w-[50px] border-none">
                                                        <div className="w-[1px] h-4 bg-app-accent/20 mx-auto" />
                                                    </td>
                                                    <td className="py-2 px-3 border-none">
                                                        <div className="flex items-center gap-2">
                                                            <MonoCode className="bg-transparent border-none text-text-secondary text-[10px] font-regular">L-{item.po_sl_no}</MonoCode>
                                                        </div>
                                                    </td>
                                                    <td className="py-2 px-3 w-[120px] border-none" />
                                                    <td className="py-2 px-3 w-[90px] text-right bg-blue-600/5 dark:bg-blue-400/5 border-none">
                                                        <Accounting className="text-sm text-app-accent font-regular pr-0 w-full text-right">{item.quantity}</Accounting>
                                                    </td>
                                                    <td className="py-2 px-3 w-[110px] text-right border-none" />
                                                    <td className="py-2 px-3 w-[130px] text-right bg-blue-600/5 dark:bg-blue-400/5 border-none">
                                                        <Accounting className="text-blue-400 text-sm font-regular pr-0 w-full text-right">{formatIndianCurrency(item.taxable_value || item.amount)}</Accounting>
                                                    </td>
                                                    <td className="w-[50px] border-none" />
                                                </tr>
                                            ))}
                                        </React.Fragment>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Totals */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
                    <div className="lg:col-start-2">
                        <Card className="p-8 bg-blue-500/5 border-none shadow-none elevation-2 backdrop-blur-xl">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center pb-2 border-none">
                                    <Label className="uppercase tracking-wide text-app-fg-muted text-[10px]">Net Taxable Value</Label>
                                    <Accounting className="text-lg font-semibold text-app-fg">{header.total_taxable_value || header.taxable_value}</Accounting>
                                </div>
                                <div className="flex justify-between items-center text-app-fg-muted">
                                    <Label className="uppercase tracking-wide text-[10px]">Total GST (CGST + SGST)</Label>
                                    <Accounting className="text-sm">{((header.cgst_total || header.cgst || 0) + (header.sgst_total || header.sgst || 0)).toFixed(2)}</Accounting>
                                </div>
                                <div className="pt-6 mt-4 border-none flex justify-between items-end">
                                    <div className="space-y-2">
                                        <Label className="uppercase text-app-accent tracking-wide text-[10px]">Grand Total</Label>
                                        <SmallText className="text-app-fg-muted block max-w-[280px] leading-snug italic lowercase first-letter:uppercase text-xs">
                                            {amountInWords(header.total_invoice_value || 0)} Only
                                        </SmallText>
                                    </div>
                                    <Accounting className="text-3xl text-app-fg tracking-tighter leading-none">
                                        {header.total_invoice_value || 0}
                                    </Accounting>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </DocumentTemplate>
    );
}

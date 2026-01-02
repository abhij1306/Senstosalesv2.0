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
                variant="secondary"
                size="sm"
                asChild
                className="bg-app-status-success/10 text-app-status-success hover:bg-app-status-success/20 border-app-status-success/20"
            >
                <a
                    href={`${API_BASE_URL}/api/invoice/${encodeURIComponent(header.invoice_number)}/download`}
                    target="_blank"
                    rel="noreferrer"
                >
                    <FileDown size={16} className="mr-2" /> Excel
                </a>
            </Button>
            <Button variant="secondary" size="sm" onClick={() => window.print()} className="border-app-border/20">
                <Printer size={16} className="mr-2" /> Print
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
            icon={<Receipt size={20} className="text-app-accent" />}
            iconLayoutId={`inv-icon-${header?.invoice_number}`}
        >
            <div className="space-y-6">
                <DocumentJourney currentStage="Invoice" className="mb-2" />

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="mb-4 bg-app-overlay/5 p-1 border border-app-border/10 rounded-xl inline-flex">
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
                            <Card className="p-6 mt-0 border-none shadow-sm bg-app-surface/50 backdrop-blur-md">
                                <TabsContent value="buyer" className="mt-0">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-1.5">
                                            <Label className="uppercase tracking-widest text-app-fg-muted text-[11px] opacity-70">Buyer Name</Label>
                                            <H3 className="text-app-fg text-[15px] font-semibold leading-none">
                                                {header.buyer_name || "-"}
                                            </H3>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="uppercase tracking-widest text-app-fg-muted text-[11px] opacity-70">Buyer GSTIN</Label>
                                            <Accounting className="text-app-accent text-[15px] font-mono leading-none">{header.buyer_gstin || "-"}</Accounting>
                                        </div>
                                        <div className="space-y-1.5 col-span-2 pt-4 border-t border-app-border/5">
                                            <Label className="uppercase tracking-widest text-app-fg-muted text-[11px] opacity-70">Billing Address</Label>
                                            <Body className="text-app-fg text-[14px] leading-relaxed max-w-3xl opacity-90">
                                                {header.buyer_address || "-"}
                                            </Body>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="references" className="mt-0">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                        <div className="space-y-1.5"><Label className="uppercase tracking-widest text-app-fg-muted text-[11px] opacity-70">Order Number</Label><Accounting className="text-app-fg text-[14px] font-mono">{header.buyers_order_no || "-"}</Accounting></div>
                                        <div className="space-y-1.5"><Label className="uppercase tracking-widest text-app-fg-muted text-[11px] opacity-70">Order Date</Label><Body className="text-app-fg text-[14px]">{header.buyers_order_date ? formatDate(header.buyers_order_date) : "-"}</Body></div>
                                        <div className="space-y-1.5"><Label className="uppercase tracking-widest text-app-fg-muted text-[11px] opacity-70">Linked DC</Label><Accounting className="text-app-accent cursor-pointer hover:underline text-[14px] font-mono" onClick={() => router.push(header.dc_number ? dcRoute(header.dc_number) : "#")}>{header.dc_number || "-"}</Accounting></div>
                                        <div className="space-y-1.5"><Label className="uppercase tracking-widest text-app-fg-muted text-[11px] opacity-70">Challan Date</Label><Body className="text-app-fg text-[14px]">{header.dc_date ? formatDate(header.dc_date) : "-"}</Body></div>
                                        <div className="space-y-1.5"><Label className="uppercase tracking-widest text-app-fg-muted text-[11px] opacity-70">GEMC Number</Label><Body className="text-app-fg text-[14px]">{header.gemc_number || "-"}</Body></div>
                                        <div className="space-y-1.5"><Label className="uppercase tracking-widest text-app-fg-muted text-[11px] opacity-70">SRV Number</Label><Body className="text-app-fg text-[14px]">{header.srv_no || "-"}</Body></div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="logistics" className="mt-0">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                        <div className="space-y-1.5"><Label className="uppercase tracking-widest text-app-fg-muted text-[11px] opacity-70">Vehicle No</Label><Body className="text-app-fg text-[14px]">{header.vehicle_no || "-"}</Body></div>
                                        <div className="space-y-1.5"><Label className="uppercase tracking-widest text-app-fg-muted text-[11px] opacity-70">LR Number</Label><Body className="text-app-fg text-[14px]">{header.lr_no || "-"}</Body></div>
                                        <div className="space-y-1.5"><Label className="uppercase tracking-widest text-app-fg-muted text-[11px] opacity-70">Transporter</Label><Body className="text-app-fg text-[14px]">{header.transporter || "-"}</Body></div>
                                        <div className="space-y-1.5"><Label className="uppercase tracking-widest text-app-fg-muted text-[11px] opacity-70">Payment Terms</Label><Body className="text-app-fg text-app-accent text-[14px]">{header.payment_terms || "45 Days"}</Body></div>
                                    </div>
                                </TabsContent>
                            </Card>
                        </motion.div>
                    </AnimatePresence>
                </Tabs>

                {/* Items Table */}
                <div className="space-y-4">
                    <Label className="m-0 text-app-fg-muted uppercase tracking-widest text-[11px] opacity-70">
                        Billing Structure ({items.length} Items)
                    </Label>
                    <div className="table-container shadow-premium-hover border-none bg-app-surface/30">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-app-border/5 bg-app-overlay/5">
                                    <th className="py-3 px-4 w-[60px]"><Label className="text-[11px]">#</Label></th>
                                    <th className="py-3 px-4"><Label className="text-[11px]">Description</Label></th>
                                    <th className="py-3 px-4 w-[120px]"><Label className="text-[11px]">HSN/SAC</Label></th>
                                    <th className="py-3 px-4 text-right w-[100px]"><Label className="text-[11px]">Qty</Label></th>
                                    <th className="py-3 px-4 text-right w-[120px]"><Label className="text-[11px]">Rate</Label></th>
                                    <th className="py-3 px-4 text-right w-[140px] bg-blue-50/10 dark:bg-blue-900/10"><Label className="text-blue-600 dark:text-blue-400 text-[11px]">Taxable</Label></th>
                                    <th className="py-3 px-4 text-right w-[100px]"><Label className="text-[11px]">Recd</Label></th>
                                    <th className="py-3 px-4 w-[50px]"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {groupedItems.map((group, groupIdx) => {
                                    const parent = group[0];
                                    const parentKey = parent.description || `item-${groupIdx}`;
                                    const isExpanded = expandedItems.has(parentKey);
                                    const tQty = group.reduce((sum, i) => sum + (i.quantity || 0), 0);
                                    const tVal = group.reduce((sum, i) => sum + (i.taxable_value || i.amount || 0), 0);
                                    const tRec = group.reduce((sum, i) => sum + (i.received_qty || 0), 0);

                                    return (
                                        <React.Fragment key={parentKey}>
                                            <tr className={cn("transition-colors border-b border-app-border/5", isExpanded ? "bg-app-overlay/10" : "bg-app-overlay/5")}>
                                                <td className="py-3 px-4"><MonoCode className="text-app-accent/60 text-[12px]">#S</MonoCode></td>
                                                <td className="py-3 px-4">
                                                    <Body className="text-app-fg-muted/90 text-[13px] font-medium">{parent.description}</Body>
                                                    {parent.material_code && <SmallText className="text-app-fg-muted/40 uppercase tracking-tighter text-[10px]">Code: {parent.material_code}</SmallText>}
                                                </td>
                                                <td className="py-3 px-4"><SmallText className="text-app-fg-muted/40 uppercase tracking-widest text-[11px]">{parent.hsn_sac || "-"}</SmallText></td>
                                                <td className="py-3 px-4 text-right"><Accounting className="text-app-fg-muted/70 text-[13px]">{tQty}</Accounting></td>
                                                <td className="py-3 px-4 text-right"><Accounting className="text-app-fg-muted/40 text-[13px]">{parent.rate}</Accounting></td>
                                                <td className="py-3 px-4 text-right bg-blue-50/5 dark:bg-blue-900/5"><Accounting className="text-blue-600/60 dark:text-blue-400/60 text-[13px]">{tVal}</Accounting></td>
                                                <td className="py-3 px-4 text-right"><Accounting className="text-app-fg-muted/70 text-[13px]">{tRec}</Accounting></td>
                                                <td className="py-3 px-4 text-center">
                                                    <button onClick={() => toggleItem(parentKey)} className="p-1.5 rounded-md hover:bg-app-accent/10 hover:text-app-accent transition-all text-app-fg-muted/30">
                                                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                    </button>
                                                </td>
                                            </tr>
                                            {isExpanded && group.map((item, idx) => (
                                                <tr key={idx} className="bg-app-surface border-b border-app-border/5">
                                                    <td className="py-2 px-0 relative">
                                                        <div className="absolute left-[30px] top-0 bottom-0 w-[2px] bg-app-accent/20" />
                                                        <div className="flex items-center gap-2 pl-[38px]">
                                                            <span className="text-app-accent/30" style={{ fontSize: '10px' }}>L</span>
                                                            <MonoCode className="text-app-fg-muted text-[11px]">L-{item.po_sl_no}</MonoCode>
                                                        </div>
                                                    </td>
                                                    <td colSpan={2} />
                                                    <td className="py-2 px-4 text-right"><Accounting className="text-app-fg-muted text-[12px]">{item.quantity}</Accounting></td>
                                                    <td className="py-2 px-4 text-right" />
                                                    <td className="py-2 px-4 text-right bg-blue-50/5 dark:bg-blue-900/5">
                                                        <Accounting className="text-blue-600 dark:text-blue-400 text-[12px]">{item.taxable_value || item.amount}</Accounting>
                                                    </td>
                                                    <td className="py-2 px-4 text-right"><Accounting className="text-app-fg-muted text-[12px]">{item.received_qty || 0}</Accounting></td>
                                                    <td />
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
                        <Card className="p-8 bg-app-surface/50 border-none shadow-premium-hover backdrop-blur-xl">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center pb-2 border-b border-app-border/10">
                                    <Label className="uppercase tracking-widest text-app-fg-muted text-[11px]">Net Taxable Value</Label>
                                    <Accounting className="text-lg font-semibold text-app-fg">{header.total_taxable_value || header.taxable_value}</Accounting>
                                </div>
                                <div className="flex justify-between items-center text-app-fg-muted">
                                    <Label className="uppercase tracking-widest text-[11px]">Total GST (CGST + SGST)</Label>
                                    <Accounting className="text-sm">{((header.cgst_total || header.cgst || 0) + (header.sgst_total || header.sgst || 0)).toFixed(2)}</Accounting>
                                </div>
                                <div className="pt-6 mt-4 border-t border-app-border/20 flex justify-between items-end">
                                    <div className="space-y-2">
                                        <Label className="uppercase text-app-accent tracking-widest text-[11px]">Grand Total</Label>
                                        <SmallText className="text-app-fg-muted block max-w-[280px] leading-snug italic lowercase first-letter:uppercase text-[12px]">
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

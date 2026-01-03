"use client";

import React from "react";
import { useState, useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
    FileText,
    Plus,
    Truck,
    FileDown,
} from "lucide-react";
import { api, API_BASE_URL } from "@/lib/api";
import { formatDate, cn } from "@/lib/utils";
import { DCDetail } from "@/types";
import {
    Body,
    Footnote,
    Caption1,
    Caption2,
    Accounting,
    Button,

    DocumentTemplate,
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
    MonoCode,
} from "@/components/design-system";
import { AnimatePresence, motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useDCStore } from "@/store/dcStore";

const DocumentJourney = dynamic(
    () =>
        import("@/components/design-system/molecules/DocumentJourney").then(
            (mod) => mod.DocumentJourney
        ),
    {
        loading: () => <div className="h-6 w-48 bg-app-surface-hover rounded-full animate-pulse" />,
        ssr: false,
    }
);

interface DCDetailClientProps {
    initialData: DCDetail;
    initialInvoiceData: { has_invoice: boolean; invoice_number?: string } | null;
}

export default function DCDetailClient({ initialData, initialInvoiceData }: DCDetailClientProps) {
    const router = useRouter();
    const dcId = initialData.header.dc_number;

    const { data, setDC } = useDCStore();

    useEffect(() => {
        if (initialData) setDC(initialData);
    }, [initialData, setDC]);

    // UI Local State
    const [activeTab, setActiveTab] = useState("basic");

    const hasInvoice = initialInvoiceData?.has_invoice || false;
    const invoiceNumber = initialInvoiceData?.invoice_number || null;

    // Derived state - safe access for hooks
    const items = data?.items || [];

    // Memoized grouping for Parent-Lot hierarchy (Must be called before any return)
    const groupedItems = useMemo(() => {
        return Object.values(items.reduce((acc, item) => {
            const key = item.po_item_id;
            if (!acc[key]) acc[key] = [];
            acc[key].push(item);
            return acc;
        }, {} as Record<string, typeof items>));
    }, [items]);

    if (!data) return null;

    const header = data.header;
    const notes = header.remarks ? header.remarks.split("\n\n") : [];

    // Edit and Delete logic removed for Read-Only View

    const topActions = (
        <div className="flex gap-3">
            <Button
                variant="excel"
                asChild
            >
                <a href={`${API_BASE_URL}/api/dc/${dcId}/download`} target="_blank" rel="noreferrer">
                    <FileDown size={14} />
                    Excel
                </a>
            </Button>
            {hasInvoice && (
                <Button
                    variant="secondary"
                    onClick={() => router.push(`/invoice/${encodeURIComponent(invoiceNumber!)}`)}
                >
                    <FileText size={16} />
                    View Invoice
                </Button>
            )}
            {!hasInvoice && (
                <Button
                    variant="default"
                    className="bg-blue-600 text-white hover:bg-blue-700 hover:text-white border-transparent"
                    onClick={() => router.push(`/invoice/create?dc=${dcId}`)}
                >
                    <Plus size={16} />
                    Create Invoice
                </Button>
            )}
        </div>
    );

    return (
        <DocumentTemplate
            title={`DC #${header.dc_number}`}
            description={`${header.consignee_name} • ${formatDate(header.dc_date)}`}
            actions={topActions}
            onBack={() => router.push("/dc")}
            layoutId={`dc-title-${header.dc_number}`}
            icon={<Truck size={22} className="text-system-blue" />}
            iconLayoutId={`dc-icon-${header.dc_number}`}
        >
            <div className="space-y-6">
                <DocumentJourney currentStage="DC" className="mb-2" />





                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="mb-4 bg-blue-500/5 p-1 rounded-xl w-fit border-none backdrop-blur-sm">
                        <TabsTrigger value="basic">Basic Info</TabsTrigger>
                        <TabsTrigger value="supplier">Supplier</TabsTrigger>
                        <TabsTrigger value="consignee">Consignee</TabsTrigger>
                    </TabsList>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            transition={{ duration: 0.15 }}
                        >
                            <div className="bg-app-surface rounded-xl elevation-2 p-6 mt-0">
                                <TabsContent value="basic" className="mt-0">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-1">
                                            <Caption2 className="text-text-tertiary uppercase tracking-widest text-[9px] opacity-70">DC Number</Caption2>
                                            <div className="text-text-primary px-3 py-1.5 bg-blue-500/5 rounded-lg border-none text-[12px] font-medium transition-all">{header.dc_number}</div>
                                        </div>
                                        <div className="space-y-1">
                                            <Caption2 className="text-text-tertiary uppercase tracking-widest text-[9px] opacity-70">DC Date</Caption2>
                                            <div className="text-text-primary px-3 py-1.5 bg-blue-500/5 rounded-lg border-none text-[12px] transition-all">{header.dc_date}</div>
                                        </div>
                                        <div className="space-y-1">
                                            <Caption2 className="text-text-tertiary uppercase tracking-widest text-[9px] opacity-70">PO Reference</Caption2>
                                            <button
                                                className="w-full text-left px-3 py-1.5 bg-blue-500/5 hover:bg-app-accent/10 rounded-lg border-none text-app-accent font-medium transition-all text-[12px]"
                                                onClick={() => router.push(`/po/${header.po_number}`)}
                                            >
                                                #{header.po_number}
                                            </button>
                                        </div>
                                    </div>
                                </TabsContent>
                                <TabsContent value="supplier" className="mt-0">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-1">
                                            <Caption2 className="text-text-tertiary uppercase tracking-widest text-[9px] opacity-70">Supplier Phone</Caption2>
                                            <div className="text-text-primary px-3 py-1.5 bg-blue-500/5 rounded-lg border-none text-[12px] transition-all">{header.supplier_phone}</div>
                                        </div>
                                        <div className="space-y-1">
                                            <Caption2 className="text-text-tertiary uppercase tracking-widest text-[9px] opacity-70">Supplier GSTIN</Caption2>
                                            <div className="text-text-primary px-3 py-1.5 bg-blue-500/5 rounded-lg border-none text-[12px] transition-all">{header.supplier_gstin}</div>
                                        </div>
                                    </div>
                                </TabsContent>
                                <TabsContent value="consignee" className="mt-0">
                                    <div className="space-y-1">
                                        <Caption2 className="text-text-tertiary uppercase tracking-widest text-[9px] opacity-70">Consignee Name</Caption2>
                                        <div className="text-text-primary px-3 py-2 bg-blue-500/5 rounded-lg border-none">{header.consignee_name}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <Caption2 className="text-text-tertiary uppercase tracking-widest text-[9px] opacity-70">Consignee Address</Caption2>
                                        <div className="text-text-primary px-3 py-1.5 bg-blue-500/5 rounded-lg border-none min-h-[50px] text-[12px] leading-snug transition-all">{header.consignee_address}</div>
                                    </div>
                                </TabsContent>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </Tabs>

                {/* Items Table with Parent-Lot Hierarchy */}
                <div className="space-y-2">
                    <div className="tahoe-glass-card elevation-1 overflow-hidden">
                        <table className="table-standard w-full table-fixed">
                            <thead>
                                <tr className="header-glass">
                                    <th className="py-2.5 px-3 text-center w-[50px] border-none"><Caption1 className="uppercase tracking-widest text-[11px] opacity-80">#</Caption1></th>
                                    <th className="py-2.5 px-3 text-left w-[110px] border-none"><Caption1 className="uppercase tracking-widest text-[11px] opacity-80">Code</Caption1></th>
                                    <th className="py-2.5 px-3 text-left w-[110px] border-none"><Caption1 className="uppercase tracking-widest text-[11px] opacity-80">Drawing</Caption1></th>
                                    <th className="py-2.5 px-3 text-left border-none"><Caption1 className="uppercase tracking-widest text-[11px] opacity-80">Description</Caption1></th>
                                    <th className="py-2.5 px-3 text-left w-[60px] border-none"><Caption1 className="uppercase tracking-widest text-[11px] opacity-80">Unit</Caption1></th>
                                    <th className="py-2.5 px-3 text-right w-[80px] border-none"><Caption1 className="uppercase tracking-widest text-[11px] opacity-80 block text-right">Ord</Caption1></th>
                                    <th className="py-2.5 px-3 text-right w-[90px] bg-blue-600/5 dark:bg-blue-400/5 border-none"><Caption1 className="text-app-accent uppercase tracking-widest text-[11px] opacity-80 block text-right">Qty</Caption1></th>
                                    <th className="py-2.5 px-3 text-right w-[90px] border-none"><Caption1 className="uppercase tracking-widest text-[11px] opacity-80 block text-right">Rate</Caption1></th>
                                    <th className="py-2.5 px-3 text-right w-[100px] border-none"><Caption1 className="uppercase tracking-widest text-[11px] opacity-80 block text-right">Value</Caption1></th>
                                </tr>
                            </thead>
                            <tbody>
                                {groupedItems.map((group, groupIdx) => {
                                    const parentItem = group[0];
                                    const totalDisp = group.reduce((sum, i) => sum + (i.dispatch_quantity || (group.length === 1 ? parentItem.dispatch_quantity : 0) || 0), 0);
                                    const totalValue = totalDisp * (parentItem.po_rate || 0);

                                    return (
                                        <React.Fragment key={parentItem.po_item_id || groupIdx}>
                                            <tr className="bg-blue-500/5 border-none opacity-100">
                                                <td className="py-2.5 px-3 text-center w-[50px] border-none">
                                                    <MonoCode className="border-none bg-transparent p-0 text-[11px] opacity-70 font-regular">
                                                        #{parentItem.po_item_no || groupIdx + 1}
                                                    </MonoCode>
                                                </td>
                                                <td className="py-2.5 px-3 w-[110px] text-left border-none">
                                                    <Accounting className="text-base text-text-primary font-regular">{parentItem.material_code || "-"}</Accounting>
                                                </td>
                                                <td className="py-2.5 px-3 w-[110px] text-left border-none">
                                                    <Caption1 className="text-text-tertiary text-[12px] font-regular">{parentItem.drg_no || "-"}</Caption1>
                                                </td>
                                                <td className="py-2.5 px-3 text-left border-none">
                                                    <Body className="truncate max-w-full text-text-primary font-regular text-base" title={parentItem.material_description || parentItem.description}>
                                                        {parentItem.material_description || parentItem.description}
                                                    </Body>
                                                </td>
                                                <td className="py-2.5 px-3 w-[60px] text-left border-none">
                                                    <Caption1 className="uppercase text-text-tertiary text-[12px] font-regular">{parentItem.unit}</Caption1>
                                                </td>
                                                <td className="py-2.5 px-3 w-[80px] text-right border-none">
                                                    <Accounting className="text-base text-text-tertiary font-regular pr-0">
                                                        {group.reduce((sum, i) => sum + (i.ordered_quantity || 0), 0)}
                                                    </Accounting>
                                                </td>
                                                <td className="py-2.5 px-3 w-[90px] text-right bg-blue-600/5 dark:bg-blue-400/5 border-none">
                                                    <Accounting className="text-base text-app-accent font-regular pr-0">{totalDisp}</Accounting>
                                                </td>
                                                <td className="py-2.5 px-3 w-[90px] text-right border-none">
                                                    <Accounting className="text-base text-text-primary font-regular pr-0">{parentItem.po_rate?.toFixed(2) || "-"}</Accounting>
                                                </td>
                                                <td className="py-2.5 px-3 w-[100px] text-right border-none">
                                                    <Accounting className="text-base text-text-primary font-regular pr-0">
                                                        {totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </Accounting>
                                                </td>
                                            </tr>

                                            {group.map((item) => {
                                                const lotValue = (item.dispatch_quantity || 0) * (parentItem.po_rate || 0);
                                                return (
                                                    <tr key={item.id} className="bg-transparent border-none">
                                                        <td className="py-2 px-3 text-center w-[50px] border-none">
                                                            <div className="w-[1px] h-4 bg-app-accent/20 mx-auto" />
                                                        </td>
                                                        <td className="py-2 px-3 w-[110px] text-left border-none">
                                                            <div className="flex items-center gap-2">
                                                                <MonoCode className="bg-transparent border-none text-text-secondary text-[10px] font-regular">L-{item.lot_no}</MonoCode>
                                                            </div>
                                                        </td>
                                                        <td className="py-2 px-3 w-[110px] border-none" />
                                                        <td className="py-2 px-3 border-none" />
                                                        <td className="py-2 px-3 w-[60px] border-none" />
                                                        <td className="py-2 px-3 w-[80px] text-right border-none">
                                                            <Accounting className="text-sm text-text-secondary font-regular pr-0">{item.ordered_quantity}</Accounting>
                                                        </td>
                                                        <td className="py-2 px-3 w-[90px] text-right bg-blue-600/5 dark:bg-blue-400/5 border-none">
                                                            <Accounting className="text-sm text-app-accent font-regular pr-0">
                                                                {item.dispatch_quantity}
                                                            </Accounting>
                                                        </td>
                                                        <td className="py-2 px-3 w-[90px] text-right border-none" />
                                                        <td className="py-2 px-3 w-[100px] text-right border-none">
                                                            <Accounting className="text-sm text-text-secondary font-regular pr-0">
                                                                {lotValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                            </Accounting>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </React.Fragment>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {notes.length > 0 && (
                    <div className="p-6 bg-app-surface rounded-xl elevation-2 mt-6">
                        <Caption1 className="mb-4 block uppercase tracking-wide text-text-tertiary">Additional Notes</Caption1>
                        <div className="space-y-2">
                            {notes.map((note, idx) => (
                                <div key={`note-${idx}`} className="p-3 bg-blue-500/5 rounded-xl">
                                    <Body className="text-text-secondary italic leading-relaxed">{note}</Body>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </DocumentTemplate>
    );
}


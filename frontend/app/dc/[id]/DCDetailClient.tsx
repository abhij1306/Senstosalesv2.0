"use client";

import React from "react";
import { useState, useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
    Edit2,
    Save,
    X,
    FileText,
    Plus,
    Trash2,
    Truck,
    AlertCircle,
    FileDown,
} from "lucide-react";
import { api, API_BASE_URL } from "@/lib/api";
import { formatDate, cn } from "@/lib/utils";
import { DCDetail } from "@/types";
import {
    H3,
    Body,
    SmallText,
    Label,
    Accounting,
    Button,
    Input,
    Card,
    DocumentTemplate,
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
    MonoCode,
} from "@/components/design-system";
import { AnimatePresence, motion } from "framer-motion";
import dynamic from "next/dynamic";
import { DetailSkeleton } from "@/components/design-system/molecules/skeletons/DetailSkeleton";
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

    const { data, isEditing, setDC, updateHeader, updateItem, setEditing, reset } = useDCStore();

    useEffect(() => {
        if (initialData) setDC(initialData);
    }, [initialData, setDC]);

    // UI Local State
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [activeTab, setActiveTab] = useState("basic");

    const hasInvoice = initialInvoiceData?.has_invoice || false;
    const invoiceNumber = initialInvoiceData?.invoice_number || null;

    if (!data) return <DetailSkeleton />;

    const header = data.header;
    const items = data.items || [];
    const notes = header.remarks ? header.remarks.split("\n\n") : [];

    // Memoized grouping for Parent-Lot hierarchy
    const groupedItems = useMemo(() => {
        return Object.values(items.reduce((acc, item) => {
            const key = item.po_item_id;
            if (!acc[key]) acc[key] = [];
            acc[key].push(item);
            return acc;
        }, {} as Record<string, typeof items>));
    }, [items]);

    const handleSave = async () => {
        setLoading(true);
        try {
            await api.updateDC(dcId, header, items);
            setEditing(false);
            setError(null);
        } catch (err: any) {
            setError(err.message || "Failed to save");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = useCallback(async () => {
        setLoading(true);
        try {
            await api.deleteDC(dcId);
            router.push("/dc");
        } catch (err: any) {
            setError(err.message || "Failed to delete DC");
            setShowDeleteConfirm(false);
        } finally {
            setLoading(false);
        }
    }, [dcId, router]);

    const topActions = (
        <div className="flex gap-3">
            {!isEditing ? (
                <>
                    <Button
                        variant="secondary"
                        size="sm"
                        asChild
                        className="bg-app-status-success/10 text-app-status-success hover:bg-app-status-success/20"
                    >
                        <a href={`${API_BASE_URL}/api/dc/${dcId}/download`} target="_blank" rel="noreferrer">
                            <FileDown size={16} className="mr-2" />
                            Excel
                        </a>
                    </Button>
                    {hasInvoice && (
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => router.push(`/invoice/${encodeURIComponent(invoiceNumber!)}`)}
                        >
                            <FileText size={16} className="mr-2" />
                            View Invoice
                        </Button>
                    )}
                    {!hasInvoice && (
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => router.push(`/invoice/create?dc=${dcId}`)}
                        >
                            <Plus size={16} className="mr-2" />
                            Create Invoice
                        </Button>
                    )}
                    <Button variant="default" size="sm" onClick={() => setEditing(true)}>
                        <Edit2 size={16} className="mr-2" />
                        Edit
                    </Button>
                    {!hasInvoice && (
                        <Button variant="destructive" size="sm" onClick={() => setShowDeleteConfirm(true)}>
                            <Trash2 size={16} className="mr-2" />
                            Delete
                        </Button>
                    )}
                </>
            ) : (
                <>
                    <Button variant="ghost" size="sm" onClick={reset}>
                        <X size={16} className="mr-2" />
                        Cancel
                    </Button>
                    <Button variant="default" size="sm" onClick={handleSave} disabled={loading}>
                        {loading ? <span className="animate-spin mr-2">◌</span> : <Save size={16} className="mr-2" />}
                        Save Changes
                    </Button>
                </>
            )}
        </div>
    );

    return (
        <DocumentTemplate
            title={`DC #${header.dc_number}`}
            description={`${header.consignee_name} • ${formatDate(header.dc_date)}`}
            actions={topActions}
            onBack={() => router.back()}
            layoutId={`dc-title-${header.dc_number}`}
            icon={<Truck size={20} className="text-app-status-success" />}
            iconLayoutId={`dc-icon-${header.dc_number}`}
        >
            <div className="space-y-6">
                <DocumentJourney currentStage="DC" className="mb-2" />

                {error && (
                    <Card className="p-4 bg-app-status-error/10 border-none shadow-sm">
                        <div className="flex items-center gap-2 text-app-status-error">
                            <AlertCircle size={16} />
                            <SmallText className="text-app-status-error">{error}</SmallText>
                        </div>
                    </Card>
                )}

                {/* Delete Confirmation */}
                {showDeleteConfirm && (
                    <Card className="p-6 bg-app-status-error/5 border-none shadow-premium-hover">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-app-status-error/10 rounded-full">
                                    <Trash2 size={20} className="text-app-status-error" />
                                </div>
                                <div className="space-y-1">
                                    <H3 className="text-app-fg">Delete Delivery Challan?</H3>
                                    <Body className="text-app-fg-muted mt-1">
                                        This action cannot be undone. The DC and all its items will be permanently deleted.
                                    </Body>
                                </div>
                            </div>
                            <div className="flex gap-3 justify-end">
                                <Button variant="outline" size="sm" onClick={() => setShowDeleteConfirm(false)}>
                                    Cancel
                                </Button>
                                <Button variant="destructive" size="sm" onClick={handleDelete}>
                                    <Trash2 size={16} className="mr-2" />
                                    Delete DC
                                </Button>
                            </div>
                        </div>
                    </Card>
                )}

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="mb-4 bg-transparent p-0 border-none shadow-none">
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
                            <Card className="p-6 mt-0 border-none shadow-sm bg-app-surface/50 backdrop-blur-sm relative top-[-1px]">
                                <TabsContent value="basic" className="mt-0">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-1.5">
                                            <Label>DC Number</Label>
                                            <Input value={header.dc_number} readOnly className="bg-app-overlay/5" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label>DC Date</Label>
                                            <Input
                                                type="date"
                                                value={header.dc_date}
                                                onChange={(e) => updateHeader("dc_date", e.target.value)}
                                                readOnly={!isEditing}
                                                className={!isEditing ? "bg-transparent border-transparent" : ""}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label>PO Reference</Label>
                                            <Input
                                                value={header.po_number}
                                                readOnly
                                                className="bg-app-surface-hover cursor-pointer text-app-accent"
                                                onClick={() => router.push(`/po/${header.po_number}`)}
                                            />
                                        </div>
                                    </div>
                                </TabsContent>
                                <TabsContent value="supplier" className="mt-0">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-1.5">
                                            <Label>Supplier Phone</Label>
                                            <Input
                                                value={header.supplier_phone}
                                                onChange={(e) => updateHeader("supplier_phone", e.target.value)}
                                                readOnly={!isEditing}
                                                className={!isEditing ? "bg-transparent border-transparent" : ""}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label>Supplier GSTIN</Label>
                                            <Input
                                                value={header.supplier_gstin}
                                                onChange={(e) => updateHeader("supplier_gstin", e.target.value)}
                                                readOnly={!isEditing}
                                                className={!isEditing ? "bg-transparent border-transparent" : ""}
                                            />
                                        </div>
                                    </div>
                                </TabsContent>
                                <TabsContent value="consignee" className="mt-0">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-1.5">
                                            <Label>Consignee Name</Label>
                                            <Input
                                                value={header.consignee_name}
                                                onChange={(e) => updateHeader("consignee_name", e.target.value)}
                                                readOnly={!isEditing}
                                                className={!isEditing ? "bg-transparent border-transparent" : ""}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label>Consignee Address</Label>
                                            <Input
                                                value={header.consignee_address}
                                                onChange={(e) => updateHeader("consignee_address", e.target.value)}
                                                readOnly={!isEditing}
                                                className={cn("min-h-[60px]", !isEditing ? "bg-transparent border-transparent" : "")}
                                            />
                                        </div>
                                    </div>
                                </TabsContent>
                            </Card>
                        </motion.div>
                    </AnimatePresence>
                </Tabs>

                {/* Items Table with Parent-Lot Hierarchy */}
                <div className="space-y-3">
                    <Label className="m-0 mb-1">Dispatched Items ({items.length})</Label>
                    <div className="table-container shadow-premium-hover">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-app-border/10 bg-app-overlay/5">
                                    <th className="py-3 px-2 text-left w-[60px]"><Label>Lot</Label></th>
                                    <th className="py-3 px-2 text-left w-[120px]"><Label>Code</Label></th>
                                    <th className="py-3 px-2 text-left w-[120px]"><Label>Drawing</Label></th>
                                    <th className="py-3 px-2 text-left w-[200px]"><Label>Description</Label></th>
                                    <th className="py-3 px-2 text-center w-[60px]"><Label>Unit</Label></th>
                                    <th className="py-3 px-2 text-right w-[80px]"><Label>Ord</Label></th>
                                    <th className="py-3 px-2 text-right w-[80px]"><Label>Dlv</Label></th>
                                    <th className="py-3 px-2 text-right w-[100px] bg-blue-50/10 dark:bg-blue-900/10">
                                        <Label className="text-blue-600 dark:text-blue-400">Disp</Label>
                                    </th>
                                    <th className="py-3 px-2 text-right w-[100px] bg-blue-50/10 dark:bg-blue-900/10">
                                        <Label className="text-blue-600 dark:text-blue-400">Bal</Label>
                                    </th>
                                    <th className="py-3 px-2 text-right w-[80px]"><Label>Recd</Label></th>
                                </tr>
                            </thead>
                            <tbody>
                                {groupedItems.map((group, groupIdx) => {
                                    const parentItem = group[0];
                                    const totalOrd = group.reduce((sum, i) => sum + (i.ordered_quantity || 0), 0);
                                    const totalDlv = group.reduce((sum, i) => sum + (i.delivered_quantity || 0), 0);
                                    const totalRec = group.reduce((sum, i) => sum + (i.received_quantity || 0), 0);
                                    const totalBal = group.reduce((sum, i) => sum + (i.remaining_post_dc || 0), 0);
                                    const totalDisp = group.reduce((sum, i) => sum + (i.dispatch_quantity || 0), 0);

                                    return (
                                        <React.Fragment key={parentItem.po_item_id || groupIdx}>
                                            <tr className="bg-app-overlay/5 border-b border-app-border/5">
                                                <td className="py-3 px-2 align-top">
                                                    <MonoCode className="text-app-fg-muted/60">
                                                        #{parentItem.po_item_no || groupIdx + 1}
                                                    </MonoCode>
                                                </td>
                                                <td className="py-3 px-2 align-top">
                                                    <Accounting className="text-app-fg-muted/60">{parentItem.material_code || "-"}</Accounting>
                                                </td>
                                                <td className="py-3 px-2 align-top">
                                                    <SmallText className="text-app-fg-muted/50">{parentItem.drg_no || "-"}</SmallText>
                                                </td>
                                                <td className="py-3 px-2 align-top">
                                                    <Body className="truncate max-w-[200px] text-app-fg-muted/70" title={parentItem.material_description || parentItem.description}>
                                                        {parentItem.material_description || parentItem.description}
                                                    </Body>
                                                </td>
                                                <td className="py-3 px-2 align-top text-center">
                                                    <SmallText className="uppercase text-app-fg-muted/50">{parentItem.unit}</SmallText>
                                                </td>
                                                <td className="py-3 px-2 align-top text-right">
                                                    <Accounting className="text-app-fg-muted/60">{totalOrd}</Accounting>
                                                </td>
                                                <td className="py-3 px-2 align-top text-right">
                                                    <Accounting className="text-app-fg-muted/60">{totalDlv}</Accounting>
                                                </td>
                                                <td className="py-3 px-2 align-top text-right bg-blue-50/5 dark:bg-blue-900/5">
                                                    <Accounting className="text-blue-600/60 dark:text-blue-400/60">{totalDisp}</Accounting>
                                                </td>
                                                <td className="py-3 px-2 align-top text-right bg-blue-50/5 dark:bg-blue-900/5">
                                                    <Accounting className="text-blue-600/60 dark:text-blue-400/60">{totalBal}</Accounting>
                                                </td>
                                                <td className="py-3 px-2 align-top text-right">
                                                    <Accounting className="text-app-fg-muted/60">{totalRec}</Accounting>
                                                </td>
                                            </tr>

                                            {group.map((item) => {
                                                const originalIndex = items.findIndex(i => i.id === item.id);
                                                return (
                                                    <tr key={item.id} className="bg-app-surface transition-colors border-b border-app-border/5">
                                                        <td className="py-2 px-0 relative">
                                                            <div className="absolute left-[30px] top-0 bottom-0 w-[2px] bg-app-accent/20" />
                                                            <div className="flex items-center gap-2 pl-[38px]">
                                                                <span className="text-app-accent/30" style={{ fontSize: '10px' }}>L</span>
                                                                <MonoCode className="text-app-fg-muted">L-{item.lot_no}</MonoCode>
                                                            </div>
                                                        </td>
                                                        <td colSpan={4} />
                                                        <td className="py-2 px-2 text-right">
                                                            <Accounting className="text-app-fg-muted">{item.ordered_quantity}</Accounting>
                                                        </td>
                                                        <td className="py-2 px-2 text-right">
                                                            <Accounting className="text-app-fg-muted">{item.delivered_quantity}</Accounting>
                                                        </td>
                                                        <td className="py-2 px-2 bg-blue-50/5 dark:bg-blue-900/5">
                                                            {isEditing ? (
                                                                <Input
                                                                    type="number"
                                                                    value={item.dispatch_quantity || ""}
                                                                    onChange={(e) => updateItem(originalIndex, "dispatch_quantity", parseFloat(e.target.value) || 0)}
                                                                    className="text-right w-full font-mono h-7 text-xs border-blue-200 dark:border-blue-800 focus:ring-blue-500/20"
                                                                />
                                                            ) : (
                                                                <Accounting className="text-blue-600 dark:text-blue-400 block text-right">
                                                                    {item.dispatch_quantity}
                                                                </Accounting>
                                                            )}
                                                        </td>
                                                        <td className="py-2 px-2 text-right bg-blue-50/5 dark:bg-blue-900/5">
                                                            <Accounting className="text-blue-600 dark:text-blue-400">{item.remaining_post_dc}</Accounting>
                                                        </td>
                                                        <td className="py-2 px-2 text-right">
                                                            <Accounting className="text-app-fg-muted">{item.received_quantity}</Accounting>
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

                {/* Notes */}
                {notes.length > 0 && (
                    <Card className="p-6 border-none shadow-sm bg-app-surface/30 backdrop-blur-sm">
                        <Label className="mb-4 block">Additional Notes</Label>
                        <div className="space-y-2">
                            {notes.map((note, idx) => (
                                <div key={`note-${idx}`} className="p-3 bg-app-overlay/5 rounded-lg border border-app-border/5">
                                    <Body className="text-app-fg-muted italic">{note}</Body>
                                </div>
                            ))}
                        </div>
                    </Card>
                )}
            </div>
        </DocumentTemplate>
    );
}


"use client";

import { useState, useCallback } from "react";
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
import { formatDate } from "@/lib/utils";
import { DCItemRow, DCDetail } from "@/types";
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
    Column,
} from "@/components/design-system";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { DetailSkeleton } from "@/components/design-system/molecules/skeletons/DetailSkeleton";

const DataTable = dynamic(
    () => import("@/components/design-system/organisms/DataTable").then((mod) => mod.DataTable),
    {
        loading: () => <div className="h-64 w-full bg-app-surface-hover rounded-xl animate-pulse" />,
        ssr: false,
    }
);

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

    // Initialize state from Server Data
    const [loading, setLoading] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [hasInvoice] = useState(initialInvoiceData?.has_invoice || false);
    const [invoiceNumber] = useState(initialInvoiceData?.invoice_number || null);
    const [error, setError] = useState<string | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [activeTab, setActiveTab] = useState("basic");

    const [formData, setFormData] = useState({
        dc_number: initialData.header.dc_number || "",
        dc_date: initialData.header.dc_date || "",
        po_number: initialData.header.po_number?.toString() || "",
        supplier_phone: initialData.header.supplier_phone || "0755 – 4247748",
        supplier_gstin: initialData.header.supplier_gstin || "23AACFS6810L1Z7",
        consignee_name: initialData.header.consignee_name || "The Sr. Manager (CRX)",
        consignee_address:
            initialData.header.consignee_address || "M/S Bharat Heavy Eletrical Ltd. Bhopal",
        department_no: initialData.header.department_no?.toString() || "",
        eway_bill_number: initialData.header.eway_bill_no || "",
        status: initialData.header.remarks?.includes("Status:") ? "Pending" : (initialData.header as any).status || "Pending",
    });

    const [items, setItems] = useState<DCItemRow[]>(
        initialData.items ? initialData.items.map((item: any, idx: number) => ({
            id: `item-${idx}`,
            lot_no: item.lot_no?.toString() || (idx + 1).toString(),
            material_code: item.material_code || "",
            description: item.material_description || item.description || "",
            ordered_quantity: item.lot_ordered_qty || item.ordered_qty || 0,
            remaining_post_dc: item.remaining_post_dc || 0,
            dispatch_quantity: item.dispatched_quantity || item.dispatch_qty || item.dispatch_quantity || 0,
            received_quantity: item.received_quantity || 0,
            po_item_id: item.po_item_id,
            drg_no: item.drg_no,
        })) : []
    );

    const [notes] = useState<string[]>(
        initialData.header.remarks ? initialData.header.remarks.split("\n\n") : []
    );

    const handleSave = useCallback(async () => {
        setLoading(true);
        try {
            // Reconstruct comments from notes if needed, or keeping it simple
            const updatedHeader = { ...formData, remarks: notes.join("\n\n") };
            await api.updateDC(dcId, updatedHeader, items);
            setEditMode(false);
        } catch (err: any) {
            setError(err.message || "Failed to save");
        } finally {
            setLoading(false);
        }
    }, [dcId, formData, items, notes]);

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

    const itemColumns: Column<any>[] = [
        {
            key: "material_code",
            label: "Code",
            width: "10%",
            render: (v) => <Accounting className="text-app-fg-muted">{v as string}</Accounting>,
        },
        {
            key: "description",
            label: "Description",
            width: "35%",
            render: (_v, row) => (
                <div className="space-y-0.5">
                    <Body className="text-app-fg">{row.description}</Body>
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
            render: (v) => <Accounting className="text-right">{v as number}</Accounting>,
        },
        {
            key: "dispatch_quantity",
            label: "Dlv",
            align: "right",
            width: "8%",
            render: (v, row) => {
                const idx = items.findIndex(item => item === row);
                // Type assertion for v as number since dispatch_quantity is number
                const val = v as number;

                if (editMode && idx !== -1) {
                    return (
                        <Input
                            type="number"
                            value={val || ""}
                            onChange={(e) => {
                                const newItems = [...items];
                                newItems[idx].dispatch_quantity = parseFloat(e.target.value) || 0;
                                setItems(newItems);
                            }}
                            className="text-right max-w-[80px] ml-auto h-8 px-2 font-mono text-app-accent border-app-border focus:border-app-accent"
                        />
                    );
                }
                return (
                    <Accounting variant="success" className="text-right block">
                        {val}
                    </Accounting>
                );
            },
        },
        {
            key: "remaining_post_dc",
            label: "Bal",
            align: "right",
            width: "8%",
            render: (v) => <Accounting className="text-right block font-mono">{v as number}</Accounting>,
        },
        {
            key: "received_quantity",
            label: "Rec",
            align: "right",
            width: "8%",
            render: (v) => (
                <Accounting className="text-app-status-success text-right block font-mono">
                    {v as number}
                </Accounting>
            ),
        },
    ];

    const topActions = (
        <div className="flex gap-3">
            {!editMode ? (
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
                            <FileText size={16} />
                            View Invoice
                        </Button>
                    )}
                    {!hasInvoice && (
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => router.push(`/invoice/create?dc=${dcId}`)}
                        >
                            <Plus size={16} />
                            Create Invoice
                        </Button>
                    )}
                    <Button variant="default" size="sm" onClick={() => setEditMode(true)}>
                        <Edit2 size={16} />
                        Edit
                    </Button>
                    {!hasInvoice && (
                        <Button variant="destructive" size="sm" onClick={() => setShowDeleteConfirm(true)}>
                            <Trash2 size={16} />
                            Delete
                        </Button>
                    )}
                </>
            ) : (
                <>
                    <Button variant="ghost" size="sm" onClick={() => setEditMode(false)}>
                        <X size={16} />
                        Cancel
                    </Button>
                    <Button variant="default" size="sm" onClick={handleSave}>
                        <Save size={16} />
                        Save
                    </Button>
                </>
            )}
        </div>
    );

    if (loading && !items.length) {
        return <DetailSkeleton />;
    }

    return (
        <DocumentTemplate
            title={`DC #${formData.dc_number}`}
            description={`${formData.consignee_name} • ${formatDate(formData.dc_date)}`}
            actions={topActions}
            onBack={() => router.back()}
            layoutId={`dc-title-${formData.dc_number}`}
            icon={<Truck size={20} className="text-app-status-success" />}
            iconLayoutId={`dc-icon-${formData.dc_number}`}
        >
            <div className="space-y-6">
                <DocumentJourney currentStage="DC" className="mb-2" />

                {error && (
                    <Card className="p-4 bg-app-status-error/10 border-none shadow-sm">
                        <div className="flex items-center gap-2 text-app-status-error">
                            <AlertCircle size={16} />
                            <SmallText className="font-semibold text-app-status-error">{error}</SmallText>
                        </div>
                    </Card>
                )}

                {/* Delete Confirmation Dialog */}
                {showDeleteConfirm && (
                    <Card className="p-6 bg-[var(--color-sys-status-error)]/[0.03] border-none shadow-premium-hover">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-app-status-error/10 rounded-full">
                                    <Trash2 size={20} className="text-app-status-error" />
                                </div>
                                <div>
                                    <H3 className="text-h3 text-app-fg">
                                        Delete Delivery Challan?
                                    </H3>
                                    <SmallText className="text-app-fg-muted mt-1 block">
                                        This action cannot be undone. The DC and all its items will be permanently
                                        deleted.
                                    </SmallText>
                                </div>
                            </div>
                            <div className="flex gap-3 justify-end">
                                <Button variant="outline" size="sm" onClick={() => setShowDeleteConfirm(false)}>
                                    Cancel
                                </Button>
                                <Button variant="destructive" size="sm" onClick={handleDelete}>
                                    <Trash2 size={16} />
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
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                        >
                            <Card className="p-6 mt-0 border-none shadow-sm bg-app-surface/50 backdrop-blur-sm relative top-[-1px]">
                                <TabsContent value="basic" className="mt-0">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-1.5">
                                            <Label>DC Number</Label>
                                            <Input value={formData.dc_number} readOnly className="bg-[var(--color-sys-bg-tertiary)]/50" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label>DC Date</Label>
                                            <Input
                                                type="date"
                                                value={formData.dc_date}
                                                onChange={(e) => setFormData({ ...formData, dc_date: e.target.value })}
                                                readOnly={!editMode}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label>PO Number</Label>
                                            <Input
                                                value={formData.po_number}
                                                readOnly
                                                className="bg-app-surface-hover cursor-pointer"
                                                onClick={() => router.push(`/po/${formData.po_number}`)}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label>Department No</Label>
                                            <Input
                                                value={formData.department_no}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        department_no: e.target.value,
                                                    })
                                                }
                                                readOnly={!editMode}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label>E-Way Bill Number</Label>
                                            <Input
                                                value={formData.eway_bill_number}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        eway_bill_number: e.target.value,
                                                    })
                                                }
                                                readOnly={!editMode}
                                            />
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="supplier" className="mt-0">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-1.5">
                                            <Label>Supplier Phone</Label>
                                            <Input
                                                value={formData.supplier_phone}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        supplier_phone: e.target.value,
                                                    })
                                                }
                                                readOnly={!editMode}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label>Supplier GSTIN</Label>
                                            <Input
                                                value={formData.supplier_gstin}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        supplier_gstin: e.target.value,
                                                    })
                                                }
                                                readOnly={!editMode}
                                            />
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="consignee" className="mt-0">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-1.5">
                                            <Label>Consignee Name</Label>
                                            <Input
                                                value={formData.consignee_name}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        consignee_name: e.target.value,
                                                    })
                                                }
                                                readOnly={!editMode}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label>Consignee Address</Label>
                                            <Input
                                                value={formData.consignee_address}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        consignee_address: e.target.value,
                                                    })
                                                }
                                                readOnly={!editMode}
                                                className="min-h-[60px]"
                                            />
                                        </div>
                                    </div>
                                </TabsContent>
                            </Card>
                        </motion.div>
                    </AnimatePresence>
                </Tabs>

                {/* Items Table */}
                <div className="space-y-3">
                    <Label className="m-0 mb-3 text-app-fg-muted uppercase tracking-wider text-xs font-bold block">
                        Dispatched Items ({items.length})
                    </Label>
                    <div className="surface-card bg-app-border/30">
                        <div className="bg-app-surface">
                            <DataTable columns={itemColumns} data={items} keyField="id" density="compact" />
                        </div>
                    </div>
                </div>

                {/* Notes */}
                {notes.length > 0 && (
                    <Card className="p-6 border-none shadow-sm bg-app-surface-hover/30">
                        <H3 className="mb-4 text-app-fg-muted uppercase">
                            Notes
                        </H3>
                        <div className="space-y-2">
                            {notes.map((note, idx) => (
                                <div
                                    key={`note-${idx}`}
                                    className="p-3 bg-app-surface/50 rounded-lg shadow-inner italic"
                                >
                                    <Body className="text-app-fg-muted">{note}</Body>
                                </div>
                            ))}
                        </div>
                    </Card>
                )}
            </div>
        </DocumentTemplate>
    );
}

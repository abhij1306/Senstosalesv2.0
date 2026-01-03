"use client";

import React, { useState, useCallback, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Save, Plus, Trash2, Package, Loader2, FileText, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Title3,
  Label,
  Body,
  Accounting,
  Button,
  Input,
  Card,
  DocumentJourney,
  DocumentTemplate,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  SmallText,
  Caption2,
} from "@/components/design-system";
import { api } from "@/lib/api";
import { usePOStore } from "@/store/poStore";

function CreatePOPageContent() {
  const router = useRouter();
  const {
    data,
    setHeader,
    updateHeader,
    addItem,
    removeItem,
    updateItem,
    reset
  } = usePOStore();

  const [activeTab, setActiveTab] = useState("basic");
  const [saving, setSaving] = useState(false);

  // Initialize store with default structure on mount
  useEffect(() => {
    reset();
    const defaultHeader = {
      po_number: "",
      po_date: new Date().toISOString().split("T")[0],
      supplier_name: "",
      supplier_code: "",
      supplier_phone: "",
      supplier_fax: "",
      supplier_email: "",
      department_no: "",
      enquiry_no: "",
      enquiry_date: "",
      quotation_ref: "",
      quotation_date: "",
      rc_no: "",
      order_type: "",
      po_status: "New",
      amend_no: 0,
      po_value: 0,
      fob_value: 0,
      net_po_value: 0,
      tin_no: "",
      ecc_no: "",
      mpct_no: "",
      inspection_by: "",
      inspection_at: "",
      consignee_name: "",
      consignee_address: "",
      issuer_name: "",
      issuer_designation: "",
      issuer_phone: "",
      remarks: "",
    };
    setHeader(defaultHeader);

    const fetchDefaults = async () => {
      try {
        const settings = await api.getSettings();
        updateHeader("consignee_name", settings.supplier_name || "");
        updateHeader("consignee_address", settings.supplier_address || "");
        updateHeader("inspection_at", settings.supplier_address || "BHEL Works");
      } catch (e) {
        console.error("Failed to load defaults", e);
      }
    };
    fetchDefaults();
  }, [setHeader, updateHeader, reset]);

  const handleSave = useCallback(async () => {
    if (!data?.header?.po_number) {
      alert("PO Number is required");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        header: {
          ...data.header,
          po_number: parseInt(data.header.po_number),
        },
        items: (data.items || []).map((item) => ({
          ...item,
          ordered_quantity: item.ordered_quantity,
          deliveries: [], // Simple manual PO creation defaults to one delivery in backend
        })),
      };

      await api.createPO(payload);
      router.push(`/po/${data.header.po_number}`);
    } catch (err: any) {
      alert(err.message || "Failed to save Purchase Order");
    } finally {
      setSaving(false);
    }
  }, [data, router]);

  if (!data || !data.header) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="animate-spin text-action-primary" size={32} />
    </div>
  );

  const { header, items = [] } = data;

  const topActions = (
    <div className="flex items-center gap-2">
      <Button variant="secondary" onClick={() => router.back()} disabled={saving}>
        Cancel
      </Button>
      <Button variant="primary" onClick={handleSave} disabled={saving}>
        {saving ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Save size={16} />
        )}
        {saving ? "Saving..." : "Save PO"}
      </Button>
    </div>
  );

  return (
    <DocumentTemplate
      title="Create Purchase Order"
      description="Enter procurement contract details manually"
      actions={topActions}
      onBack={() => router.back()}
      icon={<FileText size={20} className="text-action-primary" />}
      iconLayoutId="create-po-icon"
    >
      <div className="space-y-6">
        <DocumentJourney currentStage="PO" className="mb-2" />

        {/* Info Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4 p-1 rounded-xl inline-flex overflow-x-auto max-w-full border-none">
            <TabsTrigger value="basic" className="px-6 py-2 rounded-lg data-[state=active]:bg-app-surface data-[state=active]:elevation-1 transition-all whitespace-nowrap">Basic Info</TabsTrigger>
            <TabsTrigger value="supplier" className="px-6 py-2 rounded-lg data-[state=active]:bg-app-surface data-[state=active]:elevation-1 transition-all whitespace-nowrap">Supplier</TabsTrigger>
            <TabsTrigger value="references" className="px-6 py-2 rounded-lg data-[state=active]:bg-app-surface data-[state=active]:elevation-1 transition-all whitespace-nowrap">References</TabsTrigger>
            <TabsTrigger value="financial" className="px-6 py-2 rounded-lg data-[state=active]:bg-app-surface data-[state=active]:elevation-1 transition-all whitespace-nowrap">Financial</TabsTrigger>
            <TabsTrigger value="issuer" className="px-6 py-2 rounded-lg data-[state=active]:bg-app-surface data-[state=active]:elevation-1 transition-all whitespace-nowrap">Issuer</TabsTrigger>
            <TabsTrigger value="consignee" className="px-6 py-2 rounded-lg data-[state=active]:bg-app-surface data-[state=active]:elevation-1 transition-all whitespace-nowrap">Consignee</TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="p-6 mt-0">
                <TabsContent value="basic" className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-2">
                      <Label>PO NUMBER</Label>
                      <Input
                        value={header.po_number}
                        onChange={(e) => updateHeader("po_number", e.target.value)}
                        placeholder="e.g. 4500012345"
                        className="text-app-fg tabular-nums"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>PO DATE</Label>
                      <Input
                        type="date"
                        value={header.po_date}
                        onChange={(e) => updateHeader("po_date", e.target.value)}
                        className="text-app-fg"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>DEPARTMENT NO</Label>
                      <Input
                        value={header.department_no}
                        onChange={(e) => updateHeader("department_no", e.target.value)}
                        className="text-app-fg"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="supplier" className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <Label>SUPPLIER NAME</Label>
                      <Input
                        value={header.supplier_name}
                        onChange={(e) => updateHeader("supplier_name", e.target.value)}
                        className="text-app-fg"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>SUPPLIER CODE</Label>
                      <Input
                        value={header.supplier_code}
                        onChange={(e) => updateHeader("supplier_code", e.target.value)}
                        className="text-app-fg"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>PHONE</Label>
                      <Input
                        value={header.supplier_phone}
                        onChange={(e) => updateHeader("supplier_phone", e.target.value)}
                        className="text-app-fg tabular-nums"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>EMAIL</Label>
                      <Input
                        type="email"
                        value={header.supplier_email}
                        onChange={(e) => updateHeader("supplier_email", e.target.value)}
                        className="text-app-fg"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="references" className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-2">
                      <Label>ENQUIRY NO</Label>
                      <Input
                        value={header.enquiry_no}
                        onChange={(e) => updateHeader("enquiry_no", e.target.value)}
                        className="text-app-fg"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>RC NUMBER</Label>
                      <Input
                        value={header.rc_no}
                        onChange={(e) => updateHeader("rc_no", e.target.value)}
                        className="text-app-fg tabular-nums"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>ORDER TYPE</Label>
                      <Input
                        value={header.order_type}
                        onChange={(e) => updateHeader("order_type", e.target.value)}
                        className="text-app-fg"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="financial" className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-2">
                      <Label>TIN NUMBER</Label>
                      <Input
                        value={header.tin_no}
                        onChange={(e) => updateHeader("tin_no", e.target.value)}
                        className="text-app-fg tabular-nums uppercase"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>ECC NUMBER</Label>
                      <Input
                        value={header.ecc_no}
                        onChange={(e) => updateHeader("ecc_no", e.target.value)}
                        className="text-app-fg tabular-nums uppercase"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>MPCT NUMBER</Label>
                      <Input
                        value={header.mpct_no}
                        onChange={(e) => updateHeader("mpct_no", e.target.value)}
                        className="text-app-fg tabular-nums uppercase"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="issuer" className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-2">
                      <Label>ISSUER NAME</Label>
                      <Input
                        value={header.issuer_name}
                        onChange={(e) => updateHeader("issuer_name", e.target.value)}
                        className="text-app-fg"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>DESIGNATION</Label>
                      <Input
                        value={header.issuer_designation}
                        onChange={(e) => updateHeader("issuer_designation", e.target.value)}
                        className="text-app-fg"
                      />
                    </div>
                    <div className="col-span-full space-y-2">
                      <Label>ADDITIONAL REMARKS</Label>
                      <textarea
                        value={header.remarks}
                        onChange={(e) => updateHeader("remarks", e.target.value)}
                        className="w-full px-4 py-3 text-app-fg bg-app-surface border-none rounded-2xl focus:outline-none focus:bg-app-surface-hover resize-none transition-all font-medium text-sm leading-relaxed"
                        rows={4}
                        placeholder="Additional project information..."
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="consignee" className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <Label>CONSIGNEE NAME</Label>
                      <Input
                        value={header.consignee_name}
                        onChange={(e) => updateHeader("consignee_name", e.target.value)}
                        className="text-app-fg"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>CONSIGNEE ADDRESS</Label>
                      <textarea
                        value={header.consignee_address}
                        onChange={(e) => updateHeader("consignee_address", e.target.value)}
                        className="w-full px-4 py-3 text-app-fg bg-app-surface border-none rounded-2xl focus:outline-none focus:bg-app-surface-hover resize-none transition-all font-medium text-sm leading-relaxed"
                        rows={4}
                      />
                    </div>
                  </div>
                </TabsContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </Tabs>

        {/* Items Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="m-0 text-app-fg uppercase tracking-wide font-semibold text-xs">
              Material Items ({items.length})
            </Label>
            <Button variant="secondary" onClick={addItem}>
              <Plus size={16} />
              Add Item
            </Button>
          </div>

          <Suspense fallback={<div className="h-64 w-full bg-app-surface/50 rounded-xl animate-pulse border-none" />}>
            <div className="table-container border-none shadow-none overflow-visible">
              <table className="w-full">
                <thead>
                  <tr className="header-glass">
                    <th className="py-3 px-6 text-left w-16 px-6"><Caption2 className="uppercase tracking-widest opacity-100">#</Caption2></th>
                    <th className="py-3 px-6 text-left"><Caption2 className="uppercase tracking-widest opacity-100">Material Details</Caption2></th>
                    <th className="py-3 px-6 text-right w-32"><Caption2 className="uppercase tracking-widest opacity-100">Ordered Qty</Caption2></th>
                    <th className="py-3 px-6 text-right w-40"><Caption2 className="uppercase tracking-widest opacity-100">Value / Rate</Caption2></th>
                    <th className="py-3 px-6 w-16"></th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence mode="popLayout">
                    {items.length > 0 ? (
                      items.map((item: any, idx: number) => (
                        <motion.tr
                          key={`item-${idx}`}
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="border-none hover:bg-app-surface-hover/30 transition-colors bg-transparent border-b border-white/5 last:border-0"
                        >
                          <td className="py-6 px-6 align-top">
                            <Accounting className="text-action-primary text-center block">
                              {item.po_item_no}
                            </Accounting>
                          </td>
                          <td className="py-6 px-6 space-y-4">
                            <div className="space-y-1.5">
                              <Label className="tracking-wide text-xs font-semibold text-app-fg-muted">DESCRIPTION</Label>
                              <Input
                                value={item.material_description}
                                onChange={(e) => updateItem(idx, "material_description", e.target.value)}
                                placeholder="Enter material specification..."
                                className="text-app-fg"
                              />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                              <div className="space-y-1.5">
                                <Label className="tracking-wide text-xs font-semibold text-app-fg-muted">CODE</Label>
                                <Input
                                  value={item.material_code}
                                  onChange={(e) => updateItem(idx, "material_code", e.target.value)}
                                  placeholder="Code"
                                  className="text-app-fg h-10 text-xs tabular-nums"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <Label className="tracking-wide text-xs font-semibold text-app-fg-muted">DRAWING</Label>
                                <Input
                                  value={item.drg_no}
                                  onChange={(e) => updateItem(idx, "drg_no", e.target.value)}
                                  placeholder="DRG"
                                  className="text-app-fg h-10 text-xs tabular-nums"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <Label className="tracking-wide text-xs font-semibold text-app-fg-muted">UNIT</Label>
                                <Input
                                  value={item.unit}
                                  onChange={(e) => updateItem(idx, "unit", e.target.value)}
                                  placeholder="Unit"
                                  className="text-app-fg h-10 text-xs uppercase"
                                />
                              </div>
                            </div>
                          </td>
                          <td className="py-6 px-6 align-top text-right">
                            <div className="space-y-1.5">
                              <Label className="tracking-wide text-xs font-semibold text-app-fg-muted">QTY</Label>
                              <Input
                                type="number"
                                value={item.ordered_quantity}
                                onChange={(e) => updateItem(idx, "ordered_quantity", parseFloat(e.target.value))}
                                className="text-right tabular-nums border-action-primary/20 focus:border-action-primary"
                              />
                            </div>
                          </td>
                          <td className="py-6 px-6 align-top text-right">
                            <div className="space-y-4">
                              <div className="space-y-1.5">
                                <Label className="tracking-wide text-xs font-semibold text-app-fg-muted">UNIT RATE</Label>
                                <Input
                                  type="number"
                                  value={item.po_rate}
                                  onChange={(e) => updateItem(idx, "po_rate", parseFloat(e.target.value))}
                                  className="text-right tabular-nums"
                                />
                              </div>
                              <div className="pt-2 border-none">
                                <Label className="tracking-wide text-xs font-semibold text-app-fg-muted block mb-1">ITEM VALUE</Label>
                                <Accounting isCurrency className="text-action-primary text-right block text-base">
                                  {item.item_value}
                                </Accounting>
                              </div>
                            </div>
                          </td>
                          <td className="py-6 px-6 align-top text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(idx)}
                              className="text-app-fg-muted hover:text-app-status-error hover:bg-app-status-error/10 transition-all mt-6 rounded-full p-2"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </td>
                        </motion.tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-32 text-center bg-transparent">
                          <div className="flex flex-col items-center justify-center gap-4 opacity-50">
                            <div className="w-16 h-16 rounded-2xl bg-app-overlay/5 flex items-center justify-center">
                              <Package className="w-8 h-8 text-app-fg-muted mb-0 stroke-[1.5]" />
                            </div>
                            <div className="space-y-1">
                              <Body className="text-app-fg-muted uppercase tracking-wide font-medium">No items defined</Body>
                              <SmallText>Define material items for this purchase order</SmallText>
                            </div>
                            <Button variant="secondary" size="sm" onClick={addItem} className="mt-2">
                              <Plus size={14} className="mr-2" /> Add Your First Item
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </Suspense>

          {items.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
              <div className="lg:col-start-2">
                <Card className="p-10 bg-app-surface/50 border-none shadow-premium-hover backdrop-blur-md relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-action-primary/5 rounded-bl-full -mr-16 -mt-16 pointer-events-none" />
                  <div className="flex justify-between items-end">
                    <div className="space-y-2">
                      <Label className="uppercase tracking-wide font-semibold text-xs text-app-fg-muted">Estimated Contract Value</Label>
                      <Body className="text-app-fg-muted italic lowercase first-letter:uppercase max-w-[250px] leading-tight block">
                        Net value including all materials and quantities
                      </Body>
                    </div>
                    <div className="text-right">
                      <Accounting
                        isCurrency
                        className="text-4xl text-app-fg tracking-tighter"
                      >
                        {items.reduce((acc: number, cur: any) => acc + (cur.item_value || 0), 0)}
                      </Accounting>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </DocumentTemplate>
  );
}

export default function CreatePOPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-app-bg">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-action-primary" size={48} />
            <Body className="text-app-fg-muted animate-pulse uppercase tracking-wide text-xs font-medium">Preparing Workspace</Body>
          </div>
        </div>
      }
    >
      <CreatePOPageContent />
    </Suspense>
  );
}

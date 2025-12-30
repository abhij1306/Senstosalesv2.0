"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Save, Plus, Trash2, Package, Loader2, FileText, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  H3,
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
} from "@/components/design-system";
import { api } from "@/lib/api";

export default function CreatePOPage() {
  const router = useRouter();

  const initialData = {
    header: {
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
      inspection_at: "BHEL Works, Bhopal",
      consignee_name: "BHEL BHOPAL",
      consignee_address: "PIPLANI, BHOPAL, MADHYA PRADESH, 462022",
      issuer_name: "",
      issuer_designation: "",
      issuer_phone: "",
      remarks: "",
    },
    items: [],
  };

  const [data, setData] = useState<any>(initialData);
  const [activeTab, setActiveTab] = useState("basic");
  const [saving, setSaving] = useState(false);

  const addItem = useCallback(() => {
    setData((prev: any) => {
      const maxItemNo =
        prev.items.length > 0 ? Math.max(...prev.items.map((i: any) => i.po_item_no || 0)) : 0;
      const newItem = {
        po_item_no: maxItemNo + 1,
        material_code: "",
        material_description: "",
        drg_no: "",
        unit: "NOS",
        ord_qty: 0,
        po_rate: 0,
        item_value: 0,
        deliveries: [],
      };
      return { ...prev, items: [...prev.items, newItem] };
    });
  }, []);

  const removeItem = useCallback((itemNo: number) => {
    setData((prev: any) => ({
      ...prev,
      items: prev.items.filter((i: any) => i.po_item_no !== itemNo),
    }));
  }, []);

  const handleSave = useCallback(async () => {
    if (!data.header.po_number) {
      alert("PO Number is required");
      return;
    }

    setSaving(true);
    try {
      // Map frontend data to backend PODetail schema
      const payload = {
        header: {
          ...data.header,
          po_number: parseInt(data.header.po_number),
          po_date: data.header.po_date,
        },
        items: data.items.map((item: any) => ({
          po_item_no: item.po_item_no,
          material_code: item.material_code,
          material_description: item.material_description,
          drg_no: item.drg_no,
          unit: item.unit,
          po_rate: item.po_rate,
          ordered_quantity: item.ord_qty,
          item_value: item.item_value,
          deliveries: [], // Simple manual PO creation defaults to one delivery in backend
        })),
      };

      await api.createPO(payload);
      router.push(`/po/${data.header.po_number}`);
    } catch (err: any) {
      // console.error("Save Error:", err);
      alert(err.message || "Failed to save Purchase Order");
    } finally {
      setSaving(false);
    }
  }, [data, router]);

  const { header, items } = data;

  const updateHeader = useCallback((field: string, value: any) => {
    setData({
      ...data,
      header: { ...data.header, [field]: value },
    });
  }, [data]);

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...data.items];
    newItems[index] = { ...newItems[index], [field]: value };
    if (field === "ord_qty" || field === "po_rate") {
      newItems[index].item_value = (newItems[index].ord_qty || 0) * (newItems[index].po_rate || 0);
    }
    setData({ ...data, items: newItems });
  };

  const topActions = (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={() => router.back()} disabled={saving}>
        Cancel
      </Button>
      <Button variant="default" size="sm" onClick={handleSave} disabled={saving}>
        {saving ? (
          <Loader2 size={16} className="animate-spin mr-2" />
        ) : (
          <Save size={16} className="mr-2" />
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
      icon={<FileText size={20} className="text-app-accent" />}
      iconLayoutId="create-po-icon"
    >
      <div className="mb-6">
        <DocumentJourney currentStage="PO" />
      </div>

      <div className="space-y-6">
        {/* Tabs for Header Info */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4 bg-app-surface-hover/30 p-1 rounded-xl">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="supplier">Supplier</TabsTrigger>
            <TabsTrigger value="references">References</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
            <TabsTrigger value="issuer">Issuer</TabsTrigger>
            <TabsTrigger value="consignee">Consignee</TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
            >
              <Card className="surface-claymorphic shadow-clay-surface p-6">
                <TabsContent value="basic" className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-1.5">
                      <Label className="uppercase text-app-fg-muted">
                        PO Number
                      </Label>
                      <Input
                        id="po-number"
                        name="po-number"
                        value={header.po_number}
                        onChange={(e) => updateHeader("po_number", e.target.value)}
                        placeholder="e.g. 4500012345"
                        className="font-medium text-app-fg"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="uppercase text-app-fg-muted">
                        PO Date
                      </Label>
                      <div className="bg-app-surface-hover/30 backdrop-blur-md px-3 py-1.5 rounded-xl border border-app-border shadow-sm focus-within:ring-2 focus-within:ring-app-accent/10 transition-all flex items-center gap-2">
                        <Calendar size={14} className="text-app-accent" />
                        <Input
                          id="po-date"
                          name="po-date"
                          type="date"
                          value={header.po_date}
                          onChange={(e) => updateHeader("po_date", e.target.value)}
                          className="font-bold text-app-fg bg-transparent border-none p-0 focus:ring-0 cursor-pointer text-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="uppercase text-app-fg-muted">
                        Department No
                      </Label>
                      <Input
                        value={header.department_no}
                        onChange={(e) => updateHeader("department_no", e.target.value)}
                        className="font-medium text-app-fg"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="supplier" className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <Label className="uppercase text-app-fg-muted">
                        Supplier Name
                      </Label>
                      <Input
                        id="supplier-name"
                        name="supplier-name"
                        value={header.supplier_name}
                        onChange={(e) => updateHeader("supplier_name", e.target.value)}
                        className="font-medium text-app-fg"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="uppercase text-app-fg-muted">
                        Supplier Code
                      </Label>
                      <Input
                        id="supplier-code"
                        name="supplier-code"
                        value={header.supplier_code}
                        onChange={(e) => updateHeader("supplier_code", e.target.value)}
                        className="font-medium text-app-fg"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="uppercase text-app-fg-muted">
                        Phone
                      </Label>
                      <Input
                        value={header.supplier_phone}
                        onChange={(e) => updateHeader("supplier_phone", e.target.value)}
                        className="font-medium text-app-fg"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="uppercase text-app-fg-muted">
                        Email
                      </Label>
                      <Input
                        type="email"
                        value={header.supplier_email}
                        onChange={(e) => updateHeader("supplier_email", e.target.value)}
                        className="font-medium text-app-fg"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="references" className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-1.5">
                      <Label className="uppercase text-app-fg-muted">
                        Enquiry No
                      </Label>
                      <Input
                        value={header.enquiry_no}
                        onChange={(e) => updateHeader("enquiry_no", e.target.value)}
                        className="font-medium text-app-fg"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="uppercase text-app-fg-muted">
                        RC Number
                      </Label>
                      <Input
                        value={header.rc_no}
                        onChange={(e) => updateHeader("rc_no", e.target.value)}
                        className="font-medium text-app-fg"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="uppercase text-app-fg-muted">
                        Order Type
                      </Label>
                      <Input
                        value={header.order_type}
                        onChange={(e) => updateHeader("order_type", e.target.value)}
                        className="font-medium text-app-fg"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="financial" className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-1.5">
                      <Label className="uppercase text-app-fg-muted">
                        TIN Number
                      </Label>
                      <Input
                        value={header.tin_no}
                        onChange={(e) => updateHeader("tin_no", e.target.value)}
                        className="font-medium text-app-fg font-mono"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="uppercase text-app-fg-muted">
                        ECC Number
                      </Label>
                      <Input
                        value={header.ecc_no}
                        onChange={(e) => updateHeader("ecc_no", e.target.value)}
                        className="font-medium text-app-fg font-mono"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="uppercase text-app-fg-muted">
                        MPCT Number
                      </Label>
                      <Input
                        value={header.mpct_no}
                        onChange={(e) => updateHeader("mpct_no", e.target.value)}
                        className="font-medium text-app-fg font-mono"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="issuer" className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-1.5">
                      <Label className="uppercase text-app-fg-muted">
                        Issuer Name
                      </Label>
                      <Input
                        value={header.issuer_name}
                        onChange={(e) => updateHeader("issuer_name", e.target.value)}
                        className="font-medium text-app-fg"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="uppercase text-app-fg-muted">
                        Designation
                      </Label>
                      <Input
                        value={header.issuer_designation}
                        onChange={(e) => updateHeader("issuer_designation", e.target.value)}
                        className="font-medium text-app-fg"
                      />
                    </div>
                    <div className="col-span-full space-y-1.5">
                      <Label className="uppercase text-app-fg-muted">
                        Remarks
                      </Label>
                      <textarea
                        id="remarks"
                        name="remarks"
                        value={header.remarks}
                        onChange={(e) => updateHeader("remarks", e.target.value)}
                        className="w-full px-3 py-2 text-app-fg bg-app-surface-hover/10 border border-app-border/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-app-accent/10 focus:border-app-accent/30 resize-none transition-all"
                        rows={3}
                        placeholder="Additional project information..."
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="consignee" className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <Label className="uppercase text-app-fg-muted">
                        Consignee Name
                      </Label>
                      <Input
                        value={header.consignee_name}
                        onChange={(e) => updateHeader("consignee_name", e.target.value)}
                        className="font-medium text-app-fg"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="uppercase text-app-fg-muted">
                        Consignee Address
                      </Label>
                      <textarea
                        value={header.consignee_address}
                        onChange={(e) => updateHeader("consignee_address", e.target.value)}
                        className="w-full px-3 py-2 text-app-fg bg-app-surface-hover/10 border border-app-border/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-app-accent/10 focus:border-app-accent/30 resize-none transition-all"
                        rows={3}
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
          <div className="flex items-center justify-between px-1">
            <H3 className="font-medium text-app-fg text-sm">
              Material Items ({items.length})
            </H3>
            <Button color="secondary" size="sm" onClick={addItem}>
              <Plus size={16} className="mr-2" />
              Add Item
            </Button>
          </div>

          <Card className="p-0 overflow-hidden border-none shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-app-border/10 bg-app-surface-hover/30">
                    <th className="py-3 px-6 text-left">
                      <Label className="uppercase text-app-fg-muted">
                        #
                      </Label>
                    </th>
                    <th className="py-3 px-6 text-left">
                      <Label className="uppercase text-app-fg-muted">
                        Material Details
                      </Label>
                    </th>
                    <th className="py-3 px-6 text-right">
                      <Label className="uppercase text-app-fg-muted">
                        Qty
                      </Label>
                    </th>
                    <th className="py-3 px-6 text-right">
                      <Label className="uppercase text-app-fg-muted">
                        Rate
                      </Label>
                    </th>
                    <th className="py-3 px-6 text-right">
                      <Label className="uppercase text-app-fg-muted">
                        Value
                      </Label>
                    </th>
                    <th className="py-3 px-6 w-16"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.length > 0 ? (
                    items.map((item: any, idx: number) => (
                      <tr
                        key={`item-${idx}`}
                        className="border-b border-app-border/5 hover:bg-app-surface-hover/5 transition-colors"
                      >
                        <td className="py-4 px-6">
                          <Accounting className="font-medium text-app-fg font-mono text-center block">
                            {item.po_item_no}
                          </Accounting>
                        </td>
                        <td className="py-4 px-6 space-y-3 min-w-[300px]">
                          <Input
                            value={item.material_description}
                            onChange={(e) =>
                              updateItem(idx, "material_description", e.target.value)
                            }
                            placeholder="Material Description"
                            className="font-medium text-app-fg"
                          />
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <Label className="uppercase text-app-fg-muted ml-1">
                                Code
                              </Label>
                              <Input
                                value={item.material_code}
                                onChange={(e) => updateItem(idx, "material_code", e.target.value)}
                                placeholder="Code"
                                className="font-medium text-app-fg h-8"
                              />
                            </div>
                            <div>
                              <Label className="uppercase text-app-fg-muted ml-1">
                                Drawing
                              </Label>
                              <Input
                                value={item.drg_no}
                                onChange={(e) => updateItem(idx, "drg_no", e.target.value)}
                                placeholder="DRG"
                                className="font-medium text-app-fg h-8"
                              />
                            </div>
                            <div>
                              <Label className="uppercase text-slate-400 ml-1">
                                Unit
                              </Label>
                              <Input
                                value={item.unit}
                                onChange={(e) => updateItem(idx, "unit", e.target.value)}
                                placeholder="Unit"
                                className="font-medium text-app-fg h-8 uppercase"
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <Input
                            type="number"
                            value={item.ord_qty}
                            onChange={(e) => updateItem(idx, "ord_qty", parseFloat(e.target.value))}
                            className="text-right font-mono"
                          />
                        </td>
                        <td className="py-4 px-6">
                          <Input
                            type="number"
                            value={item.po_rate}
                            onChange={(e) => updateItem(idx, "po_rate", parseFloat(e.target.value))}
                            className="text-right font-mono"
                          />
                        </td>
                        <td className="py-4 px-6 text-right">
                          <Accounting className="font-medium text-app-fg font-mono block">
                            {item.item_value}
                          </Accounting>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.po_item_no)}
                            className="text-app-fg-muted hover:text-app-status-error"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-24 text-center">
                        <div className="flex flex-col items-center justify-center opacity-40">
                          <Package className="w-12 h-12 text-app-fg-muted/30 mb-3 stroke-[1.5]" />
                          <Body className="text-app-fg-muted/60">
                            No material items defined yet
                          </Body>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {items.length > 0 && (
              <div className="bg-app-surface-hover/30 border-t border-app-border/10 p-8 flex justify-end">
                <div className="text-right flex items-center gap-8">
                  <Label className="text-small uppercase tracking-[0.2em] text-app-fg-muted">
                    Estimated Total Value
                  </Label>
                  <Accounting
                    isCurrency
                    className="text-2xl text-app-fg font-mono"
                  >
                    {items.reduce((acc: number, cur: any) => acc + (cur.item_value || 0), 0)}
                  </Accounting>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </DocumentTemplate>
  );
}




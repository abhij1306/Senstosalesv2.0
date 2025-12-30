"use client";

import { useEffect, useState, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Save, Loader2, AlertCircle, Search, ChevronDown, Check, X, CheckCircle2 } from "lucide-react";
import { api, type Buyer } from "@/lib/api";
import type { InvoiceFormData, InvoiceItemUI } from "@/types/ui";
import { createDefaultInvoiceForm } from "@/lib/uiAdapters";
import { amountInWords, formatIndianCurrency } from "@/lib/utils";
import * as Select from "@radix-ui/react-select";
import { motion, useDragControls } from "framer-motion";
import {
  H3,
  Label,
  SmallText,
  Body,
  Accounting,
  Button,
  Input,
  Card,
  DocumentTemplate,
} from "@/components/design-system";
import { DocumentJourney } from "@/components/design-system/molecules/DocumentJourney";

const TAX_RATES = { cgst: 9.0, sgst: 9.0 };

function CreateInvoicePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dcId = searchParams?.get("dc") || "";

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItemUI[]>([]);
  const [manualDcId, setManualDcId] = useState(dcId);
  const [formData, setFormData] = useState<InvoiceFormData>(
    createDefaultInvoiceForm(dcId || undefined)
  );

  // Multi-Buyer States
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [selectedBuyerId, setSelectedBuyerId] = useState<string>("");

  const [isDuplicate, setIsDuplicate] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, [dcId]);

  const fetchInitialData = async () => {
    try {
      const buyerList = await api.getBuyers();
      setBuyers(buyerList);

      const defaultBuyer = buyerList.find((b) => b.is_default);
      if (defaultBuyer) {
        setSelectedBuyerId(defaultBuyer.id.toString());
        applyBuyerToForm(defaultBuyer);
      } else if (buyerList.length > 0) {
        setSelectedBuyerId(buyerList[0].id.toString());
        applyBuyerToForm(buyerList[0]);
      }

      if (dcId) loadDC(dcId);
    } catch {
      // Logic failure for buyers not critical
    }
  };

  const applyBuyerToForm = (buyer: Buyer) => {
    setFormData((prev) => ({
      ...prev,
      buyer_name: buyer.name,
      buyer_gstin: buyer.gstin,
      buyer_address: buyer.billing_address,
      buyer_state: buyer.state || "",
      buyer_state_code: buyer.state_code || "",
      place_of_supply: buyer.place_of_supply,
    }));
  };

  const handleBuyerChange = (id: string) => {
    setSelectedBuyerId(id);
    const buyer = buyers.find((b) => b.id.toString() === id);
    if (buyer) applyBuyerToForm(buyer);
  };

  const checkNumberDuplicate = async (num: string, date: string) => {
    if (!num || num.length < 3) return;
    setIsChecking(true);
    try {
      const res = await api.checkDuplicateNumber("Invoice", num, date);
      setIsDuplicate(res.exists);
    } catch {
      // Fail silently
    } finally {
      setIsChecking(false);
    }
  };

  const loadDC = useCallback(async (id: string) => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.getDCDetail(id);

      if (!data?.header) {
        setError("Challan not found.");
        setLoading(false);
        return;
      }

      setFormData((prev) => ({
        ...prev,
        dc_number: data.header.dc_number || "",
        challan_date: data.header.dc_date || "",
        buyers_order_no: data.header.po_number?.toString() || "",
        buyers_order_date: data.header.po_date || "",
        vehicle_no: data.header.vehicle_no || "",
        lr_no: data.header.lr_no || "",
        transporter: data.header.transporter || "",
        destination: (data.header as any).destination || "",
      }));

      if (data.items?.length > 0) {
        const items: InvoiceItemUI[] = data.items.map((item: any) => {
          const qty = item.dispatched_quantity || item.dispatch_qty || 0;
          const rate = item.po_rate || 0;
          const taxableValue = qty * rate;
          const cgstAmount = (taxableValue * TAX_RATES.cgst) / 100;
          const sgstAmount = (taxableValue * TAX_RATES.sgst) / 100;
          return {
            lotNumber: item.lot_no?.toString() || "",
            description: item.description || item.material_description || "",
            hsnCode: item.hsn_code || "",
            quantity: qty,
            unit: "NO",
            rate: rate,
            taxableValue,
            tax: {
              cgstRate: TAX_RATES.cgst,
              cgstAmount,
              sgstRate: TAX_RATES.sgst,
              sgstAmount,
              igstRate: 0,
              igstAmount: 0,
            },
            totalAmount: taxableValue + cgstAmount + sgstAmount,
          };
        });
        setInvoiceItems(items);
        calculateTotals(items);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load DC");
    } finally {
      setLoading(false);
    }
  }, []);

  const calculateTotals = (items: InvoiceItemUI[]) => {
    const taxable = items.reduce((sum, item) => sum + item.taxableValue, 0);
    const cgst = items.reduce((sum, item) => sum + item.tax.cgstAmount, 0);
    const sgst = items.reduce((sum, item) => sum + item.tax.sgstAmount, 0);
    const total = items.reduce((sum, item) => sum + item.totalAmount, 0);

    const validTotal = isNaN(total) ? 0 : total;

    setFormData(
      (prev) =>
        ({
          ...prev,
          taxable_value: isNaN(taxable) ? 0 : taxable,
          cgst: isNaN(cgst) ? 0 : cgst,
          sgst: isNaN(sgst) ? 0 : sgst,
          total_invoice_value: validTotal,
          amount_in_words: amountInWords(validTotal),
        }) as any
    );
  };

  const handleSave = async () => {
    setShowWarning(false);
    setSaving(true);
    setError(null);
    try {
      const apiItems = invoiceItems.map((item) => ({
        po_sl_no: item.lotNumber,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit || "NO",
        rate: item.rate,
        hsn_sac: item.hsnCode,
        no_of_packets: (item as any).no_of_packets,
      }));

      const payload = {
        invoice_number: formData.invoice_number,
        invoice_date: formData.invoice_date,
        dc_number: formData.dc_number,
        buyer_name: formData.buyer_name,
        buyer_address: (formData as any).buyer_address,
        buyer_gstin: formData.buyer_gstin,
        buyer_state: formData.buyer_state,
        buyer_state_code: (formData as any).buyer_state_code,
        place_of_supply: formData.place_of_supply,
        buyers_order_no: formData.buyers_order_no,
        buyers_order_date: formData.buyers_order_date,
        vehicle_no: formData.vehicle_no,
        lr_no: formData.lr_no,
        transporter: formData.transporter,
        destination: formData.destination,
        terms_of_delivery: formData.terms_of_delivery,
        gemc_number: formData.gemc_number,
        gemc_date: formData.gemc_date,
        mode_of_payment: formData.mode_of_payment,
        payment_terms: formData.payment_terms || "45 Days",
        despatch_doc_no: formData.despatch_doc_no,
        srv_no: formData.srv_no,
        srv_date: formData.srv_date,
        remarks: formData.remarks,
        items: apiItems,
      };

      await api.createInvoice(payload);
      router.push(`/invoice/${formData.invoice_number}`);
    } catch (err: any) {
      // console.error("Invoice creation failed:", err);
      // Handle Pydantic 422 errors specifically to show something readable
      if (err.status === 422 && Array.isArray(err.data?.detail)) {
        const details = err.data.detail.map((d: any) => `${d.loc.join(".")}: ${d.msg}`).join(", ");
        setError(`Validation Error: ${details}`);
      } else {
        const msg =
          typeof err.message === "object"
            ? JSON.stringify(err.message)
            : err.message || "Failed to create invoice";
        setError(msg);
      }
    } finally {
      setSaving(false);
    }
  };

  const topActions = (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={() => router.back()} disabled={saving}>
        Cancel
      </Button>
      <Button
        variant="default"
        size="sm"
        onClick={() => setShowWarning(true)}
        disabled={
          saving ||
          invoiceItems.length === 0 ||
          isDuplicate ||
          isChecking ||
          !formData.invoice_number
        }
      >
        {saving ? (
          <Loader2 size={16} className="animate-spin mr-2" />
        ) : (
          <Save size={16} className="mr-2" />
        )}
        {saving ? "Saving..." : "Generate Invoice"}
      </Button>
    </div>
  );

  return (
    <DocumentTemplate
      title="Create GST Invoice"
      description="Generate billing documentation from DC"
      actions={topActions}
    >
      <div className="mb-6">
        <DocumentJourney currentStage="Invoice" />
      </div>

      <div className="space-y-6">
        {error && (
          <Card className="p-4 bg-red-50 border-red-100">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle size={16} />
              <SmallText className="font-medium">{error}</SmallText>
            </div>
          </Card>
        )}

        {/* DC Selection */}
        {!dcId && (
          <Card className="p-6">
            <Label className="text-app-fg-muted mb-2 block">
              Delivery Challan Reference
            </Label>
            <div className="flex gap-3 mt-1">
              <div className="flex-1">
                <Input
                  value={manualDcId}
                  onChange={(e) => setManualDcId(e.target.value)}
                  placeholder="Enter DC number"
                  className="font-medium text-app-fg"
                />
              </div>
              <Button
                variant="secondary"
                onClick={() => loadDC(manualDcId)}
                disabled={!manualDcId || loading}
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin mr-2" />
                ) : (
                  <Search size={16} className="mr-2" />
                )}
                {loading ? "Loading..." : "Load DC"}
              </Button>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Invoice Details */}
            {/* Invoice Details */}
            <Card className="p-6">
              <H3 className="mb-6 text-app-fg text-sm">Invoice Information</H3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                <div className="space-y-1.5">
                  <Label className="text-app-fg-muted">
                    Invoice Number
                  </Label>
                  <Input
                    value={formData.invoice_number}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData({ ...formData, invoice_number: val });
                      checkNumberDuplicate(val, formData.invoice_date);
                    }}
                    className={cn(
                      "font-medium tabular-nums",
                      isDuplicate
                        ? "border-app-status-error text-app-status-error focus:ring-app-status-error/10"
                        : "text-app-fg"
                    )}
                    placeholder="INV/001/24-25"
                  />
                  {isChecking && (
                    <SmallText className="text-app-fg-muted animate-pulse">
                      Checking uniqueness...
                    </SmallText>
                  )}
                  {isDuplicate && (
                    <SmallText className="text-app-status-error">
                      This number already exists in this FY
                    </SmallText>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-app-fg-muted">
                    Invoice Date
                  </Label>
                  <Input
                    type="date"
                    value={formData.invoice_date}
                    onChange={(e) => setFormData({ ...formData, invoice_date: e.target.value })}
                    className="font-medium text-app-fg"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-app-fg-muted">
                    Linked DC
                  </Label>
                  <div className="font-medium text-app-fg tabular-nums px-3 py-2 bg-app-surface-hover/30 rounded-xl border border-dashed border-app-border">
                    {formData.dc_number || "---"}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-app-fg-muted">
                    Order Reference
                  </Label>
                  <div className="font-medium text-app-fg px-3 py-2 bg-app-surface-hover/30 rounded-xl border border-dashed border-app-border">
                    {formData.buyers_order_no || "---"}
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <H3 className="mb-6 text-app-fg text-sm">Logistics & Payments</H3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                <div className="space-y-1.5">
                  <Label className="text-app-fg-muted">
                    Vehicle No
                  </Label>
                  <Input
                    value={formData.vehicle_no || ""}
                    onChange={(e) => setFormData({ ...formData, vehicle_no: e.target.value })}
                    className="font-medium text-app-fg"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-app-fg-muted">
                    Transporter
                  </Label>
                  <Input
                    value={formData.transporter || ""}
                    onChange={(e) => setFormData({ ...formData, transporter: e.target.value })}
                    className="font-medium text-app-fg"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-app-fg-muted">
                    Payment Terms
                  </Label>
                  <Input
                    value={formData.payment_terms || "45 Days"}
                    onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                    className="font-medium text-app-fg"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-app-fg-muted">
                    Mode of Payment
                  </Label>
                  <Input
                    value={formData.mode_of_payment || ""}
                    onChange={(e) => setFormData({ ...formData, mode_of_payment: e.target.value })}
                    className="font-medium text-app-fg"
                  />
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Buyer Selection Card */}
            <Card className="p-6 border-app-accent/20 bg-app-accent/5 ring-1 ring-app-accent/10">
              <Label className="text-app-accent mb-4 block">
                Bill To: Entity Selection
              </Label>

              <Select.Root value={selectedBuyerId} onValueChange={handleBuyerChange}>
                <Select.Trigger className="flex items-center justify-between w-full px-4 py-2 bg-white border border-blue-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all">
                  <Select.Value placeholder="Select Buyer" />
                  <Select.Icon>
                    <ChevronDown size={14} className="text-blue-400" />
                  </Select.Icon>
                </Select.Trigger>
                <Select.Portal>
                  <Select.Content className="overflow-hidden bg-white rounded-xl shadow-xl border border-slate-100 z-50">
                    <Select.Viewport className="p-1">
                      {buyers.map((b) => (
                        <Select.Item
                          key={b.id}
                          value={b.id.toString()}
                          className="flex items-center px-8 py-2 text-sm text-slate-700 rounded-lg outline-none hover:bg-blue-50 hover:text-blue-700 cursor-pointer relative data-[highlighted]:bg-blue-50"
                        >
                          <Select.ItemText>{b.name}</Select.ItemText>
                          <Select.ItemIndicator className="absolute left-2">
                            <Check size={14} />
                          </Select.ItemIndicator>
                        </Select.Item>
                      ))}
                    </Select.Viewport>
                  </Select.Content>
                </Select.Portal>
              </Select.Root>

              <div className="mt-8 pt-6 border-t border-blue-100 space-y-4">
                <div>
                  <Label>Live Snapshot</Label>
                  <H3 className="text-app-fg leading-tight">
                    {formData.buyer_name || "---"}
                  </H3>
                </div>
                <div className="space-y-1">
                  <Label>GSTIN</Label>
                  <Accounting className="text-h4 text-app-accent">
                    {formData.buyer_gstin || "---"}
                  </Accounting>
                </div>
                <div className="space-y-1">
                  <Label>Billing Address</Label>
                  <SmallText className="text-app-fg-muted block leading-relaxed">
                    {formData.buyer_address || "---"}
                  </SmallText>
                </div>
                <div className="flex items-center gap-4">
                  <div>
                    <Label>State</Label>
                    <SmallText className="font-bold text-app-fg">
                      {formData.buyer_state || "---"}
                    </SmallText>
                  </div>
                  <div>
                    <Label>POS</Label>
                    <SmallText className="font-bold text-app-fg">
                      {formData.place_of_supply || "---"}
                    </SmallText>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Items Table */}
        {invoiceItems.length > 0 && (
          <Card className="p-0 overflow-hidden border-none shadow-sm">
            <div className="px-6 py-4 bg-app-surface-hover/30 border-b border-app-border">
              <H3 className="font-medium text-app-fg">
                Invoice Items ({invoiceItems.length})
              </H3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/30">
                    <th className="py-3 px-6 text-left">
                      <Label>Lot</Label>
                    </th>
                    <th className="py-3 px-6 text-left">
                      <Label>Description</Label>
                    </th>
                    <th className="py-3 px-6 text-left">
                      <Label>HSN</Label>
                    </th>
                    <th className="py-3 px-6 text-right">
                      <Label>Qty</Label>
                    </th>
                    <th className="py-3 px-6 text-right">
                      <Label>Rate</Label>
                    </th>
                    <th className="py-3 px-6 text-right">
                      <Label>Total</Label>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceItems.map((item, idx) => (
                    <tr
                      key={`item-${idx}`}
                      className="border-b border-app-border hover:bg-app-surface-hover/5 transition-colors"
                    >
                      <td className="py-2 px-6">
                        <Accounting className="font-medium text-app-fg font-mono">
                          {item.lotNumber}
                        </Accounting>
                      </td>
                      <td className="py-2 px-6 text-app-fg">{item.description}</td>
                      <td className="py-2 px-6 font-mono text-app-fg-muted">
                        {item.hsnCode}
                      </td>
                      <td className="py-2 px-6 text-right">
                        <Accounting className="text-app-fg-muted text-right block">
                          {item.quantity}
                        </Accounting>
                      </td>
                      <td className="py-2 px-6 text-right text-app-fg-muted font-mono">
                        {formatIndianCurrency(item.rate)}
                      </td>
                      <td className="py-2 px-6 text-right text-app-fg">
                        <Accounting isCurrency className="font-mono text-right block">
                          {item.totalAmount}
                        </Accounting>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-app-surface-hover/30 border-t border-app-border p-8">
              <div className="grid grid-cols-2 gap-x-12 gap-y-4 max-w-sm ml-auto">
                <Label>Taxable Value</Label>
                <Accounting isCurrency className="text-right text-app-fg-muted">
                  {formData.taxable_value || 0}
                </Accounting>

                <Label>CGST @ 9%</Label>
                <Accounting isCurrency className="text-right text-app-fg-muted">
                  {formData.cgst || 0}
                </Accounting>

                <Label>SGST @ 9%</Label>
                <Accounting isCurrency className="text-right text-app-fg-muted">
                  {formData.sgst || 0}
                </Accounting>

                <div className="col-span-2 my-2 border-t border-app-border"></div>

                <Label className="text-small leading-tight text-app-fg">
                  Grand Total
                </Label>
                <Accounting isCurrency className="text-right text-xl text-app-fg">
                  {formData.total_invoice_value}
                </Accounting>

                <div className="col-span-2 mt-4 text-right">
                  <SmallText className="italic text-app-fg-muted">
                    {(formData as any).amount_in_words || "---"} Only
                  </SmallText>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Invoice Generation Warning Modal */}
      {showWarning && (
        <DraggableWarningModal
          onClose={() => setShowWarning(false)}
          onConfirm={handleSave}
        />
      )}
    </DocumentTemplate>
  );
}

// Extracted for cleaner Hook usage (useDragControls)
function DraggableWarningModal({ onClose, onConfirm }: { onClose: () => void; onConfirm: () => void }) {
  const dragControls = useDragControls();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        drag
        dragListener={false}
        dragControls={dragControls}
        dragMomentum={false}
        whileDrag={{ scale: 1.02, cursor: "grabbing" }}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: "spring", duration: 0.3 }}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
        className="relative w-full max-w-md cursor-default"
      >
        <Card className="p-0 overflow-hidden border-none shadow-2xl bg-white/95 backdrop-blur-xl">
          {/* Header with gradient - DRAGGABLE HANDLE */}
          <div
            onPointerDown={(e) => dragControls.start(e)}
            className="relative px-6 pt-6 pb-4 bg-gradient-to-br from-amber-50 to-orange-50 border-b border-amber-100 cursor-grab active:cursor-grabbing select-none"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <H3 className="text-slate-900 mb-1">⚠️ Critical Warning</H3>
                <SmallText className="text-slate-600">
                  Please read carefully before proceeding
                </SmallText>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
              <Body className="text-slate-800 leading-relaxed">
                Once this <strong className="text-amber-700">Invoice is generated</strong>, it{" "}
                <strong className="text-red-600">cannot be modified or deleted</strong>.
              </Body>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700 font-medium flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                The invoice will be permanently locked
              </Label>
              <Label className="text-slate-700 font-medium flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                The linked DC will also be locked from editing
              </Label>
              <Label className="text-slate-700 font-medium flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                Ensure all details are correct before proceeding
              </Label>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="flex-1 border-slate-300 hover:bg-slate-100"
            >
              <X size={16} className="mr-2" />
              Cancel
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={onConfirm}
              className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg"
            >
              <CheckCircle2 size={16} className="mr-2" />
              I Understand, Proceed
            </Button>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}


export default function CreateInvoicePage() {
  return (
    <Suspense
      fallback={
        <div className="p-32 text-center">
          <Body className="text-slate-400 animate-pulse">Loading template...</Body>
        </div>
      }
    >
      <CreateInvoicePageContent />
    </Suspense>
  );
}




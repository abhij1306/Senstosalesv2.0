"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Save, Search, AlertCircle, Loader2, Plus, Trash2, Truck, Calendar } from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { DCItemRow, POHeader } from "@/types";
import {
  H3,
  Label,
  SmallText,
  Body,
  Accounting,
  MonoCode,
  Button,
  Badge,
  Input,
  Card,
  DocumentJourney,
  DocumentTemplate,
} from "@/components/design-system";
import { CreateDCSkeleton } from "@/components/design-system/molecules/skeletons/CreateDCSkeleton";

function CreateDCPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPoNumber = searchParams ? searchParams.get("po") : "";

  const [poNumber, setPONumber] = useState(initialPoNumber || "");
  const [items, setItems] = useState<DCItemRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [poData, setPOData] = useState<POHeader | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notes, setNotes] = useState<string[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [conflictType, setConflictType] = useState<string | null>(null);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  const [formData, setFormData] = useState({
    dc_number: "",
    dc_date: new Date().toISOString().split("T")[0],
    supplier_phone: "0755 – 4247748",
    supplier_gstin: "23AACFS6810L1Z7",
    consignee_name: "",
    consignee_address: "",
  });

  useEffect(() => {
    if (initialPoNumber) {
      loadInitialData(initialPoNumber);
    }
  }, [initialPoNumber]);

  const loadInitialData = async (po: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const [lots, pod] = await Promise.all([
        api.getReconciliationLots(parseInt(po)),
        api.getPODetail(parseInt(po)),
      ]);

      // Process Lots
      const lotsData = Array.isArray(lots) ? lots : (lots as any)?.lots || [];
      const mappedItems: DCItemRow[] = lotsData.map((lot: any) => ({
        id: `${lot.po_item_id}-${lot.lot_no}`,
        lot_no: lot.lot_no?.toString() || "",
        description: lot.material_description || "",
        drg_no: lot.drg_no || "",
        ordered_quantity: lot.ordered_qty || 0,
        remaining_post_dc: lot.remaining_qty || 0,
        dispatch_quantity: 0,
        po_item_id: lot.po_item_id,
      }));
      setItems(mappedItems);
      if (mappedItems.length === 0) setError("No items available for dispatch");

      // Process PO Data
      if (pod?.header) {
        setPOData(pod.header);
        setFormData((prev) => ({
          ...prev,
          consignee_name: (pod.header as any)?.consignee_name || "",
          consignee_address: (pod.header as any)?.consignee_address || "",
          supplier_phone: pod.header?.supplier_phone || "0755 – 4247748",
          supplier_gstin: pod.header?.supplier_gstin || "23AACFS6810L1Z7",
        }));
      }
    } catch (err: any) {
      setError(err.message || "Failed to load initial data");
    } finally {
      setIsLoading(false);
    }
  };

  const checkNumberDuplicate = async (num: string, date: string) => {
    if (!num || num.trim() === "") return;
    setIsChecking(true);
    try {
      const res = await api.checkDuplicateNumber("DC", num, date);
      setIsDuplicate(res.exists);
      setConflictType(res.conflict_type || null);
    } catch {
      // If check fails, don't block user (fail open)
      setIsDuplicate(false);
      setConflictType(null);
    } finally {
      setIsChecking(false);
    }
  };

  const handleLoadItems = (po: string) => {
    if (!po) return;
    loadInitialData(po);
  };

  const handleSubmit = async () => {
    setError(null);
    setIsSubmitting(true);
    const itemsToDispatch = items.filter(
      (item) => item.dispatch_quantity && item.dispatch_quantity > 0
    );
    if (itemsToDispatch.length === 0) {
      setError("At least one item must have dispatch quantity");
      setIsSubmitting(false);
      return;
    }
    // Validation: Check for over-delivery
    const overDeliveryItem = itemsToDispatch.find(
      (item) => item.dispatch_quantity > (item.remaining_post_dc || 0)
    );
    if (overDeliveryItem) {
      setError(
        `Cannot dispatch more than remaining quantity (Lot ${overDeliveryItem.lot_no}: ${overDeliveryItem.dispatch_quantity} > ${overDeliveryItem.remaining_post_dc})`
      );
      setIsSubmitting(false);
      return;
    }
    try {
      const dcPayload = {
        dc_number: formData.dc_number,
        dc_date: formData.dc_date,
        po_number: poNumber ? parseInt(poNumber) : undefined,
        supplier_phone: formData.supplier_phone,
        supplier_gstin: formData.supplier_gstin,
        consignee_name: formData.consignee_name,
        consignee_address: formData.consignee_address,
        remarks: notes.join("\n\n"),
      };
      const itemsPayload = itemsToDispatch.map((item) => ({
        po_item_id: item.po_item_id,
        lot_no: item.lot_no ? parseInt(item.lot_no.toString()) : undefined,
        dispatch_qty: item.dispatch_quantity,
        hsn_code: null,
        hsn_rate: null,
      }));
      const response = (await api.createDC(dcPayload, itemsPayload)) as any;
      router.push(`/dc/${response.dc_number || formData.dc_number}`);
    } catch (err: any) {
      // Handle Pydantic 422 errors specifically to show something readable
      if (err.status === 422 && Array.isArray(err.data?.detail)) {
        const details = err.data.detail.map((d: any) => `${d.loc.join(".")}: ${d.msg}`).join(", ");
        setError(`Validation Error: ${details}`);
      } else {
        const msg =
          typeof err.message === "object"
            ? JSON.stringify(err.message)
            : err.message || "Failed to create challan";
        setError(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const topActions = (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={() => router.back()} disabled={isSubmitting}>
        Cancel
      </Button>
      <Button
        color="primary"
        size="sm"
        onClick={handleSubmit}
        disabled={
          isSubmitting || items.length === 0 || isDuplicate || isChecking || !formData.dc_number
        }
      >
        {isSubmitting ? (
          <Loader2 size={16} className="animate-spin mr-2" />
        ) : (
          <Save size={16} className="mr-2" />
        )}
        {isSubmitting ? "Generating..." : "Generate Challan"}
      </Button>
    </div>
  );

  return (
    <DocumentTemplate
      title="Create Delivery Challan"
      description="Generate dispatch documentation from PO"
      actions={topActions}
      icon={<Truck size={20} className="text-app-status-success" />}
      iconLayoutId="create-dc-icon"
    >
      <div className="mb-6">
        <DocumentJourney currentStage="DC" />
      </div>

      <div className="space-y-6">
        {error && (
          <Card className="p-4 bg-app-status-error/10 border-app-status-error/20">
            <div className="flex items-center gap-2 text-app-status-error">
              <AlertCircle size={16} />
              <SmallText className="font-medium">{error}</SmallText>
            </div>
          </Card>
        )}

        {/* PO Selection */}
        {!initialPoNumber && (
          <Card className="p-6">
            <Label className="mb-2 block">
              Purchase Order Reference
            </Label>
            <div className="flex gap-3 mt-1">
              <div className="flex-1">
                <Input
                  id="search-po-number"
                  name="search-po-number"
                  value={poNumber}
                  onChange={(e) => setPONumber(e.target.value)}
                  placeholder="Enter PO number"
                  className="font-medium text-app-fg"
                />
              </div>
              <Button
                variant="secondary"
                onClick={() => handleLoadItems(poNumber)}
                disabled={!poNumber || isLoading}
              >
                {isLoading ? (
                  <Loader2 size={16} className="animate-spin mr-2" />
                ) : (
                  <Search size={16} className="mr-2" />
                )}
                {isLoading ? "Loading..." : "Load Items"}
              </Button>
            </div>
            {poData && (
              <div className="mt-4 p-4 bg-slate-50/50 rounded-xl border border-slate-100 flex items-center justify-between">
                <div className="flex flex-col">
                  <Label className="text-app-fg-muted">
                    Supplier
                  </Label>
                  <Body className="text-app-fg">{poData.supplier_name}</Body>
                </div>
                <Badge
                  variant="outline"
                  className="bg-app-surface text-app-fg-muted border-app-border"
                >
                  PO #{poData.po_number}
                </Badge>
              </div>
            )}
          </Card>
        )}

        {/* Challan Details */}
        <Card className="surface-claymorphic shadow-clay-surface p-6">
          <H3 className="mb-6 text-app-fg">Challan Information</H3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="space-y-1.5">
              <Label className="text-app-fg-muted">
                DC Number
              </Label>
              <Input
                id="dc-number"
                name="dc-number"
                value={formData.dc_number}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData({ ...formData, dc_number: val });

                  // Clear existing timer
                  if (debounceTimer) clearTimeout(debounceTimer);

                  // Debounce the duplicate check (500ms delay)
                  const timer = setTimeout(() => {
                    checkNumberDuplicate(val, formData.dc_date);
                  }, 500);

                  setDebounceTimer(timer);
                }}
                className={cn(
                  "font-medium tabular-nums",
                  isDuplicate
                    ? "border-app-status-error text-app-status-error focus:ring-app-status-error/10"
                    : "text-app-fg"
                )}
                placeholder="DC/001/24-25"
              />
              {isChecking && (
                <SmallText className="text-app-fg-muted animate-pulse">
                  Checking uniqueness...
                </SmallText>
              )}
              {isDuplicate && (
                <SmallText className="text-app-status-error font-medium">
                  {conflictType === "Invoice"
                    ? `⚠️ Invoice #${formData.dc_number} already exists in this FY`
                    : `This DC number already exists in this FY`}
                </SmallText>
              )}

            </div>
            <div className="space-y-1.5">
              <Label className="text-app-fg-muted">
                DC Date
              </Label>
              <div className="bg-app-surface-hover/30 backdrop-blur-md px-3 py-1.5 rounded-xl border border-app-border shadow-sm focus-within:ring-2 focus-within:ring-app-accent/10 transition-all flex items-center gap-2">
                <Calendar size={14} className="text-app-accent" />
                <Input
                  id="dc-date"
                  name="dc-date"
                  type="date"
                  value={formData.dc_date}
                  onChange={(e) => setFormData({ ...formData, dc_date: e.target.value })}
                  className="text-app-fg bg-transparent border-none p-0 focus:ring-0 cursor-pointer text-sm font-medium"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-app-fg-muted">
                Supplier Phone
              </Label>
              <Input
                id="supplier-phone"
                name="supplier-phone"
                value={formData.supplier_phone}
                onChange={(e) => setFormData({ ...formData, supplier_phone: e.target.value })}
                className="font-medium text-app-fg"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-app-fg-muted">
                Supplier GSTIN
              </Label>
              <Input
                id="supplier-gstin"
                name="supplier-gstin"
                value={formData.supplier_gstin}
                onChange={(e) => setFormData({ ...formData, supplier_gstin: e.target.value })}
                className="font-medium text-sys-primary"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-app-fg-muted">
                Consignee Name
              </Label>
              <Input
                id="consignee-name"
                name="consignee-name"
                value={formData.consignee_name}
                onChange={(e) => setFormData({ ...formData, consignee_name: e.target.value })}
                className="font-medium text-sys-primary"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-app-fg-muted">
                Consignee Address
              </Label>
              <textarea
                id="consignee-address"
                name="consignee-address"
                value={formData.consignee_address}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    consignee_address: e.target.value,
                  })
                }
                className="w-full px-3 py-2 text-sys-primary bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-950/10 focus:border-slate-300 resize-none transition-all"
                rows={2}
              />
            </div>
          </div>
        </Card>

        {/* Items Table */}
        {items.length > 0 && (
          <Card className="surface-claymorphic shadow-clay-surface p-0 overflow-hidden border-none">
            <div className="px-6 py-4 bg-app-surface-hover/30 border-b border-app-border/10 flex items-center justify-between">
              <H3 className="font-medium text-app-fg text-sm">
                Dispatch Items ({items.length})
              </H3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--color-sys-text-tertiary)]/10 bg-[var(--color-sys-bg-tertiary)]/10">
                    <th className="py-3 px-6 text-left">
                      <Label className="text-app-fg-muted">
                        Lot
                      </Label>
                    </th>
                    <th className="py-3 px-6 text-left">
                      <Label className="text-app-fg-muted">
                        Description
                      </Label>
                    </th>
                    <th className="py-3 px-6 text-right">
                      <Label className="text-app-fg-muted">
                        Ord
                      </Label>
                    </th>
                    <th className="py-3 px-6 text-right">
                      <Label className="text-app-fg-muted">
                        Bal
                      </Label>
                    </th>
                    <th className="py-3 px-6 text-right">
                      <Label className="text-app-fg-muted">
                        Dlv Qty
                      </Label>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => {
                    const isCompleted = (item.remaining_post_dc || 0) <= 0;
                    return (
                      <tr
                        key={item.id}
                        className={cn(
                          "border-b border-[var(--color-sys-text-tertiary)]/5 transition-colors",
                          isCompleted
                            ? "bg-slate-50/50 grayscale opacity-60"
                            : "hover:bg-[var(--color-sys-bg-tertiary)]/5"
                        )}
                      >
                        <td className="py-4 px-6">
                          <MonoCode className="text-app-fg text-center block">
                            {item.lot_no}
                          </MonoCode>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex flex-col">
                            <Body className="text-app-fg leading-normal">
                              {item.description}
                            </Body>
                            {item.drg_no && (
                              <SmallText className="uppercase text-app-fg-muted mt-0.5">
                                DRG: {item.drg_no}
                              </SmallText>
                            )}
                            {isCompleted && (
                              <Badge variant="outline" className="w-fit mt-1 text-xs px-1 py-0 border-green-200 text-green-700 bg-green-50">
                                COMPLETED
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <Accounting className="text-app-fg-muted text-right block">
                            {item.ordered_quantity}
                          </Accounting>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <Accounting className={cn(
                            "text-right block",
                            isCompleted ? "text-app-status-success font-medium" : "text-app-fg-muted"
                          )}>
                            {item.remaining_post_dc}
                          </Accounting>
                        </td>
                        <td className="py-4 px-6">
                          <Input
                            type="number"
                            disabled={isCompleted}
                            value={item.dispatch_quantity || ""}
                            onChange={(e) => {
                              const newItems = [...items];
                              newItems[idx].dispatch_quantity = parseFloat(e.target.value) || 0;
                              setItems(newItems);
                            }}
                            className={cn(
                              "text-right max-w-[100px] ml-auto font-mono h-9",
                              isCompleted
                                ? "bg-slate-100 text-slate-400 cursor-not-allowed border-transparent"
                                : "border-app-fg-muted/20 focus:ring-app-accent/5"
                            )}
                            placeholder={isCompleted ? "-" : "0"}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Notes */}
        <Card className="surface-claymorphic shadow-clay-surface p-6">
          <Label className="text-app-fg-muted mb-4 block">
            Additional Notes
          </Label>
          <div className="space-y-3">
            {notes.map((note, idx) => (
              <div key={`lot-${idx}`} className="flex gap-2">
                <Input
                  value={note}
                  onChange={(e) => {
                    const newNotes = [...notes];
                    newNotes[idx] = e.target.value;
                    setNotes(newNotes);
                  }}
                  placeholder="Enter additional information..."
                  className="font-medium text-app-fg"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setNotes(notes.filter((_, i) => i !== idx))}
                  className="text-app-fg-muted hover:text-app-status-error"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setNotes([...notes, ""])}
              className="border-dashed border-2 border-app-fg-muted/20 hover:border-app-accent/30"
            >
              <Plus size={16} className="mr-2" />
              Add Line Note
            </Button>
          </div>
        </Card >
      </div >
    </DocumentTemplate >
  );
}

export default function CreateDCPage() {
  return (
    <Suspense fallback={<CreateDCSkeleton />}>
      <CreateDCPageContent />
    </Suspense>
  );
}




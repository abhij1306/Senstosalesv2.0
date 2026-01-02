"use client";

import React from "react";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Save, Search, AlertCircle, Loader2, Plus, Trash2, Truck } from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { DCItemRow } from "@/types";
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
import { useDCStore } from "@/store/dcStore";

function CreateDCPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPoNumber = searchParams ? searchParams.get("po") : "";

  const {
    data,
    poData,
    notes,
    isCheckingNumber,
    isDuplicateNumber,
    conflictType,
    updateHeader,
    setHeader,
    updateItem,
    setPOData,
    setItems,
    addNote,
    updateNote,
    removeNote,
    setNumberStatus,
  } = useDCStore();

  const [poNumber, setPONumber] = useState(initialPoNumber || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const header = data?.header || {
    dc_number: "",
    dc_date: new Date().toISOString().split("T")[0],
    supplier_phone: "0755 – 4247748",
    supplier_gstin: "23AACFS6810L1Z7",
    consignee_name: "",
    consignee_address: "",
  };

  const items = data?.items || [];

  // Memoized item grouping to eliminate re-calculation lag
  const groupedItems = React.useMemo(() => {
    return Object.values(items.reduce((acc, item) => {
      const key = item.po_item_id;
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {} as Record<string, typeof items>));
  }, [items]);

  useEffect(() => {
    if (initialPoNumber) {
      loadInitialData(initialPoNumber);
    }
  }, [initialPoNumber]);

  const loadInitialData = async (po: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const pod = await api.getPODetail(po);
      const mappedItems: DCItemRow[] = [];

      if (pod?.items) {
        pod.items.forEach((item: any) => {
          const deliveries = item.deliveries || [];
          deliveries.forEach((lot: any) => {
            const ord = lot.ordered_quantity || 0;
            const dlv = lot.delivered_quantity || 0;
            const recd = lot.received_quantity || 0;
            const currentBal = Math.max(0, ord - dlv);

            mappedItems.push({
              id: `${item.id}-${lot.lot_no}`,
              po_item_id: item.id.toString(),
              po_item_no: item.po_item_no,
              lot_no: lot.lot_no,
              material_code: item.material_code || "",
              description: item.material_description || "",
              drg_no: item.drg_no || "",
              unit: item.unit || "NOS",
              ordered_quantity: ord,
              delivered_quantity: dlv,
              received_quantity: recd,
              dispatch_quantity: 0,
              remaining_post_dc: currentBal,
              original_remaining: currentBal
            });
          });
        });
      }

      setItems(mappedItems);

      if (pod?.header) {
        setPOData(pod.header);
        setHeader({
          ...header,
          consignee_name: (pod.header as any)?.consignee_name || "",
          consignee_address: (pod.header as any)?.consignee_address || "",
          supplier_phone: pod.header?.supplier_phone || "0755 – 4247748",
          supplier_gstin: pod.header?.supplier_gstin || "23AACFS6810L1Z7",
        });
      }

      if (mappedItems.length === 0) {
        setError("No items found in this PO.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load initial data");
    } finally {
      setIsLoading(false);
    }
  };

  const checkNumberDuplicate = async (num: string, date: string) => {
    if (!num || num.trim() === "") return;
    setNumberStatus(true, false, null);
    try {
      const res = await api.checkDuplicateNumber("DC", num, date);
      setNumberStatus(false, res.exists, res.conflict_type || null);
    } catch {
      setNumberStatus(false, false, null);
    }
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
    const overDeliveryItem = itemsToDispatch.find(
      (item) => item.dispatch_quantity > (item.original_remaining || 0)
    );
    if (overDeliveryItem) {
      setError(
        `Cannot dispatch more than originally available (Lot ${overDeliveryItem.lot_no}: ${overDeliveryItem.dispatch_quantity} > ${overDeliveryItem.original_remaining})`
      );
      setIsSubmitting(false);
      return;
    }
    try {
      const dcPayload = {
        dc_number: header.dc_number,
        dc_date: header.dc_date,
        po_number: poNumber || undefined,
        supplier_phone: header.supplier_phone,
        supplier_gstin: header.supplier_gstin,
        consignee_name: header.consignee_name,
        consignee_address: header.consignee_address,
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
      router.push(`/dc/${response.dc_number || header.dc_number}`);
    } catch (err: any) {
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
          isSubmitting || items.length === 0 || isDuplicateNumber || isCheckingNumber || !header.dc_number
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
              <SmallText className="font-medium text-app-status-error">{error}</SmallText>
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
                onClick={() => loadInitialData(poNumber)}
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
              <div className="mt-4 p-4 bg-app-surface/50 rounded-xl border border-app-border/10 flex items-center justify-between">
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
        <Card className="p-6 shadow-sm border-none bg-app-surface/50">
          <H3 className="mb-6 font-bold text-app-fg">Challan Information</H3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label>DC NUMBER</Label>
              <Input
                value={header.dc_number}
                onChange={(e) => updateHeader("dc_number", e.target.value)}
                onBlur={() => checkNumberDuplicate(header.dc_number, header.dc_date)}
                placeholder="Ex. DC/001/24-25"
                className={cn(
                  "font-medium transition-all shadow-sm focus:ring-2",
                  isDuplicateNumber
                    ? "border-app-status-error focus:ring-app-status-error/20"
                    : isCheckingNumber
                      ? "border-app-accent focus:ring-app-accent/20"
                      : "border-app-border focus:ring-app-accent/10"
                )}
              />
              {isCheckingNumber && (
                <div className="flex items-center gap-2 text-xs text-app-accent mt-1">
                  <Loader2 className="w-3 h-3 animate-spin" /> Checking availability...
                </div>
              )}
              {isDuplicateNumber && (
                <div className="flex items-center gap-2 text-xs text-app-status-error mt-1 font-medium">
                  <AlertCircle className="w-3 h-3" />
                  {conflictType === "DC"
                    ? "This DC Number already exists"
                    : "DC Number conflicts with " + conflictType}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>DC DATE</Label>
              <Input
                type="date"
                value={header.dc_date}
                onChange={(e) => {
                  const d = e.target.value;
                  updateHeader("dc_date", d);
                  if (header.dc_number) checkNumberDuplicate(header.dc_number, d);
                }}
                className="font-medium"
              />
            </div>

            <div className="space-y-2">
              <Label>SUPPLIER PHONE</Label>
              <Input
                value={header.supplier_phone}
                onChange={(e) => updateHeader("supplier_phone", e.target.value)}
                className="font-medium bg-app-surface/50"
                readOnly
              />
            </div>

            <div className="space-y-2">
              <Label>SUPPLIER GSTIN</Label>
              <Input
                value={header.supplier_gstin}
                onChange={(e) => updateHeader("supplier_gstin", e.target.value)}
                className="font-medium bg-app-surface/50"
                readOnly
              />
            </div>

            <div className="space-y-2">
              <Label>CONSIGNEE NAME</Label>
              <Input
                value={header.consignee_name}
                onChange={(e) => updateHeader("consignee_name", e.target.value)}
                className="font-medium"
              />
            </div>

            <div className="space-y-2">
              <Label>CONSIGNEE ADDRESS</Label>
              <Input
                value={header.consignee_address}
                onChange={(e) => updateHeader("consignee_address", e.target.value)}
                className="font-medium truncate"
                title={header.consignee_address}
              />
            </div>
          </div>
        </Card>

        {/* Items Table */}
        {items.length > 0 && (
          <div className="space-y-3">
            <Label className="m-0 mb-1">
              Dispatch Items ({items.length})
            </Label>
            <div className="table-container shadow-premium-hover">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-app-border/10 bg-app-overlay/5">
                    <th className="py-3 px-2 text-left w-[60px]">
                      <Label>Lot</Label>
                    </th>
                    <th className="py-3 px-2 text-left w-[120px]">
                      <Label>Code</Label>
                    </th>
                    <th className="py-3 px-2 text-left w-[120px]">
                      <Label>Drawing</Label>
                    </th>
                    <th className="py-3 px-2 text-left w-[200px]">
                      <Label>Description</Label>
                    </th>
                    <th className="py-3 px-2 text-center w-[60px]">
                      <Label>Unit</Label>
                    </th>
                    <th className="py-3 px-2 text-right w-[80px]">
                      <Label>Ord</Label>
                    </th>
                    <th className="py-3 px-2 text-right w-[80px]">
                      <Label>Dlv</Label>
                    </th>
                    <th className="py-3 px-2 text-right w-[100px] bg-blue-50/10 dark:bg-blue-900/10">
                      <Label className="text-blue-600 dark:text-blue-400">Disp</Label>
                    </th>
                    <th className="py-3 px-2 text-right w-[100px] bg-blue-50/10 dark:bg-blue-900/10">
                      <Label className="text-blue-600 dark:text-blue-400">Bal</Label>
                    </th>
                    <th className="py-3 px-2 text-right w-[80px]">
                      <Label>Recd</Label>
                    </th>
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
                      <React.Fragment key={parentItem.po_item_id}>
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
                            <Body className="truncate max-w-[200px] text-app-fg-muted/70" title={parentItem.description}>
                              {parentItem.description}
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
                                {/* Visual Indent Pipe */}
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
                                <Input
                                  type="number"
                                  value={item.dispatch_quantity || ""}
                                  onChange={(e) => {
                                    const val = parseFloat(e.target.value) || 0;
                                    const originalRem = items[originalIndex].original_remaining ?? items[originalIndex].remaining_post_dc ?? 0;
                                    const validDispatch = Math.min(Math.max(0, val), originalRem);
                                    const newBalance = Math.max(0, originalRem - validDispatch);

                                    updateItem(originalIndex, "dispatch_quantity", validDispatch);
                                    updateItem(originalIndex, "remaining_post_dc", newBalance);
                                  }}
                                  className="text-right w-full font-mono h-7 text-xs border-blue-200 dark:border-blue-800 focus:ring-blue-500/20"
                                  placeholder="0"
                                />
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
        )}

        {/* Notes */}
        <Card className="p-6 border-none bg-app-surface/50">
          <Label className="mb-4 block">
            Additional Notes
          </Label>
          <div className="space-y-3">
            {notes.map((note, idx) => (
              <div key={`lot-${idx}`} className="flex gap-2">
                <Input
                  value={note}
                  onChange={(e) => updateNote(idx, e.target.value)}
                  placeholder="Enter additional information..."
                  className="font-medium text-app-fg"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeNote(idx)}
                  className="text-app-fg-muted hover:text-app-status-error"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={addNote}
              className="border-dashed border-2 border-app-border/50 hover:border-app-accent/30"
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

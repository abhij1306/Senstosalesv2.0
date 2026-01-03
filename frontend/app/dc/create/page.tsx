"use client";

import React from "react";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Save, Search, AlertCircle, Loader2, Plus, Trash2, Truck } from "lucide-react";
import { api } from "@/lib/api";
import { cn, formatDate } from "@/lib/utils";
import { DCItemRow } from "@/types";
import {
  Body,
  Footnote,
  Caption1,
  Caption2,
  Accounting,
  MonoCode,
  Button,
  Badge,
  Input,
  Card,
  DocumentJourney,
  DocumentTemplate,
} from "@/components/design-system";
import { ActionConfirmationModal } from "@/components/design-system/molecules/ActionConfirmationModal";
import { useDCStore } from "@/store/dcStore";
import { useDebounce } from "@/hooks/useDebounce";

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
  const [showWarning, setShowWarning] = useState(false);

  const header = data?.header || {
    dc_number: "",
    dc_date: new Date().toISOString().split("T")[0],
    supplier_phone: "0755 – 4247748",
    supplier_gstin: "23AACFS6810L1Z7",
    consignee_name: "",
    consignee_address: "",
  };

  // Real-time duplicate check with debounce
  const debouncedDCNumber = useDebounce(header.dc_number, 500);

  useEffect(() => {
    if (debouncedDCNumber && debouncedDCNumber.trim() !== "") {
      checkNumberDuplicate(debouncedDCNumber, header.dc_date);
    } else {
      // Clear status if empty
      setNumberStatus(false, false, null);
    }
  }, [debouncedDCNumber, header.dc_date]);


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
            // Fallback to item quantity if lot quantity is missing (valid for single-lot items)
            const ord = lot.ordered_quantity || (deliveries.length === 1 ? item.ordered_quantity : 0) || 0;
            const dlv = lot.delivered_quantity || (deliveries.length === 1 ? item.delivered_quantity : 0) || 0;
            const recd = lot.received_quantity || (deliveries.length === 1 ? item.received_quantity : 0) || 0;
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
              po_rate: item.po_rate || 0,
              ordered_quantity: ord,
              delivered_quantity: dlv,
              received_quantity: recd,
              dispatch_quantity: 0,
              remaining_post_dc: currentBal,
              original_remaining: currentBal,
              dely_date: lot.dely_date || "",
              physical_dispatched_qty: lot.physical_dispatched_qty || 0,
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

  const handleSave = () => {
    // Basic validation
    if (!header.dc_number || !header.dc_date) {
      setError("DC Number and Date are required");
      return;
    }

    // Check for duplicate number
    if (isDuplicateNumber && conflictType === "DC") {
      setError("Duplicate DC Number detected. Please use a unique number.");
      return;
    }

    if (items.some(i => (i.dispatch_quantity || 0) > 0)) {
      setShowWarning(true);
    } else {
      setError("Please dispatch at least one item.");
    }
  };

  const confirmSave = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      // Prepare payload
      // Use existing store data logic or refine as needed
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

      const dispatchItems = items.filter(i => (i.dispatch_quantity || 0) > 0);
      const itemsPayload = dispatchItems.map((item) => ({
        po_item_id: item.po_item_id,
        lot_no: item.lot_no ? parseInt(item.lot_no.toString()) : undefined,
        dispatch_qty: item.dispatch_quantity,
        hsn_code: null,
        hsn_rate: null,
      }));

      const response = await api.createDC(dcPayload, itemsPayload) as any;

      // Cleanup
      setNumberStatus(false, false, null); // Clear duplication status

      // Redirect
      router.push(`/dc/${response.dc_number || header.dc_number}`);

    } catch (err: any) {
      console.error(err);
      if (err.status === 422 && Array.isArray(err.data?.detail)) {
        const details = err.data.detail.map((d: any) => `${d.loc.join(".")}: ${d.msg}`).join(", ");
        setError(`Validation Error: ${details}`);
      } else {
        setError(err.message || "Failed to create Delivery Challan");
      }
      setIsSubmitting(false); // Only stop submitting on error, otherwise redirecting
    } finally {
      setShowWarning(false);
    }
  };

  const topActions = (
    <div className="flex items-center gap-2">
      <Button variant="secondary" onClick={() => router.back()} disabled={isSubmitting}>
        Cancel
      </Button>
      <Button
        variant="primary"
        onClick={handleSave}
        disabled={
          isSubmitting || items.length === 0 || isDuplicateNumber || isCheckingNumber || !header.dc_number || isLoading
        }
      >
        {isSubmitting ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Save size={16} />
        )}
        {isSubmitting ? "Saving..." : "Save Challan"}
      </Button>
    </div>
  );

  return (
    <DocumentTemplate
      title="Create Delivery Challan"
      description="Generate dispatch documentation from PO"
      actions={topActions}
      icon={<Truck size={18} className="text-app-status-success" />}
      iconLayoutId="create-dc-icon"
    >
      <div className="mb-6">
        <DocumentJourney currentStage="DC" />
      </div>

      <div className="space-y-6">
        {error && (
          <div className="p-4 bg-status-error/10 border-none rounded-xl mb-4">
            <div className="flex items-center gap-2 text-status-error">
              <AlertCircle size={16} />
              <Footnote className="text-status-error">{error}</Footnote>
            </div>
          </div>
        )}

        {/* PO Selection */}
        {!initialPoNumber && (
          <div className="p-6 bg-surface rounded-xl shadow-1">
            <Caption1 className="mb-2 block uppercase tracking-wide text-text-tertiary">
              Purchase Order Reference
            </Caption1>
            <div className="flex gap-3 mt-1">
              <div className="flex-1">
                <Input
                  id="search-po-number"
                  name="search-po-number"
                  value={poNumber}
                  onChange={(e) => setPONumber(e.target.value)}
                  placeholder="Enter PO number"
                />
              </div>
              <Button
                variant="secondary"
                onClick={() => loadInitialData(poNumber)}
                disabled={!poNumber || isLoading}
                className="h-[36px]"
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
              <div className="mt-4 p-4 bg-surface-variant/30 rounded-xl border-none flex items-center justify-between">
                <div className="flex flex-col">
                  <Caption1 className="text-text-tertiary uppercase tracking-wide">
                    Supplier
                  </Caption1>
                  <Body className="text-text-primary">{poData.supplier_name}</Body>
                </div>
                <Badge
                  variant="outline"
                  className="bg-surface text-text-tertiary border-white/10"
                >
                  PO #{poData.po_number}
                </Badge>
              </div>
            )}
          </div>
        )}

        {/* Challan Details */}
        <Card className="p-6">
          <Caption1 className="mb-6 block uppercase tracking-widest text-text-tertiary">Challan Information</Caption1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <Caption2 className="uppercase tracking-widest text-text-tertiary">DC Number</Caption2>
              <Input
                value={header.dc_number}
                onChange={(e) => updateHeader("dc_number", e.target.value)}
                placeholder="Ex. DC/001/24-25"
                className={cn(
                  isDuplicateNumber ? "border-app-status-error" : "border-transparent"
                )}
              />
              {isCheckingNumber && (
                <div className="flex items-center gap-2 text-[10px] text-action-primary mt-1 uppercase tracking-tight">
                  <Loader2 className="w-3 h-3 animate-spin" /> Checking availability...
                </div>
              )}
              {isDuplicateNumber && (
                <div className="flex items-center gap-2 text-[10px] text-status-error mt-1 uppercase tracking-tight">
                  <AlertCircle className="w-3 h-3" />
                  {conflictType === "DC"
                    ? "This DC Number already exists"
                    : "DC Number conflicts with " + conflictType}
                </div>
              )}
            </div>

            <div className="space-y-1">
              <Caption2 className="uppercase tracking-widest text-text-tertiary">DC Date</Caption2>
              <Input
                type="date"
                value={header.dc_date}
                onChange={(e) => {
                  const d = e.target.value;
                  updateHeader("dc_date", d);
                  if (header.dc_number) checkNumberDuplicate(header.dc_number, d);
                }}
              />
            </div>

            <div className="space-y-1">
              <Caption2 className="uppercase tracking-widest text-text-tertiary">Supplier Phone</Caption2>
              <Input
                value={header.supplier_phone}
                readOnly
                className="bg-surface-variant/30"
              />
            </div>

            <div className="space-y-1">
              <Caption2 className="uppercase tracking-widest text-text-tertiary">Supplier GSTIN</Caption2>
              <Input
                value={header.supplier_gstin}
                readOnly
                className="bg-surface-variant/30"
              />
            </div>

            <div className="space-y-1">
              <Caption2 className="uppercase tracking-widest text-text-tertiary">Consignee Name</Caption2>
              <Input
                value={header.consignee_name}
                onChange={(e) => updateHeader("consignee_name", e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <Caption2 className="uppercase tracking-widest text-text-tertiary">Consignee Address</Caption2>
              <Input
                value={header.consignee_address}
                onChange={(e) => updateHeader("consignee_address", e.target.value)}
                className="truncate"
                title={header.consignee_address}
              />
            </div>
          </div>
        </Card>

        {/* Items Table */}
        {items.length > 0 && (
          <div className="bg-surface shadow-1 rounded-xl overflow-hidden">
            <table className="table-standard w-full table-fixed">
              <thead>
                <tr className="bg-surface-variant border-none">
                  <th className="py-2.5 px-3 text-left w-[50px]"><Caption2 className="uppercase tracking-widest opacity-100">#</Caption2></th>
                  <th className="py-2.5 px-3 text-left w-[120px]"><Caption2 className="uppercase tracking-widest opacity-100">Code</Caption2></th>
                  <th className="py-2.5 px-3 text-left w-[120px]"><Caption2 className="uppercase tracking-widest opacity-100">Drawing</Caption2></th>
                  <th className="py-2.5 px-3 text-left"><Caption2 className="uppercase tracking-widest opacity-100">Description</Caption2></th>
                  <th className="py-2.5 px-3 text-left w-[60px]"><Caption2 className="uppercase tracking-widest opacity-100">Unit</Caption2></th>
                  <th className="py-2.5 px-3 text-right w-[100px]"><Caption2 className="uppercase tracking-widest opacity-100 block text-right">Rate</Caption2></th>
                  <th className="py-2.5 px-3 text-right w-[80px]"><Caption2 className="uppercase tracking-widest opacity-100 block text-right">Ord</Caption2></th>
                  <th className="py-2.5 px-3 text-right w-[80px]"><Caption2 className="uppercase tracking-widest opacity-100 block text-right">Dlv</Caption2></th>
                  <th className="py-2.5 px-3 text-right w-[100px]"><Caption2 className="text-action-primary uppercase tracking-widest opacity-100 block text-right">Qty</Caption2></th>
                  <th className="py-2.5 px-3 text-right w-[80px]"><Caption2 className="text-status-warning uppercase tracking-widest opacity-100 block text-right">Bal</Caption2></th>
                  <th className="py-2.5 px-3 text-right w-[80px]"><Caption2 className="uppercase tracking-widest opacity-100 block text-right">Recd</Caption2></th>
                </tr>
              </thead>
              <tbody>
                {groupedItems.map((group, groupIdx) => {
                  const parentItem = group[0];
                  const totalOrd = group.reduce((sum, i) => sum + (i.ordered_quantity || 0), 0);
                  const totalPhysDlv = group.reduce((sum, i) => sum + (i.physical_dispatched_qty || 0), 0);
                  const totalRec = group.reduce((sum, i) => sum + (i.received_quantity || 0), 0);
                  const totalDisp = group.reduce((sum, i) => sum + (i.dispatch_quantity || 0), 0);
                  // Balance for DC calculation must be Ordered - Physical Dispatched
                  const totalBal = Math.max(0, totalOrd - totalPhysDlv - totalDisp);

                  return (
                    <React.Fragment key={parentItem.po_item_id}>
                      <tr className="bg-surface-variant/30 border-none">
                        <td className="py-2.5 px-3 text-center w-[50px] border-none">
                          <MonoCode className="bg-transparent border-none p-0 opacity-60 font-regular">
                            #{parentItem.po_item_no || groupIdx + 1}
                          </MonoCode>
                        </td>
                        <td className="py-2.5 px-3 w-[120px] text-left border-none">
                          <Accounting className="text-text-tertiary opacity-70 font-regular pr-0 w-full text-right">{parentItem.material_code || "-"}</Accounting>
                        </td>
                        <td className="py-2.5 px-3 w-[120px] text-left border-none">
                          <Caption2 className="text-text-tertiary opacity-40 font-regular">{parentItem.drg_no || "-"}</Caption2>
                        </td>
                        <td className="py-2.5 px-3 border-none text-left">
                          <Body className="truncate max-w-full text-text-secondary opacity-80 font-regular" title={parentItem.description}>
                            {parentItem.description}
                          </Body>
                        </td>
                        <td className="py-2.5 px-3 w-[60px] text-left border-none">
                          <Caption2 className="uppercase text-text-tertiary opacity-50 font-regular">{parentItem.unit}</Caption2>
                        </td>
                        <td className="py-2.5 px-3 w-[100px] text-right border-none">
                          <Accounting className="text-text-tertiary opacity-70 font-regular pr-0 w-full text-right">{parentItem.po_rate || 0}</Accounting>
                        </td>
                        <td className="py-2.5 px-3 w-[80px] text-right border-none">
                          <Accounting className="text-text-tertiary opacity-70 font-regular pr-0 w-full text-right">{totalOrd}</Accounting>
                        </td>
                        <td className="py-2.5 px-3 w-[80px] text-right border-none">
                          <Accounting className="text-text-tertiary opacity-70 font-regular pr-0 w-full text-right">{totalPhysDlv}</Accounting>
                        </td>
                        <td className="py-2.5 px-3 w-[100px] text-right bg-action-primary/5 border-none">
                          <Accounting className="text-action-primary font-regular pr-0 w-full text-right">{totalDisp}</Accounting>
                        </td>
                        <td className="py-2.5 px-3 w-[80px] text-right bg-status-warning/5 border-none">
                          <Accounting className="text-status-warning font-regular pr-0 w-full text-right">{totalBal}</Accounting>
                        </td>
                        <td className="py-2.5 px-3 w-[80px] text-right border-none">
                          <Accounting className="text-text-tertiary opacity-70 font-regular pr-0 w-full text-right">{totalRec}</Accounting>
                        </td>
                      </tr>

                      {group.map((item) => {
                        const originalIndex = items.findIndex(i => i.id === item.id);
                        const originalRem = (items[originalIndex].ordered_quantity || 0) - (items[originalIndex].physical_dispatched_qty || 0);
                        // Calculate Lot Balance (Order - Phys Dispatched - Current Input)
                        const lotBal = Math.max(0, (item.ordered_quantity || 0) - (item.physical_dispatched_qty || 0) - (item.dispatch_quantity || 0));
                        const isCompleted = originalRem <= 0;

                        return (
                          <React.Fragment key={item.id}>
                            <tr className="bg-surface-variant/30 border-none last:border-none">
                              <td className="py-2 px-3 text-center w-[50px] border-none">
                                {/* Pipe Removed */}
                              </td>
                              <td className="py-2 px-3 w-[120px] text-left border-none">
                                <div className="flex items-center gap-2">
                                  <MonoCode className="bg-transparent border-none text-text-secondary font-regular">L-{item.lot_no}</MonoCode>
                                </div>
                              </td>
                              <td className="w-[120px] border-none" />
                              <td className="border-none" />
                              <td className="w-[60px] border-none" />
                              <td className="w-[100px] text-right border-none" />
                              <td className="py-2 px-3 w-[80px] text-right border-none">
                                <Accounting className="text-text-secondary font-regular pr-0 w-full text-right">{item.ordered_quantity}</Accounting>
                              </td>
                              <td className="py-2 px-3 w-[80px] text-right border-none">
                                <Accounting className="text-text-secondary font-regular pr-0 w-full text-right">{item.physical_dispatched_qty}</Accounting>
                              </td>
                              <td className="py-2 px-3 w-[100px] text-right border-none">
                                <Input
                                  type="number"
                                  value={item.dispatch_quantity || ""}
                                  onChange={(e) => {
                                    if (isCompleted) return;
                                    const val = parseFloat(e.target.value) || 0;
                                    const validDispatch = Math.min(Math.max(0, val), originalRem);
                                    updateItem(originalIndex, "dispatch_quantity", validDispatch);
                                  }}
                                  disabled={isCompleted}
                                  className={`text-right w-full h-7 text-xs border-transparent focus:border-action-primary/20 font-regular ${isCompleted ? "bg-surface-variant text-text-tertiary cursor-not-allowed" : "bg-action-primary/5 text-text-primary"
                                    }`}
                                  placeholder={isCompleted ? "Done" : "0"}
                                />
                              </td>
                              <td className="py-2 px-3 w-[80px] text-right bg-status-warning/5 border-none">
                                <Accounting className={`font-regular pr-0 w-full text-right ${isCompleted ? "text-text-tertiary" : "text-status-warning"}`}>
                                  {isCompleted ? "0" : lotBal}
                                </Accounting>
                              </td>
                              <td className="py-2 px-3 w-[80px] text-right border-none">
                                <Accounting className="text-text-secondary font-regular pr-0 w-full text-right">{item.received_quantity}</Accounting>
                              </td>
                            </tr>
                          </React.Fragment>
                        );
                      })}

                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="p-6 bg-surface rounded-xl shadow-1">
          <Caption1 className="mb-4 block uppercase tracking-wide text-text-tertiary">
            Additional Notes
          </Caption1>
          <div className="space-y-3">
            {notes.map((note, idx) => (
              <div key={`lot-${idx}`} className="flex gap-2">
                <Input
                  value={note}
                  onChange={(e) => updateNote(idx, e.target.value)}
                  placeholder="Enter additional information..."
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeNote(idx)}
                  className="text-text-tertiary hover:text-status-error hover:bg-status-error/10 transition-all rounded-full p-2"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            ))}
            <Button
              variant="secondary"
              size="sm"
              onClick={addNote}
              className="w-full bg-transparent hover:bg-surface-variant/20"
            >
              <Plus size={16} />
              Add Line Note
            </Button>
          </div>
        </div>
      </div>

      <ActionConfirmationModal
        isOpen={showWarning}
        onClose={() => setShowWarning(false)}
        onConfirm={confirmSave}
        title="Confirm Delivery Challan Generation"
        subtitle="This action is permanent"
        warningText="Generating this DC will lock the specified quantities. Ensure all details are correct as this affects inventory and billing."
        confirmLabel={isSubmitting ? "Saving..." : "Confirm Save"}
      />
    </DocumentTemplate >
  );
}

import { Suspense } from "react";

export default function CreateDCPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center p-12"><Loader2 className="animate-spin text-action-primary" /></div>}>
      <CreateDCPageContent />
    </Suspense>
  );
}

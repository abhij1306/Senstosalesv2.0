"use client";

import React, { useEffect, useState, Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn, amountInWords } from "@/lib/utils";
import { Save, Loader2, AlertCircle, Search, ChevronDown, Check, X, CheckCircle2, Receipt } from "lucide-react";
import { api, type Buyer } from "@/lib/api";
import * as Select from "@radix-ui/react-select";
import { motion, useDragControls, AnimatePresence } from "framer-motion";
import {
  Title3,
  Label,
  SmallText,
  Body,
  Accounting,
  Button,
  Input,
  Card,
  DocumentTemplate,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  DocumentJourney,
  MonoCode,
  ActionConfirmationModal,
  Caption2,
  Autocomplete
} from "@/components/design-system";
import { useInvoiceStore } from "@/store/invoiceStore";

// No hardcoded TAX_RATES here, will be fetched from settings

function CreateInvoicePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dcIdFromUrl = searchParams?.get("dc") || "";

  const {
    data,
    dcData,
    isCheckingNumber,
    isDuplicateNumber,
    setInvoice,
    setHeader,
    updateHeader,
    setDCData,
    setItems,
    setNumberStatus,
  } = useInvoiceStore();

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualDcId, setManualDcId] = useState(dcIdFromUrl);
  const [dcOptions, setDcOptions] = useState<any[]>([]);
  const [isSearchingDC, setIsSearchingDC] = useState(false);

  // Multi-Buyer States
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [selectedBuyerId, setSelectedBuyerId] = useState<string>("");
  const [showWarning, setShowWarning] = useState(false);

  const handleDCSearch = async (query: string) => {
    if (!query) return;
    setIsSearchingDC(true);
    try {
      const results = await api.searchGlobal(query);
      const options = results
        .filter((r) => r.type === "DC")
        .map((r) => ({
          value: r.number,
          label: `DC #${r.number}`,
          subLabel: r.party,
        }));
      setDcOptions(options);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearchingDC(false);
    }
  };

  const header = data?.header || {
    invoice_number: "",
    invoice_date: new Date().toISOString().split("T")[0],
    dc_number: dcIdFromUrl,
    buyer_name: "",
    buyer_gstin: "",
    buyer_address: "",
    buyer_state: "",
    buyer_state_code: "",
    place_of_supply: "",
    total_taxable_value: 0,
    cgst_total: 0,
    sgst_total: 0,
    total_invoice_value: 0,
  } as any;

  const items = data?.items || [];

  // Memoized Item Grouping for Parent-Lot hierarchy
  const groupedItems = useMemo(() => {
    return Object.values(items.reduce((acc, item) => {
      // In Invoice, po_sl_no is used for lot reference
      const key = item.description || "item";
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {} as Record<string, typeof items>));
  }, [items]);

  useEffect(() => {
    fetchInitialData();
  }, [dcIdFromUrl]);

  const [taxRates, setTaxRates] = useState({ cgst: 9.0, sgst: 9.0 });

  const fetchInitialData = async () => {
    try {
      const [buyerList, settings] = await Promise.all([
        api.getBuyers(),
        api.getSettings()
      ]);
      setBuyers(buyerList);

      if (settings) {
        const cgst = parseFloat((settings as any).cgst_rate) || 9.0;
        const sgst = parseFloat((settings as any).sgst_rate) || 9.0;
        setTaxRates({ cgst, sgst });
      }

      const defaultBuyer = buyerList.find((b) => b.is_default);
      if (defaultBuyer) {
        setSelectedBuyerId(defaultBuyer.id.toString());
        applyBuyerToStore(defaultBuyer);
      } else if (buyerList.length > 0) {
        setSelectedBuyerId(buyerList[0].id.toString());
        applyBuyerToStore(buyerList[0]);
      }

      if (dcIdFromUrl) loadDC(dcIdFromUrl, settings);
    } catch {
      // Failure not critical
    }
  };

  const applyBuyerToStore = (buyer: Buyer) => {
    const updatedHeader = {
      ...header,
      buyer_name: buyer.name,
      buyer_gstin: buyer.gstin,
      buyer_address: buyer.billing_address,
      buyer_state: buyer.state || "",
      buyer_state_code: buyer.state_code || "",
      place_of_supply: buyer.place_of_supply,
    };
    setHeader(updatedHeader);
  };

  const handleBuyerChange = (id: string) => {
    setSelectedBuyerId(id);
    const buyer = buyers.find((b) => b.id.toString() === id);
    if (buyer) applyBuyerToStore(buyer);
  };

  const checkNumberDuplicate = async (num: string, date: string) => {
    if (!num || num.length < 3) return;
    setNumberStatus(true, false);
    try {
      const res = await api.checkDuplicateNumber("Invoice", num, date);
      setNumberStatus(false, res.exists);
    } catch {
      setNumberStatus(false, false);
    }
  };

  const loadDC = async (id: string, existingSettings?: any) => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const dcDetail = await api.getDCDetail(id);

      if (!dcDetail?.header) {
        setError("Challan not found.");
        setIsLoading(false);
        return;
      }

      setDCData(dcDetail.header);

      // Fetch latest header from store to avoid stale closure (e.g. buyer info just set)
      const currentHeader = useInvoiceStore.getState().data?.header || header;

      const newHeader = {
        ...currentHeader,
        dc_number: dcDetail.header.dc_number || "",
        dc_date: dcDetail.header.dc_date || "",
        buyers_order_no: dcDetail.header.po_number?.toString() || "",
        buyers_order_date: dcDetail.header.po_date || "",
        vehicle_no: dcDetail.header.vehicle_no || "",
        lr_no: dcDetail.header.lr_no || "",
        transporter: dcDetail.header.transporter || "",
        destination: (dcDetail.header as any).destination || "",
      };
      setHeader(newHeader);

      let currentCgst = taxRates.cgst;
      let currentSgst = taxRates.sgst;

      if (existingSettings) {
        currentCgst = parseFloat(existingSettings.cgst_rate) || 9.0;
        currentSgst = parseFloat(existingSettings.sgst_rate) || 9.0;
      }

      if (dcDetail.items?.length > 0) {
        const mappedItems = dcDetail.items
          .map((item: any) => {
            const qty = item.dispatched_quantity || item.dispatch_qty || 0;
            const rate = item.po_rate || 0;
            const taxableValue = qty * rate;
            const cgstAmount = (taxableValue * currentCgst) / 100;
            const sgstAmount = (taxableValue * currentSgst) / 100;

            return {
              po_sl_no: item.lot_no?.toString() || "1",
              description: item.description || item.material_description || "",
              hsn_sac: item.hsn_code || "",
              quantity: qty,
              unit: item.unit || "NOS",
              rate: rate,
              taxable_value: taxableValue,
              cgst_amount: cgstAmount,
              sgst_amount: sgstAmount,
              total_amount: taxableValue + cgstAmount + sgstAmount,
              received_qty: item.received_quantity || 0,
            };
          })
          .filter((item: any) => item.quantity > 0);

        setItems(mappedItems);
        calculateTotals(mappedItems);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load DC");
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTotals = (currentItems: any[]) => {
    const taxable = currentItems.reduce((sum, item) => sum + (item.taxable_value || 0), 0);
    const cgst = currentItems.reduce((sum, item) => sum + (item.cgst_amount || 0), 0);
    const sgst = currentItems.reduce((sum, item) => sum + (item.sgst_amount || 0), 0);
    const total = taxable + cgst + sgst;

    updateHeader("total_taxable_value", taxable);
    updateHeader("cgst_total", cgst);
    updateHeader("sgst_total", sgst);
    updateHeader("total_invoice_value", total);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setShowWarning(false);
    try {
      const payload = {
        invoice_number: header.invoice_number,
        invoice_date: header.invoice_date,
        dc_number: header.dc_number,
        buyer_name: header.buyer_name,
        buyer_address: header.buyer_address,
        buyer_gstin: header.buyer_gstin,
        buyer_state: header.buyer_state,
        buyer_state_code: header.buyer_state_code,
        place_of_supply: header.place_of_supply,
        buyers_order_no: header.buyers_order_no,
        buyers_order_date: header.buyers_order_date,
        vehicle_no: header.vehicle_no,
        lr_no: header.lr_no,
        transporter: header.transporter,
        destination: header.destination,
        terms_of_delivery: header.terms_of_delivery,
        gemc_number: header.gemc_number,
        gemc_date: header.gemc_date,
        mode_of_payment: header.mode_of_payment,
        payment_terms: header.payment_terms || "45 Days",
        despatch_doc_no: header.despatch_doc_no,
        srv_no: header.srv_no,
        srv_date: header.srv_date,
        remarks: header.remarks,
        items: items,
      };

      await api.createInvoice(payload);
      router.push(`/invoice/${header.invoice_number}`);
    } catch (err: any) {
      setError(err.message || "Failed to create invoice");
    } finally {
      setIsSaving(false);
    }
  };

  const topActions = (
    <div className="flex items-center gap-3">
      {/* DC Search - only show when no DC is preloaded */}
      {!dcIdFromUrl && (
        <div className="w-64">
          <Autocomplete
            placeholder="Search DC Number..."
            value={manualDcId}
            options={dcOptions}
            onSearch={handleDCSearch}
            loading={isSearchingDC}
            onChange={(val) => {
              setManualDcId(val);
              if (val) loadDC(val);
            }}
          />
        </div>
      )}
      <Button variant="secondary" onClick={() => router.back()} disabled={isSaving}>
        Cancel
      </Button>
      <Button
        variant="primary"
        onClick={() => setShowWarning(true)}
        disabled={isSaving || items.length === 0 || isDuplicateNumber || !header.invoice_number}
      >
        {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
        {isSaving ? "Saving..." : "Save Invoice"}
      </Button>
    </div>
  );

  return (
    <DocumentTemplate
      title="Create GST Invoice"
      description="Generate billing documentation from DC"
      actions={topActions}
      onBack={() => router.back()}
      icon={<Receipt size={20} className="text-action-primary" />}
      iconLayoutId="create-invoice-icon"
    >
      <div className="space-y-6">
        <DocumentJourney currentStage="Invoice" className="mb-2" />

        {error && (
          <Card className="p-4 bg-status-error/10 border-none">
            <div className="flex items-center gap-2 text-status-error">
              <AlertCircle size={16} />
              <SmallText className="text-status-error">{error}</SmallText>
            </div>
          </Card>
        )}



        {/* Info Tabs */}
        <Tabs defaultValue="buyer" className="w-full">
          <TabsList className="mb-4 p-1 rounded-xl inline-flex border-none bg-surface-variant/30">
            <TabsTrigger value="buyer">Buyer Info</TabsTrigger>
            <TabsTrigger value="references">References</TabsTrigger>
            <TabsTrigger value="logistics">Logistics</TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
            >
              <Card className="p-6 mt-0">
                <TabsContent value="buyer" className="mt-0">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 pr-6">
                      <div className="space-y-2">
                        <Label>INVOICE NUMBER</Label>
                        <Input
                          value={header.invoice_number}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateHeader("invoice_number", val);
                            checkNumberDuplicate(val, header.invoice_date);
                          }}
                          className={cn("tabular-nums text-lg", isDuplicateNumber ? "border-status-error ring-status-error/10" : "")}
                          placeholder="INV/001/24-25"
                        />
                        {isDuplicateNumber && <SmallText className="text-status-error">This number already exists</SmallText>}
                      </div>
                      <div className="space-y-2">
                        <Label>INVOICE DATE</Label>
                        <Input type="date" value={header.invoice_date} onChange={(e) => updateHeader("invoice_date", e.target.value)} />
                      </div>
                    </div>

                    <div className="lg:col-span-1">
                      <Label className="text-action-primary mb-3 block uppercase tracking-wide">Billed To</Label>
                      <Select.Root value={selectedBuyerId} onValueChange={handleBuyerChange}>
                        <Select.Trigger className="flex items-center justify-between w-full px-4 py-2 bg-surface-variant/30 border-none rounded-xl text-sm shadow-none mb-4 focus:bg-surface transition-all">
                          <Select.Value placeholder="Select Buyer" />
                          <Select.Icon><ChevronDown size={14} /></Select.Icon>
                        </Select.Trigger>
                        <Select.Portal>
                          <Select.Content className="overflow-hidden bg-surface rounded-2xl shadow-3 z-50">
                            <Select.Viewport className="p-1">
                              {buyers.map((b) => (
                                <Select.Item key={b.id} value={b.id.toString()} className="flex items-center px-8 py-3 text-sm text-text-secondary rounded-xl outline-none hover:bg-action-primary/10 hover:text-action-primary cursor-pointer">
                                  <Select.ItemText>{b.name}</Select.ItemText>
                                </Select.Item>
                              ))}
                            </Select.Viewport>
                          </Select.Content>
                        </Select.Portal>
                      </Select.Root>
                      <div className="p-4 rounded-xl bg-surface-variant/30 border-none">
                        <Title3 className="text-text-primary text-sm mb-1">{header.buyer_name || "---"}</Title3>
                        <Body className="text-text-tertiary leading-relaxed">{header.buyer_address || "---"}</Body>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="references" className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="space-y-1.5"><Label>Order Number</Label><Input value={header.buyers_order_no || ""} onChange={(e) => updateHeader("buyers_order_no", e.target.value)} /></div>
                    <div className="space-y-1.5"><Label>Order Date</Label><Input type="date" value={header.buyers_order_date || ""} onChange={(e) => updateHeader("buyers_order_date", e.target.value)} /></div>
                    <div className="space-y-1.5"><Label>GEMC No</Label><Input value={header.gemc_number || ""} onChange={(e) => updateHeader("gemc_number", e.target.value)} /></div>
                    <div className="space-y-1.5"><Label>SRV No</Label><Input value={header.srv_no || ""} onChange={(e) => updateHeader("srv_no", e.target.value)} /></div>
                  </div>
                </TabsContent>

                <TabsContent value="logistics" className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="space-y-1.5"><Label>Vehicle No</Label><Input value={header.vehicle_no || ""} onChange={(e) => updateHeader("vehicle_no", e.target.value)} /></div>
                    <div className="space-y-1.5"><Label>LR Number</Label><Input value={header.lr_no || ""} onChange={(e) => updateHeader("lr_no", e.target.value)} /></div>
                    <div className="space-y-1.5"><Label>Transporter</Label><Input value={header.transporter || ""} onChange={(e) => updateHeader("transporter", e.target.value)} /></div>
                    <div className="space-y-1.5"><Label>Payment Terms</Label><Input value={header.payment_terms || "45 Days"} onChange={(e) => updateHeader("payment_terms", e.target.value)} /></div>
                  </div>
                </TabsContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </Tabs>

        {/* Items Table */}
        {items.length > 0 && (
          <div className="space-y-4">
            <Label className="m-0 text-text-tertiary uppercase tracking-wide">
              Billing Structure ({items.length} Items)
            </Label>
            <div className="overflow-hidden bg-surface shadow-1 rounded-xl">
              <table className="w-full">
                <thead>
                  <tr className="bg-surface-variant border-none">
                    <th className="py-3 px-4 text-left w-[60px]"><Caption2 className="uppercase tracking-widest opacity-100">Lot</Caption2></th>
                    <th className="py-3 px-4 text-left"><Caption2 className="uppercase tracking-widest opacity-100">Description</Caption2></th>
                    <th className="py-3 px-4 text-left w-[120px]"><Caption2 className="uppercase tracking-widest opacity-100">HSN/SAC</Caption2></th>
                    <th className="py-3 px-4 text-right w-[100px]"><Caption2 className="uppercase tracking-widest opacity-100">Dlv</Caption2></th>
                    <th className="py-3 px-4 text-right w-[100px]"><Caption2 className="uppercase tracking-widest opacity-100">Recd</Caption2></th>
                    <th className="py-3 px-4 text-right w-[100px]"><Caption2 className="uppercase tracking-widest opacity-100">Rate</Caption2></th>
                    <th className="py-3 px-4 text-right w-[120px] bg-action-primary/5"><Caption2 className="text-action-primary uppercase tracking-widest opacity-100">Taxable</Caption2></th>
                  </tr>
                </thead>
                <tbody>
                  {groupedItems.map((group, groupIdx) => {
                    const parent = group[0];
                    const tQty = group.reduce((sum, i) => sum + (i.quantity || 0), 0);
                    const tVal = group.reduce((sum, i) => sum + (i.taxable_value || 0), 0);
                    const tRec = group.reduce((sum, i) => sum + (i.received_qty || 0), 0);

                    return (
                      <React.Fragment key={(parent.description || "") + groupIdx}>
                        {/* Summary Header */}
                        <tr className="bg-surface-variant/30 border-none">
                          <td className="py-3 px-4"><MonoCode className="text-action-primary/60">#{groupIdx + 1}</MonoCode></td>
                          <td className="py-3 px-4"><Body className="text-xs text-text-tertiary">{parent.description}</Body></td>
                          <td className="py-3 px-4"><SmallText className="text-text-tertiary/40 uppercase tracking-wide">{parent.hsn_sac || "-"}</SmallText></td>
                          <td className="py-3 px-4 text-right"><Accounting className="text-xs text-text-tertiary/60">{tQty}</Accounting></td>
                          <td className="py-3 px-4 text-right"><Accounting className="text-xs text-text-tertiary/60">{tRec}</Accounting></td>
                          <td className="py-3 px-4 text-right"><Accounting className="text-xs text-text-tertiary/40">{parent.rate}</Accounting></td>
                          <td className="py-3 px-4 text-right bg-action-primary/5"><Accounting className="text-xs text-action-primary/60">{tVal}</Accounting></td>
                        </tr>
                        {/* Lot Rows */}
                        {group.map((item, idx) => (
                          <tr key={idx} className="bg-app-surface border-none transition-colors">
                            <td className="py-2 px-0 relative">
                              <div className="absolute left-[30px] top-0 bottom-0 w-[2px] bg-action-primary/20" />
                            </td>
                            <td className="py-2 px-4">
                              <div className="flex items-center gap-2">
                                <MonoCode className="text-app-fg-muted">L-{item.po_sl_no}</MonoCode>
                              </div>
                            </td>
                            <td />
                            <td className="py-2 px-4 text-right"><Accounting className="text-text-secondary">{item.quantity}</Accounting></td>
                            <td className="py-2 px-4 text-right"><Accounting className="text-text-secondary">{item.received_qty}</Accounting></td>
                            <td className="py-2 px-4 text-right" />
                            <td className="py-2 px-4 text-right bg-action-primary/5">
                              <Accounting className="text-action-primary">{item.taxable_value}</Accounting>
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Totals Card */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
              <div className="lg:col-start-2">
                <Card className="p-8 bg-app-surface/50 border-none shadow-premium-hover backdrop-blur-xl">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-2 border-none">
                      <Label className="uppercase tracking-wide text-text-tertiary">Net Taxable Value</Label>
                      <Accounting className="text-xl text-text-primary">{header.total_taxable_value}</Accounting>
                    </div>
                    <div className="flex justify-between items-center text-text-tertiary">
                      <Label className="uppercase tracking-wide">CGST ({taxRates.cgst}%) + SGST ({taxRates.sgst}%)</Label>
                      <Accounting className="text-sm">{(header.cgst_total + header.sgst_total).toFixed(2)}</Accounting>
                    </div>
                    <div className="pt-6 mt-4 border-none flex justify-between items-end">
                      <div className="space-y-2">
                        <Label className="uppercase text-action-primary tracking-wide">Total Invoice Value</Label>
                        <SmallText className="text-text-tertiary block max-w-[280px] leading-snug italic lowercase first-letter:uppercase">
                          {amountInWords(header.total_invoice_value)} Only
                        </SmallText>
                      </div>
                      <Accounting className="text-4xl text-text-primary tracking-tighter leading-none">
                        {header.total_invoice_value}
                      </Accounting>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>

      <ActionConfirmationModal
        isOpen={showWarning}
        onClose={() => setShowWarning(false)}
        onConfirm={handleSave}
        title="Generate Invoice?"
        subtitle="Permanent Financial Action"
        warningText="Warning: Generating this invoice will lock the associated DC and cannot be undone."
        confirmLabel="Confirm"
        cancelLabel="Cancel"
      />
    </DocumentTemplate>
  );
}

export default function CreateInvoicePage() {
  return (
    <Suspense fallback={<div className="h-screen w-full bg-app-bg animate-pulse" />}>
      <CreateInvoicePageContent />
    </Suspense>
  );
}

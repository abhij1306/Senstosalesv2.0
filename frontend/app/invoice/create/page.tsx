"use client";

import React, { useEffect, useState, Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn, amountInWords } from "@/lib/utils";
import { Save, Loader2, AlertCircle, Search, ChevronDown, Check, X, CheckCircle2, Receipt } from "lucide-react";
import { api, type Buyer } from "@/lib/api";
import * as Select from "@radix-ui/react-select";
import { motion, useDragControls, AnimatePresence } from "framer-motion";
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
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  DocumentJourney,
  MonoCode,
} from "@/components/design-system";
import { useInvoiceStore } from "@/store/invoiceStore";

const TAX_RATES = { cgst: 9.0, sgst: 9.0 };

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

  // Multi-Buyer States
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [selectedBuyerId, setSelectedBuyerId] = useState<string>("");
  const [showWarning, setShowWarning] = useState(false);

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

  const fetchInitialData = async () => {
    try {
      const buyerList = await api.getBuyers();
      setBuyers(buyerList);

      const defaultBuyer = buyerList.find((b) => b.is_default);
      if (defaultBuyer) {
        setSelectedBuyerId(defaultBuyer.id.toString());
        applyBuyerToStore(defaultBuyer);
      } else if (buyerList.length > 0) {
        setSelectedBuyerId(buyerList[0].id.toString());
        applyBuyerToStore(buyerList[0]);
      }

      if (dcIdFromUrl) loadDC(dcIdFromUrl);
    } catch {
      // Failure not critical
    }
  };

  const applyBuyerToStore = (buyer: Buyer) => {
    updateHeader("buyer_name", buyer.name);
    updateHeader("buyer_gstin", buyer.gstin);
    updateHeader("buyer_address", buyer.billing_address);
    updateHeader("buyer_state", buyer.state || "");
    updateHeader("buyer_state_code", buyer.state_code || "");
    updateHeader("place_of_supply", buyer.place_of_supply);
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

  const loadDC = async (id: string) => {
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

      const newHeader = {
        ...header,
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

      if (dcDetail.items?.length > 0) {
        const mappedItems = dcDetail.items
          .map((item: any) => {
            const qty = item.dispatched_quantity || item.dispatch_qty || 0;
            const rate = item.po_rate || 0;
            const taxableValue = qty * rate;
            const cgstAmount = (taxableValue * TAX_RATES.cgst) / 100;
            const sgstAmount = (taxableValue * TAX_RATES.sgst) / 100;

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
    setShowWarning(false);
    setIsSaving(true);
    setError(null);
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
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={() => router.back()} disabled={isSaving}>
        Cancel
      </Button>
      <Button
        color="primary"
        size="sm"
        onClick={() => setShowWarning(true)}
        disabled={isSaving || items.length === 0 || isDuplicateNumber || !header.invoice_number}
      >
        {isSaving ? <Loader2 size={16} className="animate-spin mr-2" /> : <Save size={16} className="mr-2" />}
        {isSaving ? "Saving..." : "Generate Invoice"}
      </Button>
    </div>
  );

  return (
    <DocumentTemplate
      title="Create GST Invoice"
      description="Generate billing documentation from DC"
      actions={topActions}
      onBack={() => router.back()}
      icon={<Receipt size={20} className="text-app-accent" />}
      iconLayoutId="create-invoice-icon"
    >
      <div className="space-y-6">
        <DocumentJourney currentStage="Invoice" className="mb-2" />

        {error && (
          <Card className="p-4 bg-app-status-error/10 border-none">
            <div className="flex items-center gap-2 text-app-status-error">
              <AlertCircle size={16} />
              <SmallText className="text-app-status-error">{error}</SmallText>
            </div>
          </Card>
        )}

        {/* DC Selection */}
        {!dcIdFromUrl && (
          <Card className="p-6">
            <Label className="mb-2 block">Delivery Challan Reference</Label>
            <div className="flex gap-3 mt-1">
              <div className="flex-1">
                <Input
                  value={manualDcId}
                  onChange={(e) => setManualDcId(e.target.value)}
                  placeholder="Enter DC number"
                  className="text-app-fg text-lg"
                />
              </div>
              <Button variant="secondary" onClick={() => loadDC(manualDcId)} disabled={!manualDcId || isLoading}>
                {isLoading ? <Loader2 size={16} className="animate-spin mr-2" /> : <Search size={16} className="mr-2" />}
                {isLoading ? "Loading..." : "Load DC"}
              </Button>
            </div>
          </Card>
        )}

        {/* Info Tabs */}
        <Tabs defaultValue="buyer" className="w-full">
          <TabsList className="mb-4 bg-app-overlay/5 p-1 rounded-xl inline-flex border border-app-border/10">
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
              <Card className="p-6 mt-0 border-none shadow-sm bg-app-surface/50 backdrop-blur-md">
                <TabsContent value="buyer" className="mt-0">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 border-r border-app-border/10 pr-6">
                      <div className="space-y-2">
                        <Label>INVOICE NUMBER</Label>
                        <Input
                          value={header.invoice_number}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateHeader("invoice_number", val);
                            checkNumberDuplicate(val, header.invoice_date);
                          }}
                          className={cn("tabular-nums text-lg", isDuplicateNumber ? "border-app-status-error ring-app-status-error/10" : "")}
                          placeholder="INV/001/24-25"
                        />
                        {isDuplicateNumber && <SmallText className="text-app-status-error">This number already exists</SmallText>}
                      </div>
                      <div className="space-y-2">
                        <Label>INVOICE DATE</Label>
                        <Input type="date" value={header.invoice_date} onChange={(e) => updateHeader("invoice_date", e.target.value)} />
                      </div>
                    </div>

                    <div className="lg:col-span-1">
                      <Label className="text-app-accent mb-3 block uppercase tracking-widest">Billed To</Label>
                      <Select.Root value={selectedBuyerId} onValueChange={handleBuyerChange}>
                        <Select.Trigger className="flex items-center justify-between w-full px-4 py-2 bg-app-surface border border-app-border/20 rounded-xl text-sm shadow-sm mb-4">
                          <Select.Value placeholder="Select Buyer" />
                          <Select.Icon><ChevronDown size={14} /></Select.Icon>
                        </Select.Trigger>
                        <Select.Portal>
                          <Select.Content className="overflow-hidden bg-app-surface rounded-2xl shadow-premium border border-app-border/10 z-50">
                            <Select.Viewport className="p-1">
                              {buyers.map((b) => (
                                <Select.Item key={b.id} value={b.id.toString()} className="flex items-center px-8 py-3 text-sm text-app-fg-muted rounded-xl outline-none hover:bg-app-accent/10 hover:text-app-accent cursor-pointer">
                                  <Select.ItemText>{b.name}</Select.ItemText>
                                </Select.Item>
                              ))}
                            </Select.Viewport>
                          </Select.Content>
                        </Select.Portal>
                      </Select.Root>
                      <div className="p-4 rounded-xl bg-app-overlay/5 border border-app-border/10">
                        <H3 className="text-app-fg text-sm mb-1">{header.buyer_name || "---"}</H3>
                        <Body className="text-app-fg-muted leading-relaxed">{header.buyer_address || "---"}</Body>
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
            <Label className="m-0 text-app-fg-muted uppercase tracking-widest">
              Billing Structure ({items.length} Items)
            </Label>
            <div className="table-container shadow-premium-hover bg-app-surface/30">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-app-border/10 bg-app-overlay/10">
                    <th className="py-3 px-4 text-left w-[60px]"><Label>Lot</Label></th>
                    <th className="py-3 px-4 text-left"><Label>Description</Label></th>
                    <th className="py-3 px-4 text-left w-[120px]"><Label>HSN/SAC</Label></th>
                    <th className="py-3 px-4 text-right w-[100px]"><Label>Qty</Label></th>
                    <th className="py-3 px-4 text-right w-[100px]"><Label>Rate</Label></th>
                    <th className="py-3 px-4 text-right w-[120px] bg-blue-50/10 dark:bg-blue-900/10"><Label className="text-blue-600 dark:text-blue-400">Taxable</Label></th>
                    <th className="py-3 px-4 text-right w-[100px]"><Label>Recd</Label></th>
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
                        <tr className="bg-app-overlay/10 border-b border-app-border/5">
                          <td className="py-3 px-4"><MonoCode className="text-app-accent/60">#S</MonoCode></td>
                          <td className="py-3 px-4"><Body className="text-[13px] text-app-fg-muted/80">{parent.description}</Body></td>
                          <td className="py-3 px-4"><SmallText className="text-app-fg-muted/40 uppercase tracking-widest">{parent.hsn_sac || "-"}</SmallText></td>
                          <td className="py-3 px-4 text-right"><Accounting className="text-[13px] text-app-fg-muted/60">{tQty}</Accounting></td>
                          <td className="py-3 px-4 text-right"><Accounting className="text-[13px] text-app-fg-muted/40">{parent.rate}</Accounting></td>
                          <td className="py-3 px-4 text-right bg-blue-50/5 dark:bg-blue-900/5"><Accounting className="text-[13px] text-blue-600/60 dark:text-blue-400/60">{tVal}</Accounting></td>
                          <td className="py-3 px-4 text-right"><Accounting className="text-[13px] text-app-fg-muted/60">{tRec}</Accounting></td>
                        </tr>
                        {/* Lot Rows */}
                        {group.map((item, idx) => (
                          <tr key={idx} className="bg-app-surface border-b border-app-border/5 transition-colors">
                            <td className="py-2 px-0 relative">
                              <div className="absolute left-[30px] top-0 bottom-0 w-[2px] bg-app-accent/20" />
                              <div className="flex items-center gap-2 pl-[38px]">
                                <span className="text-app-accent/30" style={{ fontSize: '10px' }}>L</span>
                                <MonoCode className="text-app-fg-muted">L-{item.po_sl_no}</MonoCode>
                              </div>
                            </td>
                            <td colSpan={2} />
                            <td className="py-2 px-4 text-right"><Accounting className="text-app-fg-muted">{item.quantity}</Accounting></td>
                            <td className="py-2 px-4 text-right" />
                            <td className="py-2 px-4 text-right bg-blue-50/5 dark:bg-blue-900/5">
                              <Accounting className="text-blue-600 dark:text-blue-400">{item.taxable_value}</Accounting>
                            </td>
                            <td className="py-2 px-4 text-right"><Accounting className="text-app-fg-muted">{item.received_qty}</Accounting></td>
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
                    <div className="flex justify-between items-center pb-2 border-b border-app-border/10">
                      <Label className="uppercase tracking-widest text-app-fg-muted">Net Taxable Value</Label>
                      <Accounting className="text-xl text-app-fg">{header.total_taxable_value}</Accounting>
                    </div>
                    <div className="flex justify-between items-center text-app-fg-muted">
                      <Label className="uppercase tracking-widest">CGST (9%) + SGST (9%)</Label>
                      <Accounting className="text-sm">{(header.cgst_total + header.sgst_total).toFixed(2)}</Accounting>
                    </div>
                    <div className="pt-6 mt-4 border-t border-app-border/20 flex justify-between items-end">
                      <div className="space-y-2">
                        <Label className="uppercase text-app-accent tracking-widest">Total Invoice Value</Label>
                        <SmallText className="text-app-fg-muted block max-w-[280px] leading-snug italic lowercase first-letter:uppercase">
                          {amountInWords(header.total_invoice_value)} Only
                        </SmallText>
                      </div>
                      <Accounting className="text-4xl text-app-fg tracking-tighter leading-none">
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

      {/* Verification Modal */}
      <AnimatePresence>
        {showWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-app-overlay/40 backdrop-blur-sm"
            onClick={() => setShowWarning(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md"
            >
              <Card className="p-0 overflow-hidden border-none shadow-2xl bg-app-surface">
                <div className="p-8 pb-6 bg-gradient-to-br from-app-status-error/5 to-app-status-warning/5 border-b border-app-border/10 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-app-status-error flex items-center justify-center shadow-lg shadow-app-status-error/20">
                    <AlertCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <H3 className="text-app-fg leading-none">Generate Invoice?</H3>
                    <SmallText className="text-app-fg-muted mt-1 uppercase tracking-widest">Permanent Financial Action</SmallText>
                  </div>
                </div>
                <div className="p-8">
                  <div className="p-4 rounded-2xl bg-app-status-error/5 border border-app-status-error/10 mb-6">
                    <Body className="text-sm text-app-status-error italic">
                      Warning: Generating this invoice will lock the associated DC and cannot be undone.
                    </Body>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1 font-medium" onClick={() => setShowWarning(false)}>Cancel</Button>
                    <Button color="primary" className="flex-1 shadow-lg shadow-app-accent/20" onClick={handleSave}>Confirm</Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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

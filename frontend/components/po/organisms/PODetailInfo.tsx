"use client"; // v1.0.1 - HMR Refresh

import React from "react";
import { Input } from "@/components/design-system/atoms/Input";
import { Body, H3, Label, SmallText, Accounting } from "@/components/design-system/atoms/Typography";
import { Stack, Flex, Box } from "@/components/design-system/atoms/Layout";
import { Button } from "@/components/design-system/atoms/Button";
import { Badge } from "@/components/design-system/atoms/Badge";
import { Card } from "@/components/design-system/atoms/Card";
import {
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent
} from "@/components/design-system/molecules/Tabs";
import { SummaryCards } from "@/components/design-system/organisms/SummaryCards";
import {
    Info,
    FileText,
    ShieldCheck,
    Receipt,
    Calendar
} from "lucide-react";
import { formatDate, formatIndianCurrency } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

import { usePOStore } from "@/store/poStore";

interface FieldProps {
    label: string;
    value: any;
    field?: string;
    readonly?: boolean;
    editMode: boolean;
}

const Field = ({ label, value, field, readonly = false, editMode }: FieldProps) => {
    const updateHeader = usePOStore((state) => state.updateHeader);
    return (
        <div className="min-h-[38px] flex flex-col justify-center">
            <Label className="mb-0.5">{label}</Label>
            {editMode && field && !readonly ? (
                <Input
                    value={value ?? ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateHeader(field, e.target.value)}
                    className="h-8 px-2 py-1 border-none bg-app-surface-hover focus:bg-app-surface transition-all shadow-none focus:shadow-sm font-semibold text-app-fg"
                />
            ) : (
                <div
                    className="text-[13px] font-medium text-app-fg leading-tight py-0.5 truncate"
                    title={value?.toString()}
                >
                    {value || (
                        <span className="text-app-fg-muted font-normal italic opacity-40 uppercase tracking-widest text-[9px]">
                            Empty
                        </span>
                    )}
                </div>
            )}
        </div>
    );
};

interface PODetailInfoProps {
    srvs: any[];
    editMode: boolean;
    onSRVClick: (srvNumber: string) => void;
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

export const PODetailInfo = ({
    srvs,
    editMode,
    onSRVClick,
    activeTab,
    setActiveTab,
}: PODetailInfoProps) => {
    const header = usePOStore((state) => state.data?.header);
    const updateHeader = usePOStore((state) => state.updateHeader);

    if (!header) return null;
    return (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-4 bg-app-overlay/5 p-1 rounded-xl w-fit border border-app-border/10 backdrop-blur-sm">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="references">References</TabsTrigger>
                <TabsTrigger value="financial">Financial Details</TabsTrigger>
                <TabsTrigger value="issuer">Issuing Authority</TabsTrigger>
                <TabsTrigger value="srvs">Store Receipts ({srvs.length})</TabsTrigger>
            </TabsList>
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.15 }}
                >
                    <div className="bg-app-surface border border-white/5 rounded-xl shadow-sm p-5 min-h-[160px]">
                        <TabsContent value="basic" className="m-0">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3">
                                <Field label="PO Number" value={header.po_number} field="po_number" readonly editMode={editMode} />
                                <Field label="PO Date" value={formatDate(header.po_date)} field="po_date" readonly editMode={editMode} />
                                <Field label="Supplier Name" value={header.supplier_name} field="supplier_name" editMode={editMode} />
                                <Field label="Supplier Code" value={header.supplier_code} field="supplier_code" editMode={editMode} />
                                <Field label="Phone" value={header.supplier_phone} field="supplier_phone" editMode={editMode} />
                                <Field label="Fax" value={header.supplier_fax} field="supplier_fax" editMode={editMode} />
                                <Field label="Email" value={header.supplier_email} field="supplier_email" editMode={editMode} />
                                <Field label="Dept No (DVN)" value={header.department_no} field="department_no" editMode={editMode} />
                            </div>
                        </TabsContent>
                        <TabsContent value="references" className="m-0">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3">
                                <Field label="Enquiry Number" value={header.enquiry_no} field="enquiry_no" editMode={editMode} />
                                <Field label="Enquiry Date" value={formatDate(header.enquiry_date)} field="enquiry_date" editMode={editMode} />
                                <Field label="Quotation Ref" value={header.quotation_ref} field="quotation_ref" editMode={editMode} />
                                <Field label="Quotation Date" value={formatDate(header.quotation_date)} field="quotation_date" editMode={editMode} />
                                <Field label="RC Number" value={header.rc_no} field="rc_no" editMode={editMode} />
                                <Field label="Order Type" value={header.order_type} field="order_type" editMode={editMode} />
                                <Field label="PO Status" value={header.po_status} field="po_status" editMode={editMode} />
                                <Field label="AMD Number" value={header.amend_no} field="amend_no" editMode={editMode} />
                            </div>
                        </TabsContent>
                        <TabsContent value="financial" className="m-0">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3">
                                <Field label="PO Value" value={formatIndianCurrency(header.po_value)} field="po_value" editMode={editMode} />
                                <Field label="FOB Value" value={formatIndianCurrency(header.fob_value)} field="fob_value" editMode={editMode} />
                                <Field label="Net Value" value={formatIndianCurrency(header.net_po_value)} field="net_po_value" editMode={editMode} />
                                <Field label="TIN No" value={header.tin_no} field="tin_no" editMode={editMode} />
                                <Field label="ECC No" value={header.ecc_no} field="ecc_no" editMode={editMode} />
                                <Field label="MPCT No" value={header.mpct_no} field="mpct_no" editMode={editMode} />
                                <Field label="Currency" value={header.currency} field="currency" editMode={editMode} />
                                <Field label="Ex Rate" value={header.ex_rate} field="ex_rate" editMode={editMode} />
                            </div>
                        </TabsContent>
                        <TabsContent value="issuer" className="m-0">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-4">
                                <Field label="Inspection By" value={header.inspection_by} field="inspection_by" editMode={editMode} />
                                <Field label="Issuer Name" value={header.issuer_name} field="issuer_name" editMode={editMode} />
                                <Field label="Designation" value={header.issuer_designation} field="issuer_designation" editMode={editMode} />
                                <Field label="Issuer Phone" value={header.issuer_phone} field="issuer_phone" editMode={editMode} />
                                <div className="col-span-2 md:col-span-4 mt-2">
                                    <div className="flex flex-col">
                                        <SmallText className="text-[10px] font-bold text-app-fg-muted uppercase tracking-widest mb-1 leading-none">
                                            Remarks
                                        </SmallText>
                                        {editMode ? (
                                            <input
                                                value={header.remarks || ""}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateHeader("remarks", e.target.value)}
                                                className="w-full h-8 px-2 text-[13px] border-none bg-app-surface-hover rounded focus:bg-app-surface transition-all shadow-none font-medium text-app-fg"
                                                placeholder="Enter remarks..."
                                            />
                                        ) : (
                                            <div className="text-[13px] text-app-fg font-normal line-clamp-1 italic px-0.5 opacity-90" title={header.remarks || ""}>
                                                {header.remarks || "No remarks provided."}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                        <TabsContent value="srvs" className="m-0">
                            {srvs.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {srvs.map((srv: any) => (
                                        <div
                                            key={srv.srv_number}
                                            className="p-4 rounded-xl shadow-sm bg-app-border/10 hover:bg-app-accent/5 hover:shadow-md transition-all duration-300 group cursor-pointer"
                                            onClick={() => onSRVClick(srv.srv_number)}
                                        >
                                            <Flex justify="between" align="start" className="mb-3">
                                                <Stack gap={1}>
                                                    <div className="text-[10px] font-bold text-app-fg uppercase tracking-tight group-hover:text-app-accent">
                                                        SRV-{srv.srv_number}
                                                    </div>
                                                    <div className="text-[9px] font-medium text-app-fg-muted flex items-center gap-1 uppercase tracking-tighter">
                                                        <Calendar className="w-2.5 h-2.5" />
                                                        {formatDate(srv.srv_date)}
                                                    </div>
                                                </Stack>
                                                <Stack align="end" gap={2}>
                                                    <div className="w-6 h-6 rounded-lg bg-app-accent/10 flex items-center justify-center text-app-accent shadow-sm">
                                                        <Receipt className="w-3 h-3" />
                                                    </div>
                                                </Stack>
                                            </Flex>
                                            <div className="grid grid-cols-2 pt-2 border-t border-app-border/20 mt-2 gap-2">
                                                <div>
                                                    <div className="text-[7px] font-bold text-app-status-success uppercase tracking-widest leading-tight">
                                                        Accepted
                                                    </div>
                                                    <Accounting variant="success" className="text-[11px]">
                                                        {srv.total_accepted_qty || 0}
                                                    </Accounting>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-[7px] font-bold text-app-status-error uppercase tracking-widest leading-tight">
                                                        Rejected
                                                    </div>
                                                    <Accounting variant="error" className="text-[11px]">
                                                        {srv.total_rejected_qty || 0}
                                                    </Accounting>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6 text-app-fg-muted italic text-sm">
                                    No linked SRVs found.
                                </div>
                            )}
                        </TabsContent>
                    </div>
                </motion.div>
            </AnimatePresence>
        </Tabs>
    );
};

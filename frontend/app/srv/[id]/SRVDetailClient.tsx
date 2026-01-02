"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, ChevronDown, ChevronUp } from "lucide-react";

import {
    Button,
    SmallText,
    Accounting,
    DocumentTemplate,
    Flex,
    Stack,
    Body,
    Label,
    Card,
    MonoCode,
} from "@/components/design-system";
import { formatDate, cn } from "@/lib/utils";

interface SRVDetailClientProps {
    initialSRV: any;
}

export default function SRVDetailClient({ initialSRV }: SRVDetailClientProps) {
    const router = useRouter();
    const [expandedParents, setExpandedParents] = useState<Set<number>>(new Set());

    const header = initialSRV?.header || {};
    const rawItems = initialSRV?.items || [];

    // Group SRV Items by PO Item No for Parent-Lot hierarchy
    const groupedItems = useMemo(() => {
        const groups: Record<number, any[]> = {};
        rawItems.forEach((item: any) => {
            const key = item.po_item_no;
            if (!groups[key]) groups[key] = [];
            groups[key].push(item);
        });
        return Object.values(groups);
    }, [rawItems]);

    const toggleParent = (itemNo: number) => {
        const newSet = new Set(expandedParents);
        if (newSet.has(itemNo)) newSet.delete(itemNo);
        else newSet.add(itemNo);
        setExpandedParents(newSet);
    };

    const actions = (
        <Flex gap={2}>
            <Button variant="secondary" size="sm" onClick={() => router.push("/srv")} className="border-app-border/20">
                Registry
            </Button>
            <Button variant="secondary" size="sm" onClick={() => window.print()} className="border-app-border/20">
                PDF Export
            </Button>
        </Flex>
    );

    return (
        <DocumentTemplate
            title={`Store Receipt Voucher - ${header.srv_number}`}
            description="Official material receipt and inspection document"
            actions={actions}
            icon={<Box size={22} className="text-system-blue" />}
            iconLayoutId="srv-detail-icon"
        >
            <Stack gap={6}>
                <div className="flex items-center justify-between px-1">
                    <Label className="m-0 text-app-fg-muted uppercase tracking-wide text-xs">
                        Inspection Manifest ({rawItems.length} Entries)
                    </Label>
                    <SmallText className="text-app-fg-muted opacity-50 uppercase tracking-tighter">
                        PO: <a href={`/po/${header.po_number}`} className="hover:text-app-accent hover:underline transition-colors">{header.po_number}</a>
                    </SmallText>
                </div>

                <div className="table-container border rounded-md">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                {["Div", "PO No", "PO Itm", "Sub Itm", "PMTR No", "SRV No", "SRV Itm", "Rev No", "SRV Date", "Challan No", "Challan Dt", "Tax Inv", "Tax Inv Dt", "Finance Dt", "CNote No", "CNote Dt", "Unit", "Order Qty", "Challan Qty", "Recvd Qty", "Accepted Qty", "Rej Qty"].map((head, i) => (
                                    <th key={i} className={cn(
                                        "h-10 px-1 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 border-none",
                                        "text-[9px] uppercase tracking-tight whitespace-nowrap",
                                        ["PO Itm", "Sub Itm", "SRV Itm", "Rev No", "Unit"].includes(head) && "text-center",
                                        ["Order Qty", "Challan Qty", "Recvd Qty", "Accepted Qty", "Rej Qty"].includes(head) && "text-right"
                                    )}>
                                        {head}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {rawItems.map((item: any, idx: number) => (
                                <tr key={idx} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted border-app-border/10">
                                    <td className="p-1 text-[10px] whitespace-nowrap font-medium text-app-fg">{header.div || "PLM"}</td>
                                    <td className="p-1 text-[10px] whitespace-nowrap font-medium text-app-fg">{header.po_number}</td>
                                    <td className="p-1 text-[10px] whitespace-nowrap text-center font-medium text-app-fg">{item.po_item_no}</td>
                                    <td className="p-1 text-[10px] whitespace-nowrap text-center text-muted-foreground">0</td>
                                    <td className="p-1 text-[10px] whitespace-nowrap text-muted-foreground">{item.pmir_no || "-"}</td>
                                    <td className="p-1 text-[10px] whitespace-nowrap font-medium text-app-fg">{item.srv_number || header.srv_number}</td>
                                    <td className="p-1 text-[10px] whitespace-nowrap text-center font-medium text-app-fg">1</td>
                                    <td className="p-1 text-[10px] whitespace-nowrap text-center text-muted-foreground">0</td>
                                    <td className="p-1 text-[10px] whitespace-nowrap text-muted-foreground">{formatDate(header.srv_date)}</td>
                                    <td className="p-1 text-[10px] whitespace-nowrap text-muted-foreground">{item.challan_no || "-"}</td>
                                    <td className="p-1 text-[10px] whitespace-nowrap text-muted-foreground">{item.challan_date ? formatDate(item.challan_date) : "-"}</td>
                                    <td className="p-1 text-[10px] whitespace-nowrap text-muted-foreground">{item.invoice_no || "-"}</td>
                                    <td className="p-1 text-[10px] whitespace-nowrap text-muted-foreground">{item.invoice_date ? formatDate(item.invoice_date) : "-"}</td>
                                    <td className="p-1 text-[10px] whitespace-nowrap text-muted-foreground">{item.finance_date ? formatDate(item.finance_date) : "-"}</td>
                                    <td className="p-1 text-[10px] whitespace-nowrap text-muted-foreground">{item.cnote_no || "-"}</td>
                                    <td className="p-1 text-[10px] whitespace-nowrap text-muted-foreground">{item.cnote_date ? formatDate(item.cnote_date) : "-"}</td>
                                    <td className="p-1 text-[10px] whitespace-nowrap text-center text-muted-foreground">{item.unit || "NOS"}</td>
                                    <td className="p-1 text-[10px] whitespace-nowrap text-right font-mono text-muted-foreground">{item.order_qty}</td>
                                    <td className="p-1 text-[10px] whitespace-nowrap text-right font-mono text-muted-foreground">{item.challan_qty}</td>
                                    <td className="p-1 text-[10px] whitespace-nowrap text-right font-mono font-medium text-app-fg">{item.received_qty}</td>
                                    <td className="p-1 text-[10px] whitespace-nowrap text-right font-mono text-emerald-600 font-medium">{item.accepted_qty}</td>
                                    <td className="p-1 text-[10px] whitespace-nowrap text-right font-mono text-red-500 font-medium">{item.rejected_qty || 0}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Stack>
        </DocumentTemplate>
    );
}

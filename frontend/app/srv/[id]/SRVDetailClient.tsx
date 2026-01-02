"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ClipboardCheck, ChevronDown, ChevronUp } from "lucide-react";

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
            icon={<ClipboardCheck size={20} className="text-app-status-success" />}
            iconLayoutId="srv-detail-icon"
        >
            <Stack gap={6}>
                <div className="flex items-center justify-between px-1">
                    <Label className="m-0 text-app-fg-muted uppercase tracking-widest text-[11px]">
                        Inspection Manifest ({rawItems.length} Entries)
                    </Label>
                    <SmallText className="text-app-fg-muted opacity-50 uppercase tracking-tighter">
                        PO: {header.po_number}
                    </SmallText>
                </div>

                <div className="table-container shadow-premium-hover bg-app-surface/30 border-none">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-app-border/10 bg-app-overlay/10">
                                <th className="py-3 px-4 w-[60px]"><Label># ITM</Label></th>
                                <th className="py-3 px-4"><Label>Details</Label></th>
                                <th className="py-3 px-4 w-[110px]"><Label>SRV No</Label></th>
                                <th className="py-3 px-4 w-[100px]"><Label>Tax Inv</Label></th>
                                <th className="py-3 px-4 text-right w-[90px]"><Label>Order</Label></th>
                                <th className="py-3 px-4 text-right w-[90px]"><Label>Challan</Label></th>
                                <th className="py-3 px-4 text-right w-[90px] bg-blue-50/10 dark:bg-blue-900/10"><Label className="text-blue-600 dark:text-blue-400">Recvd</Label></th>
                                <th className="py-3 px-4 text-right w-[90px] bg-green-50/10 dark:bg-green-900/10"><Label className="text-green-600 dark:text-green-400">Accepted</Label></th>
                                <th className="py-3 px-4 text-right w-[70px] bg-red-50/10 dark:bg-red-900/10"><Label className="text-red-500">Rej</Label></th>
                                <th className="py-3 px-4 w-[50px]"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {groupedItems.map((group, groupIdx) => {
                                const parent = group[0];
                                const isExpanded = expandedParents.has(parent.po_item_no);
                                const tOrd = group.reduce((sum, i) => sum + (i.order_qty || 0), 0);
                                const tCha = group.reduce((sum, i) => sum + (i.challan_qty || 0), 0);
                                const tRec = group.reduce((sum, i) => sum + (i.received_qty || 0), 0);
                                const tAcc = group.reduce((sum, i) => sum + (i.accepted_qty || 0), 0);
                                const tRej = group.reduce((sum, i) => sum + (i.rejected_qty || 0), 0);

                                return (
                                    <React.Fragment key={parent.po_item_no}>
                                        <tr className={cn("transition-colors border-b border-app-border/10", isExpanded ? "bg-app-overlay/10" : "bg-app-overlay/5")}>
                                            <td className="py-3 px-4"><MonoCode className="text-app-accent leading-none">#{parent.po_item_no}</MonoCode></td>
                                            <td className="py-3 px-4">
                                                <Body className="text-[13px] text-app-fg-muted/80">{parent.material_description || "Material"}</Body>
                                                <div className="flex gap-3 mt-0.5">
                                                    <SmallText className="text-[10px] text-app-fg-muted/40 uppercase tracking-tighter">Code: {parent.material_code || "-"}</SmallText>
                                                    <SmallText className="text-[10px] text-app-accent/40 uppercase tracking-tighter">Unit: {parent.unit}</SmallText>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4"><Accounting className="text-[12px] text-app-accent/60">{parent.srv_number || header.srv_number}</Accounting></td>
                                            <td className="py-3 px-4"><SmallText className="text-app-fg-muted/40 text-[10px] uppercase truncate max-w-[80px]">{parent.invoice_no || "-"}</SmallText></td>
                                            <td className="py-3 px-4 text-right"><Accounting className="text-[12px] text-app-fg-muted/60">{tOrd}</Accounting></td>
                                            <td className="py-3 px-4 text-right"><Accounting className="text-[12px] text-app-fg-muted/60">{tCha}</Accounting></td>
                                            <td className="py-3 px-4 text-right bg-blue-50/5 dark:bg-blue-900/5"><Accounting className="text-[12px] text-blue-600/60 dark:text-blue-400/60">{tRec}</Accounting></td>
                                            <td className="py-3 px-4 text-right bg-green-50/5 dark:bg-green-900/5"><Accounting className="text-[12px] text-green-600/60 dark:text-green-400/60">{tAcc}</Accounting></td>
                                            <td className="py-3 px-4 text-right bg-red-50/5 dark:bg-red-900/5"><Accounting className={cn("text-[12px]", tRej > 0 ? "text-red-500/60" : "text-app-fg-muted/20")}>{tRej}</Accounting></td>
                                            <td className="py-3 px-4 text-center">
                                                <button onClick={() => toggleParent(parent.po_item_no)} className="p-1.5 rounded-md hover:bg-app-accent/10 hover:text-app-accent transition-all text-app-fg-muted/30">
                                                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                </button>
                                            </td>
                                        </tr>
                                        {isExpanded && group.map((item, idx) => (
                                            <tr key={idx} className="bg-app-surface border-b border-app-border/5">
                                                <td className="py-2 px-0 relative">
                                                    <div className="absolute left-[30px] top-0 bottom-0 w-[2px] bg-app-accent/20" />
                                                    <div className="flex items-center gap-2 pl-[38px]">
                                                        <span className="text-[10px] text-app-accent/30">L</span>
                                                        <MonoCode className="text-[11px] text-app-fg-muted">L-{item.lot_no || 0}</MonoCode>
                                                    </div>
                                                </td>
                                                <td className="py-2 px-4">
                                                    <div className="flex gap-4">
                                                        <SmallText className="text-[10px] text-app-fg-muted/60 uppercase">Challan: {item.challan_no || "-"}</SmallText>
                                                        <SmallText className="text-[10px] text-app-fg-muted/40 uppercase">PMIR: {item.pmir_no || "-"}</SmallText>
                                                    </div>
                                                </td>
                                                <td colSpan={2} />
                                                <td className="py-2 px-4 text-right"><Accounting className="text-[11px] text-app-fg-muted/40">{item.order_qty}</Accounting></td>
                                                <td className="py-2 px-4 text-right"><Accounting className="text-[11px] text-app-fg-muted/40">{item.challan_qty}</Accounting></td>
                                                <td className="py-2 px-4 text-right bg-blue-50/5 dark:bg-blue-900/5"><Accounting className="text-[11px] text-blue-600 dark:text-blue-400">{item.received_qty}</Accounting></td>
                                                <td className="py-2 px-4 text-right bg-green-50/5 dark:bg-green-900/5"><Accounting className="text-[11px] text-green-600 dark:text-green-400">{item.accepted_qty}</Accounting></td>
                                                <td className="py-2 px-4 text-right bg-red-50/5 dark:bg-red-900/5"><Accounting className={cn("text-[11px]", (item.rejected_qty || 0) > 0 ? "text-red-500" : "text-app-fg-muted/10")}>{item.rejected_qty || 0}</Accounting></td>
                                                <td />
                                            </tr>
                                        ))}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </Stack>
        </DocumentTemplate>
    );
}

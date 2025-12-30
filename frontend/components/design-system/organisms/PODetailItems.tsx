"use client";

import React from "react";
import { Button } from "../atoms/Button";
import { Input } from "../atoms/Input";
import { Accounting, SmallText, Body, Label, MonoCode } from "../atoms/Typography";
import { Flex, Stack } from "../atoms/Layout";
import {
    Plus,
    Trash2,
    ChevronDown,
    ChevronUp,
    Layers
} from "lucide-react";
import { formatDate, cn } from "@/lib/utils";

interface PODetailItemsProps {
    items: any[];
    editMode: boolean;
    expandedItems: Set<number>;
    toggleItem: (itemNo: number) => void;
    addItem: () => void;
    removeItem: (index: number) => void;
    updateItem: (index: number, field: string, value: any) => void;
    addDelivery: (itemIdx: number) => void;
    removeDelivery: (itemIdx: number, deliveryIdx: number) => void;
    onUpdateItems: (newItems: any[]) => void;
}

export const PODetailItems = ({
    items,
    editMode,
    expandedItems,
    toggleItem,
    addItem,
    removeItem,
    updateItem,
    addDelivery,
    removeDelivery,
    onUpdateItems
}: PODetailItemsProps) => {
    return (
        <Stack gap={3}>
            <Flex align="center" justify="between">
                <Label className="m-0 uppercase tracking-[0.2em] text-[10px] font-bold text-app-fg block">
                    Bill of Materials
                </Label>
                {editMode && (
                    <Button size="sm" onClick={addItem} variant="secondary" className="h-8 text-[11px] font-bold">
                        <Plus className="w-3.5 h-3.5 mr-1.5" /> ADD ITEM
                    </Button>
                )}
            </Flex>
            <div className="surface-card bg-app-border/30 overflow-hidden shadow-xl shadow-app-accent/5">
                <div className="bg-app-surface overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-app-border/10">
                            <tr>
                                <th className="py-2.5 px-4 text-[10px] font-bold text-app-fg-muted uppercase tracking-widest text-center w-12"><Label className="text-[10px]">#</Label></th>
                                <th className="py-2.5 px-4 text-[10px] font-bold text-app-fg-muted uppercase tracking-widest text-left w-32"><Label className="text-[10px]">Code</Label></th>
                                <th className="py-2.5 px-4 text-[10px] font-bold text-app-fg-muted uppercase tracking-widest text-left"><Label className="text-[10px]">Description</Label></th>
                                <th className="py-2.5 px-4 text-[10px] font-bold text-app-fg-muted uppercase tracking-widest text-left w-20"><Label className="text-[10px]">Unit</Label></th>
                                <th className="py-2.5 px-4 text-[10px] font-bold text-app-fg-muted uppercase tracking-widest text-right w-28"><Label className="text-[10px]">Rate</Label></th>
                                <th className="py-2.5 px-2 text-[10px] font-bold text-app-fg-muted uppercase tracking-widest text-center w-32"><Label className="text-[10px]">Ord</Label></th>
                                <th className="py-2.5 px-2 text-[10px] font-bold text-app-fg-muted uppercase tracking-widest text-center w-32"><Label className="text-[10px]">Dlv</Label></th>
                                <th className="py-2.5 px-2 text-[10px] font-bold text-app-fg-muted uppercase tracking-widest text-center w-32"><Label className="text-[10px]">Bal</Label></th>
                                <th className="py-2.5 px-2 text-[10px] font-bold text-app-fg-muted uppercase tracking-widest text-center w-32"><Label className="text-[10px]">Rec</Label></th>
                                <th className="py-2.5 px-4 w-12"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, idx) => (
                                <React.Fragment key={item.po_item_no}>
                                    <tr className={cn(
                                        "transition-colors group border-b border-app-border/5",
                                        idx % 2 === 0 ? "bg-app-surface" : "bg-app-border/5",
                                        expandedItems.has(item.po_item_no) ? "bg-app-accent/5" : ""
                                    )}>
                                        <td className="py-2 px-4 text-center align-top pt-3.5 italic text-app-fg-muted/60 text-[11px]">
                                            <MonoCode>{idx + 1}</MonoCode>
                                        </td>
                                        <td className="py-2 px-4 align-top pt-2.5">
                                            {editMode ? (
                                                <Input value={item.material_code} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateItem(idx, "material_code", e.target.value)} className="h-7 w-full px-1.5 py-1 border-none bg-app-border/10 font-medium text-app-fg text-[12px]" />
                                            ) : (
                                                <Accounting className="tracking-tighter text-[12px]">{item.material_code}</Accounting>
                                            )}
                                        </td>
                                        <td className="py-2 px-4 align-top pt-2.5">
                                            {editMode ? (
                                                <Stack gap={1}>
                                                    <Input value={item.material_description} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateItem(idx, "material_description", e.target.value)} className="h-7 w-full px-1.5 py-1 border-none bg-app-border/10 font-medium text-app-fg text-[12px]" />
                                                    <Input value={item.drg_no} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateItem(idx, "drg_no", e.target.value)} placeholder="Drawing" className="h-6 text-[11px] w-32 px-1.5 py-0.5 border-none bg-app-border/10 font-medium text-app-fg" />
                                                </Stack>
                                            ) : (
                                                <Stack gap={0.5}>
                                                    <Body className="font-medium leading-tight truncate max-w-[400px] text-app-fg text-[12px]" title={item.material_description}>{item.material_description}</Body>
                                                    {item.drg_no && (
                                                        <SmallText className="text-[10px] font-medium text-app-accent uppercase tracking-tight">DRG: {item.drg_no}</SmallText>
                                                    )}
                                                </Stack>
                                            )}
                                        </td>
                                        <td className="py-2 px-4 align-top pt-2.5">
                                            {editMode ? (
                                                <Input value={item.unit} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateItem(idx, "unit", e.target.value)} className="h-7 text-[12px] w-14 px-1 py-1 border-none bg-app-border/10 font-medium text-app-fg" />
                                            ) : (
                                                <SmallText className="text-app-fg-muted uppercase font-bold">{item.unit}</SmallText>
                                            )}
                                        </td>
                                        <td className="py-2 px-4 text-right align-top pt-3">
                                            {editMode ? (
                                                <Input type="number" variant="ghost" value={item.po_rate} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateItem(idx, "po_rate", parseFloat(e.target.value))} className="h-7 text-[12px] text-right w-full px-1.5 py-1 font-mono font-medium text-app-fg focus:bg-app-border/10 transition-colors" />
                                            ) : (
                                                <div className="h-7 px-1.5 py-1 flex items-center justify-end">
                                                    <Accounting isCurrency className="tracking-tighter text-[12px] font-mono">{item.po_rate}</Accounting>
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-2 px-2 text-center align-top pt-3">
                                            {editMode ? (
                                                <Input type="number" variant="ghost" value={item.ordered_quantity} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateItem(idx, "ordered_quantity", parseFloat(e.target.value))} className="h-7 text-[12px] text-center w-full px-1 py-1 font-medium text-app-fg focus:bg-app-border/10 transition-colors" />
                                            ) : (
                                                <div className="h-7 px-1 py-1 flex items-center justify-center">
                                                    <Accounting className="tracking-tighter text-[12px]">{item.ordered_quantity}</Accounting>
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-2 px-2 text-center align-top pt-3">
                                            {editMode ? (
                                                <Input type="number" variant="ghost" value={item.delivered_quantity} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateItem(idx, "delivered_quantity", parseFloat(e.target.value))} className="h-7 text-[12px] text-center w-full px-1 py-1 font-medium text-app-accent focus:bg-app-accent/10 transition-colors" />
                                            ) : (
                                                <div className="h-7 px-1 py-1 flex items-center justify-center">
                                                    <Accounting variant="highlight" className="tracking-tighter text-[12px]">{item.delivered_quantity}</Accounting>
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-2 px-2 text-center align-top pt-3">
                                            <div className="h-7 px-1 py-1 flex items-center justify-center">
                                                <Accounting variant="warning" className="tracking-tighter text-[12px]">
                                                    {(item.ordered_quantity || 0) - (item.delivered_quantity || 0)}
                                                </Accounting>
                                            </div>
                                        </td>
                                        <td className="py-2 px-2 text-center align-top pt-3">
                                            {editMode ? (
                                                <Input type="number" variant="ghost" value={item.received_quantity} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateItem(idx, "received_quantity", parseFloat(e.target.value))} className="h-7 text-[12px] text-center w-full px-1 py-1 font-medium text-app-status-success focus:bg-app-status-success/10 transition-colors" />
                                            ) : (
                                                <div className="h-7 px-1 py-1 flex items-center justify-center">
                                                    <Accounting variant="success" className="tracking-tighter text-[12px]">{item.received_quantity}</Accounting>
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-2 px-4 align-top pt-2">
                                            <Flex direction="col" gap={1} align="center">
                                                <button onClick={() => toggleItem(item.po_item_no)} className={cn("p-1.5 rounded-md transition-all text-app-fg-muted/60 hover:text-app-fg", expandedItems.has(item.po_item_no) && "text-app-accent bg-app-accent/10")}>
                                                    {expandedItems.has(item.po_item_no) ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                </button>
                                                {editMode && (
                                                    <button onClick={() => removeItem(idx)} className="p-1.5 rounded-md text-app-status-error/60 hover:text-app-status-error hover:bg-app-status-error/10 transition-all">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </Flex>
                                        </td>
                                    </tr>
                                    {expandedItems.has(item.po_item_no) && (
                                        <tr className="bg-app-border/5">
                                            <td colSpan={10} className="p-0">
                                                <div className="pb-6 pt-2 px-12">
                                                    <Flex align="center" justify="between" className="mb-3 border-none pb-2">
                                                        <Label className="text-[10px] font-bold text-app-fg-muted uppercase tracking-[0.2em] flex items-center gap-2 m-0">
                                                            <Layers size={12} /> Delivery Lots & Schedules
                                                        </Label>
                                                        {editMode && (
                                                            <button onClick={() => addDelivery(idx)} className="text-[10px] font-bold text-app-accent hover:brightness-110 transition-all uppercase tracking-tight flex items-center bg-app-accent/5 px-2 py-1 rounded-md">
                                                                <Plus className="w-3 h-3 mr-1" /> Add Lot
                                                            </button>
                                                        )}
                                                    </Flex>
                                                    <Stack gap={1}>
                                                        {item.deliveries && item.deliveries.length > 0 ? (
                                                            item.deliveries.map((d: any, dIdx: number) => (
                                                                <div key={dIdx} className="flex items-center gap-8 py-2 px-4 rounded-lg hover:bg-app-border/10 transition-colors group/lot">
                                                                    <div className="flex items-center gap-3 min-w-[60px]">
                                                                        <span className="text-[10px] text-app-fg-muted/40">└</span>
                                                                        <MonoCode className="text-[11px] font-bold text-app-accent">L{d.lot_no}</MonoCode>
                                                                    </div>
                                                                    <div className="flex items-center gap-2 min-w-[120px]">
                                                                        <SmallText className="text-[9px] text-app-fg-muted uppercase font-medium">Qty</SmallText>
                                                                        {editMode ? (
                                                                            <Input
                                                                                type="number"
                                                                                value={d.delivered_quantity}
                                                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                                                    const n = [...items];
                                                                                    n[idx].deliveries[dIdx].delivered_quantity = parseFloat(e.target.value);
                                                                                    onUpdateItems(n);
                                                                                }}
                                                                                className="h-7 w-20 text-right bg-app-surface border-none text-[11px] font-bold"
                                                                            />
                                                                        ) : (
                                                                            <Accounting className="text-[11px] font-bold text-app-fg">{d.delivered_quantity}</Accounting>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex items-center gap-2 min-w-[150px]">
                                                                        <SmallText className="text-[9px] text-app-fg-muted uppercase font-medium">Date</SmallText>
                                                                        {editMode ? (
                                                                            <input
                                                                                type="date"
                                                                                value={d.dely_date ? new Date(d.dely_date).toISOString().split("T")[0] : ""}
                                                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                                                    const n = [...items];
                                                                                    n[idx].deliveries[dIdx].dely_date = e.target.value;
                                                                                    onUpdateItems(n);
                                                                                }}
                                                                                className="h-7 w-28 text-[11px] bg-app-surface rounded px-2 border-none outline-none text-app-fg font-bold"
                                                                            />
                                                                        ) : (
                                                                            <Body className="text-[11px] font-bold text-app-fg font-mono">{formatDate(d.dely_date)}</Body>
                                                                        )}
                                                                    </div>
                                                                    {editMode && (
                                                                        <div className="ml-auto">
                                                                            <Button variant="ghost" size="sm" onClick={() => removeDelivery(idx, dIdx)} className="text-app-status-error/40 hover:text-app-status-error hover:bg-app-status-error/10">
                                                                                <Trash2 className="w-3.5 h-3.5" />
                                                                            </Button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="flex items-center gap-3 py-4 pl-12 text-app-fg-muted/40">
                                                                <span>└</span>
                                                                <SmallText className="italic">No delivery lots defined for this item</SmallText>
                                                            </div>
                                                        )}
                                                    </Stack>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </Stack>
    );
};

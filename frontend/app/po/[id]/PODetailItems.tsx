"use client";

import React, { useMemo, useState, useEffect } from "react";
import {
    Button,
    Input,
    Accounting,
    SmallText,
    Body,
    Label,
    MonoCode,
    Card,
    Caption1,
    Caption2,
    Flex,
    Stack,
    Grid,
    Title2,
    Badge
} from "@/components/design-system";
import {
    Plus,
    Trash2,
    ChevronDown,
    ChevronUp,
    AlertCircle
} from "lucide-react";
import { formatDate, cn } from "@/lib/utils";
import { usePOStore } from "@/store/poStore";

interface PODetailItemsProps {
    editMode: boolean;
    expandedItems: Set<number>;
    toggleItem: (itemNo: number) => void;
}

// Performant Input that only commits to store on blur/enter
const GranularInput = React.memo(({
    value,
    onUpdate,
    className,
    type = "text"
}: {
    value: string | number;
    onUpdate: (val: any) => void;
    className?: string;
    type?: string;
}) => {
    const [localValue, setLocalValue] = React.useState(String(value));

    useEffect(() => {
        setLocalValue(String(value));
    }, [value]);

    const handleCommit = () => {
        if (String(localValue) !== String(value)) {
            const finalValue = type === "number" ? parseFloat(localValue) || 0 : localValue;
            onUpdate(finalValue);
        }
    };

    return (
        <Input
            type={type}
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onBlur={handleCommit}
            onKeyDown={(e) => {
                if (e.key === 'Enter') handleCommit();
            }}
            className={cn("h-8 px-2 text-[13px] border-none transition-all", className)}
        />
    );
});
GranularInput.displayName = "GranularInput";

const LotRow = React.memo(({
    itemIdx,
    lotIdx,
    editMode,
}: {
    itemIdx: number;
    lotIdx: number;
    editMode: boolean;
}) => {
    // Select specific delivery to avoid re-rendering on unrelated changes
    const delivery = usePOStore((state) => state.data?.items[itemIdx]?.deliveries[lotIdx]);
    const updateDelivery = usePOStore((state) => state.updateDelivery);
    const removeDelivery = usePOStore((state) => state.removeDelivery);

    if (!delivery) return null;

    return (
        <tr className="bg-app-overlay/5 border-none transition-colors hover:bg-app-overlay/10">
            <td className="py-2 px-3 border-none"></td>
            <td className="py-2 px-3 border-none" colSpan={3}>
                <Flex align="center" gap={3}>
                    <Badge variant="outline" className="text-[9px] uppercase tracking-tighter opacity-60">Lot {lotIdx + 1}</Badge>
                </Flex>
            </td>
            <td className="border-none" colSpan={2} />
            <td className="py-2 px-3 border-none text-right">
                {editMode ? (
                    <GranularInput
                        type="number"
                        value={delivery.ordered_quantity || 0}
                        onUpdate={(v) => updateDelivery(itemIdx, lotIdx, "ordered_quantity", v)}
                        className="text-right font-mono"
                    />
                ) : (
                    <Accounting className="text-[13px] text-text-secondary pr-2">{delivery.ordered_quantity || 0}</Accounting>
                )}
            </td>
            <td className="py-2 px-3 border-none text-right">
                <Accounting className="text-[13px] text-text-tertiary pr-2">{delivery.delivered_quantity || 0}</Accounting>
            </td>
            <td className="py-2 px-3 border-none text-right">
                <Accounting className="text-[13px] text-action-primary font-bold pr-2">{Math.max(0, (delivery.ordered_quantity || 0) - (delivery.delivered_quantity || 0))}</Accounting>
            </td>
            <td className="py-2 px-3 border-none text-right">
                <Accounting className="text-[13px] text-text-tertiary pr-2">{delivery.received_quantity || 0}</Accounting>
            </td>
            <td className="py-2 px-3 border-none text-center">
                {editMode && (
                    <Button
                        variant="ghost"
                        size="compact"
                        onClick={() => removeDelivery(itemIdx, lotIdx)}
                        className="h-6 w-6 p-0 text-status-error hover:bg-status-error/10"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                )}
            </td>
        </tr>
    );
});
LotRow.displayName = "LotRow";

const ItemRow = React.memo(({
    idx,
    editMode,
    isExpanded,
    toggleItem,
}: {
    idx: number;
    editMode: boolean;
    isExpanded: boolean;
    toggleItem: (n: number) => void;
}) => {
    const item = usePOStore((state) => state.data?.items[idx]);
    const updateItem = usePOStore((state) => state.updateItem);
    const removeItem = usePOStore((state) => state.removeItem);
    const addDelivery = usePOStore((state) => state.addDelivery);

    if (!item) return null;

    const { tOrd, tDlv, tRecd, tBal } = useMemo(() => {
        const deliveries = item.deliveries || [];
        const ord = deliveries.reduce((acc: number, d: any) => acc + (d.ordered_quantity || 0), 0) || (item.ordered_quantity || 0);
        const phys_dsp = deliveries.reduce((acc: number, d: any) => acc + (d.physical_dispatched_qty || 0), 0);
        const total_dlv = deliveries.reduce((acc: number, d: any) => acc + (d.delivered_quantity || 0), 0) || (item.delivered_quantity || 0);
        const recd = deliveries.reduce((acc: number, d: any) => acc + (d.received_quantity || 0), 0) || (item.received_quantity || 0);
        return {
            tOrd: ord,
            tDlv: total_dlv,
            tRecd: recd,
            tBal: Math.max(0, ord - total_dlv)
        };
    }, [item.deliveries, item.ordered_quantity, item.delivered_quantity, item.received_quantity]);

    return (
        <React.Fragment>
            <tr className={cn(
                "transition-all duration-300 group relative border-none h-[52px]",
                isExpanded
                    ? "bg-white/40 shadow-sm z-10"
                    : "hover:bg-white/20"
            )}>
                <td className="py-2.5 px-3 text-center w-[50px] border-none">
                    <MonoCode className="text-[10px] text-action-primary border-none bg-transparent p-0 font-regular">#{item.po_item_no}</MonoCode>
                </td>
                <td className="py-2.5 px-3 w-[120px] border-none text-left">
                    {editMode ? (
                        <GranularInput
                            value={item.material_code || ""}
                            onUpdate={(v) => updateItem(idx, "material_code", v)}
                            className="bg-action-primary/5 font-medium"
                        />
                    ) : (
                        <Accounting className="text-[13px] text-text-primary font-medium">{item.material_code}</Accounting>
                    )}
                </td>
                <td className="py-2.5 px-3 w-[120px] border-none text-left">
                    {editMode ? (
                        <GranularInput
                            value={item.drg_no || ""}
                            onUpdate={(v) => updateItem(idx, "drg_no", v)}
                            className="bg-blue-500/5"
                        />
                    ) : (
                        <Caption1 className="text-text-tertiary text-[11px]">{item.drg_no || "-"}</Caption1>
                    )}
                </td>
                <td className="py-2.5 px-3 border-none text-left">
                    {editMode ? (
                        <GranularInput
                            value={item.material_description}
                            onUpdate={(v) => updateItem(idx, "material_description", v)}
                            className="bg-blue-500/5"
                        />
                    ) : (
                        <Body className="text-[13px] text-text-primary font-regular truncate max-w-full" title={item.material_description}>{item.material_description}</Body>
                    )}
                </td>
                <td className="py-2.5 px-3 w-[60px] border-none text-left">
                    <Caption1 className="text-text-tertiary text-[11px] uppercase">{item.unit}</Caption1>
                </td>
                <td className="py-2.5 px-3 w-[90px] text-right border-none">
                    <Accounting className="text-[13px] text-text-primary pr-2">{(item.po_rate || 0).toFixed(2)}</Accounting>
                </td>
                <td className="py-2.5 px-3 w-[80px] text-right border-none">
                    <Accounting className="text-[13px] text-text-tertiary pr-2">{tOrd}</Accounting>
                </td>
                <td className="py-2.5 px-3 w-[80px] text-right border-none">
                    <div className="flex flex-col items-end gap-1 px-1">
                        <Accounting className="text-[13px] text-text-tertiary pr-1">{tDlv}</Accounting>
                        <div className="w-full max-w-[40px] bg-text-tertiary/10 h-1 rounded-full overflow-hidden">
                            <div
                                className="bg-brand-primary h-full transition-all duration-1000"
                                style={{ width: `${Math.min(100, (tDlv / (tOrd || 1)) * 100)}%` }}
                            />
                        </div>
                    </div>
                </td>
                <td className="py-2.5 px-3 w-[80px] text-right bg-action-primary/5 border-none">
                    <Accounting className="text-[13px] text-action-primary font-bold pr-2">{tBal}</Accounting>
                </td>
                <td className="py-2.5 px-3 w-[80px] text-right border-none">
                    <div className="flex flex-col items-end gap-1 px-1">
                        <Accounting className="text-[13px] text-text-tertiary pr-1">{tRecd}</Accounting>
                        <div className="w-full max-w-[40px] bg-text-tertiary/10 h-1 rounded-full overflow-hidden">
                            <div
                                className="bg-status-success h-full transition-all duration-1000"
                                style={{ width: `${Math.min(100, (tRecd / (tOrd || 1)) * 100)}%` }}
                            />
                        </div>
                    </div>
                </td>
                <td className="py-2.5 px-3 w-[60px] border-none text-center">
                    <Flex gap={1} justify="center">
                        <Button
                            variant="glass"
                            size="compact"
                            onClick={() => toggleItem(item.po_item_no)}
                            className="h-7 w-7 p-0 rounded-full"
                        >
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </Button>
                        {editMode && (
                            <Button
                                variant="ghost"
                                size="compact"
                                onClick={() => removeItem(idx)}
                                className="h-7 w-7 p-0 text-status-error hover:bg-status-error/10 rounded-full"
                            >
                                <Trash2 size={14} />
                            </Button>
                        )}
                    </Flex>
                </td>
            </tr>

            {isExpanded && (
                <React.Fragment>
                    {item.deliveries && item.deliveries.map((_, lIdx) => (
                        <LotRow
                            key={`${item.po_item_no}-lot-${lIdx}`}
                            itemIdx={idx}
                            lotIdx={lIdx}
                            editMode={editMode}
                        />
                    ))}
                    {editMode && (
                        <tr className="bg-app-overlay/2 border-none">
                            <td className="py-2 px-3 border-none"></td>
                            <td className="py-2 px-3 border-none" colSpan={9}>
                                <Button
                                    variant="ghost"
                                    size="compact"
                                    className="text-[10px] text-action-primary font-bold uppercase tracking-widest gap-2"
                                    onClick={() => addDelivery(idx)}
                                >
                                    <Plus size={12} /> Add Delivery Lot
                                </Button>
                            </td>
                        </tr>
                    )}
                </React.Fragment>
            )}
        </React.Fragment>
    );
});
ItemRow.displayName = "ItemRow";

export const PODetailItems = ({
    editMode,
    expandedItems,
    toggleItem,
}: PODetailItemsProps) => {
    // Select specific dependencies to reduce re-renders
    const items = usePOStore((state) => state.data?.items || []);
    const addItem = usePOStore((state) => state.addItem);

    return (
        <Stack gap={3}>
            <Flex align="center" justify="between" className="mb-2">
                <Caption1 className="m-0 text-text-tertiary uppercase tracking-widest text-[10px] font-bold">
                    Procurement Structure
                </Caption1>
                {editMode && (
                    <Button onClick={addItem} variant="secondary" className="h-8 rounded-full px-4 text-xs">
                        <Plus className="w-4 h-4 mr-1" /> New Item
                    </Button>
                )}
            </Flex>

            <div className="tahoe-glass-card overflow-hidden shadow-2 border border-white/10 backdrop-blur-xl">
                <table className="w-full border-collapse table-fixed">
                    <thead>
                        <tr className="bg-surface-sunken border-none h-[48px] transition-colors">
                            <th className="py-2.5 px-3 text-center w-[50px] border-none bg-surface-sunken"><Caption1 className="uppercase tracking-[0.15em] text-[10px] opacity-70 font-bold">#</Caption1></th>
                            <th className="py-2.5 px-3 text-left w-[120px] border-none bg-surface-sunken"><Caption1 className="uppercase tracking-[0.15em] text-[10px] opacity-70 font-bold">Code</Caption1></th>
                            <th className="py-2.5 px-3 text-left w-[120px] border-none bg-surface-sunken"><Caption1 className="uppercase tracking-[0.15em] text-[10px] opacity-70 font-bold">Drawing</Caption1></th>
                            <th className="py-2.5 px-3 text-left border-none bg-surface-sunken"><Caption1 className="uppercase tracking-[0.15em] text-[10px] opacity-70 font-bold">Description</Caption1></th>
                            <th className="py-2.5 px-3 text-left w-[60px] border-none bg-surface-sunken"><Caption1 className="uppercase tracking-[0.15em] text-[10px] opacity-70 font-bold">Unit</Caption1></th>
                            <th className="py-2.5 px-3 text-right w-[90px] border-none bg-surface-sunken"><Caption1 className="uppercase tracking-[0.15em] text-[10px] opacity-70 block text-right pr-2 font-bold">Rate</Caption1></th>
                            <th className="py-2.5 px-3 text-right w-[80px] border-none bg-surface-sunken"><Caption1 className="uppercase tracking-[0.15em] text-[10px] opacity-70 block text-right pr-2 font-bold">Ord</Caption1></th>
                            <th className="py-2.5 px-3 text-right w-[80px] border-none bg-surface-sunken"><Caption1 className="uppercase tracking-[0.15em] text-[10px] opacity-70 block text-right pr-2 font-bold">Dlv</Caption1></th>
                            <th className="py-2.5 px-3 text-right w-[80px] bg-action-primary/10 border-none"><Caption1 className="text-action-primary uppercase tracking-[0.15em] text-[10px] opacity-100 block text-right pr-2 font-black">Bal</Caption1></th>
                            <th className="py-2.5 px-3 text-right w-[80px] border-none bg-surface-sunken"><Caption1 className="uppercase tracking-[0.15em] text-[10px] opacity-70 block text-right pr-2 font-bold">Recd</Caption1></th>
                            <th className="py-2.5 px-3 w-[60px] border-none bg-surface-sunken"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-none">
                        {items.length > 0 ? (
                            items.map((item, idx) => (
                                <ItemRow
                                    key={item.po_item_no}
                                    idx={idx}
                                    editMode={editMode}
                                    isExpanded={expandedItems.has(item.po_item_no)}
                                    toggleItem={toggleItem}
                                />
                            ))
                        ) : (
                            <tr>
                                <td colSpan={11} className="py-20 text-center border-none">
                                    {editMode && (
                                        <Button onClick={addItem} variant="glass" className="mx-auto rounded-full px-6">
                                            <Plus className="w-5 h-5 mr-2" /> Add first procurement item
                                        </Button>
                                    )}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </Stack>
    );
};

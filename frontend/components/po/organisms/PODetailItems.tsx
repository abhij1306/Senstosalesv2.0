"use client";

import React, { useMemo } from "react";
import { Button } from "@/components/design-system/atoms/Button";
import { Input } from "@/components/design-system/atoms/Input";
import { Accounting, SmallText, Body, Label, MonoCode, Card } from "@/components/design-system/atoms";
import { Flex, Stack } from "@/components/design-system/atoms/Layout";
import {
    Plus,
    Trash2,
    ChevronDown,
    ChevronUp,
    Layers,
    AlertCircle
} from "lucide-react";
import { formatDate, cn } from "@/lib/utils";
import { usePOStore } from "@/store/poStore";

interface PODetailItemsProps {
    editMode: boolean;
    expandedItems: Set<number>;
    toggleItem: (itemNo: number) => void;
}

const QuantityInput = React.memo(({
    value,
    onUpdate,
    min,
    max,
    className
}: {
    value: number;
    onUpdate: (val: number) => void;
    min?: number;
    max?: number;
    className?: string;
}) => {
    const [localValue, setLocalValue] = React.useState(value.toString());

    React.useEffect(() => {
        setLocalValue(value.toString());
    }, [value]);

    const handleCommit = () => {
        const newVal = parseFloat(localValue) || 0;
        // Balance Guard: Clamp value if needed, or let user know.
        // For PO Detail, we allow manual override but within reason?
        // User said: "Delivered quantity cannot exceed ordered quantity" (Validation already exists in backend).
        // Let's implement some basic checks.
        if (min !== undefined && newVal < min) {
            setLocalValue(min.toString());
            onUpdate(min);
            return;
        }
        if (max !== undefined && newVal > max) {
            setLocalValue(max.toString());
            onUpdate(max);
            return;
        }
        if (newVal !== value) {
            onUpdate(newVal);
        }
    };

    return (
        <Input
            type="number"
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onBlur={handleCommit}
            onKeyDown={(e) => {
                if (e.key === 'Enter') handleCommit();
            }}
            className={cn("h-7 px-2 font-mono text-xs text-right transition-all", className)}
        />
    );
});
QuantityInput.displayName = "QuantityInput";

const LotRow = React.memo(({
    itemIdx,
    lotIdx,
    editMode,
}: {
    itemIdx: number;
    lotIdx: number;
    editMode: boolean;
}) => {
    const delivery = usePOStore((state) => state.data?.items[itemIdx].deliveries[lotIdx]);
    const updateDelivery = usePOStore((state) => state.updateDelivery);
    const removeDelivery = usePOStore((state) => state.removeDelivery);

    if (!delivery) return null;

    const ord = delivery.ordered_quantity || 0;
    const dlv = delivery.delivered_quantity || 0;
    const recd = delivery.received_quantity || 0;
    const bal = Math.max(0, ord - dlv);

    return (
        <tr className="bg-app-surface transition-colors border-b border-app-border/5">
            <td className="py-2 px-0 relative w-[60px]">
                {/* Visual Indent Pipe */}
                <div className="absolute left-[30px] top-0 bottom-0 w-[2px] bg-app-accent/20" />
                <div className="flex items-center gap-2 pl-[38px]">
                    <span className="text-app-accent/30" style={{ fontSize: '10px' }}>L</span>
                </div>
            </td>
            <td className="py-2 px-4" />
            <td className="py-2 px-4">
                <MonoCode className="text-app-fg-muted">L-{delivery.lot_no}</MonoCode>
            </td>
            <td className="py-2 px-4">
                {editMode ? (
                    <Input
                        type="date"
                        value={delivery.dely_date ? delivery.dely_date.split('T')[0] : ''}
                        onChange={(e) => updateDelivery(itemIdx, lotIdx, 'dely_date', e.target.value)}
                        className="h-7 bg-app-surface/50 border-app-border/50 px-1"
                    />
                ) : (
                    <Body className="text-app-fg">
                        {delivery.dely_date ? formatDate(delivery.dely_date) : '-'}
                    </Body>
                )}
            </td>
            <td className="py-2 px-4" />
            <td className="py-2 px-4 text-right">
                {editMode ? (
                    <QuantityInput
                        value={ord}
                        onUpdate={(val) => updateDelivery(itemIdx, lotIdx, 'ordered_quantity', val)}
                        className="border-app-border border"
                    />
                ) : (
                    <Accounting className="text-[11px] text-app-fg-muted">{ord}</Accounting>
                )}
            </td>
            <td className="py-2 px-4 text-right bg-blue-50/5 dark:bg-blue-900/5">
                {editMode ? (
                    <QuantityInput
                        value={dlv}
                        max={ord}
                        onUpdate={(val) => updateDelivery(itemIdx, lotIdx, 'delivered_quantity', val)}
                        className="border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400"
                    />
                ) : (
                    <Accounting className="text-[12px] text-blue-600 dark:text-blue-400">{dlv}</Accounting>
                )}
            </td>
            <td className="py-2 px-4 text-right bg-blue-50/5 dark:bg-blue-900/5">
                <Accounting className="text-[12px] text-blue-600 dark:text-blue-400">{bal}</Accounting>
            </td>
            <td className="py-2 px-4 text-right">
                <Accounting className="text-[11px] text-app-fg-muted">{recd}</Accounting>
            </td>
            <td className="py-2 px-4 text-center">
                {editMode && (
                    <button onClick={() => removeDelivery(itemIdx, lotIdx)} className="text-app-status-error/40 hover:text-app-status-error transition-all">
                        <Trash2 size={14} />
                    </button>
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

    // Memoize aggregations for performance
    const { tOrd, tDlv, tRecd, tBal } = useMemo(() => {
        const deliveries = item.deliveries || [];
        const ord = deliveries.reduce((acc: number, d: any) => acc + (d.ordered_quantity || 0), 0);
        const dlv = deliveries.reduce((acc: number, d: any) => acc + (d.delivered_quantity || 0), 0);
        const recd = deliveries.reduce((acc: number, d: any) => acc + (d.received_quantity || 0), 0);
        return {
            tOrd: ord,
            tDlv: dlv,
            tRecd: recd,
            tBal: Math.max(0, ord - dlv)
        };
    }, [item.deliveries]);

    return (
        <React.Fragment>
            <tr className={cn(
                "transition-colors border-b border-app-border/10",
                isExpanded ? "bg-app-overlay/10" : "bg-app-overlay/5"
            )}>
                <td className="py-3 px-4 text-center">
                    <MonoCode className="text-[12px] text-app-accent leading-none">#{item.po_item_no}</MonoCode>
                </td>
                <td className="py-3 px-4">
                    {editMode ? (
                        <Input value={item.material_code} onChange={(e) => updateItem(idx, "material_code", e.target.value)} className="h-7 w-full text-[12px] bg-app-surface/50" />
                    ) : (
                        <Accounting className="text-[12px] text-app-fg-muted/70">{item.material_code}</Accounting>
                    )}
                </td>
                <td className="py-3 px-4">
                    {editMode ? (
                        <Input value={item.drg_no} onChange={(e) => updateItem(idx, "drg_no", e.target.value)} className="h-7 w-full text-[11px] bg-app-surface/50" />
                    ) : (
                        <SmallText className="text-[11px] text-app-accent/60">{item.drg_no || "-"}</SmallText>
                    )}
                </td>
                <td className="py-3 px-4">
                    {editMode ? (
                        <Input value={item.material_description} onChange={(e) => updateItem(idx, "material_description", e.target.value)} className="h-7 w-full text-[12px] bg-app-surface/50" />
                    ) : (
                        <Body className="text-[13px] text-app-fg-muted/80 truncate max-w-[200px]" title={item.material_description}>{item.material_description}</Body>
                    )}
                </td>
                <td className="py-3 px-4 text-center">
                    <SmallText className="uppercase text-app-fg-muted/40">{item.unit}</SmallText>
                </td>
                <td className="py-3 px-4 text-right">
                    <Accounting className="text-[13px] text-app-fg-muted/60">{tOrd}</Accounting>
                </td>
                <td className="py-3 px-4 text-right bg-blue-50/10 dark:bg-blue-900/10">
                    <Accounting className="text-[13px] text-blue-600/60 dark:text-blue-400/60">{tDlv}</Accounting>
                </td>
                <td className="py-3 px-4 text-right bg-blue-50/10 dark:bg-blue-900/10">
                    <Accounting className="text-[13px] text-blue-600/60 dark:text-blue-400/60">{tBal}</Accounting>
                </td>
                <td className="py-3 px-4 text-right">
                    <Accounting className="text-[13px] text-app-fg-muted/60">{tRecd}</Accounting>
                </td>
                <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                        <button onClick={() => toggleItem(item.po_item_no)} className={cn("p-1.5 rounded-md transition-all", isExpanded ? "bg-app-accent/10 text-app-accent" : "text-app-fg-muted/40 hover:text-app-fg")}>
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                        {editMode && (
                            <button onClick={() => removeItem(idx)} className="p-1.5 text-app-status-error/40 hover:text-app-status-error hover:bg-app-status-error/5 rounded-md transition-all">
                                <Trash2 size={16} />
                            </button>
                        )}
                    </div>
                </td>
            </tr>

            {isExpanded && (
                <React.Fragment>
                    {item.deliveries?.map((d, dIdx) => (
                        <LotRow key={`${item.id}-lot-${d.lot_no}`} itemIdx={idx} lotIdx={dIdx} editMode={editMode} />
                    ))}
                    {editMode && (
                        <tr className="bg-app-surface">
                            <td className="py-2 px-0 relative">
                                <div className="absolute left-[30px] top-0 bottom-0 w-[2px] bg-app-accent/10" />
                            </td>
                            <td colSpan={9} className="py-2 px-4">
                                <Button variant="ghost" size="sm" onClick={() => addDelivery(idx)} className="h-6 text-[10px] text-app-accent hover:bg-app-accent/5 uppercase tracking-wider">
                                    <Plus size={12} className="mr-1" /> Add Delivery Lot
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
    const items = usePOStore((state) => state.data?.items || []);
    const addItem = usePOStore((state) => state.addItem);

    return (
        <Stack gap={3}>
            <Flex align="center" justify="between" className="mb-1">
                <Label className="m-0 text-[11px] tracking-[0.1em] text-app-fg-muted uppercase">
                    Procurement Structure
                </Label>
                {editMode && (
                    <Button size="sm" onClick={addItem} variant="secondary" className="h-8 text-[11px] bg-app-accent/5 text-app-accent border-app-accent/20">
                        <Plus className="w-4 h-4 mr-1.5" /> New Item
                    </Button>
                )}
            </Flex>

            <div className="table-container shadow-premium-hover border-none">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-white/5 bg-app-overlay/10">
                            <th className="py-3 px-4 text-center w-[50px]"><Label className="m-0 text-[12px]">#</Label></th>
                            <th className="py-3 px-4 w-[120px]"><Label className="m-0 text-[12px]">Code</Label></th>
                            <th className="py-3 px-4 w-[120px]"><Label className="m-0 text-[12px]">Drawing</Label></th>
                            <th className="py-3 px-4"><Label className="m-0 text-[12px]">Description</Label></th>
                            <th className="py-3 px-4 text-center w-[70px]"><Label className="m-0 text-[12px]">Unit</Label></th>
                            <th className="py-3 px-4 text-right w-[90px]"><Label className="m-0 text-[12px]">Ordered</Label></th>
                            <th className="py-3 px-4 text-right w-[90px] bg-blue-50/10 dark:bg-blue-900/10"><Label className="m-0 text-[12px] text-blue-600 dark:text-blue-400">Delivered</Label></th>
                            <th className="py-3 px-4 text-right w-[90px] bg-blue-50/10 dark:bg-blue-900/10"><Label className="m-0 text-[12px] text-blue-600 dark:text-blue-400">Balance</Label></th>
                            <th className="py-3 px-4 text-right w-[90px]"><Label className="m-0 text-[12px]">Received</Label></th>
                            <th className="py-3 px-4 w-[60px]"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, idx) => (
                            <ItemRow
                                key={item.po_item_no}
                                idx={idx}
                                editMode={editMode}
                                isExpanded={expandedItems.has(item.po_item_no)}
                                toggleItem={toggleItem}
                            />
                        ))}
                    </tbody>
                </table>
            </div>

            {items.length === 0 && (
                <Card className="p-12 flex flex-col items-center justify-center bg-app-surface/30 border-dashed border-2 border-app-border/30 text-center">
                    <div className="p-3 bg-app-surface-hover rounded-full mb-3 text-app-fg-muted/20">
                        <AlertCircle size={32} />
                    </div>
                    <Body className="text-app-fg-muted">No items found in this Purchase Order.</Body>
                    {editMode && (
                        <Button variant="ghost" className="mt-4 text-app-accent" onClick={addItem}>
                            Add the first item
                        </Button>
                    )}
                </Card>
            )}
        </Stack>
    );
};

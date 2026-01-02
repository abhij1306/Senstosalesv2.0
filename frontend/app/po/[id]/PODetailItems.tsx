"use client";

import React, { useMemo } from "react";
import { Button } from "@/components/design-system/atoms/Button";
import { Input } from "@/components/design-system/atoms/Input";
import { Accounting, SmallText, Body, Label, MonoCode, Card, Caption1, Caption2 } from "@/components/design-system/atoms";
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
            className={cn("h-7 px-2 font-mono text-footnote text-right transition-all", className)}
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
        <tr className="bg-blue-500/5 border-none">
            <td className="py-2 px-0 relative w-[50px] border-none">
                {/* Visual Indent Pipe */}
                <div className="absolute left-[25px] top-0 bottom-0 w-[1.5px] bg-app-accent/20" />
            </td>
            <td className="py-2 px-3 w-[120px] border-none">
                <div className="flex items-center gap-2">
                    <MonoCode className="text-text-tertiary font-regular">L-{delivery.lot_no}</MonoCode>
                </div>
            </td>
            <td className="py-2 px-3 w-[120px] text-right border-none">
                {editMode ? (
                    <Input
                        type="date"
                        value={delivery.dely_date ? delivery.dely_date.split('T')[0] : ''}
                        onChange={(e) => updateDelivery(itemIdx, lotIdx, 'dely_date', e.target.value)}
                        className="h-7 px-1 border-none bg-blue-500/5 text-sm font-regular"
                    />
                ) : (
                    <Body className="text-text-primary text-[12px] opacity-60 font-regular">
                        {delivery.dely_date ? formatDate(delivery.dely_date) : '-'}
                    </Body>
                )}
            </td>
            <td className="py-2 px-3 border-none" />
            <td className="py-2 px-3 w-[70px] border-none" />
            <td className="py-2 px-3 w-[90px] text-right border-none" />
            <td className="py-2 px-3 w-[90px] text-right border-none">
                {editMode ? (
                    <QuantityInput
                        value={ord}
                        onUpdate={(val) => updateDelivery(itemIdx, lotIdx, 'ordered_quantity', val)}
                        className="border-none bg-blue-500/5 text-sm font-regular"
                    />
                ) : (
                    <Accounting className="text-[12px] text-text-tertiary font-regular w-full text-right pr-0">{ord}</Accounting>
                )}
            </td>
            <td className="py-2 px-3 w-[90px] text-right bg-blue-600/5 dark:bg-blue-400/5 border-none">
                {editMode ? (
                    <QuantityInput
                        value={dlv}
                        max={ord}
                        onUpdate={(val) => updateDelivery(itemIdx, lotIdx, 'delivered_quantity', val)}
                        className="text-system-blue border-none bg-blue-500/5 text-sm font-regular"
                    />
                ) : (
                    <Accounting className="text-[12px] text-system-blue font-regular w-full text-right pr-0">{dlv}</Accounting>
                )}
            </td>
            <td className="py-2 px-3 w-[90px] text-right bg-blue-600/5 dark:bg-blue-400/5 border-none">
                <Accounting className="text-[12px] text-system-blue font-regular w-full text-right pr-0">{bal}</Accounting>
            </td>
            <td className="py-2 px-3 w-[90px] text-right border-none">
                <Accounting className="text-[12px] text-text-tertiary font-regular w-full text-right pr-0">{recd}</Accounting>
            </td>
            <td className="py-2 px-3 w-[60px] text-center border-none">
                {editMode && (
                    <button onClick={() => removeDelivery(itemIdx, lotIdx)} className="text-app-status-error/40 hover:text-app-status-error hover:bg-app-status-error/10 transition-all p-1.5 rounded-full">
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
                "transition-colors border-none",
                isExpanded ? "bg-blue-500/10" : "bg-transparent hover:bg-blue-500/5"
            )}>
                <td className="py-2.5 px-3 text-center w-[50px] border-none">
                    <MonoCode className="text-[10px] text-app-accent border-none bg-transparent p-0 font-regular">#{item.po_item_no}</MonoCode>
                </td>
                <td className="py-2.5 px-3 w-[120px] border-none text-left">
                    {editMode ? (
                        <Input value={item.material_code} onChange={(e) => updateItem(idx, "material_code", e.target.value)} className="h-8 w-full text-base bg-blue-500/5 border-none font-regular" />
                    ) : (
                        <Accounting className="text-base text-text-primary font-regular">{item.material_code}</Accounting>
                    )}
                </td>
                <td className="py-2.5 px-3 w-[120px] border-none text-left">
                    {editMode ? (
                        <Input value={item.drg_no} onChange={(e) => updateItem(idx, "drg_no", e.target.value)} className="h-8 w-full text-base bg-blue-500/5 border-none font-regular" />
                    ) : (
                        <Caption1 className="text-text-tertiary text-[12px] font-regular">{item.drg_no || "-"}</Caption1>
                    )}
                </td>
                <td className="py-2.5 px-3 border-none text-left">
                    {editMode ? (
                        <Input value={item.material_description} onChange={(e) => updateItem(idx, "material_description", e.target.value)} className="h-8 w-full text-base bg-blue-500/5 border-none font-regular" />
                    ) : (
                        <Body className="text-base text-text-primary font-regular truncate max-w-full" title={item.material_description}>{item.material_description}</Body>
                    )}
                </td>
                <td className="py-2.5 px-3 w-[70px] border-none text-left">
                    <Caption1 className="text-text-tertiary text-[12px] uppercase font-regular">{item.unit}</Caption1>
                </td>
                <td className="py-2.5 px-3 w-[90px] text-right border-none">
                    {editMode ? (
                        <Input type="number" value={item.po_rate} onChange={(e) => updateItem(idx, "po_rate", parseFloat(e.target.value))} className="h-8 w-full text-base text-right bg-blue-500/5 border-none font-regular" />
                    ) : (
                        <Accounting className="text-base text-text-primary font-regular">{item.po_rate}</Accounting>
                    )}
                </td>
                <td className="py-2.5 px-3 w-[90px] text-right border-none">
                    <Accounting className="text-base text-text-tertiary font-regular">{tOrd}</Accounting>
                </td>
                <td className="py-2.5 px-3 w-[90px] text-right bg-blue-600/5 dark:bg-blue-400/5 border-none">
                    <Accounting className="text-base text-blue-600 dark:text-blue-400 font-regular">{tDlv}</Accounting>
                </td>
                <td className="py-2.5 px-3 w-[90px] text-right bg-blue-600/5 dark:bg-blue-400/5 border-none">
                    <Accounting className="text-base text-blue-600 dark:text-blue-400 font-regular">{tBal}</Accounting>
                </td>
                <td className="py-2.5 px-3 w-[90px] text-right border-none">
                    <Accounting className="text-base text-text-tertiary font-regular">{tRecd}</Accounting>
                </td>
                <td className="py-2.5 px-3 w-[60px] text-center border-none">
                    <div className="flex items-center justify-center gap-1">
                        <button onClick={() => toggleItem(item.po_item_no)} className={cn("p-1.5 rounded-md transition-all", isExpanded ? "bg-app-accent/10 text-app-accent" : "text-text-tertiary hover:text-text-primary")}>
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                        {editMode && (
                            <button onClick={() => removeItem(idx)} className="p-1.5 text-app-status-error/40 hover:text-app-status-error hover:bg-app-status-error/10 rounded-full transition-all">
                                <Trash2 size={14} />
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
                        <tr className="bg-app-overlay/5 border-none">
                            <td className="py-2 px-0 relative w-[50px] border-none">
                                <div className="absolute left-[25px] top-0 bottom-0 w-[2.5px] bg-app-accent/10" />
                            </td>
                            <td colSpan={10} className="py-2 px-3 border-none">
                                <Button variant="secondary" size="compact" onClick={() => addDelivery(idx)} className="h-6 text-[10px] text-app-accent bg-transparent hover:bg-blue-500/5 border-none shadow-none">
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
    const items = usePOStore((state) => state.data?.items || []);
    const addItem = usePOStore((state) => state.addItem);

    return (
        <Stack gap={3}>
            <Flex align="center" justify="between" className="mb-2">
                <Caption1 className="m-0 text-text-tertiary uppercase tracking-widest text-[10px]">
                    Procurement Structure
                </Caption1>
                {editMode && (
                    <Button onClick={addItem} variant="secondary" className="h-8 text-xs">
                        <Plus className="w-4 h-4" /> New Item
                    </Button>
                )}
            </Flex>

            <Card className="p-0 overflow-hidden border-none elevation-2">
                <table className="table-standard w-full border-collapse table-fixed">
                    <thead>
                        <tr className="header-glass border-none">
                            <th className="py-2.5 px-3 text-center w-[50px] border-none"><Caption1 className="uppercase tracking-widest text-[11px] opacity-80">#</Caption1></th>
                            <th className="py-2.5 px-3 text-left w-[120px] border-none"><Caption1 className="uppercase tracking-widest text-[11px] opacity-80">Code</Caption1></th>
                            <th className="py-2.5 px-3 text-left w-[120px] border-none"><Caption1 className="uppercase tracking-widest text-[11px] opacity-80">Drawing</Caption1></th>
                            <th className="py-2.5 px-3 text-left border-none"><Caption1 className="uppercase tracking-widest text-[11px] opacity-80">Description</Caption1></th>
                            <th className="py-2.5 px-3 text-left w-[70px] border-none"><Caption1 className="uppercase tracking-widest text-[11px] opacity-80">Unit</Caption1></th>
                            <th className="py-2.5 px-3 text-right w-[90px] border-none"><Caption1 className="uppercase tracking-widest text-[11px] opacity-80 block text-right">Rate</Caption1></th>
                            <th className="py-2.5 px-3 text-right w-[90px] border-none"><Caption1 className="uppercase tracking-widest text-[11px] opacity-80 block text-right">Ord</Caption1></th>
                            <th className="py-2.5 px-3 text-right w-[90px] bg-blue-600/5 dark:bg-blue-400/5 border-none"><Caption1 className="text-blue-600 dark:text-blue-400 uppercase tracking-widest text-[11px] opacity-80 block text-right">Dlv</Caption1></th>
                            <th className="py-2.5 px-3 text-right w-[90px] bg-blue-600/5 dark:bg-blue-400/5 border-none"><Caption1 className="text-blue-600 dark:text-blue-400 uppercase tracking-widest text-[11px] opacity-80 block text-right">Bal</Caption1></th>
                            <th className="py-2.5 px-3 text-right w-[90px] border-none"><Caption1 className="uppercase tracking-widest text-[11px] opacity-80 block text-right">Recd</Caption1></th>
                            <th className="py-2.5 px-3 w-[60px] border-none"></th>
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
            </Card>

            {items.length === 0 && (
                <Card className="p-12 flex flex-col items-center justify-center bg-app-surface/30 border-none text-center elevation-1">
                    <div className="p-3 bg-blue-500/5 rounded-full mb-3 text-app-fg-muted/20">
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

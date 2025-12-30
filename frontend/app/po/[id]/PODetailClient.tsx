"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Edit2,
    Save,
    X,
    FileText,
    FileDown,
} from "lucide-react";
import { api, API_BASE_URL } from "@/lib/api";
import { formatDate, cn } from "@/lib/utils";
import { PODetail, POItem, PODelivery, SRVListItem } from "@/types";
import {
    DocumentTemplate,
    Button,
    Flex,
    Box,
} from "@/components/design-system";
import { PODetailCard } from "@/components/design-system/organisms";

interface PODetailClientProps {
    initialPO: PODetail;
    initialSrvs: SRVListItem[];
    initialDC: { has_dc: boolean; dc_id?: string } | null;
}

export default function PODetailClient({
    initialPO,
    initialSrvs,
    initialDC,
}: PODetailClientProps) {
    const router = useRouter();
    // Initialize state with Server Data (Zero Waterfall)
    const [data, setData] = useState<PODetail>(initialPO);
    const [srvs] = useState<SRVListItem[]>(initialSrvs);
    const [hasDC] = useState(initialDC?.has_dc || false);
    const [dcId] = useState(initialDC?.dc_id || null);

    const [loading, setLoading] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [expandedItems, setExpandedItems] = useState<Set<number>>(
        new Set(initialPO.items?.map((item: POItem) => item.po_item_no) || [])
    );
    const [activeTab, setActiveTab] = useState("basic");

    const handleSave = async () => {
        if (!data || !data.header) return;
        setLoading(true);
        try {
            await api.updatePO(data.header.po_number, data.header, data.items);
            setEditMode(false);
        } catch {
            // console.error(err.message || "Failed to sync changes");
        } finally {
            setLoading(false);
        }
    };

    const addItem = () => {
        if (!data || !data.items) return;
        const maxItemNo = Math.max(
            ...data.items.map((i: POItem) => i.po_item_no || 0),
            0,
        );
        const newItem: POItem = {
            po_item_no: maxItemNo + 1,
            material_code: "",
            material_description: "NEW PROCUREMENT ITEM",
            drg_no: "",
            unit: "NOS",
            ordered_quantity: 0,
            po_rate: 0,
            item_value: 0,
            delivered_quantity: 0,
            deliveries: [],
        };
        setData({ ...data, items: [...data.items, newItem] });
        setExpandedItems(new Set([...Array.from(expandedItems), maxItemNo + 1]));
    };

    const toggleItem = (itemNo: number) => {
        const s = new Set(expandedItems);
        if (s.has(itemNo)) {
            s.delete(itemNo);
        } else {
            s.add(itemNo);
        }
        setExpandedItems(s);
    };

    const updateHeader = (field: string, value: any) => {
        if (!data) return;
        setData({ ...data, header: { ...data.header, [field]: value } });
    };

    const updateItem = (index: number, field: string, value: any) => {
        if (!data || !data.items) return;
        const newItems = [...data.items];
        newItems[index] = { ...newItems[index], [field]: value };
        if (field === "po_rate" || field === "ordered_quantity") {
            newItems[index].item_value =
                (newItems[index].ordered_quantity || 0) * (newItems[index].po_rate || 0);
        }
        setData({ ...data, items: newItems });
    };

    const addDelivery = (itemIdx: number) => {
        if (!data || !data.items) return;
        const newItems = [...data.items];
        const item = newItems[itemIdx];
        const maxLotNo = Math.max(
            ...(item.deliveries?.map((d: PODelivery) => d.lot_no || 0) || []),
            0,
        );
        const newLot: PODelivery = {
            lot_no: maxLotNo + 1,
            delivered_quantity: 0,
            dely_date: new Date().toISOString().split("T")[0],
        };
        newItems[itemIdx].deliveries = [...(item.deliveries || []), newLot];
        setData({ ...data, items: newItems });
    };

    const removeDelivery = (itemIdx: number, deliveryIdx: number) => {
        if (!data || !data.items) return;
        const newItems = [...data.items];
        newItems[itemIdx].deliveries = newItems[itemIdx].deliveries.filter(
            (_, i) => i !== deliveryIdx,
        );
        setData({ ...data, items: newItems });
    };

    const removeItem = (index: number) => {
        if (!data || !data.items) return;
        const newItems = data.items.filter((_, i) => i !== index);
        setData({ ...data, items: newItems });
    };

    const { header, items } = data;

    const renderActions = () => {
        if (editMode) {
            return (
                <Flex align="center" gap={3}>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditMode(false)}
                        className="text-app-fg-muted hover:bg-app-surface-hover text-xs"
                    >
                        <X className="w-4 h-4 mr-2" /> DISCARD
                    </Button>
                    <Button
                        variant="default"
                        size="sm"
                        onClick={handleSave}
                        className="bg-app-accent hover:brightness-110 text-white shadow-sm text-xs"
                        disabled={loading}
                    >
                        {loading ? "SAVING..." : (
                            <><Save className="w-4 h-4 mr-2" /> SAVE CHANGES</>
                        )}
                    </Button>
                </Flex>
            );
        }
        return (
            <Flex align="center" gap={3}>
                <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="text-app-fg-muted hover:bg-app-surface-hover text-xs"
                >
                    <a
                        href={`${API_BASE_URL}/api/po/${header.po_number}/download`}
                        target="_blank"
                        rel="noreferrer"
                    >
                        <FileDown className="w-4 h-4 mr-2 text-app-accent" />
                        EXCEL
                    </a>
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                        hasDC && dcId
                            ? router.push(`/dc/${dcId}`)
                            : router.push(`/dc/create?po=${header.po_number}`)
                    }
                    className={cn(
                        "text-app-fg-muted hover:bg-app-surface-hover text-xs",
                        hasDC && "text-app-accent",
                    )}
                >
                    <FileText className="w-4 h-4 mr-2" />
                    {hasDC ? "VIEW DC" : "GENERATE DC"}
                </Button>
                <Box className="w-[1px] h-6 bg-app-border/10 mx-1" />
                <Button
                    variant="default"
                    size="sm"
                    onClick={() => setEditMode(true)}
                    className="bg-app-accent text-white hover:brightness-110 shadow-lg text-xs"
                >
                    <Edit2 className="w-4 h-4 mr-2 text-white" /> MODIFY RECORD
                </Button>
            </Flex>
        );
    };

    return (
        <DocumentTemplate
            title={`PO #${header.po_number}`}
            description={`${header.supplier_name} • ${formatDate(header.po_date)}`}
            actions={renderActions()}
            onBack={() => router.back()}
            layoutId={`po-title-${header.po_number}`}
            icon={<FileText size={20} className="text-app-accent" />}
            iconLayoutId={`po-icon-${header.po_number}`}
        >
            <PODetailCard
                header={header}
                items={items}
                srvs={srvs}
                editMode={editMode}
                expandedItems={expandedItems}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                toggleItem={toggleItem}
                addItem={addItem}
                removeItem={removeItem}
                updateItem={updateItem}
                updateHeader={updateHeader}
                addDelivery={addDelivery}
                removeDelivery={removeDelivery}
                onUpdateItems={(newItems) => setData({ ...data, items: newItems as POItem[] })}
                onSRVClick={(srvNo) => router.push(`/srv/${srvNo}`)}
            />
        </DocumentTemplate>
    );
}

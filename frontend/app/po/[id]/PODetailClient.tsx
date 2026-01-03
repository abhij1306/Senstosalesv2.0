"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Edit2,
    Save,
    X,
    FileText,
    FileDown,
    ShoppingCart,
} from "lucide-react";
import { api } from "@/lib/api";
import { formatDate, cn } from "@/lib/utils";
import { PODetail, POItem, PODelivery, SRVListItem } from "@/types";
import {
    DocumentTemplate,
    Button,
    Flex,
    Box,
} from "@/components/design-system";
import { PODetailCard } from "./PODetailCard";
import { usePOStore } from "@/store/poStore";

interface PODetailClientProps {
    initialPO: PODetail | null;
    initialSrvs: SRVListItem[];
    initialDC: { has_dc: boolean; dc_id?: string } | null;
}

export default function PODetailClient({
    initialPO,
    initialSrvs,
    initialDC,
}: PODetailClientProps) {
    const router = useRouter();

    // Zustand Store Integration
    const data = usePOStore((state) => state.data);
    const setPO = usePOStore((state) => state.setPO);
    const updateHeader = usePOStore((state) => state.updateHeader);
    const updateItem = usePOStore((state) => state.updateItem);
    const addItem = usePOStore((state) => state.addItem);
    const removeItem = usePOStore((state) => state.removeItem);
    const addDelivery = usePOStore((state) => state.addDelivery);
    const removeDelivery = usePOStore((state) => state.removeDelivery);

    // Initialize store with server data
    useEffect(() => {
        if (initialPO) {
            setPO(initialPO);
        }
    }, [initialPO, setPO]);

    const [srvs] = useState<SRVListItem[]>(initialSrvs);
    const [hasDC] = useState(initialDC?.has_dc || false);
    const [dcId] = useState(initialDC?.dc_id || null);

    const [loading, setLoading] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [expandedItems, setExpandedItems] = useState<Set<number>>(
        new Set(initialPO?.items?.map((item: POItem) => item.po_item_no) || [])
    );
    const [activeTab, setActiveTab] = useState("basic");

    // Handle Not Found State
    if (!initialPO || !initialPO.header) {
        return (
            <DocumentTemplate
                title="Purchase Order Not Found"
                description="The requested purchase order could not be found or has been deleted."
                onBack={() => router.back()}
                layoutId="po-not-found"
                icon={<ShoppingCart size={22} className="text-system-blue" />}
                iconLayoutId="po-icon-not-found"
            >
                <div className="flex flex-col items-center justify-center p-12 text-center h-[50vh]">
                    <div className="w-16 h-16 rounded-full bg-blue-500/5 flex items-center justify-center mb-4">
                        <ShoppingCart size={32} className="text-text-tertiary" />
                    </div>
                    <h3 className="text-lg font-medium text-app-fg-primary mb-2">
                        PO Not Found
                    </h3>
                    <p className="text-sm text-app-fg-muted max-w-md mb-6">
                        We couldn't find the Purchase Order you're looking for. It may have been deleted or the ID is incorrect.
                    </p>
                    <Button onClick={() => router.push("/po/list")}>
                        Return to List
                    </Button>
                </div>
            </DocumentTemplate>
        );
    }

    const handleSave = useCallback(async () => {
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
    }, [data]);

    const toggleItem = useCallback((itemNo: number) => {
        const s = new Set(expandedItems);
        if (s.has(itemNo)) {
            s.delete(itemNo);
        } else {
            s.add(itemNo);
        }
        setExpandedItems(s);
    }, [expandedItems]);

    // Safe destructuring after Not Found check
    if (!data || !data.header) return null;

    const { header, items } = data;

    const renderActions = () => {
        if (editMode) {
            return (
                <Flex align="center" gap={3}>
                    <Button
                        variant="secondary"
                        onClick={() => setEditMode(false)}
                    >
                        Discard
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleSave}
                        disabled={loading}
                    >
                        {loading ? <Save className="animate-spin" size={16} /> : <Save size={16} />}
                        Save Changes
                    </Button>
                </Flex>
            );
        }
        return (
            <Flex align="center" gap={2}>
                <Button
                    variant="success"
                    onClick={() => window.open(`/api/po/${header.po_number}/download`, '_blank')}
                    className="whitespace-nowrap shadow-1"
                >
                    <FileDown size={16} /> Excel
                </Button>

                <div className="w-[1px] h-6 bg-border-subtle mx-1" />

                <Button
                    variant="secondary"
                    onClick={() => setEditMode(true)}
                    className="whitespace-nowrap text-text-primary hover:bg-surface-variant"
                >
                    <Edit2 size={16} /> Modify
                </Button>

                <Button
                    variant="primary"
                    onClick={() =>
                        hasDC && dcId
                            ? router.push(`/dc/${dcId}`)
                            : router.push(`/dc/create?po=${header.po_number}`)
                    }
                    className="whitespace-nowrap shadow-2"
                >
                    <FileText size={16} />
                    {hasDC ? "View DC" : "Generate DC"}
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
            icon={<ShoppingCart size={22} className="text-system-blue" />}
            iconLayoutId={`po-icon-${header.po_number}`}
        >
            <PODetailCard
                srvs={srvs}
                editMode={editMode}
                expandedItems={expandedItems}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                toggleItem={toggleItem}
                onSRVClick={(srvNo: string) => router.push(`/srv/${srvNo}`)}
            />
        </DocumentTemplate>
    );
}


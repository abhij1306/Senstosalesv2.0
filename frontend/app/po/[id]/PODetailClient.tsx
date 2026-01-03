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
import { Button } from "@/components/design-system/atoms/Button";
import { Flex, Box } from "@/components/design-system/atoms/Layout";
import { DocumentTemplate } from "@/components/design-system/templates/DocumentTemplate";
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

    // Granular Store Selection to prevent total re-renders
    const poNumber = usePOStore((state) => state.data?.header?.po_number);
    const supplierName = usePOStore((state) => state.data?.header?.supplier_name);
    const poDate = usePOStore((state) => state.data?.header?.po_date);

    const setPO = usePOStore((state) => state.setPO);

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

    const handleSave = useCallback(async () => {
        const currentData = usePOStore.getState().data;
        if (!currentData || !currentData.header) return;

        setLoading(true);
        try {
            await api.updatePO(currentData.header.po_number, currentData.header, currentData.items);
            setEditMode(false);
        } catch {
            // Error handling
        } finally {
            setLoading(false);
        }
    }, []);

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


    const toggleItem = useCallback((itemNo: number) => {
        const s = new Set(expandedItems);
        if (s.has(itemNo)) {
            s.delete(itemNo);
        } else {
            s.add(itemNo);
        }
        setExpandedItems(s);
    }, [expandedItems]);

    if (!poNumber) return null;

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
                    onClick={() => window.open(`/api/po/${poNumber}/download`, '_blank')}
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
                            : router.push(`/dc/create?po=${poNumber}`)
                    }
                    className="whitespace-nowrap shadow-2"
                    disabled={!hasDC && (usePOStore.getState().data?.items || []).every(i => (i.ordered_quantity || 0) - (i.delivered_quantity || 0) <= 0)}
                >
                    <FileText size={16} />
                    {hasDC ? "View DC" : "Generate DC"}
                </Button>
            </Flex>
        );
    };

    return (
        <DocumentTemplate
            title={`PO #${poNumber}`}
            description={`${supplierName} • ${formatDate(poDate || "")}`}
            actions={renderActions()}
            onBack={() => router.back()}
            layoutId={`po-title-${poNumber}`}
            icon={<ShoppingCart size={22} className="text-system-blue" />}
            iconLayoutId={`po-icon-${poNumber}`}
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


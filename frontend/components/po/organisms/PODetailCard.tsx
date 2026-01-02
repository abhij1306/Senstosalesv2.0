"use client";

import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import { Stack } from "@/components/design-system/atoms/Layout";
import { DocumentJourney } from "@/components/design-system/molecules/DocumentJourney";
import { PODetailInfo } from "./PODetailInfo";

import { usePOStore } from "@/store/poStore";

// Lazy load heavy table data for zero-waterfall effect
const PODetailItems = dynamic(() => import("./PODetailItems").then(mod => mod.PODetailItems), {
    ssr: false,
    loading: () => <div className="h-[400px] w-full bg-app-surface/50 animate-pulse rounded-xl border border-app-border/10" />
});

interface PODetailCardProps {
    srvs: any[];
    editMode: boolean;
    expandedItems: Set<number>;
    activeTab: string;
    setActiveTab: (tab: string) => void;
    toggleItem: (itemNo: number) => void;
    onSRVClick: (srvNumber: string) => void;
}

export const PODetailCard = (props: PODetailCardProps) => {
    const header = usePOStore((state) => state.data?.header);

    // Actions are used inside children, but we pass editMode/expandedItems as before
    // to maintain control flow from the client parent if desired,
    // OR we could move those to store too. For now let's stick to the plan.

    return (
        <Stack gap={6}>
            <DocumentJourney currentStage="PO" className="mb-2" />

            <PODetailInfo
                srvs={props.srvs}
                editMode={props.editMode}
                activeTab={props.activeTab}
                setActiveTab={props.setActiveTab}
                onSRVClick={props.onSRVClick}
            />

            <Suspense fallback={<div className="h-[400px] w-full bg-app-surface/50 animate-pulse rounded-xl border border-app-border/10" />}>
                <PODetailItems
                    editMode={props.editMode}
                    expandedItems={props.expandedItems}
                    toggleItem={props.toggleItem}
                />
            </Suspense>
        </Stack>
    );
};

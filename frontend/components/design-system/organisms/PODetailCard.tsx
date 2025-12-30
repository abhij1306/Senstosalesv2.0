"use client";

import React from "react";
import { Stack } from "../atoms/Layout";
import { DocumentJourney } from "../molecules/DocumentJourney";
import { PODetailInfo } from "./PODetailInfo";
import { PODetailItems } from "./PODetailItems";

interface PODetailCardProps {
    header: any;
    items: any[];
    srvs: any[];
    editMode: boolean;
    expandedItems: Set<number>;
    activeTab: string;
    setActiveTab: (tab: string) => void;
    toggleItem: (itemNo: number) => void;
    addItem: () => void;
    removeItem: (index: number) => void;
    updateItem: (index: number, field: string, value: any) => void;
    updateHeader: (field: string, value: any) => void;
    addDelivery: (itemIdx: number) => void;
    removeDelivery: (itemIdx: number, deliveryIdx: number) => void;
    onUpdateItems: (newItems: any[]) => void;
    onSRVClick: (srvNumber: string) => void;
}

export const PODetailCard = (props: PODetailCardProps) => {
    return (
        <Stack gap={6}>
            <DocumentJourney currentStage="PO" className="mb-2" />

            <PODetailInfo
                header={props.header}
                srvs={props.srvs}
                editMode={props.editMode}
                updateHeader={props.updateHeader}
                onSRVClick={props.onSRVClick}
                activeTab={props.activeTab}
                setActiveTab={props.setActiveTab}
            />

            <PODetailItems
                items={props.items}
                editMode={props.editMode}
                expandedItems={props.expandedItems}
                toggleItem={props.toggleItem}
                addItem={props.addItem}
                removeItem={props.removeItem}
                updateItem={props.updateItem}
                addDelivery={props.addDelivery}
                removeDelivery={props.removeDelivery}
                onUpdateItems={props.onUpdateItems}
            />
        </Stack>
    );
};

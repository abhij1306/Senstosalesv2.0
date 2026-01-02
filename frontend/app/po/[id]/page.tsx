
import React, { Suspense } from "react";
import { api } from "@/lib/api";
import { DetailSkeleton } from "@/components/design-system/molecules/skeletons/DetailSkeleton";
import PODetailClient from "./PODetailClient";

// Function to fetch data on the server
async function getPOData(id: string) {
    const poId = id;
    if (!poId) throw new Error("Invalid PO ID");

    // Parallel Data Fetching with Graceful Error Handling
    try {
        const [poData, dcCheck, srvData] = await Promise.all([
            api.getPODetail(poId),
            api.checkPOHasDC(poId).catch(() => null),
            api.listSRVs(poId).catch(() => []),
        ]);
        return { poData, dcCheck, srvData };
    } catch (error) {
        console.error("Failed to fetch PO data:", error);
        // Return null data so client component can render "Not Found" state
        return { poData: null, dcCheck: null, srvData: [] };
    }
}

// POContent component fetches its own data to enable Suspense
async function POContent({ id }: { id: string }) {
    const { poData, dcCheck, srvData } = await getPOData(id);
    return (
        <PODetailClient
            initialPO={poData}
            initialDC={dcCheck}
            initialSrvs={srvData}
        />
    );
}

export default async function PODetailPage({ params }: { params: { id: string } }) {
    const { id } = await params;

    return (
        <Suspense fallback={<DetailSkeleton />}>
            <POContent id={id} />
        </Suspense>
    );
}

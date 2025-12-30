
import React, { Suspense } from "react";
import { api } from "@/lib/api";
import { DetailSkeleton } from "@/components/design-system/molecules/skeletons/DetailSkeleton";
import PODetailClient from "./PODetailClient";

// Function to fetch data on the server
async function getPOData(id: string) {
    const poId = parseInt(id);
    if (isNaN(poId)) throw new Error("Invalid PO ID");

    // Parallel Data Fetching (Zero Waterfall)
    const [poData, dcCheck, srvData] = await Promise.all([
        api.getPODetail(poId),
        api.checkPOHasDC(poId).catch(() => null),
        api.listSRVs(poId).catch(() => []),
    ]);

    return { poData, dcCheck, srvData };
}

export default async function PODetailPage({ params }: { params: { id: string } }) {
    const { id } = await params;

    // Server Side Data Fetching
    // Note: In Next.js 15, params must be awaited, but this project structure suggests 14/13.
    // We treat it as direct object access based on existing code style.

    try {
        const { poData, dcCheck, srvData } = await getPOData(id);

        return (
            <Suspense fallback={<DetailSkeleton />}>
                <PODetailClient
                    initialPO={poData}
                    initialDC={dcCheck}
                    initialSrvs={srvData}
                />
            </Suspense>
        );
    } catch (error) {
        return (
            <div className="p-8 text-center text-sys-error">
                <h2 className="text-lg font-bold">Failed to load PO Record</h2>
                <p className="opacity-80">{(error as Error).message}</p>
            </div>
        );
    }
}

import React, { Suspense } from "react";
import { api } from "@/lib/api";
import { DetailSkeleton } from "@/components/design-system/molecules/skeletons/DetailSkeleton";
import SRVDetailClient from "./SRVDetailClient";
import { notFound } from "next/navigation";

// Function to fetch data on the server
async function getSRVData(id: string) {
    try {
        const data = await api.getSRV(id);
        if (!data || !data.header) return null;
        return data;
    } catch {
        // console.error("Error fetching SRV in RSC:", error);
        return null;
    }
}

export default async function SRVDetailPage({ params }: { params: { id: string } }) {
    const { id } = await params;
    const srvData = await getSRVData(id);

    if (!srvData) {
        return notFound();
    }

    return (
        <Suspense fallback={<DetailSkeleton />}>
            <SRVDetailClient initialSRV={srvData} />
        </Suspense>
    );
}

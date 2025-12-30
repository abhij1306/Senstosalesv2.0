
import React, { Suspense } from "react";
import { api } from "@/lib/api";
import { DetailSkeleton } from "@/components/design-system/molecules/skeletons/DetailSkeleton";
import DCDetailClient from "./DCDetailClient";
import { normalizeId } from "@/lib/routes";
import { notFound } from "next/navigation";

// Function to fetch data on the server
async function getDCData(id: string) {
    // Normalize and Decode ID
    const normalizedId = normalizeId(id);
    if (!normalizedId) return null;

    const dcNumber = decodeURIComponent(normalizedId);

    // Parallel Data Fetching (Zero Waterfall)
    // Note: getDCDetail and checkDCHasInvoice might usually take dcNumber
    const [dcData, invoiceCheck] = await Promise.all([
        api.getDCDetail(dcNumber).catch(() => null),
        api.checkDCHasInvoice(dcNumber).catch(() => null),
    ]);

    if (!dcData) return null;

    return { dcData, invoiceCheck };
}

export default async function DCDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const { dcData, invoiceCheck } = await getDCData(id) || {};

    if (!dcData) {
        return notFound();
    }


    return (
        <Suspense fallback={<DetailSkeleton />}>
            <DCDetailClient
                initialData={dcData}
                initialInvoiceData={invoiceCheck}
            />
        </Suspense>
    );
}

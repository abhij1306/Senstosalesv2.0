import React from "react";
import { api } from "@/lib/api";
import { normalizeId } from "@/lib/routes";
import { notFound } from "next/navigation";
import InvoiceDetailClient from "./InvoiceDetailClient";

export default async function InvoiceDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    // Normalize logic consistent with client-side
    const invoiceId = normalizeId(id);

    if (!invoiceId) {
        notFound();
    }

    try {
        const decodedId = decodeURIComponent(invoiceId);
        const data = await api.getInvoiceDetail(decodedId);

        if (!data || !data.header) {
            // If we get valid JSON but empty header, treat as 404
            // console.error(`[InvoicePage] No header found for ID: ${decodedId}`);
            notFound();
        }

        return <InvoiceDetailClient data={data} />;
    } catch (error: any) {
        // console.error(`[InvoicePage] Error fetching invoice ${invoiceId}:`, error);

        // Handle 404 from API
        if (error?.status === 404) {
            notFound();
        }

        // For other errors, we could throw to trigger error.tsx
        // or return a friendly error state here.
        throw error;
    }
}

import { Suspense } from "react";
import { api } from "@/lib/api";
import { PONoteListClient } from "@/components/po-notes/PONoteListClient";
import { PONotesSkeleton } from "@/components/design-system";

async function getTemplates() {
    try {
        const data = await api.getPONotes();
        return data || [];
    } catch {
        // console.error("Error fetching templates in RSC:", err);
        return [];
    }
}

export default async function PONotesPage() {
    const templates = await getTemplates();

    return (
        <Suspense fallback={<PONotesSkeleton />}>
            <PONoteListClient initialTemplates={templates} />
        </Suspense>
    );
}

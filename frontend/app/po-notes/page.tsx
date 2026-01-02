import { api } from "@/lib/api";
import { PONoteListClient } from "./PONoteListClient";

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
        <PONoteListClient initialTemplates={templates} />
    );
}

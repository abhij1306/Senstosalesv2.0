"use client";

import { useState, useCallback } from "react";
import { Quote } from "lucide-react";
import { api, PONote } from "@/lib/api";
import {
    DocumentTemplate,
    EmptyState,
    Grid,
    Stack,
} from "@/components/design-system";
import { PONoteCard } from "@/components/po-notes/organisms/PONoteCard";
import { PONoteDialog } from "@/components/po-notes/organisms/PONoteDialog";
import { PONoteDeleteDialog } from "@/components/po-notes/organisms/PONoteDeleteDialog";
import { PONotePageActions } from "@/components/po-notes/organisms/PONotePageActions";

interface PONoteListClientProps {
    initialTemplates: PONote[];
}

export function PONoteListClient({ initialTemplates }: PONoteListClientProps) {
    const [templates, setTemplates] = useState<PONote[]>(initialTemplates);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [formData, setFormData] = useState({ title: "", content: "" });

    const loadTemplates = useCallback(async () => {
        try {
            setLoading(true);
            const data = await api.getPONotes();
            setTemplates(data || []);
        } catch (err) {
            console.error("Failed to load templates:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            try {
                if (editingId) {
                    await api.updatePONote(editingId.toString(), formData);
                } else {
                    await api.createPONote(formData);
                }
                setFormData({ title: "", content: "" });
                setEditingId(null);
                setShowForm(false);
                loadTemplates();
            } catch (err) {
                console.error("Failed to save template:", err);
            }
        },
        [editingId, formData, loadTemplates]
    );

    const handleEdit = useCallback((template: PONote) => {
        setFormData({ title: template.title, content: template.content });
        setEditingId(template.id);
        setShowForm(true);
    }, []);

    const handleDeleteConfirm = useCallback(async () => {
        if (!deleteId) return;
        try {
            await api.deletePONote(deleteId.toString());
            loadTemplates();
            setDeleteId(null);
        } catch (err) {
            console.error("Failed to delete template:", err);
        }
    }, [deleteId, loadTemplates]);

    const handleCreate = () => {
        setFormData({ title: "", content: "" });
        setEditingId(null);
        setShowForm(true);
    };

    return (
        <DocumentTemplate
            title="Document Templates"
            description="Reusable terms and conditions for purchase orders & challans"
            actions={<PONotePageActions onCreate={handleCreate} disabled={loading} />}
            icon={<Quote size={20} className="text-[var(--color-sys-brand-primary)]" />}
        >
            <Stack gap={8} className="py-2">
                {templates.length > 0 ? (
                    <Grid cols="1" className="md:grid-cols-2 lg:grid-cols-3" gap={6}>
                        {templates.map((template) => (
                            <PONoteCard
                                key={template.id}
                                template={template}
                                onEdit={handleEdit}
                                onDelete={setDeleteId}
                            />
                        ))}
                    </Grid>
                ) : !loading && (
                    <EmptyState
                        icon={Quote}
                        title="No templates configured"
                        description="Standardize your document terms for faster processing."
                        action={<PONotePageActions onCreate={handleCreate} />}
                    />
                )}
            </Stack>

            <PONoteDialog
                isOpen={showForm}
                onClose={() => setShowForm(false)}
                title={editingId ? "Update Template" : "New Template"}
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleSubmit}
                isEditing={!!editingId}
            />

            <PONoteDeleteDialog
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDeleteConfirm}
            />
        </DocumentTemplate>
    );
}

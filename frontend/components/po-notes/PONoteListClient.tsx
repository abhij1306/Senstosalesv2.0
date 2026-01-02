"use client";

import React, { useState, useCallback } from "react";
import { Quote, Plus, FileText } from "lucide-react";
import { api, PONote } from "@/lib/api";
import {
    Stack,
    Grid,
    Flex,
    Button,
    Label,
    H3,
    Body,
    Box,
    Card,
} from "@/components/design-system";
import { DocumentTemplate } from "@/components/design-system/templates/DocumentTemplate";
import { PONoteCard } from "@/components/po-notes/organisms/PONoteCard";
import { PONoteDialog } from "@/components/po-notes/organisms/PONoteDialog";
import { PONoteDeleteDialog } from "@/components/po-notes/organisms/PONoteDeleteDialog";

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
            title="Policy & Terms"
            description="Configure reusable clauses, standard T&Cs, and document policies for POs & DCs."
            icon={<Quote className="w-5 h-5" />}
            actions={
                <Button
                    onClick={handleCreate}
                    disabled={loading}
                    size="compact"
                    className="h-9 px-6 active-glow"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Provision Clause
                </Button>
            }
        >
            <Box className="mt-2">
                {templates.length > 0 ? (
                    <Grid
                        cols={1}
                        className="sm:grid-cols-2 xl:grid-cols-3"
                        gap={4}
                    >
                        {templates.map((template) => (
                            <PONoteCard
                                key={template.id}
                                template={template}
                                onEdit={handleEdit}
                                onDelete={setDeleteId}
                            />
                        ))}
                    </Grid>
                ) : (
                    <Card className="p-16 flex flex-col items-center justify-center text-center bg-app-surface/30 border-dashed border-2 border-app-border/30">
                        <div className="w-16 h-16 rounded-full bg-app-overlay/5 flex items-center justify-center text-app-fg-muted mb-4">
                            <FileText className="w-8 h-8 opacity-20" />
                        </div>
                        <H3 className="text-lg mb-2">Null Policy Matrix</H3>
                        <Body className="text-app-fg-muted mb-6 max-w-sm">
                            No standardized clauses detected. Provision a new term to accelerate document lifecycle.
                        </Body>
                        <Button
                            variant="primary"
                            onClick={handleCreate}
                            className="active-glow"
                        >
                            Start Provisioning
                        </Button>
                    </Card>
                )}
            </Box>

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

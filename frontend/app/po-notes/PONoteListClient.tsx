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
    Title3,
    Body,
    Box,
    Card,
} from "@/components/design-system";
import { DocumentTemplate } from "@/components/design-system/templates/DocumentTemplate";
import { PONoteCard } from "./organisms/PONoteCard";
import { PONoteDialog } from "./organisms/PONoteDialog";
import { PONoteDeleteDialog } from "./organisms/PONoteDeleteDialog";

interface PONoteListClientProps {
    initialNotes: PONote[];
}

export function PONoteListClient({ initialNotes }: PONoteListClientProps) {
    const [templates, setTemplates] = useState<PONote[]>(initialNotes);
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

    const handleDeleteClick = useCallback((template: PONote) => {
        setDeleteId(template.id);
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
                    variant="glass"
                    onClick={handleCreate}
                    disabled={loading}
                    className="min-w-[160px] whitespace-nowrap shadow-sm"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Provision Clause
                </Button>
            }
        >
            <Box className="mt-2">
                {templates.length > 0 ? (
                    <Grid
                        className="grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
                        gap={4}
                    >
                        {templates.map((template) => (
                            <PONoteCard
                                key={template.id}
                                template={template}
                                onEdit={handleEdit}
                                onDelete={handleDeleteClick}
                            />
                        ))}
                    </Grid>
                ) : (
                    <div className="tahoe-glass-card p-20 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-500">
                        <div className="w-20 h-20 rounded-3xl bg-app-overlay/5 flex items-center justify-center text-action-primary shadow-inner mb-6 backdrop-blur-md border border-white/10">
                            <FileText className="w-10 h-10 opacity-40" />
                        </div>
                        <Title3 className="text-2xl font-bold tracking-tight text-text-primary mb-2">Null Policy Matrix</Title3>
                        <Body className="text-text-secondary mb-8 max-w-sm leading-relaxed opacity-70">
                            No standardized clauses detected. Provision a new term to accelerate your procurement document lifecycle.
                        </Body>
                        <Button
                            variant="primary"
                            onClick={handleCreate}
                            className="min-w-[180px] shadow-md"
                        >
                            <Plus className="w-5 h-5 mr-2" /> Start Provisioning
                        </Button>
                    </div>
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

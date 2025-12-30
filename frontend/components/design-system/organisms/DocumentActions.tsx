"use client";

import React from "react";
import { Button } from "@/components/design-system/atoms/Button";
import { Save, X, Edit2, Trash2, Plus, FileDown } from "lucide-react";

export interface DocumentActionsProps {
    mode: "view" | "edit";
    onEdit?: () => void;
    onSave?: () => void;
    onCancel?: () => void;
    onDelete?: () => void;
    onDownload?: () => void;
    onCreate?: () => void;
    isSaving?: boolean;
    isDeleting?: boolean;
    canDelete?: boolean;
    customActions?: React.ReactNode;
}

export function DocumentActions({
    mode,
    onEdit,
    onSave,
    onCancel,
    onDelete,
    onDownload,
    onCreate,
    isSaving = false,
    isDeleting = false,
    canDelete = true,
    customActions,
}: DocumentActionsProps) {
    if (mode === "edit") {
        return (
            <div className="flex gap-3">
                {onCancel && (
                    <Button variant="ghost" size="sm" onClick={onCancel} disabled={isSaving}>
                        <X size={16} /> Cancel
                    </Button>
                )}
                {onSave && (
                    <Button variant="default" size="sm" onClick={onSave} disabled={isSaving}>
                        <Save size={16} /> {isSaving ? "Saving..." : "Save"}
                    </Button>
                )}
                {customActions}
            </div>
        );
    }

    return (
        <div className="flex gap-3">
            {onDownload && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onDownload}
                    className="text-emerald-700 border-emerald-200 bg-emerald-50 hover:bg-emerald-100"
                >
                    <FileDown size={16} /> Excel
                </Button>
            )}
            {onCreate && (
                <Button variant="secondary" size="sm" onClick={onCreate}>
                    <Plus size={16} /> Create
                </Button>
            )}
            {onEdit && (
                <Button variant="default" size="sm" onClick={onEdit}>
                    <Edit2 size={16} /> Edit
                </Button>
            )}
            {onDelete && canDelete && (
                <Button variant="destructive" size="sm" onClick={onDelete} disabled={isDeleting}>
                    <Trash2 size={16} /> {isDeleting ? "Deleting..." : "Delete"}
                </Button>
            )}
            {customActions}
        </div>
    );
}
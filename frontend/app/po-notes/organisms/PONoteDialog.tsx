"use client";

import React from "react";
import {
    Label,
    Button,
    Input,
    Stack,
    Flex,
    SmallText,
    H3
} from "@/components/design-system";
import { Dialog } from "@/components/design-system/molecules/Dialog";
import { cn } from "@/lib/utils";
import { FileEdit, Info } from "lucide-react";

interface PONoteDialogProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    formData: { title: string; content: string };
    setFormData: (data: { title: string; content: string }) => void;
    onSubmit: (e: React.FormEvent) => void;
    isEditing: boolean;
}

export const PONoteDialog = ({
    isOpen,
    onClose,
    title,
    formData,
    setFormData,
    onSubmit,
    isEditing,
}: PONoteDialogProps) => {
    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            maxWidth="max-w-xl"
            footer={
                <Flex gap={3} className="w-full">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="flex-1 font-black text-[10px] uppercase tracking-widest h-10 rounded-xl"
                    >
                        Abort
                    </Button>
                    <Button
                        type="button"
                        variant="primary"
                        onClick={onSubmit}
                        className="flex-[2] font-black text-[10px] uppercase tracking-widest h-10 rounded-xl active-glow"
                    >
                        {isEditing ? "Commit Provision" : "Instantiate Clause"}
                    </Button>
                </Flex>
            }
        >
            <Stack gap={5} className="py-2">
                <Flex align="center" gap={3} className="p-3 bg-app-accent/5 rounded-2xl border-none">
                    <div className="w-8 h-8 rounded-xl bg-app-accent/10 flex items-center justify-center text-app-accent">
                        <Info className="w-4 h-4" />
                    </div>
                    <p className="text-[11px] font-medium text-app-fg opacity-80 leading-snug">
                        Standardized clauses ensure legal consistency across all purchase orders and dispatch documents.
                    </p>
                </Flex>

                <Stack gap={2}>
                    <Label className="text-[10px] font-black uppercase tracking-widest text-app-accent">Identifier</Label>
                    <Input
                        value={formData.title}
                        onChange={(e) =>
                            setFormData({ ...formData, title: e.target.value })
                        }
                        placeholder="e.g., Warranty Protocol v2.0"
                        className="h-10 bg-app-overlay/10 border-app-border/30 rounded-xl font-bold text-sm text-app-fg focus:ring-app-accent/20"
                        required
                        autoFocus
                    />
                </Stack>

                <Stack gap={2}>
                    <Label className="text-[10px] font-black uppercase tracking-widest text-app-accent">Provision Schema</Label>
                    <div className="relative group">
                        <div className="absolute top-3 left-3 pointer-events-none opacity-20 group-focus-within:opacity-50 transition-opacity">
                            <FileEdit className="w-4 h-4 text-app-fg" />
                        </div>
                        <textarea
                            value={formData.content}
                            onChange={(e) =>
                                setFormData({ ...formData, content: e.target.value })
                            }
                            rows={8}
                            className="w-full pl-10 pr-4 py-3 text-sm text-app-fg bg-app-overlay/10 border-none rounded-2xl focus:outline-none focus:bg-app-overlay/20 resize-none transition-all font-medium placeholder:text-app-fg-muted/30"
                            placeholder="Enter the full legal text for this provision..."
                            required
                        />
                    </div>
                    <SmallText className="px-1 opacity-50 uppercase tracking-tighter">Markdown and standard text accepted.</SmallText>
                </Stack>
            </Stack>
        </Dialog>
    );
};

"use client";

import React from "react";
import { Button, Body, H3, Flex, Stack } from "@/components/design-system";
import { Dialog } from "@/components/design-system/molecules/Dialog";
import { AlertTriangle } from "lucide-react";

interface PONoteDeleteDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export const PONoteDeleteDialog = ({
    isOpen,
    onClose,
    onConfirm,
}: PONoteDeleteDialogProps) => {
    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            title="Termination Protocol"
            maxWidth="max-w-md"
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
                        variant="destructive"
                        onClick={onConfirm}
                        className="flex-1 font-black text-[10px] uppercase tracking-widest h-10 rounded-full shadow-md shadow-app-status-error/20"
                    >
                        Purge Clause
                    </Button>
                </Flex>
            }
        >
            <Stack gap={4} className="py-2">
                <Flex align="center" gap={4} className="p-4 bg-app-status-error/5 border-none rounded-2xl elevation-1">
                    <div className="w-12 h-12 rounded-full bg-app-status-error/10 flex items-center justify-center text-app-status-error shrink-0">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <Stack gap={1}>
                        <H3 className="text-sm text-app-status-error">Irreversible Action</H3>
                        <p className="text-[11px] font-medium text-app-fg opacity-80 leading-snug">
                            This clause will be permanently purged from the policy matrix. Existing documents will retain their snapshot, but new provisions will be restricted.
                        </p>
                    </Stack>
                </Flex>
                <Body className="text-app-fg-muted italic text-[13px] px-1">
                    Confirmed termination will immediately restrict this preset from the global provision engine. Are you sure you wish to proceed?
                </Body>
            </Stack>
        </Dialog>
    );
};

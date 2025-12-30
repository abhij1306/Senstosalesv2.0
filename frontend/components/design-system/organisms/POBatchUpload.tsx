import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload } from "lucide-react";
import { Button } from "@/components/design-system/atoms/Button";
import { Body, Label, Accounting } from "@/components/design-system/atoms/Typography";
import { Flex, Stack, Box } from "@/components/design-system/atoms/Layout";
import { cn } from "@/lib/utils";

export interface POBatchUploadProps {
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    selectedFiles: File[];
    uploading: boolean;
    uploadProgress: { current: number; total: number };
    onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onUpload: () => void;
    onCancel: () => void;
    onClear: () => void;
    onTriggerSelect: () => void;
}

export const POBatchUpload = ({
    fileInputRef,
    selectedFiles,
    uploading,
    uploadProgress,
    onFileSelect,
    onUpload,
    onCancel,
    onClear,
    onTriggerSelect,
}: POBatchUploadProps) => {
    return (
        <div className="relative">
            <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.html"
                onChange={onFileSelect}
                className="hidden"
            />
            <AnimatePresence>
                {uploading || selectedFiles.length > 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="min-w-[320px] bg-[var(--color-sys-bg-surface)] rounded-xl border-none shadow-premium p-4 absolute right-0 top-12 z-50"
                    >
                        <Flex justify="between" align="center" className="mb-3">
                            <Label className="text-[var(--color-sys-text-secondary)] text-[10px]">
                                BATCH UPLOAD
                            </Label>
                            {!uploading && (
                                <button
                                    onClick={onClear}
                                    className="text-[var(--color-sys-text-tertiary)] hover:text-[var(--color-sys-text-primary)]"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </Flex>
                        {uploading ? (
                            <Stack gap={3}>
                                <Flex justify="between" align="center">
                                    <Body className="text-[13px] text-[var(--color-sys-text-primary)]">
                                        Processing {uploadProgress.current} / {uploadProgress.total}
                                    </Body>
                                    <Accounting className="text-[13px] text-[var(--color-sys-brand-primary)]">
                                        {Math.round(
                                            (uploadProgress.current / uploadProgress.total) * 100
                                        )}
                                        %
                                    </Accounting>
                                </Flex>
                                <Box className="w-full bg-[var(--color-sys-bg-tertiary)] rounded-full h-2 overflow-hidden">
                                    <motion.div
                                        className="bg-[var(--color-sys-brand-primary)] h-full"
                                        initial={{ width: 0 }}
                                        animate={{
                                            width: `${(uploadProgress.current / uploadProgress.total) * 100
                                                }%`,
                                        }}
                                        transition={{ duration: 0.3 }}
                                    />
                                </Box>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={onCancel}
                                    className="w-full text-[var(--color-sys-status-error)] hover:bg-[var(--color-sys-status-error)]/10"
                                >
                                    <X size={14} className="mr-2" /> Cancel
                                </Button>
                            </Stack>
                        ) : (
                            <Stack gap={3}>
                                <Body className="text-[13px] text-[var(--color-sys-text-secondary)]">
                                    {selectedFiles.length} file
                                    {selectedFiles.length !== 1 ? "s" : ""} ready to upload
                                </Body>
                                <Button
                                    variant="default"
                                    size="sm"
                                    onClick={onUpload}
                                    className="w-full"
                                >
                                    <Upload size={14} className="mr-2" /> Start Upload
                                </Button>
                            </Stack>
                        )}
                    </motion.div>
                ) : (
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={onTriggerSelect}
                        className="shadow-sm"
                    >
                        <Upload size={16} className="mr-2" /> Upload POs
                    </Button>
                )}
            </AnimatePresence>
        </div>
    );
};

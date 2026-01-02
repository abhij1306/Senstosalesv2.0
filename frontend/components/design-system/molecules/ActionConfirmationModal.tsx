"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/design-system/atoms/Button";
import { Card, H3, SmallText, Body } from "@/components/design-system/atoms";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActionConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    subtitle?: string;
    warningText?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: "warning" | "error"; // For future styling flexibility
}

// Standalone Draggable Modal Component (like Upload UI but centered)
export const ActionConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = "Are you sure?",
    subtitle = "This action cannot be undone",
    warningText,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
}: ActionConfirmationModalProps) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    drag
                    dragMomentum={false}
                    // Centered initial position: 50% left, translated -50% to visually center
                    initial={{ opacity: 0, y: 50, x: "-50%", left: "50%", scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, x: "-50%", left: "50%", scale: 1 }}
                    exit={{ opacity: 0, y: 50, x: "-50%", left: "50%", scale: 0.95 }}
                    className="fixed top-[20%] z-[100] w-[420px]"
                >
                    <div
                        className={cn(
                            "rounded-[2.5rem] overflow-hidden transition-all duration-300",
                            "glass-panel shadow-macos-soft",
                            "border-2 border-gray-300/60 dark:border-white/10",
                            "bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl",
                            "cursor-grab active:cursor-grabbing"
                        )}
                    >
                        <div className="p-8">
                            {/* Header Section */}
                            <div className="flex items-start gap-4 mb-6">
                                <div className="w-14 h-14 rounded-[20px] bg-red-50 dark:bg-red-500/10 flex items-center justify-center shadow-sm border border-red-100 dark:border-red-500/20">
                                    <AlertCircle className="w-7 h-7 text-red-500" />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <H3 className="text-gray-900 dark:text-app-fg leading-none text-[20px] font-semibold tracking-tight">{title}</H3>
                                    <SmallText className="text-gray-600 dark:text-gray-400 mt-1 uppercase tracking-widest text-[11px] font-regular opacity-80">
                                        {subtitle}
                                    </SmallText>
                                </div>
                            </div>

                            {/* Warning Content */}
                            {warningText && (
                                <div className="p-5 rounded-[20px] bg-red-50/80 dark:bg-red-500/5 border-2 border-red-200/60 dark:border-red-500/10 mb-8 relative overflow-hidden group">
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500/60 dark:bg-red-500/40" />
                                    <Body className="text-[13px] text-red-700 dark:text-red-400 leading-relaxed font-regular pl-2">
                                        {warningText}
                                    </Body>
                                </div>
                            )}

                            {/* Actions (Standardized with Upload UI buttons) */}
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    className="flex-1 h-12 rounded-[18px] font-regular text-[13px] uppercase tracking-wider border-2 border-gray-300 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 text-gray-700 dark:text-white"
                                    onClick={onClose}
                                >
                                    {cancelLabel}
                                </Button>
                                <Button
                                    className="flex-1 h-12 rounded-[18px] bg-blue-600 hover:bg-blue-700 text-white font-regular text-[13px] uppercase tracking-wider shadow-lg shadow-blue-500/25"
                                    onClick={onConfirm}
                                >
                                    {confirmLabel}
                                </Button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

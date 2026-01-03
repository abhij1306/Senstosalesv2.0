"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/design-system/atoms/Button";
import { Card } from "@/components/design-system/atoms/Card";
import { Title3, SmallText, Body } from "@/components/design-system/atoms/Typography";
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
                            "shadow-macos-soft",
                            "border border-white/20",
                            "tahoe-glass backdrop-blur-3xl",
                            "cursor-grab active:cursor-grabbing"
                        )}
                    >
                        <div className="p-8">
                            {/* Header Section */}
                            <div className="flex items-start gap-4 mb-6">
                                <div className="w-14 h-14 rounded-[20px] bg-red-500/10 flex items-center justify-center shadow-sm border border-red-500/20">
                                    <AlertCircle className="w-7 h-7 text-red-500" />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <Title3 className="text-text-primary leading-none text-[20px] font-semibold tracking-tight">{title}</Title3>
                                    <SmallText className="text-text-secondary mt-1 uppercase tracking-widest text-[11px] font-regular opacity-80">
                                        {subtitle}
                                    </SmallText>
                                </div>
                            </div>

                            {/* Warning Content */}
                            {warningText && (
                                <div className="p-5 rounded-[20px] bg-red-500/5 border border-red-500/10 mb-8 relative overflow-hidden group">
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500/30" />
                                    <Body className="text-[13px] text-red-500/90 leading-relaxed font-regular pl-2">
                                        {warningText}
                                    </Body>
                                </div>
                            )}

                            {/* Actions (Standardized with Upload UI buttons) */}
                            <div className="flex gap-3">
                                <Button
                                    variant="secondary"
                                    className="flex-1 h-12 rounded-[18px] font-regular text-[13px] uppercase tracking-wider border-2 border-border-secondary hover:bg-surface-secondary text-text-primary"
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

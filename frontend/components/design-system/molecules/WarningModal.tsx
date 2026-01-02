"use client";
import React, { useState, useEffect } from "react";
import { Button } from "../atoms/Button";
import { H2, Body } from "../atoms/Typography";
import { AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * WarningModal Molecule - Atomic Design System v1.0
 * Critical for destructive actions (e.g., DB reset)
 * Must block user interaction until decision made
 */
export interface WarningModalProps {
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmLabel?: string;
    cancelLabel?: string;
    confirmVariant?: "default" | "destructive";
}

export const WarningModal: React.FC<WarningModalProps> = ({
    open,
    title,
    message,
    onConfirm,
    onCancel,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    confirmVariant = "destructive",
}) => {
    const [isVisible, setIsVisible] = useState(open);

    useEffect(() => {
        setIsVisible(open);
        // Lock body scroll when modal is open
        if (open) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [open]);

    // Handle Escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape" && open) {
                onCancel();
            }
        };
        window.addEventListener("keydown", handleEscape);
        return () => window.removeEventListener("keydown", handleEscape);
    }, [open, onCancel]);

    if (!isVisible) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-app-fg/40 backdrop-blur-sm"
            onClick={onCancel}
            role="dialog"
            aria-modal="true"
            aria-labelledby="warning-modal-title"
        >
            <div
                className={cn(
                    "relative bg-app-surface rounded-2xl shadow-app-spotlight",
                    "w-full max-w-md mx-4 p-8 border border-app-border/50",
                    "animate-in fade-in zoom-in-95 duration-200"
                )}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close button */}
                <button
                    onClick={onCancel}
                    className="absolute top-4 right-4 text-app-fg-muted hover:text-app-fg transition-colors"
                    aria-label="Close modal"
                >
                    <X size={20} />
                </button>

                {/* Icon */}
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-app-status-error/10 mb-6 mx-auto">
                    <AlertTriangle size={28} className="text-app-status-error" />
                </div>

                {/* Content */}
                <div className="text-center">
                    <H2 id="warning-modal-title" className="mb-2 text-app-fg">
                        {title}
                    </H2>
                    <Body className="text-app-fg-muted mb-8">{message}</Body>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3">
                    <Button
                        variant={confirmVariant === "destructive" ? "destructive" : "primary"}
                        className="w-full"
                        onClick={() => {
                            onConfirm();
                            setIsVisible(false);
                        }}
                    >
                        {confirmLabel}
                    </Button>
                    <Button variant="ghost" className="w-full" onClick={onCancel}>
                        {cancelLabel}
                    </Button>
                </div>
            </div>
        </div>
    );
};

"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import { X } from "lucide-react";
import { Card } from "../atoms/Card";
import { H3 } from "../atoms/Typography";
import { Button } from "../atoms/Button";
import { cn } from "@/lib/utils";

export interface DialogProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    className?: string; // For the content container
    maxWidth?: string; // e.g. "max-w-md", "max-w-2xl"
}

export const Dialog = ({
    isOpen,
    onClose,
    title,
    children,
    footer,
    className,
    maxWidth = "max-w-md",
}: DialogProps) => {
    const [mounted, setMounted] = useState(false);
    const dragControls = useDragControls();

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    // Lock body scroll when dialog is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-app-overlay/40 backdrop-blur-sm z-50"
                        onClick={onClose}
                    />
                    {/* Dialog Content */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            drag
                            dragListener={false}
                            dragControls={dragControls}
                            dragMomentum={false}
                            whileDrag={{ cursor: "grabbing" }}
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{
                                duration: 0.2,
                                type: "spring",
                                damping: 25,
                                stiffness: 300,
                            }}
                            className={cn("w-full pointer-events-auto", maxWidth)}
                        >
                            <Card
                                className={cn(
                                    "overflow-hidden shadow-app-spotlight border border-app-border/30",
                                    "bg-app-surface/90 backdrop-blur-xl",
                                    className
                                )}
                            >
                                {/* Header - Draggable Handle */}
                                <div
                                    onPointerDown={(e) => dragControls.start(e)}
                                    className="flex items-center justify-between px-6 py-4 border-b border-app-border cursor-grab active:cursor-grabbing select-none"
                                >
                                    <H3 className="text-app-fg uppercase tracking-tight">{title || "Dialog"}</H3>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={onClose}
                                        className="h-8 w-8 p-0 rounded-full hover:bg-app-overlay text-app-fg-muted"
                                    >
                                        <X size={18} />
                                    </Button>
                                </div>
                                {/* Body */}
                                <div className="p-6">{children}</div>
                                {/* Footer */}
                                {footer && (
                                    <div className="px-6 py-4 bg-app-overlay/50 border-t border-app-border flex justify-end gap-3">
                                        {footer}
                                    </div>
                                )}
                            </Card>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
};

// Compound component exports for shadcn/ui compatibility or extended usage
export const DialogContent = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={cn("p-6", className)}>{children}</div>
);

export const DialogHeader = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={cn("flex items-center justify-between px-6 py-4 border-b border-app-border", className)}>
        {children}
    </div>
);

export const DialogTitle = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <H3 className={className}>{children}</H3>
);
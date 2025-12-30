"use client";

import React from "react";
import { motion, useDragControls, AnimatePresence } from "framer-motion";
import { X, Upload, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "../atoms/Button";
import { Body, Label, Accounting } from "../atoms/Typography";
import { Flex, Stack, Box } from "../atoms/Layout";
import { Card } from "../atoms/Card";

export interface DraggableUploadWidgetProps {
    title: string;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    selectedFiles: File[];
    isUploading: boolean;
    progress: { current: number; total: number };
    onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onUpload: () => void;
    onCancel: () => void;
    onClear: () => void;
    triggerLabel?: string;
}

export const DraggableUploadWidget = ({
    title,
    fileInputRef,
    selectedFiles,
    isUploading,
    progress,
    onFileSelect,
    onUpload,
    onCancel,
    onClear,
    triggerLabel = "Upload Files",
}: DraggableUploadWidgetProps) => {
    const dragControls = useDragControls();

    // If active (files selected OR uploading), show the floating window
    // Otherwise show the trigger button
    const isActive = selectedFiles.length > 0 || isUploading;

    const handleTriggerClick = () => {
        fileInputRef.current?.click();
    };

    // We only portal the ACTIVE widget (the floating window)
    // The trigger button stays in the DOM flow where it is placed (or we can portal it too if needed, but usually button is in toolbar)
    // Wait, the design requires the trigger to be disjointed? 
    // The previous code had the trigger button returned when !isActive.
    // If we use Portal, we should likely Portal the Widget Window, but what about the Trigger?
    // The user moved the component to the root of the page, so the trigger button would render at the root... which might be hidden or wrong?
    // Actually, handling the trigger button INSIDE this widget is ambiguous if the widget is placed at root.
    // Ideally:
    // 1. Trigger Button should be rendered by the consumer (page) where it wants (Toolbar).
    // 2. This Widget should ONLY render the Floating Window (Portal).
    // But to keep API valid:
    // If !isActive, return null (Consumer renders their own button).
    // If isActive, return specific Portal.

    // User passed `triggerLabel`, implying this component handles the trigger.
    // But in srv/page.tsx, I manually added a separate Button in the toolbar.
    // And in the DraggableWidget, if !isActive, it renders a fixed button bottom-right.

    // Current behavior: 
    // srv/page.tsx renders Toolbar Button AND this Widget.
    // If !isActive, this Widget renders a Floating Button bottom-right.
    // If isActive, this Widget renders the Floating Window bottom-right.

    // The user says "upload disappears".
    // Likely: They click Toolbar button. `isActive` becomes true.
    // The Widget (bottom-right) tries to render the Window.
    // BUT maybe it is clipped.

    // Solution: MUST use Portal for the Window.

    // Solution: MUST use Portal for the Window.
    <AnimatePresence mode="wait">
        {isActive && (
            <motion.div
                key="active-widget"
                drag
                dragListener={false}
                dragControls={dragControls}
                dragMomentum={false}
                whileDrag={{ cursor: "grabbing" }}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="fixed bottom-8 right-8 z-[9999] w-[360px]"
            >
                <Card className="p-0 overflow-hidden shadow-2xl bg-white/90 backdrop-blur-xl border border-white/20">
                    {/* Draggable Header */}
                    <div
                        onPointerDown={(e) => dragControls.start(e)}
                        className="px-4 py-3 bg-gradient-to-r from-sys-brand-primary/5 to-sys-brand-primary/10 border-b border-sys-brand-primary/10 flex items-center justify-between cursor-grab active:cursor-grabbing select-none"
                    >
                        <Flex gap={2} align="center">
                            <div className="p-1.5 bg-sys-brand-primary/10 rounded-full text-sys-brand-primary">
                                <Upload size={14} />
                            </div>
                            <Label className="uppercase text-[11px] tracking-wider font-bold text-sys-brand-primary">
                                {title}
                            </Label>
                        </Flex>

                        {!isUploading && (
                            <button onClick={onClear} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <X size={16} />
                            </button>
                        )}
                    </div>

                    {/* Content */}
                    <div className="p-4">
                        {isUploading ? (
                            <Stack gap={3}>
                                <Flex justify="between" align="center">
                                    <Body className="text-xs font-medium text-slate-700">
                                        Processing Batch...
                                    </Body>
                                    <Accounting className="text-xs font-mono text-sys-brand-primary">
                                        {progress.current} / {progress.total}
                                    </Accounting>
                                </Flex>
                                <Box className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                    <motion.div
                                        className="bg-sys-brand-primary h-full rounded-full"
                                        initial={{ width: 0 }}
                                        animate={{
                                            width: `${(progress.current / progress.total) * 100}%`,
                                        }}
                                        transition={{ duration: 0.3 }}
                                    />
                                </Box>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={onCancel}
                                    className="w-full text-rose-500 hover:text-rose-600 hover:bg-rose-50 h-8"
                                >
                                    Cancel Operation
                                </Button>
                            </Stack>
                        ) : (
                            <Stack gap={4}>
                                <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                                    <Flex align="center" gap={3}>
                                        <div className="relative">
                                            <FileText size={24} className="text-slate-400" />
                                            <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-[2px] border border-white">
                                                <CheckCircle2 size={10} className="text-white" />
                                            </div>
                                        </div>
                                        <div>
                                            <Body className="text-sm font-semibold text-slate-800">
                                                {selectedFiles.length} file{selectedFiles.length !== 1 ? "s" : ""} selected
                                            </Body>
                                            <Body className="text-xs text-slate-500">
                                                Ready to process
                                            </Body>
                                        </div>
                                    </Flex>
                                </div>
                                <Button onClick={onUpload} className="w-full font-bold shadow-lg shadow-brand-primary/20">
                                    Start Upload
                                </Button>
                            </Stack>
                        )}
                    </div>
                </Card>
            </motion.div>
        )}
    </AnimatePresence>


    return (
        <>
            {/* Persistent Hidden Input */}
            <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.html"
                onChange={onFileSelect}
                className="hidden"
            />

            {/* Trigger Button */}
            {!isActive && (
                <motion.div
                    key="trigger-button"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <Button variant="default" onClick={handleTriggerClick} className="shadow-lg shadow-sys-brand-primary/20">
                        <Upload size={16} className="mr-2" />
                        {triggerLabel}
                    </Button>
                </motion.div>
            )}

            <AnimatePresence mode="wait">
                {isActive && (
                    <motion.div
                        key="active-widget"
                        drag
                        dragListener={false}
                        dragControls={dragControls}
                        dragMomentum={false}
                        whileDrag={{ cursor: "grabbing" }}
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="fixed bottom-8 right-8 z-[100] w-[360px]"
                    >
                        <Card className="p-0 overflow-hidden shadow-2xl bg-white/90 backdrop-blur-xl border border-white/20">
                            {/* Draggable Header */}
                            <div
                                onPointerDown={(e) => dragControls.start(e)}
                                className="px-4 py-3 bg-gradient-to-r from-sys-brand-primary/5 to-sys-brand-primary/10 border-b border-sys-brand-primary/10 flex items-center justify-between cursor-grab active:cursor-grabbing select-none"
                            >
                                <Flex gap={2} align="center">
                                    <div className="p-1.5 bg-sys-brand-primary/10 rounded-full text-sys-brand-primary">
                                        <Upload size={14} />
                                    </div>
                                    <Label className="uppercase text-[11px] tracking-wider font-bold text-sys-brand-primary">
                                        {title}
                                    </Label>
                                </Flex>

                                {!isUploading && (
                                    <button onClick={onClear} className="text-slate-400 hover:text-slate-600 transition-colors">
                                        <X size={16} />
                                    </button>
                                )}
                            </div>

                            {/* Content */}
                            <div className="p-4">
                                {isUploading ? (
                                    <Stack gap={3}>
                                        <Flex justify="between" align="center">
                                            <Body className="text-xs font-medium text-slate-700">
                                                Processing Batch...
                                            </Body>
                                            <Accounting className="text-xs font-mono text-sys-brand-primary">
                                                {progress.current} / {progress.total}
                                            </Accounting>
                                        </Flex>
                                        <Box className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                            <motion.div
                                                className="bg-sys-brand-primary h-full rounded-full"
                                                initial={{ width: 0 }}
                                                animate={{
                                                    width: `${(progress.current / progress.total) * 100}%`,
                                                }}
                                                transition={{ duration: 0.3 }}
                                            />
                                        </Box>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={onCancel}
                                            className="w-full text-rose-500 hover:text-rose-600 hover:bg-rose-50 h-8"
                                        >
                                            Cancel Operation
                                        </Button>
                                    </Stack>
                                ) : (
                                    <Stack gap={4}>
                                        <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                                            <Flex align="center" gap={3}>
                                                <div className="relative">
                                                    <FileText size={24} className="text-slate-400" />
                                                    <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-[2px] border border-white">
                                                        <CheckCircle2 size={10} className="text-white" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <Body className="text-sm font-semibold text-slate-800">
                                                        {selectedFiles.length} file{selectedFiles.length !== 1 ? "s" : ""} selected
                                                    </Body>
                                                    <Body className="text-xs text-slate-500">
                                                        Ready to process
                                                    </Body>
                                                </div>
                                            </Flex>
                                        </div>
                                        <Button onClick={onUpload} className="w-full font-bold shadow-lg shadow-brand-primary/20">
                                            Start Upload
                                        </Button>
                                    </Stack>
                                )}
                            </div>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

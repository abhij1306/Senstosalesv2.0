"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minimize2, Maximize2, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useUpload } from "@/components/providers/UploadContext";
import { cn } from "@/lib/utils";
import {
    Body,
    SmallText,
    Accounting,
    Button,
    Flex,
    Stack,
    Box,
} from "@/components/design-system";

export default function BatchUploadCard() {
    const {
        isUploading,
        progress,
        acceptedCount,
        rejectedCount,
        minimized,
        files,
        uploadType,
        cancelUpload,
        setMinimized,
        resetUpload,
    } = useUpload();

    // Only show if there's active state or finding results
    const isVisible = isUploading || (progress.total > 0 && progress.current === progress.total);

    if (!isVisible) return null;

    const isComplete = progress.total > 0 && progress.current === progress.total;

    return (
        <AnimatePresence>
            <motion.div
                drag
                dragMomentum={false}
                initial={{ opacity: 0, y: -20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.9 }}
                className={cn(
                    "fixed bottom-12 right-8 z-[100] cursor-grab active:cursor-grabbing",
                    minimized ? "w-auto" : "w-[400px]"
                )}
            >
                <div
                    className={cn(
                        "rounded-[2.5rem] transition-all duration-300 overflow-hidden shadow-2xl",
                        "tahoe-glass-card border-none backdrop-blur-3xl",
                        minimized ? "p-2 pr-6" : "p-0"
                    )}
                >
                    {minimized ? (
                        <Flex align="center" gap={3.5}>
                            <Box className="relative w-12 h-12 flex items-center justify-center bg-surface-variant/30 rounded-full shadow-inner border-none">
                                <svg className="w-full h-full transform -rotate-90 p-2">
                                    <circle
                                        cx="16"
                                        cy="16"
                                        r="14"
                                        stroke="currentColor"
                                        strokeWidth="3"
                                        fill="transparent"
                                        className="text-primary/20"
                                        viewBox="0 0 32 32"
                                    />
                                    <circle
                                        cx="16"
                                        cy="16"
                                        r="14"
                                        stroke="currentColor"
                                        strokeWidth="3"
                                        fill="transparent"
                                        strokeDasharray={88}
                                        strokeDashoffset={88 - (88 * progress.current) / progress.total}
                                        className="text-primary transition-all duration-500 ease-out shadow-primary/40"
                                        viewBox="0 0 32 32"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-[11px] font-bold text-text-primary">
                                        {Math.round((progress.current / (progress.total || 1)) * 100)}%
                                    </span>
                                </div>
                            </Box>
                            <Stack gap={0}>
                                <div className="text-[12px] font-semibold text-text-primary leading-tight">Processing</div>
                                <div className="text-[10px] font-bold text-text-secondary uppercase tracking-tight">
                                    {progress.current}/{progress.total} Ingested
                                </div>
                            </Stack>
                            <Button
                                variant="ghost"
                                size="compact"
                                className="h-8 w-8 ml-3 hover:bg-surface-variant/40 rounded-full"
                                onClick={() => setMinimized(false)}
                            >
                                <Maximize2 size={15} className="text-text-secondary" />
                            </Button>
                        </Flex>
                    ) : (
                        <div className="p-8">
                            <Flex justify="between" align="start" className="mb-8">
                                <Flex align="center" gap={4.5}>
                                    <Box className={cn(
                                        "w-16 h-16 rounded-[22px] flex items-center justify-center shadow-lg transition-all duration-500 border-none shadow-primary/20",
                                        isComplete
                                            ? "bg-status-success text-white"
                                            : "bg-action-primary text-white"
                                    )}>
                                        {isComplete ? <CheckCircle size={32} /> : <Loader2 size={32} className="animate-spin" />}
                                    </Box>
                                    <Stack gap={0.5}>
                                        <div className="text-[22px] font-semibold text-text-primary tracking-tight leading-tight">
                                            {isComplete ? "Finalized" : `Matrix Ingestion`}
                                        </div>
                                        <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-text-tertiary opacity-70">
                                            {files.length} Document{files.length !== 1 ? 's' : ''} Streamed
                                        </div>
                                    </Stack>
                                </Flex>
                                <Flex gap={2}>
                                    <Button
                                        variant="ghost"
                                        size="compact"
                                        className="h-9 w-9 rounded-full bg-surface-variant/30 hover:bg-surface-variant/50 text-text-primary transition-all"
                                        onClick={() => setMinimized(true)}
                                    >
                                        <Minimize2 size={16} />
                                    </Button>
                                    {isComplete && (
                                        <Button
                                            variant="ghost"
                                            size="compact"
                                            className="h-9 w-9 rounded-full bg-status-error/10 hover:bg-status-error/20 text-status-error transition-all"
                                            onClick={resetUpload}
                                        >
                                            <X size={16} />
                                        </Button>
                                    )}
                                </Flex>
                            </Flex>

                            <Stack gap={8}>
                                {/* Progress Bar */}
                                <Box className="w-full">
                                    <Flex justify="between" align="end" className="mb-3 w-full px-1">
                                        <div className="text-[11px] font-bold uppercase tracking-widest text-text-secondary opacity-60">
                                            Parser Velocity
                                        </div>
                                        <div className="text-[26px] font-bold text-primary tracking-tighter tabular-nums">
                                            {Math.round((progress.current / (progress.total || 1)) * 100)}%
                                        </div>
                                    </Flex>
                                    <div className="h-4 w-full bg-surface-variant/20 rounded-full overflow-hidden border-none p-1">
                                        <motion.div
                                            className={cn(
                                                "h-full rounded-full shadow-primary/40 relative overflow-hidden transition-all duration-300",
                                                isComplete ? "bg-status-success" : "bg-action-primary"
                                            )}
                                            initial={{ width: 0 }}
                                            animate={{
                                                width: `${(progress.current / (progress.total || 1)) * 100}%`,
                                            }}
                                            transition={{ type: "spring", damping: 25, stiffness: 120 }}
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite]" />
                                        </motion.div>
                                    </div>
                                </Box>

                                {/* Grid Stats */}
                                <div className="grid grid-cols-2 gap-5 w-full">
                                    <Box className="flex flex-col items-center justify-center p-6 bg-status-success/10 border-none rounded-[2rem] shadow-sm h-32 group hover:scale-[1.02] transition-all">
                                        <Flex align="center" gap={2} className="mb-2">
                                            <CheckCircle size={14} className="text-status-success" />
                                            <div className="text-[11px] font-bold uppercase tracking-widest text-status-success opacity-80">Accepted</div>
                                        </Flex>
                                        <div className="text-3xl font-bold text-status-success tracking-tighter tabular-nums">{acceptedCount}</div>
                                    </Box>

                                    <Box className={cn(
                                        "flex flex-col items-center justify-center p-6 rounded-[2rem] shadow-sm h-32 border-none transition-all hover:scale-[1.02] group",
                                        rejectedCount > 0
                                            ? "bg-status-error/10"
                                            : "bg-surface-variant/30"
                                    )}>
                                        <Flex align="center" gap={2} className="mb-2">
                                            <AlertCircle size={14} className={rejectedCount > 0 ? "text-status-error" : "text-text-tertiary"} />
                                            <div className={cn("text-[11px] font-bold uppercase tracking-widest opacity-80", rejectedCount > 0 ? "text-status-error" : "text-text-secondary")}>Rejected</div>
                                        </Flex>
                                        <div className={cn("text-3xl font-bold tracking-tighter tabular-nums", rejectedCount > 0 ? "text-status-error" : "text-text-tertiary")}>{rejectedCount}</div>
                                    </Box>
                                </div>

                                {/* Actions */}
                                {!isComplete && (
                                    <Button
                                        variant="secondary"
                                        size="lg"
                                        onClick={cancelUpload}
                                        className="w-full text-red-500 hover:text-white hover:bg-red-500 border-none h-14 font-bold tracking-[0.1em] text-[12px] uppercase rounded-[20px] transition-all"
                                    >
                                        Halt Provisioning
                                    </Button>
                                )}
                                {isComplete && (
                                    <Button
                                        onClick={resetUpload}
                                        className="w-full bg-action-primary hover:bg-action-primary/90 text-white shadow-xl shadow-action-primary/30 h-14 font-bold tracking-[0.1em] text-[12px] uppercase rounded-[20px] transition-all"
                                    >
                                        Dismiss Ledger
                                    </Button>
                                )}
                            </Stack>
                        </div>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

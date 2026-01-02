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
    H4,
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
                        "rounded-[2.5rem] transition-all duration-300 overflow-hidden",
                        "glass-panel shadow-macos-soft border border-white/40 dark:border-white/10",
                        minimized ? "p-2 pr-6" : "p-0"
                    )}
                >
                    {minimized ? (
                        <Flex align="center" gap={3.5}>
                            <Box className="relative w-12 h-12 flex items-center justify-center bg-blue-50/50 dark:bg-blue-900/20 rounded-full shadow-inner border border-blue-100/20 dark:border-white/5">
                                <svg className="w-full h-full transform -rotate-90 p-2">
                                    <circle
                                        cx="16"
                                        cy="16"
                                        r="14"
                                        stroke="currentColor"
                                        strokeWidth="3"
                                        fill="transparent"
                                        className="text-blue-400/20"
                                        viewBox="0 0 32 32"
                                    />
                                    <circle
                                        cx="16"
                                        cy="16"
                                        r="14"
                                        stroke="#007AFF"
                                        strokeWidth="3"
                                        fill="transparent"
                                        strokeDasharray={88}
                                        strokeDashoffset={88 - (88 * progress.current) / progress.total}
                                        className="transition-all duration-500 ease-out shadow-[0_0_8px_rgba(0,122,255,0.4)]"
                                        viewBox="0 0 32 32"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-[11px] font-bold text-primary">
                                        {Math.round((progress.current / (progress.total || 1)) * 100)}%
                                    </span>
                                </div>
                            </Box>
                            <Stack gap={0}>
                                <div className="text-[12px] font-semibold text-app-fg leading-tight">Processing</div>
                                <div className="text-[10px] font-bold text-text-secondary uppercase tracking-tight">
                                    {progress.current}/{progress.total} Ingested
                                </div>
                            </Stack>
                            <Button
                                variant="ghost"
                                size="compact"
                                className="h-8 w-8 ml-3 hover:bg-white/40 dark:hover:bg-white/10 rounded-full"
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
                                        "w-16 h-16 rounded-[22px] flex items-center justify-center shadow-lg transition-all duration-500 border border-white/40 shadow-blue-500/20",
                                        isComplete
                                            ? "bg-green-500 text-white"
                                            : "bg-primary text-white"
                                    )}>
                                        {isComplete ? <CheckCircle size={32} /> : <Loader2 size={32} className="animate-spin" />}
                                    </Box>
                                    <Stack gap={0.5}>
                                        <div className="text-[22px] font-semibold text-app-fg tracking-tight leading-tight">
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
                                        className="h-9 w-9 rounded-full bg-blue-50/50 dark:bg-white/10 hover:bg-white/70 dark:hover:bg-white/20 text-text-secondary transition-all"
                                        onClick={() => setMinimized(true)}
                                    >
                                        <Minimize2 size={16} />
                                    </Button>
                                    {isComplete && (
                                        <Button
                                            variant="ghost"
                                            size="compact"
                                            className="h-9 w-9 rounded-full bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-500 transition-all"
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
                                    <div className="h-4 w-full bg-blue-100/30 dark:bg-white/5 rounded-full overflow-hidden border border-blue-200/20 dark:border-white/5 p-1">
                                        <motion.div
                                            className={cn(
                                                "h-full rounded-full shadow-[0_0_12px_rgba(0,122,255,0.4)] relative overflow-hidden transition-all duration-300",
                                                isComplete ? "bg-green-500" : "bg-primary"
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
                                    <Box className="flex flex-col items-center justify-center p-6 bg-green-50/50 dark:bg-green-500/10 border border-green-500/20 rounded-[2rem] shadow-sm h-32 group hover:scale-[1.02] transition-all">
                                        <Flex align="center" gap={2} className="mb-2">
                                            <CheckCircle size={14} className="text-green-500" />
                                            <div className="text-[11px] font-bold uppercase tracking-widest text-green-600 dark:text-green-400 opacity-80">Accepted</div>
                                        </Flex>
                                        <div className="text-3xl font-bold text-green-600 dark:text-green-400 tracking-tighter tabular-nums">{acceptedCount}</div>
                                    </Box>

                                    <Box className={cn(
                                        "flex flex-col items-center justify-center p-6 rounded-[2rem] shadow-sm h-32 border transition-all hover:scale-[1.02] group",
                                        rejectedCount > 0
                                            ? "bg-red-50/50 dark:bg-red-500/10 border-red-500/20"
                                            : "bg-gray-50/50 dark:bg-white/5 border-gray-200/40 dark:border-white/10"
                                    )}>
                                        <Flex align="center" gap={2} className="mb-2">
                                            <AlertCircle size={14} className={rejectedCount > 0 ? "text-red-500" : "text-text-tertiary"} />
                                            <div className={cn("text-[11px] font-bold uppercase tracking-widest opacity-80", rejectedCount > 0 ? "text-red-600 dark:text-red-400" : "text-text-secondary")}>Rejected</div>
                                        </Flex>
                                        <div className={cn("text-3xl font-bold tracking-tighter tabular-nums", rejectedCount > 0 ? "text-red-600 dark:text-red-400" : "text-blue-200 dark:text-blue-900/40")}>{rejectedCount}</div>
                                    </Box>
                                </div>

                                {/* Actions */}
                                {!isComplete && (
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        onClick={cancelUpload}
                                        className="w-full text-red-500 hover:text-white hover:bg-red-500 border-red-500/20 h-14 font-bold tracking-[0.1em] text-[12px] uppercase rounded-[20px] transition-all"
                                    >
                                        Halt Provisioning
                                    </Button>
                                )}
                                {isComplete && (
                                    <Button
                                        onClick={resetUpload}
                                        className="w-full bg-primary hover:bg-primary/90 text-white shadow-xl shadow-blue-500/30 h-14 font-bold tracking-[0.1em] text-[12px] uppercase rounded-[20px] transition-all"
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

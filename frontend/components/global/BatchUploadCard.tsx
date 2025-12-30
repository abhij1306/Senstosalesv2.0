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
} from "@/components/design-system/organisms";

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
                    "fixed top-24 right-8 z-[100] cursor-grab active:cursor-grabbing",
                    minimized ? "w-auto" : "w-[400px]"
                )}
            >
                <div
                    className={cn(
                        "rounded-3xl transition-all duration-300 overflow-hidden",
                        "bg-white/90 backdrop-blur-xl",
                        "shadow-[0_20px_40px_-12px_rgba(0,0,0,0.12),0_4px_8px_rgba(0,0,0,0.05)]",
                        minimized ? "p-2 pr-4" : "p-0"
                    )}
                >
                    {minimized ? (
                        <Flex align="center" gap={3}>
                            <Box className="relative w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-inner">
                                <svg className="w-full h-full transform -rotate-90 p-1">
                                    <circle
                                        cx="16"
                                        cy="16"
                                        r="14"
                                        stroke="currentColor"
                                        strokeWidth="3"
                                        fill="transparent"
                                        className="text-slate-100"
                                        viewBox="0 0 32 32"
                                    />
                                    <circle
                                        cx="16"
                                        cy="16"
                                        r="14"
                                        stroke="url(#gradient-brand)"
                                        strokeWidth="3"
                                        fill="transparent"
                                        strokeDasharray={88}
                                        strokeDashoffset={88 - (88 * progress.current) / progress.total}
                                        className="text-[var(--color-sys-brand-primary)]"
                                        viewBox="0 0 32 32"
                                    />
                                    <defs>
                                        <linearGradient id="gradient-brand" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#3B82F6" />
                                            <stop offset="100%" stopColor="#8B5CF6" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <H4 className="text-[var(--color-sys-brand-primary)] p-0 m-0">
                                        {Math.round((progress.current / progress.total) * 100)}%
                                    </H4>
                                </div>
                            </Box>
                            <Stack gap={0}>
                                <SmallText className="font-bold text-[var(--color-sys-text-primary)]">Uploading...</SmallText>
                                <H4 className="text-[var(--color-sys-text-tertiary)] font-semibold">
                                    {progress.current}/{progress.total} Parsed
                                </H4>
                            </Stack>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 ml-auto hover:bg-black/5 rounded-full"
                                onClick={() => setMinimized(false)}
                            >
                                <Maximize2 size={16} />
                            </Button>
                        </Flex>
                    ) : (
                        <div className="p-6">
                            <Flex justify="between" align="start" className="mb-6">
                                <Flex align="center" gap={3}>
                                    <Box className={cn(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-colors duration-500",
                                        isComplete ? "bg-emerald-500 text-white" : "bg-blue-600 text-white"
                                    )}>
                                        {isComplete ? <CheckCircle size={24} strokeWidth={3} /> : <Loader2 size={24} className="animate-spin" />}
                                    </Box>
                                    <Stack gap={0.5}>
                                        <Body className="font-black text-xl text-[var(--color-sys-text-primary)] tracking-tight">
                                            {isComplete ? "Processing Complete" : `Ingesting ${uploadType}`}
                                        </Body>
                                        <SmallText className="text-[var(--color-sys-text-secondary)] font-medium">
                                            {files.length} Document{files.length !== 1 ? 's' : ''} in Queue
                                        </SmallText>
                                    </Stack>
                                </Flex>
                                <Flex gap={1}>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 rounded-full hover:bg-black/5 text-slate-400 hover:text-slate-600"
                                        onClick={() => setMinimized(true)}
                                    >
                                        <Minimize2 size={18} />
                                    </Button>
                                    {isComplete && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 rounded-full hover:bg-black/5 text-slate-400 hover:text-slate-600"
                                            onClick={resetUpload}
                                        >
                                            <X size={18} />
                                        </Button>
                                    )}
                                </Flex>
                            </Flex>

                            <Stack gap={6}>
                                {/* Progress Bar */}
                                <Box className="w-full">
                                    <Flex justify="between" align="end" className="mb-2 w-full">
                                        <H4 className="text-slate-400">
                                            Parsers Active
                                        </H4>
                                        <Accounting className="font-black text-blue-600 text-h2 leading-none">
                                            {Math.round((progress.current / progress.total) * 100)}%
                                        </Accounting>
                                    </Flex>
                                    <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner border border-slate-200/50">
                                        <motion.div
                                            className={cn(
                                                "h-full rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.1)] relative overflow-hidden",
                                                isComplete ? "bg-emerald-500" : "bg-gradient-to-r from-blue-500 to-indigo-600"
                                            )}
                                            initial={{ width: 0 }}
                                            animate={{
                                                width: `${(progress.current / progress.total) * 100}%`,
                                            }}
                                        >
                                            <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" />
                                        </motion.div>
                                    </div>
                                </Box>

                                {/* Grid Stats - Perfectly Aligned */}
                                <div className="grid grid-cols-2 gap-4 w-full">
                                    <Box className="flex flex-col items-start justify-center p-4 bg-emerald-50/80 border border-emerald-100/80 rounded-2xl shadow-sm h-24">
                                        <Flex align="center" gap={2} className="mb-2">
                                            <div className="p-1.5 bg-white rounded-full shadow-sm text-emerald-600">
                                                <CheckCircle size={14} strokeWidth={3} />
                                            </div>
                                            <H4 className="text-emerald-600/80 font-bold tracking-widest">Accepted</H4>
                                        </Flex>
                                        <Accounting className="text-h1 font-black text-emerald-700 tracking-tighter">{acceptedCount}</Accounting>
                                    </Box>

                                    <Box className={cn(
                                        "flex flex-col items-start justify-center p-4 rounded-2xl shadow-sm h-24 border transition-colors",
                                        rejectedCount > 0 ? "bg-rose-50/80 border-rose-100/80" : "bg-slate-50/80 border-slate-100/80"
                                    )}>
                                        <Flex align="center" gap={2} className="mb-2">
                                            <div className={cn("p-1.5 bg-white rounded-full shadow-sm", rejectedCount > 0 ? "text-rose-600" : "text-slate-400")}>
                                                <AlertCircle size={14} strokeWidth={3} />
                                            </div>
                                            <H4 className={cn("font-bold tracking-widest", rejectedCount > 0 ? "text-rose-600/80" : "text-slate-400")}>Rejected</H4>
                                        </Flex>
                                        <Accounting className={cn("text-h1 font-black tracking-tighter", rejectedCount > 0 ? "text-rose-700" : "text-slate-400")}>{rejectedCount}</Accounting>
                                    </Box>
                                </div>

                                {/* Actions */}
                                {!isComplete && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={cancelUpload}
                                        className="w-full text-rose-500 hover:text-rose-600 hover:bg-rose-50 border-rose-200/60 h-12 font-bold tracking-widest text-xs uppercase rounded-xl border-2 shadow-sm"
                                    >
                                        Halt Operation
                                    </Button>
                                )}
                                {isComplete && (
                                    <Button
                                        onClick={resetUpload}
                                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-200 h-12 font-bold tracking-widest text-xs uppercase rounded-xl"
                                    >
                                        Done
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

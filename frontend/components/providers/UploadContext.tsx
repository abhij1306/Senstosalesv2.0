"use client";

import React, { createContext, useContext, useState, useRef, useCallback } from "react";
import { api } from "@/lib/api";

type UploadType = "PO" | "SRV" | null;

interface UploadContextType {
    isUploading: boolean;
    progress: { current: number; total: number };
    files: File[];
    acceptedCount: number;
    rejectedCount: number;
    uploadType: UploadType;
    minimized: boolean;
    startUpload: (files: File[], type: UploadType) => Promise<void>;
    cancelUpload: () => void;
    resetUpload: () => void;
    setMinimized: (minimized: boolean) => void;
}

const UploadContext = createContext<UploadContextType | undefined>(undefined);

export function UploadProvider({ children }: { children: React.ReactNode }) {
    const [isUploading, setIsUploading] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const [progress, setProgress] = useState({ current: 0, total: 0 });
    const [acceptedCount, setAcceptedCount] = useState(0);
    const [rejectedCount, setRejectedCount] = useState(0);
    const [uploadType, setUploadType] = useState<UploadType>(null);
    const [minimized, setMinimized] = useState(false);

    const isCancelled = useRef(false);

    const startUpload = useCallback(async (selectedFiles: File[], type: UploadType) => {
        if (selectedFiles.length === 0) return;

        setFiles(selectedFiles);
        setUploadType(type);
        // ATOMIC UI TRIGGER: Start loading state. 
        // Consumers must wait for this to flip back to false before reloading data.
        setIsUploading(true);
        setStatusReset();
        setProgress({ current: 0, total: selectedFiles.length });
        setMinimized(false);
        isCancelled.current = false;

        let processedCount = 0;
        let accepted = 0;
        let rejected = 0;

        try {
            const CHUNK_SIZE = 5;
            for (let i = 0; i < selectedFiles.length; i += CHUNK_SIZE) {
                if (isCancelled.current) break;

                const chunk = selectedFiles.slice(i, i + CHUNK_SIZE);

                if (type === "PO") {
                    // TOT-5 Awareness: The backend now performs a heavy Reconciliation Sync.
                    // We await the entire batch chunk to ensure DB consistency.
                    await api.uploadPOBatch(chunk);
                    accepted += chunk.length;
                } else if (type === "SRV") {
                    await api.uploadSRVBatch(chunk);
                    accepted += chunk.length;
                }

                processedCount += chunk.length;

                // Atomic State Updates for Progress Ring
                setAcceptedCount((prev) => prev + chunk.length);
                // In future, parse API response for actual rejected count

                setProgress({
                    current: processedCount,
                    total: selectedFiles.length,
                });

                // Yield to event loop to keep UI responsive
                await new Promise((resolve) => setTimeout(resolve, 50));
            }
        } catch (error) {
            console.error("Upload failed in batch:", error);
            // In a real app, we'd mark the failed chunk as rejected
        } finally {
            // CRITICAL: Only turn off uploading state after EVERYTHING is done.
            // This ensures the readiness check passes before the table tries to reload.
            setIsUploading(false);
            isCancelled.current = false;
        }
    }, []);

    const cancelUpload = useCallback(() => {
        isCancelled.current = true;
        setIsUploading(false);
    }, []);

    const resetUpload = useCallback(() => {
        setFiles([]);
        setProgress({ current: 0, total: 0 });
        setAcceptedCount(0);
        setRejectedCount(0);
        setUploadType(null);
        setIsUploading(false);
        setMinimized(false);
    }, []);

    const setStatusReset = () => {
        setAcceptedCount(0);
        setRejectedCount(0);
    }

    return (
        <UploadContext.Provider
            value={{
                isUploading,
                progress,
                files,
                acceptedCount,
                rejectedCount,
                uploadType,
                minimized,
                startUpload,
                cancelUpload,
                resetUpload,
                setMinimized,
            }}
        >
            {children}
        </UploadContext.Provider>
    );
}

export function useUpload() {
    const context = useContext(UploadContext);
    if (context === undefined) {
        throw new Error("useUpload must be used within a UploadProvider");
    }
    return context;
}
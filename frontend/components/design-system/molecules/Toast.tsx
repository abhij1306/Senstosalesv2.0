"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "info" | "warning";

interface ToastMessage {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
}

interface ToastContextType {
    toast: (title: string, message?: string, type?: ToastType) => void;
    success: (title: string, message?: string) => void;
    error: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const addToast = useCallback(
        (title: string, message?: string, type: ToastType = "info") => {
            const id = Math.random().toString(36).substring(2, 9);
            setToasts((prev) => [...prev, { id, title, message, type }]);
            setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t.id !== id));
            }, 4000);
        },
        []
    );

    useEffect(() => {
        const handleApiError = (event: Event) => {
            const customEvent = event as CustomEvent;
            const detail = customEvent.detail || {};
            addToast(
                detail.title || "Error",
                detail.message || "Something went wrong",
                detail.type || "error"
            );
        };
        window.addEventListener("api-error", handleApiError);
        return () => window.removeEventListener("api-error", handleApiError);
    }, [addToast]);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const helpers = {
        toast: (title: string, message?: string, type: ToastType = "info") => addToast(title, message, type),
        success: (title: string, message?: string) => addToast(title, message, "success"),
        error: (title: string, message?: string) => addToast(title, message, "error"),
    };

    return (
        <ToastContext.Provider value={helpers}>
            {children}
            <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        className={cn(
                            "pointer-events-auto min-w-[320px] max-w-sm rounded-2xl shadow-app-spotlight border px-4 py-4 flex gap-4 transform transition-all duration-500 animate-in slide-in-from-right-12 fade-in backdrop-blur-md",
                            "bg-app-surface/90 border-app-border",
                            t.type === "success" && "border-l-4 border-l-app-status-success",
                            t.type === "error" && "border-l-4 border-l-app-status-error",
                            t.type === "warning" && "border-l-4 border-l-app-status-warning",
                            t.type === "info" && "border-l-4 border-l-app-accent"
                        )}
                    >
                        <div className="shrink-0 mt-0.5">
                            {t.type === "success" && <CheckCircle className="w-5 h-5 text-app-status-success" />}
                            {t.type === "error" && <AlertCircle className="w-5 h-5 text-app-status-error" />}
                            {t.type === "warning" && <AlertCircle className="w-5 h-5 text-app-status-warning" />}
                            {t.type === "info" && <Info className="w-5 h-5 text-app-accent" />}
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-app-fg text-[14px] leading-tight">{t.title}</h4>
                            {t.message && <p className="text-app-fg-muted mt-1 text-[12px] leading-snug">{t.message}</p>}
                        </div>
                        <button onClick={() => removeToast(t.id)} className="shrink-0 text-app-fg-muted hover:text-app-fg transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

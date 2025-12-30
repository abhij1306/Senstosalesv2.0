"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { Check, ChevronRight, Circle } from "lucide-react"; export type DocumentStage = "PO" | "DC" | "Invoice" | "SRV"; interface DocumentJourneyProps {
    currentStage: DocumentStage; stages?: DocumentStage[]; className?: string;
} const STAGE_LABELS: Record<DocumentStage, string> = {
    PO: "Purchase Order",
    DC: "Delivery Challan",
    Invoice: "Tax Invoice",
    SRV: "Service Receipt",
};

export const DocumentJourney = ({ currentStage, stages = ["PO", "DC", "Invoice"], className }: DocumentJourneyProps) => {
    const currentIndex = stages.indexOf(currentStage);
    return (
        <div className={cn("flex items-center gap-2", className)}>
            {stages.map((stage, index) => {
                const isCompleted = index < currentIndex;
                const isActive = index === currentIndex;
                const isPending = index > currentIndex;
                return (
                    <React.Fragment key={stage}>
                        <div className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 border",
                            isActive
                                ? "bg-[var(--bg-surface-elevated)] border-[var(--app-fg-muted)] shadow-md"
                                : isCompleted
                                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600"
                                    : "bg-transparent border-transparent text-[var(--app-fg-muted)]",
                        )} >
                            {isCompleted ? (
                                <Check size={12} className="text-emerald-500" />
                            ) : isActive ? (
                                <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
                            ) : (
                                <Circle size={12} className="text-[var(--app-fg-muted)] opacity-50" />
                            )}
                            <span className={cn(
                                "text-[10px] uppercase tracking-widest font-semibold",
                                isActive ? "text-[var(--app-fg)]" : isCompleted ? "text-emerald-600" : "text-[var(--app-fg-muted)]",
                            )} >
                                {stage}
                            </span>
                        </div>
                        {index < stages.length - 1 && (
                            <div className="w-4 h-[1px] bg-[var(--border-subtle)]" />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
};

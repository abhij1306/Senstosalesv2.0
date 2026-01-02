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
                                ? "bg-app-surface-raised border-app-fg-secondary shadow-md"
                                : isCompleted
                                    ? "bg-app-status-success/10 border-app-status-success/20 text-app-status-success"
                                    : "bg-transparent border-transparent text-app-fg-secondary",
                        )} >
                            {isCompleted ? (
                                <Check size={12} className="text-app-status-success" />
                            ) : isActive ? (
                                <div className="w-1.5 h-1.5 rounded-full bg-app-accent animate-pulse" />
                            ) : (
                                <Circle size={12} className="text-app-fg-secondary opacity-50" />
                            )}
                            <span className={cn(
                                "text-[10px] uppercase tracking-widest font-black",
                                isActive ? "text-app-fg-primary" : isCompleted ? "text-app-status-success" : "text-app-fg-secondary",
                            )} >
                                {stage}
                            </span>
                        </div>
                        {index < stages.length - 1 && (
                            <div className="w-4 h-[1px] bg-app-border" />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
};

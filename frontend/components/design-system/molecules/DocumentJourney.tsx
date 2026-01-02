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
        <div className={cn("flex items-center gap-1.5", className)}>
            {stages.map((stage, index) => {
                const isCompleted = index < currentIndex;
                const isActive = index === currentIndex;
                const isPending = index > currentIndex;
                return (
                    <React.Fragment key={stage}>
                        <div className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300",
                            isActive
                                ? "bg-app-surface elevation-1 text-text-primary"
                                : isCompleted
                                    ? "bg-system-green/10 text-system-green"
                                    : "bg-transparent text-text-tertiary",
                        )}>
                            {isCompleted ? (
                                <Check size={10} strokeWidth={3} className="text-system-green" />
                            ) : isActive ? (
                                <div className="w-1.5 h-1.5 rounded-full bg-app-accent" />
                            ) : (
                                <Circle size={10} className="text-text-tertiary opacity-50" />
                            )}
                            <span className={cn(
                                "text-caption-2 uppercase tracking-wider font-regular",
                                isActive ? "text-text-primary" : isCompleted ? "text-system-green" : "text-text-tertiary",
                            )}>
                                {stage}
                            </span>
                        </div>
                        {index < stages.length - 1 && (
                            <div className="w-4 h-[1px] bg-transparent" />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
};

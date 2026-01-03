"use client";
import React from "react";
import { cn } from "@/lib/utils";
export type DocumentStage = "PO" | "DC" | "Invoice" | "SRV";

interface DocumentJourneyProps {
    currentStage: DocumentStage;
    stages?: DocumentStage[];
    className?: string;
}

const STAGE_CONFIG: Record<DocumentStage, { label: string; color: string }> = {
    PO: { label: "Order", color: "rgb(var(--brand-primary))" },
    DC: { label: "Dispatch", color: "rgb(var(--brand-primary))" },
    Invoice: { label: "Billing", color: "rgb(var(--brand-primary))" },
    SRV: { label: "Receipt", color: "rgb(var(--status-success))" },
};

export const DocumentJourney = ({
    currentStage,
    stages = ["PO", "DC", "Invoice", "SRV"],
    className
}: DocumentJourneyProps) => {
    const currentIndex = stages.indexOf(currentStage);

    return (
        <div className={cn("flex items-center gap-2", className)}>
            {stages.map((stage, index) => {
                const isCompleted = index < currentIndex;
                const isActive = index === currentIndex;
                const config = STAGE_CONFIG[stage];

                return (
                    <React.Fragment key={stage}>
                        <div className="flex flex-col items-center gap-1 group relative">
                            {/* Dot */}
                            <div className={cn(
                                "relative w-2.5 h-2.5 rounded-full transition-all duration-500",
                                isActive ? "bg-brand-primary scale-125 shadow-[0_0_12px_rgb(var(--brand-primary))]" :
                                    isCompleted ? "bg-brand-primary/60" : "bg-text-tertiary/30"
                            )}>
                                {isActive && (
                                    <span className="absolute inset-0 rounded-full bg-brand-primary animate-ping opacity-40" />
                                )}
                            </div>

                            {/* Label */}
                            <span className={cn(
                                "text-[10px] uppercase tracking-tighter font-bold transition-colors",
                                isActive ? "text-text-primary" : "text-text-tertiary opacity-60"
                            )}>
                                {config.label}
                            </span>
                        </div>

                        {/* Connector Line */}
                        {index < stages.length - 1 && (
                            <div className={cn(
                                "w-10 h-[1.5px] -mt-4 transition-colors duration-500 rounded-full",
                                index < currentIndex ? "bg-brand-primary/40" : "bg-text-tertiary/10"
                            )} />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
};

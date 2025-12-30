import React from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, AlertCircle, Clock } from "lucide-react";
import { SmallText } from "@/components/design-system";

interface ReadinessStep {
    label: string;
    status: "completed" | "current" | "pending" | "error" | "warning";
    date?: string;
}

interface ReadinessStripProps {
    steps: ReadinessStep[];
    className?: string;
}

export function ReadinessStrip({ steps, className }: ReadinessStripProps) {
    return (
        <div className={cn("w-full bg-app-bg/80 backdrop-blur-md border-b border-app-border/30", className)}>
            <div className="max-w-[1400px] mx-auto px-12 py-2.5">
                <div className="flex items-center justify-between">
                    {steps.map((step, idx) => (
                        <React.Fragment key={idx}>
                            <div
                                className={cn(
                                    "flex items-center gap-3 transition-all duration-300",
                                    getStatusColor(step.status)
                                )}
                            >
                                <div className="shrink-0">
                                    <StatusIcon status={step.status} />
                                </div>
                                <div className="flex flex-col leading-none">
                                    <SmallText className="font-bold uppercase tracking-[0.15em] text-[10px]">
                                        {step.label}
                                    </SmallText>
                                    {step.date && (
                                        <SmallText className="text-[9px] opacity-60 mt-1 font-medium">
                                            {step.date}
                                        </SmallText>
                                    )}
                                </div>
                            </div>
                            {/* Connector Line (except for last item) */}
                            {idx < steps.length - 1 && (
                                <div className="flex-1 h-[1px] mx-8 bg-app-border/20 relative overflow-hidden">
                                    <div
                                        className={cn(
                                            "absolute inset-0 transition-all duration-1000",
                                            step.status === "completed" ? "bg-app-accent/30" : "bg-transparent"
                                        )}
                                    />
                                </div>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </div>
    );
}

function StatusIcon({ status }: { status: ReadinessStep["status"] }) {
    switch (status) {
        case "completed":
            return <CheckCircle2 className="w-4 h-4" />;
        case "error":
            return <AlertCircle className="w-4 h-4" />;
        case "warning":
            return <Clock className="w-4 h-4" />;
        case "current":
            return (
                <div className="w-4 h-4 rounded-full border border-current flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                </div>
            );
        default:
            return <Circle className="w-4 h-4 opacity-20" />;
    }
}

function getStatusColor(status: ReadinessStep["status"]) {
    switch (status) {
        case "completed":
            return "text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]";
        case "current":
            return "text-app-accent drop-shadow-[0_0_8px_rgba(0,113,227,0.3)]";
        case "error":
            return "text-rose-500";
        case "warning":
            return "text-amber-500";
        default:
            return "text-app-fg/20";
    }
}

"use client";

import { useEffect, useState } from "react";
import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric } from "web-vitals";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label, SmallText } from "@/components/design-system";

interface WebVitalsMetrics {
    CLS: number | null;
    FCP: number | null;
    INP: number | null;
    LCP: number | null;
    TTFB: number | null;
}

interface VitalThresholds {
    good: number;
    needsImprovement: number;
}

const THRESHOLDS: Record<keyof WebVitalsMetrics, VitalThresholds> = {
    CLS: { good: 0.1, needsImprovement: 0.25 },
    FCP: { good: 1800, needsImprovement: 3000 },
    INP: { good: 200, needsImprovement: 500 },
    LCP: { good: 2500, needsImprovement: 4000 },
    TTFB: { good: 800, needsImprovement: 1800 },
};

function getVitalStatus(name: keyof WebVitalsMetrics, value: number): "good" | "needs-improvement" | "poor" {
    const threshold = THRESHOLDS[name];
    if (value <= threshold.good) return "good";
    if (value <= threshold.needsImprovement) return "needs-improvement";
    return "poor";
}

export function WebVitalsReporter() {
    const [metrics, setMetrics] = useState<WebVitalsMetrics>({
        CLS: null,
        FCP: null,
        INP: null,
        LCP: null,
        TTFB: null,
    });
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (process.env.NODE_ENV !== "development") return;

        const handleMetric = (metric: Metric) => {
            setMetrics((prev) => ({
                ...prev,
                [metric.name]: metric.value,
            }));
        };

        onCLS(handleMetric);
        onFCP(handleMetric);
        onINP(handleMetric);
        onLCP(handleMetric);
        onTTFB(handleMetric);

        const timer = setTimeout(() => setIsVisible(true), 2000);
        return () => clearTimeout(timer);
    }, []);

    if (process.env.NODE_ENV !== "development" || !isVisible) return null;
    const hasMetrics = Object.values(metrics).some((v) => v !== null);
    if (!hasMetrics) return null;

    return (
        <div className="web-vitals-panel bg-app-surface/95 backdrop-blur-xl shadow-app-spotlight p-4 fixed bottom-6 right-6 z-[9999] min-w-[260px] rounded-2xl border border-app-border/50 ring-1 ring-app-accent/5">
            <div className="web-vitals-header flex justify-between items-center mb-4">
                <Label className="high-contrast-header text-[10px] m-0 font-black">⚡ System Vitals</Label>
                <button
                    onClick={() => setIsVisible(false)}
                    className="h-6 w-6 flex items-center justify-center rounded-full hover:bg-app-fg/10 text-app-fg/40 transition-colors"
                    aria-label="Close"
                >
                    <X size={14} />
                </button>
            </div>
            <div className="web-vitals-grid grid grid-cols-1 gap-1.5">
                {Object.entries(metrics).map(([name, value]) => {
                    if (value === null) return null;
                    const status = getVitalStatus(name as keyof WebVitalsMetrics, value);
                    const displayValue = name === "CLS" ? value.toFixed(3) : `${Math.round(value)}ms`;

                    return (
                        <div key={name} className={cn("web-vital-item flex items-center justify-between px-3 py-2 rounded-xl transition-all",
                            "bg-app-overlay/5 hover:bg-app-overlay/10 border border-transparent hover:border-app-border/20"
                        )}>
                            <SmallText className="web-vital-name text-[9px] font-black uppercase tracking-widest text-app-fg-muted">{name}</SmallText>
                            <div className="flex items-center gap-2">
                                <SmallText className="web-vital-value text-xs font-mono font-bold text-app-fg">{displayValue}</SmallText>
                                <div className={cn("web-vital-indicator w-1.5 h-1.5 rounded-full",
                                    status === "good" ? "bg-app-status-success animate-pulse" : status === "needs-improvement" ? "bg-app-status-warning" : "bg-app-status-error"
                                )} />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
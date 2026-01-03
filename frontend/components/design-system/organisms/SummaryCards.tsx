"use client";

import React from "react";
import { Title2, Footnote, Caption1, Caption2 } from "../atoms/Typography";
import { Card } from "../atoms/Card";
import { cn } from "@/lib/utils";
import { motion, Variants } from "framer-motion";

/**
 * SummaryCard Organism - Atomic Design System v6.0
 * KPI display component with restored chromatic vibrancy and intentional depth.
 * Composition: Card + Typography + Optional Icon/Trend
 */
export interface SummaryCardProps {
    title: string;
    value: React.ReactNode;
    icon?: React.ReactNode;
    trend?: {
        value: string;
        direction: "up" | "down" | "neutral";
    };
    progress?: number; // 0 to 100
    variant?: "default" | "primary" | "success" | "warning" | "error";
    className?: string;
}

const variantStyles = {
    default: "text-primary bg-surface",
    primary: "text-primary bg-gradient-to-br from-action-primary/10 to-action-primary/5",
    success: "text-primary bg-gradient-to-br from-status-success/15 to-status-success/5",
    warning: "text-primary bg-gradient-to-br from-status-warning/15 to-status-warning/5",
    error: "text-primary bg-gradient-to-br from-status-error/15 to-status-error/5",
};

const iconBackgrounds = {
    default: "bg-surface-variant text-secondary",
    primary: "bg-primary-container text-on-primary-container",
    success: "bg-[rgba(var(--status-success),0.2)] text-[rgb(var(--status-success))]",
    warning: "bg-[rgba(var(--status-warning),0.2)] text-[rgb(var(--status-warning))]",
    error: "bg-[rgba(var(--status-error),0.2)] text-[rgb(var(--status-error))]",
    info: "bg-primary-container text-on-primary-container",
};

const trendColors = {
    up: "text-[rgb(var(--status-success))] bg-[rgba(var(--status-success),0.1)]",
    down: "text-[rgb(var(--status-error))] bg-[rgba(var(--status-error),0.1)]",
    neutral: "text-secondary bg-surface-variant",
};


export const SummaryCard = React.memo(function SummaryCard({
    title,
    value,
    icon,
    trend,
    progress,
    variant = "default",
    className,
}: SummaryCardProps) {
    const iconClass = iconBackgrounds[variant as keyof typeof iconBackgrounds] || iconBackgrounds.default;

    return (
        <div
            className={cn(
                "group relative overflow-hidden rounded-xl shadow-1 transition-all duration-300",
                "bg-surface hover:scale-[1.02] hover:shadow-3 will-change-transform",
                "h-[145px]",
                className
            )}
        >
            {/* Glow Blob - Restored for premium feel */}
            <div className={cn(
                "absolute -right-6 -top-6 w-24 h-24 rounded-full blur-2xl opacity-15 transition-all duration-500 pointer-events-none group-hover:opacity-25",
                variant === 'default' ? "bg-primary/20" : "bg-primary-container"
            )} />

            <div className="p-5 h-full flex flex-col justify-between relative z-10">
                <div className="flex justify-between items-start">
                    <div className="min-w-0 flex-1">
                        <Footnote className="uppercase tracking-wide text-secondary opacity-80 mb-1 block font-medium">
                            {title}
                        </Footnote>
                        <div className={cn("m3-title-medium tracking-tight transition-colors", variantStyles[variant])}>
                            {value}
                        </div>
                    </div>
                    {icon && (
                        <div className={cn(
                            "w-11 h-11 rounded-xl flex items-center justify-center transition-transform duration-500 shrink-0 shadow-1 group-hover:rotate-6 will-change-transform",
                            iconClass
                        )}>
                            {icon}
                        </div>
                    )}
                </div>

                <div className="mt-4 flex items-center justify-between">
                    {progress !== undefined ? (
                        <div className="w-full bg-surface-variant rounded-full h-1.5 overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className={cn(
                                    "h-full rounded-full transition-all",
                                    variant === "default" || variant === "primary" ? "bg-[rgb(var(--action-primary))]" :
                                        variant === "success" ? "bg-[rgb(var(--status-success))]" :
                                            variant === "warning" ? "bg-[rgb(var(--status-warning))]" : "bg-[rgb(var(--status-error))]"
                                )}
                            />
                        </div>
                    ) : trend ? (
                        <div className={cn(
                            "px-1.5 py-0.5 rounded-md m3-label-small tracking-tight flex items-center gap-1",
                            trendColors[trend.direction]
                        )}>
                            <span className="text-[10px]">
                                {trend.direction === "up" ? "↑" : trend.direction === "down" ? "↓" : "•"}
                            </span>
                            <span>{trend.value}</span>
                        </div>
                    ) : null}

                </div>
            </div>
        </div>
    );
});

export interface SummaryCardsProps {
    cards: SummaryCardProps[];
    loading?: boolean;
    className?: string;
}

const container: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.05 },
    },
};

const item: Variants = {
    hidden: { opacity: 0, y: 10 },
    show: {
        opacity: 1,
        y: 0,
        transition: { type: "spring", stiffness: 400, damping: 25 },
    },
};

export const SummaryCards = React.memo(function SummaryCards({
    cards,
    loading,
    className,
}: SummaryCardsProps) {
    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", className)}
        >
            {cards.map((card, index) => (
                <motion.div key={index} variants={item} className="h-full">
                    <SummaryCard {...card} />
                </motion.div>
            ))}
        </motion.div>
    );
});

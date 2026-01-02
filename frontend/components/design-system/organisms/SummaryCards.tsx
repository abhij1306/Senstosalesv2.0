"use client";

import React from "react";
import { H2, SmallText } from "../atoms/Typography";
import { cn } from "@/lib/utils";
import { SummaryCardSkeleton } from "../atoms/Skeleton";
import { motion, Variants } from "framer-motion";

/**
 * SummaryCard Organism - Atomic Design System v1.0
 * Used in dashboard and list pages for KPI display.
 * Standardized to "Apple-level" design with equal heights.
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
    variant?: "default" | "primary" | "success" | "warning" | "secondary" | "error";
    className?: string;
}

const variantTextStyles = {
    default: "text-app-fg",
    primary: "text-app-accent",
    secondary: "text-app-accent",
    success: "text-emerald-500",
    warning: "text-orange-500",
    error: "text-rose-500",
};

const variantIconStyles = {
    default: "bg-app-fg/5 text-app-fg/40",
    primary: "bg-blue-50 dark:bg-blue-900/20 text-blue-500",
    secondary: "bg-app-accent/10 text-app-accent",
    success: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500",
    warning: "bg-orange-50 dark:bg-orange-900/20 text-orange-500",
    error: "bg-rose-50 dark:bg-rose-900/20 text-rose-500",
};

const trendStyles = {
    up: "text-emerald-500",
    down: "text-rose-500",
    neutral: "text-app-fg/40",
};

export const SummaryCard = React.memo(function SummaryCard({
    title,
    value,
    icon,
    trend,
    progress,
    variant = "primary",
    className,
}: SummaryCardProps) {
    return (
        <div className={cn(
            "bg-app-surface/50 backdrop-blur-xl border border-app-border/30 rounded-3xl shadow-sm h-[160px] transition-all duration-300 group",
            "hover:scale-[1.02] hover:shadow-xl hover:shadow-app-accent/5 hover:bg-app-surface/70 hover:border-app-border/50",
            className
        )}>
            <div className="p-6 h-full flex flex-col justify-between">
                <div className="flex justify-between items-start">
                    <div className="min-w-0">
                        <SmallText
                            className={cn(
                                "uppercase tracking-[0.15em] font-bold text-[11px] opacity-60 truncate block mb-1",
                                variant !== "default" ? variantTextStyles[variant] : "text-[var(--app-fg-muted)]"
                            )}
                        >
                            {title}
                        </SmallText>
                        <H2 className={cn("leading-tight font-black tracking-tight text-[28px] whitespace-nowrap truncate", variantTextStyles[variant])}>
                            {value}
                        </H2>
                    </div>
                    {icon && (
                        <div
                            className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shrink-0 ml-3",
                                variantIconStyles[variant]
                            )}
                        >
                            {icon}
                        </div>
                    )}
                </div>

                <div className="mt-auto">
                    {progress !== undefined ? (
                        <div className="w-full bg-app-surface-hover/50 rounded-full h-1.5 overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className={cn(
                                    "h-full rounded-full",
                                    variant === "primary" ? "bg-app-accent" :
                                        variant === "success" ? "bg-emerald-500" :
                                            variant === "warning" ? "bg-orange-500" : "bg-app-accent"
                                )}
                            />
                        </div>
                    ) : trend ? (
                        <div className={cn("text-[12px] font-bold tracking-tight flex items-center gap-1", trendStyles[trend.direction])}>
                            <span className="material-symbols-outlined text-[14px]">
                                {trend.direction === "up" ? "trending_up" : trend.direction === "down" ? "trending_down" : "horizontal_rule"}
                            </span>
                            <span>{trend.value}</span>
                            <span className="text-app-fg-muted/60 font-semibold ml-1">this month</span>
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
        transition: { staggerChildren: 0.03 },
    },
};

const item: Variants = {
    hidden: { opacity: 0, y: -20 },
    show: {
        opacity: 1,
        y: 0,
        transition: { type: "spring", stiffness: 500, damping: 30 },
    },
};

export const SummaryCards = React.memo(function SummaryCards({
    cards,
    loading,
    className,
}: SummaryCardsProps) {
    if (loading) {
        return (
            <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3", className)}>
                {Array.from({ length: 4 }).map((_, i) => (
                    <SummaryCardSkeleton key={i} />
                ))}
            </div>
        );
    }
    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3", className)}
        >
            {cards.map((card, index) => (
                <motion.div key={index} variants={item} className="h-full">
                    <SummaryCard {...card} />
                </motion.div>
            ))}
        </motion.div>
    );
});

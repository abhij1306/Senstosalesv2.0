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
    primary: "bg-app-accent/10 text-app-accent",
    secondary: "bg-app-accent/10 text-app-accent",
    success: "bg-emerald-500/10 text-emerald-500",
    warning: "bg-orange-500/10 text-orange-500",
    error: "bg-rose-500/10 text-rose-500",
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
    variant = "primary",
    className,
}: SummaryCardProps) {
    return (
        <div className={cn("bg-app-surface border border-app-border rounded-xl shadow-sm h-[140px] transition-all duration-300", className)}>
            <div className="p-6 h-full flex flex-col justify-between">
                <div className="flex justify-between items-start">
                    <SmallText
                        className={cn(
                            "uppercase tracking-[0.15em] font-bold text-[10px] opacity-80",
                            variant !== "default" ? variantTextStyles[variant] : "text-[var(--app-fg-muted)]"
                        )}
                    >
                        {title}
                    </SmallText>
                    {icon && (
                        <div
                            className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-300",
                                variantIconStyles[variant]
                            )}
                        >
                            {icon}
                        </div>
                    )}
                </div>
                <div className="mt-auto pt-2">
                    <H2 className={cn("leading-none font-bold tracking-tight mt-1 whitespace-nowrap truncate", variantTextStyles[variant])}>
                        {value}
                    </H2>
                    <div className="h-4 flex items-end mt-1.5">
                        {trend ? (
                            <div className={cn("text-[10px] font-bold uppercase tracking-wider flex items-center gap-1", trendStyles[trend.direction])}>
                                <span>{trend.direction === "up" ? "↑" : trend.direction === "down" ? "↓" : "•"}</span>
                                <span>{trend.value}</span>
                                <span className="text-[var(--app-fg-muted)] font-semibold ml-1">L/M</span>
                            </div>
                        ) : (
                            <div className="text-[10px] opacity-0 pointer-events-none">Spacer</div>
                        )}
                    </div>
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
    hidden: { opacity: 0, y: -20 },
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

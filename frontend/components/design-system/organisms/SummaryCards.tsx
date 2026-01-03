"use client";

import React from "react";
import { H2, SmallText, Caption1, Caption2 } from "../atoms/Typography";
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
    default: "text-text-primary",
    primary: "text-text-primary",
    success: "text-text-primary",
    warning: "text-text-primary",
    error: "text-text-primary",
};

const iconBackgrounds = {
    default: "bg-gradient-to-b from-system-blue/10 to-surface-primary/30 dark:from-surface-primary/10 dark:to-surface-primary/5",
    primary: "bg-gradient-to-b from-[#4facfe] to-[#00f2fe] shadow-system-blue/30", // Blue-Cyan (Morning Briefing)
    success: "bg-gradient-to-b from-[#667eea] to-[#764ba2] shadow-system-indigo/30", // Indigo-Purple (Invoiced Sales)
    warning: "bg-gradient-to-b from-[#a18cd1] to-[#fbc2eb] shadow-system-purple/30", // Purple-Pink (Active Orders)
    error: "bg-gradient-to-b from-[#ff9a9e] to-[#fecfef] shadow-system-red/30", // Red-Pink fallback
    info: "bg-gradient-to-b from-[#00c6fb] to-[#005bea] shadow-system-blue/30", // Cyan-Blue (Purchase Commitment)
};

const glowColors = {
    default: "bg-surface-secondary/30",
    primary: "bg-system-blue/10 group-hover:bg-system-blue/15",
    success: "bg-system-green/10 group-hover:bg-system-green/15",
    warning: "bg-system-yellow/10 group-hover:bg-system-yellow/15",
    error: "bg-system-red/10 group-hover:bg-system-red/15",
    info: "bg-system-blue/10 group-hover:bg-system-blue/15",
};

const trendColors = {
    up: "text-system-green bg-system-green/10",
    down: "text-system-red bg-system-red/10",
    neutral: "text-text-tertiary bg-text-tertiary/10",
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
    // Map 'info' variant properly if needed, effectively using 'primary' or 'info'
    const glowClass = glowColors[variant as keyof typeof glowColors] || glowColors.default;
    const iconClass = iconBackgrounds[variant as keyof typeof iconBackgrounds] || iconBackgrounds.default;

    return (
        <div
            className={cn("tahoe-glass-card h-[145px] group transition-all duration-300 hover:scale-[1.01] hover:elevation-3 relative overflow-hidden will-change-transform", className)}
        >
            {/* Glow Blob - Added from Reference */}
            <div className={cn("absolute -right-6 -top-6 w-24 h-24 rounded-full blur-2xl transition-all duration-500 pointer-events-none will-change-[filter,opacity]", glowClass)} />

            <div className="p-5 h-full flex flex-col justify-between relative z-10">
                <div className="flex justify-between items-start">
                    <div className="min-w-0 flex-1">
                        <Caption1 className="uppercase tracking-wide text-text-tertiary opacity-80 mb-1 block">
                            {title}
                        </Caption1>
                        <div className={cn("text-title-2 tracking-tight transition-colors", variantStyles[variant])}>
                            {value}
                        </div>
                    </div>
                    {icon && (
                        <div className={cn(
                            "w-11 h-11 rounded-xl flex items-center justify-center transition-transform duration-500 shrink-0 elevation-1 group-hover:rotate-6 will-change-transform",
                            iconClass,
                            variant !== 'default' && "text-white"
                        )}>
                            {icon}
                        </div>
                    )}
                </div>

                <div className="mt-4 flex items-center justify-between">
                    {progress !== undefined ? (
                        <div className="w-full bg-surface-secondary/50 dark:bg-surface-secondary/30 rounded-full h-1.5 overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className={cn(
                                    "h-full rounded-full transition-all",
                                    variant === "default" || variant === "primary" ? "bg-system-blue" :
                                        variant === "success" ? "bg-system-green" :
                                            variant === "warning" ? "bg-system-yellow" : "bg-system-red"
                                )}
                            />
                        </div>
                    ) : trend ? (
                        <div className={cn(
                            "px-1.5 py-0.5 rounded-md text-caption-2 tracking-tight flex items-center gap-1 backdrop-blur-sm",
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
            className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5", className)}
        >
            {cards.map((card, index) => (
                <motion.div key={index} variants={item} className="h-full">
                    <SummaryCard {...card} />
                </motion.div>
            ))}
        </motion.div>
    );
});

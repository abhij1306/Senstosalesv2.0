"use client";

import React from "react";
import { H2, SmallText } from "../atoms/Typography";
import { Card } from "../atoms/Card";
import { cn } from "@/lib/utils";
import { SummaryCardSkeleton } from "../atoms/Skeleton";
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
    default: "text-gray-900 dark:text-gray-100",
    primary: "text-primary",
    success: "text-app-success",
    warning: "text-app-warning",
    error: "text-app-error",
};

const iconBackgrounds = {
    default: "bg-gradient-to-b from-gray-100 to-gray-50 dark:from-white/10 dark:to-white/5",
    primary: "bg-gradient-to-b from-[#4facfe] to-[#00f2fe] shadow-blue-400/30", // Blue-Cyan (Morning Briefing)
    success: "bg-gradient-to-b from-[#667eea] to-[#764ba2] shadow-indigo-500/30", // Indigo-Purple (Invoiced Sales)
    warning: "bg-gradient-to-b from-[#a18cd1] to-[#fbc2eb] shadow-purple-500/30", // Purple-Pink (Active Orders)
    error: "bg-gradient-to-b from-[#ff9a9e] to-[#fecfef] shadow-red-400/30", // Red-Pink fallback
    info: "bg-gradient-to-b from-[#00c6fb] to-[#005bea] shadow-cyan-500/30", // Cyan-Blue (Purchase Commitment)
};

const glowColors = {
    default: "bg-gray-500/10",
    primary: "bg-blue-500/10 group-hover:bg-blue-500/20",
    success: "bg-indigo-500/10 group-hover:bg-indigo-500/20",
    warning: "bg-purple-500/10 group-hover:bg-purple-500/20",
    error: "bg-red-500/10 group-hover:bg-red-500/20",
    info: "bg-cyan-500/10 group-hover:bg-cyan-500/20", // Added for mapping
};

const trendColors = {
    up: "text-system-green bg-system-green/10 border-system-green/20",
    down: "text-system-red bg-system-red/10 border-system-red/20",
    neutral: "text-system-gray bg-system-gray/10 border-system-gray/20",
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
            className={cn("tahoe-glass-card h-[145px] group transition-all duration-300 hover:scale-[1.02] relative overflow-hidden", className)}
        >
            {/* Glow Blob - Added from Reference */}
            <div className={cn("absolute -right-6 -top-6 w-24 h-24 rounded-full blur-2xl transition-all duration-500 pointer-events-none", glowClass)} />

            <div className="p-5 h-full flex flex-col justify-between relative z-10">
                <div className="flex justify-between items-start">
                    <div className="min-w-0 flex-1">
                        <SmallText className="uppercase tracking-[0.1em] font-bold text-[11px] text-text-tertiary opacity-80 mb-1.5 block">
                            {title}
                        </SmallText>
                        <div className={cn("text-[26px] font-bold tracking-tight leading-tight transition-colors text-vibrancy", variantStyles[variant])}>
                            {value}
                        </div>
                    </div>
                    {icon && (
                        <div className={cn(
                            "w-12 h-12 rounded-[14px] flex items-center justify-center transition-transform duration-500 shrink-0 shadow-lg ring-1 ring-white/20 group-hover:rotate-6",
                            iconClass,
                            variant !== 'default' && "text-white" // Ensure white icon for colored gradients
                        )}>
                            {icon}
                        </div>
                    )}
                </div>

                <div className="mt-4 flex items-center justify-between">
                    {progress !== undefined ? (
                        <div className="w-full bg-black/5 dark:bg-white/5 rounded-full h-2 overflow-hidden border border-white/20 dark:border-white/5">
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
                            "px-2 py-0.5 rounded-lg text-[11px] font-bold tracking-tight flex items-center gap-1 border backdrop-blur-sm",
                            trendColors[trend.direction]
                        )}>
                            <span className="text-[12px]">
                                {trend.direction === "up" ? "↑" : trend.direction === "down" ? "↓" : "•"}
                            </span>
                            <span>{trend.value}</span>
                        </div>
                    ) : null}

                    <span className="text-[10px] font-bold text-text-tertiary ml-auto uppercase tracking-widest opacity-60">
                        Monthly
                    </span>
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
    if (loading) {
        return (
            <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", className)}>
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
            className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", className)}
        >
            {cards.map((card, index) => (
                <motion.div key={index} variants={item} className="h-full">
                    <SummaryCard {...card} />
                </motion.div>
            ))}
        </motion.div>
    );
});

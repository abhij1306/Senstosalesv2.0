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

const iconColors = {
    default: "text-secondary",
    primary: "text-[rgb(var(--action-primary))]",
    success: "text-[rgb(var(--status-success))]",
    warning: "text-[rgb(var(--status-warning))]",
    error: "text-[rgb(var(--status-error))]",
    info: "text-[rgb(var(--action-primary))]",
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
    const iconColorClass = iconColors[variant as keyof typeof iconColors] || iconColors.default;

    return (
        <div
            className={cn(
                "group relative overflow-hidden rounded-2xl shadow-1 transition-all duration-300",
                "bg-surface hover:shadow-3",
                "h-[140px]", // Reduced height for balanced padding
                className
            )}
        >
            {/* Gradient Mesh / Radial Glow Background */}
            <div className={cn(
                "absolute inset-0 opacity-5 pointer-events-none transition-opacity duration-500 group-hover:opacity-10",
                variant === 'default' ? "bg-[radial-gradient(circle_at_top_right,var(--action-primary-rgb),transparent_70%)]" :
                    `bg-[radial-gradient(circle_at_top_right,var(--${variant === 'primary' ? 'action-primary' : 'status-' + variant}-rgb),transparent_70%)]`
            )} />

            {/* Main Glow Blob */}
            <div className={cn(
                "absolute -right-8 -top-8 w-36 h-36 rounded-full blur-[60px] opacity-10 transition-all duration-700 pointer-events-none group-hover:opacity-30 group-hover:scale-125",
                variant === 'default' ? "bg-action-primary" :
                    variant === 'primary' ? "bg-action-primary" :
                        `bg-status-${variant}`
            )} />

            <div className="p-6 h-full flex flex-col justify-between relative z-10">
                <div className="flex justify-between items-start">
                    <div className={cn(
                        "text-2xl font-semibold tracking-tight transition-colors tabular-nums",
                        variant === 'default' ? "text-text-primary" : "text-text-primary"
                    )}>
                        {value}
                    </div>
                    {icon && (
                        <div className={cn(
                            "w-12 h-12 flex items-center justify-center transition-all duration-500 shrink-0",
                            "group-hover:scale-125 group-hover:rotate-3",
                            iconColorClass
                        )}>
                            {React.cloneElement(icon as React.ReactElement<any>, {
                                size: 28,
                                strokeWidth: 1.5,
                                className: "drop-shadow-sm"
                            })}
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-3">
                    <Caption1 className="uppercase tracking-[0.1em] text-text-tertiary block font-bold text-[10px]">
                        {title}
                    </Caption1>

                    <div className="flex items-center justify-between min-h-[1.5rem]">
                        {progress !== undefined ? (
                            <div className="w-full bg-surface-sunken/50 rounded-full h-1.5 overflow-hidden backdrop-blur-sm">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className={cn(
                                        "h-full rounded-full transition-all",
                                        variant === "default" || variant === "primary" ? "bg-action-primary" :
                                            variant === "success" ? "bg-status-success" :
                                                variant === "warning" ? "bg-status-warning" : "bg-status-error"
                                    )}
                                />
                            </div>
                        ) : trend ? (
                            <div className={cn(
                                "px-2 py-0.5 rounded-full text-[10px] font-bold tracking-tight flex items-center gap-1 shadow-sm",
                                trendColors[trend.direction]
                            )}>
                                <span className="text-[12px]">
                                    {trend.direction === "up" ? "↑" : trend.direction === "down" ? "↓" : "•"}
                                </span>
                                <span>{trend.value}</span>
                            </div>
                        ) : null}
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
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { duration: 0.4, ease: "easeOut" },
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

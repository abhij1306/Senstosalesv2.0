"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Body, SmallText } from "../atoms/Typography";
import { motion } from "framer-motion";

export interface NavigationCardProps {
    title: string;
    description?: string;
    icon?: React.ReactNode;
    active?: boolean;
    onClick?: () => void;
    className?: string;
}

export const NavigationCard = ({
    title,
    description,
    icon,
    active,
    onClick,
    className,
}: NavigationCardProps) => {
    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={cn(
                "relative flex flex-col items-start p-5 rounded-2xl transition-all duration-300 text-left overflow-hidden",
                "bg-[var(--color-sys-bg-surface)]/40 backdrop-blur-md shadow-sm hover:shadow-lg",
                active
                    ? "bg-[var(--color-sys-brand-primary)]/10 shadow-[inner_0_2px_4px_rgba(0,0,0,0.02)]"
                    : "hover:bg-[var(--color-sys-bg-surface)]/60",
                className
            )}
        >
            {/* Decorative accent for active state */}
            {active && (
                <div className="absolute top-0 right-0 w-16 h-16 -mr-8 -mt-8 bg-[var(--color-sys-brand-primary)]/10 rounded-full blur-2xl" />
            )}

            {icon && (
                <div
                    className={cn(
                        "p-2.5 rounded-xl mb-3 transition-colors",
                        active ? "bg-[var(--color-sys-brand-primary)] text-white shadow-md shadow-[var(--color-sys-brand-primary)]/20" : "bg-[var(--color-sys-bg-surface)] text-[var(--color-sys-text-tertiary)] shadow-sm"
                    )}
                >
                    {React.isValidElement(icon) ? React.cloneElement(icon as any, { size: 20 }) : icon}
                </div>
            )}

            <Body className={cn("font-bold tracking-tight", active ? "text-[var(--color-sys-brand-primary)]" : "text-[var(--color-sys-text-primary)]")}>
                {title}
            </Body>

            {description && (
                <SmallText className={cn("mt-1.5 line-clamp-2", active ? "text-[var(--color-sys-text-secondary)]" : "text-[var(--color-sys-text-tertiary)]")}>
                    {description}
                </SmallText>
            )}

            {/* Underline indicator for active state */}
            {active && (
                <motion.div
                    layoutId="nav-active-indicator"
                    className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--color-sys-brand-primary)]"
                />
            )}
        </motion.button>
    );
};

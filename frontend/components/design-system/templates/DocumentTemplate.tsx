"use client";
import React from "react";
import { Title1, Caption1 } from "../atoms/Typography";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import { Button } from "../atoms/Button";
import { motion } from "framer-motion";

interface DocumentTemplateProps {
    title: string;
    description?: React.ReactNode;
    actions?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
    onBack?: () => void;
    layoutId?: string;
    icon?: React.ReactNode;
    iconLayoutId?: string;
}

export const DocumentTemplate = ({
    title,
    description,
    actions,
    children,
    className,
    onBack,
    layoutId,
    icon,
    iconLayoutId,
}: DocumentTemplateProps) => {
    return (
        <div className={cn("w-full will-change-[transform,opacity]", className)}>
            {/* Header Area - Glassmorphic if sticky needed, otherwise transparent */}
            <div className="flex items-center justify-between mb-8 mt-2">
                <div className="flex items-center gap-5">
                    {onBack && (
                        <Button
                            variant="glass"
                            size="compact"
                            onClick={onBack}
                            className="h-10 w-10 p-0 rounded-full transition-transform hover:scale-105 active:scale-95"
                        >
                            <ArrowLeft size={18} className="text-text-secondary" />
                        </Button>
                    )}
                    {icon && (
                        <motion.div
                            layoutId={iconLayoutId}
                            className="w-12 h-12 rounded-[14px] bg-white/40 dark:bg-white/5 border border-white/60 dark:border-white/10 shadow-sm flex items-center justify-center text-system-blue backdrop-blur-md"
                        >
                            {icon}
                        </motion.div>
                    )}
                    <div className="space-y-0.5">
                        <motion.div layoutId={layoutId}>
                            <Title1 className="text-text-primary">
                                {title}
                            </Title1>
                        </motion.div>
                        {description && (
                            <Caption1 className="text-text-secondary">
                                {description}
                            </Caption1>
                        )}
                    </div>
                </div>
                {actions && <div className="flex items-center gap-3">{actions}</div>}
            </div>

            {/* Content Area */}
            <div className="w-full">
                {children}
            </div>
        </div>
    );
};

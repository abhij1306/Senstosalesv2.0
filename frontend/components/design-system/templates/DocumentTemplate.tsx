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
        <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className={cn("w-full will-change-[transform,opacity]", className)}
        >
            {/* Header Area - Glassmorphic if sticky needed, otherwise transparent */}
            <div className="flex items-center justify-between mb-4 mt-1">
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
                            className="w-12 h-12 rounded-2xl bg-surface shadow-2 flex items-center justify-center text-system-blue transition-smooth"
                        >
                            {icon}
                        </motion.div>
                    )}
                    <div className="space-y-0.5">
                        <motion.div layoutId={layoutId}>
                            <Title1 className="text-text-primary font-medium tracking-tight">
                                {title}
                            </Title1>
                        </motion.div>
                        {description && (
                            <Caption1 className="text-text-secondary opacity-70">
                                {description}
                            </Caption1>
                        )}
                    </div>
                </div>
                {actions && <div className="flex items-center gap-3">{actions}</div>}
            </div>

            {/* Content Area - Clean separation */}
            <div className="w-full">
                {children}
            </div>
        </motion.div>
    );
};

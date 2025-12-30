"use client";
import React from "react";
import { H1 } from "../atoms/Typography";
import { cn } from "@/lib/utils"; import { ArrowLeft } from "lucide-react";
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
        <div className={cn("space-y-4 will-change-[transform,opacity] min-h-screen", className)}>
            {/* Compact Header - Translucent Glass */}
            <div className="glass-header flex items-center justify-between px-6 py-4 mb-2 min-h-[64px]">
                <div className="flex items-center gap-4">
                    {onBack && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onBack}
                            className="h-8 w-8 p-0 rounded-full text-[var(--app-fg-muted)] hover:text-[var(--app-fg)] hover:bg-[var(--bg-overlay)]"
                        >
                            <ArrowLeft size={16} />
                        </Button>
                    )}
                    {icon && (
                        <motion.div layoutId={iconLayoutId} className="flex items-center justify-center text-[var(--accent)]">
                            {icon}
                        </motion.div>
                    )}
                    <div>
                        {layoutId ? (
                            <motion.div layoutId={layoutId}>
                                <H1 className="tracking-tight text-[var(--app-fg)] text-2xl font-bold">
                                    {title}
                                </H1>
                            </motion.div>
                        ) : (
                            <H1 className="tracking-tight text-[var(--app-fg)] text-2xl font-bold">
                                {title}
                            </H1>
                        )}
                        {description && (
                            <div className="text-[10px] font-semibold uppercase tracking-widest text-[var(--app-fg-muted)] mt-0.5">
                                {description}
                            </div>
                        )}
                    </div>
                </div>
                {actions && <div className="flex gap-2">{actions}</div>}
            </div>
            {/* Content Area - Standardized Padding */}
            <div className="px-6 pb-12">{children}</div>
        </div>
    );
};

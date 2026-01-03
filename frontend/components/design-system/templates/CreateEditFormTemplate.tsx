"use client";
import React from "react";
import { Title1, Title2, Body } from "../atoms/Typography";
import { Button } from "../atoms/Button";
import { ActionButtonGroup, Action } from "../molecules/ActionButtonGroup";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * CreateEditFormTemplate - Atomic Design System v1.0
 * Standard layout for create/edit pages
 * Layout: Breadcrumbs → Heading → Form Sections → Action Buttons
 */
export interface BreadcrumbItem {
    label: string;
    href?: string;
    onClick?: () => void;
}

export interface FormSection {
    title: string;
    description?: string;
    content: React.ReactNode;
}

export interface CreateEditFormTemplateProps {
    // Navigation
    breadcrumbs?: BreadcrumbItem[];
    // Header
    title: string;
    subtitle?: string;
    // Form sections
    sections: FormSection[];
    // Actions
    primaryAction: Action;
    secondaryActions?: Action[];
    // State
    loading?: boolean;
    className?: string;
}

export const CreateEditFormTemplate: React.FC<CreateEditFormTemplateProps> = ({
    breadcrumbs,
    title,
    subtitle,
    sections,
    primaryAction,
    secondaryActions = [],
    loading = false,
    className,
}) => {
    return (
        <div className={cn("max-w-5xl mx-auto space-y-6", className)}>
            {/* Breadcrumbs */}
            {breadcrumbs && breadcrumbs.length > 0 && (
                <nav className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-widest">
                    {breadcrumbs.map((crumb, index) => (
                        <React.Fragment key={index}>
                            {crumb.href ? (
                                <a
                                    href={crumb.href}
                                    className="text-app-fg-muted hover:text-app-accent transition-colors"
                                >
                                    {crumb.label}
                                </a>
                            ) : crumb.onClick ? (
                                <button
                                    onClick={crumb.onClick}
                                    className="text-app-fg-muted hover:text-app-accent transition-colors"
                                >
                                    {crumb.label}
                                </button>
                            ) : (
                                <span className="text-app-fg">
                                    {crumb.label}
                                </span>
                            )}
                            {index < breadcrumbs.length - 1 && (
                                <ChevronRight size={12} className="text-app-fg-muted/40" />
                            )}
                        </React.Fragment>
                    ))}
                </nav>
            )}

            {/* Page Header */}
            <div className="space-y-2 pb-6 border-b border-app-border">
                <Title1 className="text-app-fg tracking-tight">{title}</Title1>
                {subtitle && <Body className="text-app-fg-muted font-bold tracking-tight">{subtitle}</Body>}
            </div>

            {/* Form Sections */}
            <div className="space-y-8">
                {sections.map((section, index) => (
                    <div key={index} className="space-y-4">
                        <div className="space-y-1">
                            <Title2 className="text-app-fg uppercase tracking-tight">{section.title}</Title2>
                            {section.description && (
                                <Body className="text-app-fg-muted font-bold">{section.description}</Body>
                            )}
                        </div>
                        <div className="bg-app-surface/30 backdrop-blur-sm rounded-2xl border border-app-border/30 p-8 shadow-sm">
                            {section.content}
                        </div>
                    </div>
                ))}
            </div>

            {/* Action Buttons */}
            <div className="sticky bottom-0 bg-app-overlay/80 backdrop-blur-xl border-t border-app-border/40 px-6 py-5 -mx-6 flex items-center justify-between gap-4 z-20">
                <div className="flex items-center gap-3">
                    {secondaryActions.length > 0 && (
                        <ActionButtonGroup actions={secondaryActions} align="left" />
                    )}
                </div>
                <Button
                    variant={primaryAction.variant || "primary"}
                    onClick={primaryAction.onClick}
                    disabled={primaryAction.disabled || loading}
                    className="min-w-32"
                >
                    {primaryAction.icon}
                    {primaryAction.label}
                </Button>
            </div>
        </div>
    );
};

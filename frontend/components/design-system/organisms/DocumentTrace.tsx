"use client";

import React from "react";
import { Card } from "../atoms/Card";
import { H3, Body, SmallText } from "../atoms/Typography";
import { Badge } from "../atoms/Badge";
import { ArrowRight, FileText, Truck, Receipt } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * DocumentTrace Organism - Atomic Design System v1.0
 * Shows PO → DC → Invoice linkage hierarchy
 * Must display real document numbers and statuses
 */

export interface DocumentNode {
    type: "po" | "dc" | "invoice";
    number: string;
    date: string;
    status: "pending" | "completed" | "active";
    link?: string;
}

export interface DocumentTraceProps {
    documents: DocumentNode[];
    className?: string;
}

const documentConfig = {
    po: {
        icon: FileText,
        label: "Purchase Order",
        color: "text-app-accent",
        bgColor: "bg-app-accent/10",
    },
    dc: {
        icon: Truck,
        label: "Delivery Challan",
        color: "text-app-status-success",
        bgColor: "bg-app-status-success/10",
    },
    invoice: {
        icon: Receipt,
        label: "GST Invoice",
        color: "text-app-status-warning",
        bgColor: "bg-app-status-warning/10",
    },
};

const DocumentNodeComponent: React.FC<{ node: DocumentNode; isLast: boolean }> = ({
    node,
    isLast,
}) => {
    const config = documentConfig[node.type];
    const Icon = config.icon;

    const content = (
        <div
            className={cn(
                "flex items-center gap-3 p-4 rounded-xl border-2 transition-all",
                node.link
                    ? "cursor-pointer border-app-border/30 hover:border-app-accent hover:shadow-lg hover:shadow-app-accent/5 bg-app-surface/50 backdrop-blur-sm"
                    : "border-app-border bg-app-surface/30"
            )}
        >
            <div className={cn("p-2 rounded", config.bgColor)}>
                <Icon size={20} className={config.color} />
            </div>
            <div className="flex-1 min-w-0">
                <SmallText className="uppercase mb-0.5 text-app-fg-muted/60 font-black tracking-widest">{config.label}</SmallText>
                <div className="font-bold text-app-fg tracking-tight">{node.number}</div>
                <div className="text-[11px] text-app-fg-muted/80 font-bold mt-0.5">{node.date}</div>
            </div>
            <Badge
                variant={
                    node.status === "completed"
                        ? "success"
                        : node.status === "active"
                            ? "default"
                            : "warning"
                }
            >
                {node.status}
            </Badge>
        </div>
    );

    return (
        <div className="flex items-center gap-4">
            {node.link ? (
                <a href={node.link} className="flex-1">
                    {content}
                </a>
            ) : (
                <div className="flex-1">{content}</div>
            )}
            {!isLast && <ArrowRight size={20} className="text-app-fg-muted/30 shrink-0" />}
        </div>
    );
};

export const DocumentTrace: React.FC<DocumentTraceProps> = ({
    documents,
    className,
}) => {
    return (
        <Card className={cn("p-6 bg-app-surface/40 backdrop-blur-md border-app-border/30", className)}>
            <H3 className="mb-2 text-app-fg uppercase tracking-tight">Document Traceability</H3>
            <Body className="text-app-fg-muted mb-6 font-medium">
                Track the complete document flow from purchase order to invoice
            </Body>
            <div className="flex items-center gap-4 overflow-x-auto pb-2">
                {documents.map((doc, index) => (
                    <DocumentNodeComponent
                        key={index}
                        node={doc}
                        isLast={index === documents.length - 1}
                    />
                ))}
            </div>
        </Card>
    );
};

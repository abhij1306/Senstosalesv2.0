"use client";

import React from "react";
import { Card } from "@/components/design-system/atoms/Card";
import { Badge } from "@/components/design-system/atoms/Badge";
import { Title3 } from "@/components/design-system/atoms/Typography";
import { cn } from "@/lib/utils";

export interface StatusCardProps {
    title?: string;
    status?: string;
    variant?: "default" | "success" | "warning" | "error";
    children: React.ReactNode;
    className?: string;
    showBadge?: boolean;
}

export function StatusCard({
    title,
    status,
    variant = "default",
    children,
    className,
    showBadge = false,
}: StatusCardProps) {
    return (
        <Card className={cn("p-6", className)}>
            {(title || status) && (
                <div className="flex items-center justify-between mb-4">
                    {title && <Title3>{title}</Title3>}
                    {status && showBadge && <Badge variant={variant}>{status}</Badge>}
                </div>
            )}
            {children}
        </Card>
    );
}
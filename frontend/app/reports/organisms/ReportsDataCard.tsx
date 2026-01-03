"use client";

import React from "react";
import { Title3, SmallText, Footnote } from "@/components/design-system/atoms/Typography";
import { Stack, Flex } from "@/components/design-system/atoms/Layout";
import { cn } from "@/lib/utils";

interface ReportsDataCardProps {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
    actions?: React.ReactNode;
    className?: string;
}

export const ReportsDataCard = ({
    title,
    subtitle,
    children,
    actions,
    className,
}: ReportsDataCardProps) => {
    return (
        <div className={cn("tahoe-glass-card shadow-lg p-6 space-y-6", className)}>
            <Flex justify="between" align="center">
                <Stack gap={1}>
                    <Title3 className="m-0 text-app-accent font-bold tracking-tight uppercase leading-none text-sm">
                        {title}
                    </Title3>
                    {subtitle && (
                        <Footnote className="text-app-fg-muted font-medium opacity-60 uppercase tracking-wide">
                            {subtitle}
                        </Footnote>
                    )}
                </Stack>
                {actions && <Flex gap={2}>{actions}</Flex>}
            </Flex>
            <div className="w-full relative mt-2">
                {children}
            </div>
        </div>
    );
};

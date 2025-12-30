"use client";

import React from "react";
import { H3, SmallText } from "../atoms/Typography";
import { Stack, Flex } from "../atoms/Layout";
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
        <div className={cn("bg-app-surface border border-app-border rounded-xl shadow-sm p-6 space-y-6", className)}>
            <Flex justify="between" align="start">
                <Stack gap={1}>
                    <H3 className="m-0 text-app-accent font-bold tracking-tight uppercase leading-none">
                        {title}
                    </H3>
                    {subtitle && (
                        <SmallText className="text-app-fg-muted font-medium opacity-70">
                            {subtitle}
                        </SmallText>
                    )}
                </Stack>
                {actions && <Flex gap={2}>{actions}</Flex>}
            </Flex>
            <div className="w-full relative">
                {children}
            </div>
        </div>
    );
};

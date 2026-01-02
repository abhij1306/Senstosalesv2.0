"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Body, Caption1 } from "../atoms/Typography";
import { Card } from "../atoms/Card";
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
        <Card
            asChild
            variant={active ? "flat" : "default"}
            padding="md"
            className={cn(
                "relative flex flex-col items-start text-left cursor-pointer group",
                active ? "border-blue-200 ring-1 ring-blue-200 bg-blue-50" : "hover:bg-blue-50/50",
                className
            )}
            onClick={onClick}
        >
            <motion.div whileTap={{ scale: 0.98 }}>
                {icon && (
                    <div
                        className={cn(
                            "p-2.5 rounded-xl mb-3 transition-colors",
                            active ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" : "bg-blue-100/50 text-blue-700"
                        )}
                    >
                        {React.isValidElement(icon) ? React.cloneElement(icon as any, { size: 20 }) : icon}
                    </div>
                )}

                <Body className={cn("font-medium", active ? "text-blue-700" : "text-slate-700")}>
                    {title}
                </Body>

                {description && (
                    <Caption1 className="mt-1.5 line-clamp-2 text-slate-500">
                        {description}
                    </Caption1>
                )}
            </motion.div>
        </Card>
    );
};

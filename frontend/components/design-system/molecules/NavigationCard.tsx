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
            variant={active ? "glass" : "elevated"}
            padding="md"
            className={cn(
                "relative flex flex-col items-start text-left cursor-pointer group",
                active ? "border-app-accent/30 ring-1 ring-app-accent/30 bg-surface-secondary" : "hover:bg-surface-secondary/50",
                className
            )}
            onClick={onClick}
        >
            <motion.div whileTap={{ scale: 0.98 }}>
                {icon && (
                    <div
                        className={cn(
                            "p-2.5 rounded-xl mb-3 transition-colors",
                            active ? "bg-app-accent text-white shadow-md shadow-app-accent/20" : "bg-surface-secondary text-app-accent"
                        )}
                    >
                        {React.isValidElement(icon) ? React.cloneElement(icon as any, { size: 20 }) : icon}
                    </div>
                )}

                <Body className={cn("font-medium", active ? "text-app-accent" : "text-text-primary")}>
                    {title}
                </Body>

                {description && (
                    <Caption1 className="mt-1.5 line-clamp-2 text-text-secondary">
                        {description}
                    </Caption1>
                )}
            </motion.div>
        </Card>
    );
};

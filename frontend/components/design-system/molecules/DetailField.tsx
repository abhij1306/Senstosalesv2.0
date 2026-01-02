"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { SmallText } from "../atoms/Typography";

interface DetailFieldProps {
    label: string;
    value: string | number | null | undefined;
    icon?: React.ReactNode;
    className?: string;
}

export const DetailField = ({ label, value, icon, className }: DetailFieldProps) => (
    <div className={cn("space-y-1 group transition-all duration-300", className)}>
        <div className="flex items-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
            {icon && <div className="text-app-accent">{icon}</div>}
            <SmallText className="text-[9px] font-semibold uppercase tracking-widest m-0 leading-none">
                {label}
            </SmallText>
        </div>
        <div className="font-medium text-app-fg tracking-tight leading-snug break-words">
            {value || (
                <span className="text-app-fg-muted font-normal italic uppercase tracking-tighter opacity-50">
                    Empty
                </span>
            )}
        </div>
    </div>
);

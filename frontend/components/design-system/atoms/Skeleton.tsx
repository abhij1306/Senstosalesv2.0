"use client";

import React from "react";
import { cn } from "@/lib/utils";

export type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

export function Skeleton({ className, ...props }: SkeletonProps) {
    return (
        <div
            className={cn("animate-pulse rounded-md bg-app-fg/5", className)}
            {...props}
        />
    );
}

export function SummaryCardSkeleton() {
    return (
        <div className="surface-card h-[140px] animate-pulse">
            <div className="p-6 h-full flex flex-col justify-between">
                <div className="flex justify-between items-start">
                    <div className="space-y-3">
                        <div className="h-2 w-16 bg-app-fg/10 rounded-full" />
                    </div>
                    <div className="h-10 w-10 bg-app-fg/10 rounded-xl" />
                </div>
                <div className="mt-auto pt-2">
                    <div className="h-7 w-28 bg-app-fg/10 rounded-lg" />
                    <div className="h-3 w-32 bg-app-fg/5 rounded-full mt-3" />
                </div>
            </div>
        </div>
    );
}

export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
    return (
        <div className="flex items-center space-x-4 py-4 px-4 border-b border-app-border/10 animate-pulse bg-app-surface/50">
            {Array.from({ length: columns }).map((_, i) => (
                <div
                    key={i}
                    className={cn(
                        "h-3 bg-app-fg/5 rounded-full",
                        i === 0 ? "w-1/4" : "flex-1"
                    )}
                />
            ))}
        </div>
    );
}

"use client";
import React from "react";
// import { motion } from"framer-motion";
export default function Loading() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Skeleton */}
            <div className="flex flex-col gap-2">
                <div className="h-8 w-64 bg-app-overlay/20 rounded-xl animate-pulse" />
                <div className="h-4 w-96 bg-app-overlay/10 rounded-lg animate-pulse" />
            </div>

            {/* KPI Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-32 rounded-3xl bg-app-surface border border-app-border/10 shadow-sm p-6 space-y-4">
                        <div className="flex justify-between items-start">
                            <div className="h-4 w-24 bg-app-overlay/20 rounded-md" />
                            <div className="h-10 w-10 rounded-2xl bg-app-overlay/10" />
                        </div>
                        <div className="h-8 w-32 bg-app-overlay/30 rounded-lg" />
                    </div>
                ))}
            </div>

            {/* Table Skeleton */}
            <div className="space-y-4">
                <div className="h-10 w-full bg-app-overlay/10 rounded-2xl" />
                <div className="rounded-3xl border border-app-border/10 overflow-hidden">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-16 w-full border-b border-app-border/5 bg-app-surface/50 p-4 flex items-center gap-4">
                            <div className="h-4 w-8 bg-app-overlay/10 rounded-md" />
                            <div className="h-4 w-1/4 bg-app-overlay/20 rounded-md" />
                            <div className="h-4 w-1/4 bg-app-overlay/10 rounded-md" />
                            <div className="h-4 w-1/4 bg-app-overlay/10 rounded-md ml-auto" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
"use client";

import React from "react";
import { cn } from "@/lib/utils";

export const DetailSkeleton = () => {
    return (
        <div className="mx-auto max-w-[1400px] w-full space-y-6 animate-pulse">
            {/* Standardized Header Section */}
            <div className="flex items-center justify-between px-6 py-4 mb-2 min-h-[64px] border border-app-border rounded-2xl bg-app-surface shadow-sm">
                <div className="flex items-center gap-4">
                    {/* Back Button */}
                    <div className="h-9 w-9 rounded-full bg-app-bg" />
                    {/* Title */}
                    <div className="space-y-2">
                        <div className="h-7 w-48 bg-app-bg rounded-lg" />
                        <div className="h-4 w-32 bg-app-bg/50 rounded-md" />
                    </div>
                </div>
                {/* Actions */}
                <div className="flex gap-2">
                    <div className="h-10 w-28 bg-app-bg rounded-xl" />
                    <div className="h-10 w-28 bg-app-bg rounded-xl" />
                </div>
            </div>

            {/* Document Journey Bar (Fixed Height) */}
            <div className="w-full h-[54px] bg-app-surface border border-app-border rounded-full" />

            {/* Tabs + Content Card */}
            <div className="space-y-4">
                {/* Tabs */}
                <div className="flex gap-2 pb-px ml-4">
                    <div className="h-10 w-28 bg-app-surface-raised rounded-t-xl" />
                    <div className="h-10 w-28 bg-app-surface-raised/50 rounded-t-xl" />
                    <div className="h-10 w-28 bg-app-surface-raised/50 rounded-t-xl" />
                </div>

                {/* Main Content Card */}
                <div className="h-[280px] w-full bg-app-surface border border-app-border rounded-3xl p-7">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="space-y-3">
                                <div className="h-3 w-24 bg-app-bg rounded-full" />
                                <div className="h-10 w-full bg-app-bg/50 rounded-xl" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Table Area */}
            <div className="h-[320px] w-full bg-app-surface border border-app-border rounded-3xl mt-4" />
        </div>
    );
};


import React from "react";
import { Card } from "../../atoms/Card";

export function CreateDCSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Header Area */}
            <div className="flex items-center justify-between mb-6">
                <div className="space-y-2">
                    <div className="h-8 w-48 bg-slate-200/20 rounded-lg" />
                    <div className="h-4 w-64 bg-slate-200/10 rounded-lg" />
                </div>
                <div className="flex gap-2">
                    <div className="h-9 w-20 bg-slate-200/20 rounded-full" />
                    <div className="h-9 w-32 bg-slate-200/20 rounded-full" />
                </div>
            </div>

            {/* Document Journey Placeholder */}
            <div className="h-16 w-full bg-slate-200/5 rounded-xl mb-6" />

            {/* PO Selection Card */}
            <Card className="p-6 h-[140px] border-slate-200/10">
                <div className="h-4 w-40 bg-slate-200/20 rounded mb-4" />
                <div className="flex gap-3">
                    <div className="flex-1 h-10 bg-slate-200/10 rounded-lg" />
                    <div className="w-32 h-10 bg-slate-200/10 rounded-lg" />
                </div>
            </Card>

            {/* Challan Info Grid */}
            <Card className="surface-claymorphic p-6 h-[320px]">
                <div className="h-5 w-48 bg-slate-200/20 rounded mb-6" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="space-y-2">
                            <div className="h-3 w-24 bg-slate-200/10 rounded" />
                            <div className="h-10 w-full bg-slate-200/5 rounded-lg border border-white/5" />
                        </div>
                    ))}
                </div>
            </Card>

            {/* Items Table Placeholder */}
            <Card className="surface-claymorphic p-0 overflow-hidden h-[300px]">
                <div className="px-6 py-4 border-b border-white/5">
                    <div className="h-5 w-32 bg-slate-200/20 rounded" />
                </div>
                <div className="p-6 space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center justify-between gap-4">
                            <div className="h-4 w-16 bg-slate-200/10 rounded" />
                            <div className="h-4 flex-1 bg-slate-200/10 rounded" />
                            <div className="h-4 w-20 bg-slate-200/10 rounded" />
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}

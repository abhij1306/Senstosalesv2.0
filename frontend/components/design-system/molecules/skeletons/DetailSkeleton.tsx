export const DetailSkeleton = () => {
    return (
        <div className="mx-auto max-w-[1400px] w-full space-y-6 animate-pulse">
            {/* Standardized Header Section */}
            <div className="glass-header flex items-center justify-between px-6 py-4 mb-2 min-h-[64px] border border-[var(--border-subtle)] rounded-xl bg-[var(--bg-surface)]">
                <div className="flex items-center gap-4">
                    {/* Back Button */}
                    <div className="h-8 w-8 rounded-full bg-[var(--bg-base)]" />
                    {/* Title */}
                    <div className="space-y-2">
                        <div className="h-7 w-48 bg-[var(--bg-base)] rounded-md" />
                        <div className="h-4 w-32 bg-[var(--bg-base)]/50 rounded-sm" />
                    </div>
                </div>
                {/* Actions */}
                <div className="flex gap-2">
                    <div className="h-9 w-24 bg-[var(--bg-base)] rounded-md" />
                    <div className="h-9 w-24 bg-[var(--bg-base)] rounded-md" />
                </div>
            </div>

            {/* Document Journey Bar (Fixed Height) */}
            <div className="w-full h-[50px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-full" />

            {/* Tabs + Content Card (Large height to prevent CLS) */}
            <div className="space-y-4">
                {/* Tabs */}
                <div className="flex gap-2 pb-px">
                    <div className="h-9 w-24 bg-[var(--bg-surface-elevated)] rounded-t-lg" />
                    <div className="h-9 w-24 bg-[var(--bg-surface-elevated)]/50 rounded-t-lg" />
                    <div className="h-9 w-24 bg-[var(--bg-surface-elevated)]/50 rounded-t-lg" />
                </div>

                {/* Main Form/Content Card - STRICT HEIGHT ENFORCEMENT */}
                <div className="h-[280px] w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="space-y-2">
                                <div className="h-3 w-20 bg-[var(--bg-base)] rounded" />
                                <div className="h-8 w-full bg-[var(--bg-base)]/50 rounded-md" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Table Area */}
            <div className="h-[300px] w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl mt-4" />
        </div>
    );
};

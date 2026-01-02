export default function Loading() {
    return (
        <div className="space-y-8 p-8">
            {/* Header skeleton */}
            <div className="flex items-end justify-between">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-app-accent rounded-full" />
                        <div className="h-8 w-48 bg-app-overlay animate-pulse rounded-lg" />
                    </div>
                    <div className="h-4 w-64 bg-app-overlay/60 animate-pulse rounded-lg mt-2" />
                </div>
            </div>

            {/* Tabs skeleton */}
            <div className="flex gap-6 border-b border-app-border">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-10 w-24 bg-app-overlay animate-pulse rounded-t-lg" />
                ))}
            </div>

            {/* KPI Cards skeleton */}
            <div className="grid grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className="h-28 bg-app-surface/50 animate-pulse rounded-2xl border border-app-border/30"
                    />
                ))}
            </div>

            {/* Table skeleton */}
            <div className="bg-app-surface/30 rounded-3xl border border-app-border/30 p-8">
                <div className="h-10 bg-app-overlay animate-pulse rounded-xl mb-6" />
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div
                            key={i}
                            className="h-14 bg-app-overlay animate-pulse rounded-xl"
                            style={{ animationDelay: `${i * 50}ms` }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

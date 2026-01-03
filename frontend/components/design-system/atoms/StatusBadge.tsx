import { cn } from '@/lib/utils';

type Status = 'draft' | 'pending' | 'delivered' | 'closed' | 'active' | 'cancelled';

interface StatusBadgeProps {
    status: Status;
    className?: string;
}

const statusConfig: Record<Status, { label: string; color: string }> = {
    draft: {
        label: 'DRAFT',
        color: 'bg-slate-500/10 text-slate-600'
    },
    pending: {
        label: 'PENDING',
        color: 'bg-amber-500/10 text-amber-600'
    },
    delivered: {
        label: 'DELIVERED',
        color: 'bg-blue-500/10 text-blue-600'
    },
    closed: {
        label: 'CLOSED',
        color: 'bg-green-500/10 text-green-600'
    },
    active: {
        label: 'ACTIVE',
        color: 'bg-green-500/10 text-green-600'
    },
    cancelled: {
        label: 'CANCELLED',
        color: 'bg-red-500/10 text-red-600'
    },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
    // Normalize status or fallback to 'draft'
    const normalizedStatus = (status || 'draft').toLowerCase() as Status;
    const config = statusConfig[normalizedStatus] || statusConfig['pending']; // Safer fallback

    // Safety check in case fallback fails (unlikely due to strict typing but good for runtime)
    if (!config) return null;

    return (
        <span
            className={cn(
                'inline-flex items-center',
                'px-2.5 py-1', // Slightly wider padding
                'rounded-full', // Full pill shape
                'text-[11px] font-medium uppercase tracking-wide', // Clean typography
                config.color,
                className
            )}
        >
            {config.label}
        </span>
    );
}

import { cn } from '@/lib/utils';

type Status = 'draft' | 'pending' | 'delivered' | 'closed' | 'active' | 'cancelled';

interface StatusBadgeProps {
    status: Status;
    className?: string;
}

const statusConfig: Record<Status, { label: string; color: string }> = {
    draft: {
        label: 'Draft',
        color: 'bg-secondary-container text-on-secondary-container'
    },
    pending: {
        label: 'Pending',
        color: 'bg-[rgba(var(--status-warning),0.2)] text-[rgb(var(--status-warning))]'
    },
    delivered: {
        label: 'Delivered',
        color: 'bg-[rgba(var(--status-info),0.2)] text-[rgb(var(--status-info))]'
    },
    closed: {
        label: 'Closed',
        color: 'bg-[rgba(var(--status-success),0.2)] text-[rgb(var(--status-success))]'
    },
    active: {
        label: 'Active',
        color: 'bg-[rgba(var(--status-success),0.2)] text-[rgb(var(--status-success))]'
    },
    cancelled: {
        label: 'Cancelled',
        color: 'bg-[rgba(var(--status-error),0.2)] text-[rgb(var(--status-error))]'
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
                'px-2 py-1', // Compact - 8px/4px
                'rounded-[var(--radius-xs)]',
                'type-caption-1', // 12px uppercase
                config.color, // Safe access
                className
            )}
        >
            {config.label}
        </span>
    );
}

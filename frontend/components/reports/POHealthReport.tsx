
import {
    H3,
    H4,
    Body,
    SmallText,
    Label,
    Accounting,
} from "@/components/design-system/atoms/Typography";
import { cn } from "@/lib/utils";

interface POHealthData {
    period: string;
    summary: {
        total_pos: number;
        not_started: number;
        partially_dispatched: number;
        fully_dispatched: number;
    };
    pos: Array<{
        po_number: string;
        supplier_name: string;
        po_date: string;
        po_value: number;
        ordered_qty: number;
        dispatched_qty: number;
        pending_qty: number;
        po_age_days: number;
        fulfillment_status: string;
        invoice_status: string;
        fulfillment_pct: number;
    }>;
}

interface POHealthReportProps {
    data: POHealthData;
    aiSummary: string;
}

export default function POHealthReport({
    data,
    aiSummary,
}: POHealthReportProps) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case "FULLY_DISPATCHED":
                return "text-app-status-success bg-app-status-success/10";
            case "PARTIALLY_DISPATCHED":
                return "text-app-status-warning bg-app-status-warning/10";
            case "NOT_STARTED":
                return "text-app-status-error bg-app-status-error/10";
            default:
                return "text-app-fg-muted bg-app-surface-elevated";
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <H3 className="text-app-fg">PO Health Summary</H3>
                <SmallText className="text-app-fg-muted mt-1">
                    Period: {data.period}
                </SmallText>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-4 gap-4">
                <div className="surface-card p-4 rounded-xl border border-app-border/50 bg-app-surface/50 backdrop-blur-sm">
                    <Label className="text-app-fg-muted uppercase">Total POs</Label>
                    <H3 className="text-app-fg mt-1">{data.summary.total_pos}</H3>
                </div>
                <div className="surface-card p-4 rounded-xl border border-app-border/50 bg-app-surface/50 backdrop-blur-sm">
                    <Label className="text-app-fg-muted uppercase">Not Started</Label>
                    <H3 className="text-app-status-error mt-1">
                        {data.summary.not_started}
                    </H3>
                </div>
                <div className="surface-card p-4 rounded-xl border border-app-border/50 bg-app-surface/50 backdrop-blur-sm">
                    <Label className="text-app-fg-muted uppercase">Partial</Label>
                    <H3 className="text-app-status-warning mt-1">
                        {data.summary.partially_dispatched}
                    </H3>
                </div>
                <div className="surface-card p-4 rounded-xl border border-app-border/50 bg-app-surface/50 backdrop-blur-sm">
                    <Label className="text-app-fg-muted uppercase">Complete</Label>
                    <H3 className="text-app-status-success mt-1">
                        {data.summary.fully_dispatched}
                    </H3>
                </div>
            </div>

            {/* AI Summary */}
            {aiSummary && (
                <div className="p-4 bg-app-accent/5 border border-app-accent/20 rounded-xl">
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-app-accent/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-xl">✨</span>
                        </div>
                        <div className="flex-1">
                            <Label className="font-semibold text-app-fg mb-1">
                                AI Insight
                            </Label>
                            <Body className="text-app-fg-muted leading-relaxed">
                                {aiSummary}
                            </Body>
                        </div>
                    </div>
                </div>
            )}

            {/* PO Table */}
            <div className="surface-card overflow-hidden rounded-xl border border-app-border/50 bg-app-surface/50 backdrop-blur-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-app-surface-elevated border-b border-app-border">
                            <tr>
                                <th className="px-4 py-3 text-left">
                                    <H4>PO Number</H4>
                                </th>
                                <th className="px-4 py-3 text-left">
                                    <H4>Order Value</H4>
                                </th>
                                <th className="px-4 py-3 text-right">
                                    <H4>Dispatched</H4>
                                </th>
                                <th className="px-4 py-3 text-right">
                                    <H4>Pending</H4>
                                </th>
                                <th className="px-4 py-3 text-right">
                                    <H4>Age (Days)</H4>
                                </th>
                                <th className="px-4 py-3 text-center">
                                    <H4>Status</H4>
                                </th>
                                <th className="px-4 py-3 text-right">
                                    <H4>Fulfillment %</H4>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-app-border">
                            {data.pos.slice(0, 20).map((po) => (
                                <tr
                                    key={po.po_number}
                                    className="hover:bg-app-surface-elevated transition-colors"
                                >
                                    <td className="px-4 py-3">
                                        <Body className="font-medium text-app-fg">
                                            {po.po_number}
                                        </Body>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <Accounting>{po.ordered_qty}</Accounting>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <Accounting>{po.dispatched_qty}</Accounting>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <Accounting className="text-app-status-warning font-medium">
                                            {po.pending_qty}
                                        </Accounting>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <Body className="text-app-fg-muted">{po.po_age_days}</Body>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span
                                            className={cn(
                                                "inline-flex items-center gap-1 px-2 py-1 rounded",
                                                getStatusColor(po.fulfillment_status),
                                            )}
                                        >
                                            <Label className="text-[10px] font-medium uppercase track-wider mb-0">
                                                {po.fulfillment_status.replace("_", " ")}
                                            </Label>
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <Body className="text-app-fg">
                                            {po.fulfillment_pct}%
                                        </Body>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {data.pos.length > 20 && (
                    <div className="px-4 py-3 bg-app-surface-elevated border-t border-app-border text-center">
                        <SmallText className="text-app-fg-muted">
                            Showing 20 of {data.pos.length} POs
                        </SmallText>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">{/* PDF generation disabled (Phase 2) */}</div>
        </div>
    );
}

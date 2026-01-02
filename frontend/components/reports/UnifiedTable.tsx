import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, ArrowRight, Truck, Info, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { ActionButtonGroup } from "@/components/design-system/molecules/ActionButtonGroup";
import { Pagination } from "@/components/design-system/molecules/Pagination";
import { H3, Label, Body, Accounting, Badge, Card, Stack, Flex, SmallText, Button } from "@/components/design-system";

export interface SmartTableRow {
    po_number: number;
    po_date: string;
    po_item_no: number;
    material_description: string;
    ord_qty: number;
    dispatched_qty: number;
    pending_qty: number;
    age_days: number;
    status: "Pending" | "Completed";
}

interface UnifiedTableProps {
    data: SmartTableRow[];
    loading: boolean;
}

export function UnifiedTable({ data, loading }: UnifiedTableProps) {
    const router = useRouter();
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = data.slice(startIndex, startIndex + itemsPerPage);

    if (loading) {
        return (
            <div className="p-8 text-center text-app-fg-muted font-bold text-xs uppercase tracking-widest italic animate-pulse">
                Loading operational data lifecycle...
            </div>
        );
    }

    return (
        <Card className="rounded-2xl border border-app-border overflow-hidden bg-app-surface shadow-sm">
            <Flex justify="between" align="center" className="p-4 border-b border-app-border bg-app-overlay/5">
                <H3 className="text-sm">Operational Deep Dive</H3>
                <div className="text-[11px] font-bold text-app-fg-muted uppercase tracking-widest">
                    {data.length} RECORDS
                </div>
            </Flex>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-app-overlay/10 text-app-fg-muted border-b border-app-border/30">
                            <th className="px-6 py-3">
                                <Label className="m-0">Status</Label>
                            </th>
                            <th className="px-6 py-3">
                                <Label className="m-0">PO Details</Label>
                            </th>
                            <th className="px-6 py-3">
                                <Label className="m-0">Material Specification</Label>
                            </th>
                            <th className="px-6 py-3 text-center">
                                <Label className="m-0">Progress</Label>
                            </th>
                            <th className="px-6 py-3 text-right">
                                <Label className="m-0">Cycle Time</Label>
                            </th>
                            <th className="px-6 py-3 text-right">
                                <Label className="m-0">Action</Label>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-app-border/50">
                        {paginatedData.map((row) => {
                            // Smart Highlighting logic
                            const isUrgent = row.pending_qty > 0 && row.age_days > 14;
                            const isWarning = row.pending_qty > 0 && row.age_days > 7;

                            return (
                                <tr
                                    key={`${row.po_number}-${row.po_item_no}`}
                                    className={cn(
                                        "group hover:bg-app-overlay/5 transition-colors",
                                        isUrgent && "bg-app-status-error/5"
                                    )}
                                >
                                    <td className="px-6 py-3">
                                        <Badge
                                            variant={row.pending_qty === 0 ? "success" : isUrgent ? "error" : "accent"}
                                            className={cn("uppercase tracking-widest text-[9px]", isUrgent && "animate-pulse")}
                                        >
                                            {row.pending_qty === 0 ? "Fulfilled" : "Awaiting"}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-3">
                                        <Body className="font-bold text-xs">
                                            PO #{row.po_number}
                                        </Body>
                                        <SmallText className="text-[10px] opacity-60">{row.po_date}</SmallText>
                                    </td>
                                    <td className="px-6 py-3">
                                        <div
                                            className="text-xs font-medium text-app-fg max-w-[240px] truncate"
                                            title={row.material_description}
                                        >
                                            {row.material_description}
                                        </div>
                                    </td>
                                    <td className="px-6 py-3 text-center">
                                        <Stack align="center" gap={1.5}>
                                            <Accounting className="text-[11px] font-bold">
                                                {row.dispatched_qty} / {row.ord_qty}
                                            </Accounting>
                                            <div className="w-20 h-1 bg-app-border/30 rounded-full overflow-hidden">
                                                <div
                                                    className={cn("h-full rounded-full transition-all duration-700",
                                                        row.pending_qty === 0 ? "bg-app-status-success" : "bg-app-accent"
                                                    )}
                                                    style={{
                                                        width: `${Math.min((row.dispatched_qty / row.ord_qty) * 100, 100)}%`,
                                                    }}
                                                />
                                            </div>
                                        </Stack>
                                    </td>
                                    <td className="px-6 py-3 text-right">
                                        <span className={cn("font-bold text-xs font-mono", isUrgent ? "text-app-status-error" : "text-app-fg-muted")}>
                                            {row.age_days}d
                                        </span>
                                    </td>
                                    <td className="px-6 py-3 text-right">
                                        {row.pending_qty > 0 ? (
                                            <Button
                                                onClick={() => router.push(`/dc/create?po=${row.po_number}`)}
                                                className="h-8 px-4 text-[10px] font-black uppercase tracking-widest active-glow rounded-xl opacity-0 group-hover:opacity-100 transition-all shadow-sm shadow-app-accent/20"
                                            >
                                                Dispatch
                                            </Button>
                                        ) : (
                                            <SmallText className="font-bold text-[9px] uppercase tracking-widest opacity-30 text-app-status-success">
                                                FULFILLED
                                            </SmallText>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className="p-4 bg-app-overlay/5">
                <Pagination
                    currentPage={currentPage}
                    totalItems={data.length}
                    pageSize={itemsPerPage}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={() => { }} // Static size for now
                />
            </div>
        </Card>
    );
}

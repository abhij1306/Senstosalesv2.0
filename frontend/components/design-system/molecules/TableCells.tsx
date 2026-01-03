
import React from "react";
import { cn } from "@/lib/utils";
export const TableHeaderCell = ({ children, className, numeric, ...props }: {
    children?: React.ReactNode; className?: string; numeric?: boolean;
} & React.ThHTMLAttributes<HTMLTableCellElement>) => (
    <th className={cn(
        "h-14 px-4 sticky top-0 z-20 m3-label-large text-secondary",
        "bg-surface-variant/40 backdrop-blur-md border-b border-outline",
        numeric && "text-right",
        className,
    )} {...props}> {children} </th>
);

export const TableRowCell = ({ children, className, numeric, ...props }: {
    children?: React.ReactNode; className?: string; numeric?: boolean;
} & React.TdHTMLAttributes<HTMLTableCellElement>) => (
    <td className={cn(
        "h-[52px] px-4 m3-body-medium text-primary",
        "border-b border-outline-variant/30 transition-colors hover:bg-primary-container/10",
        numeric && "font-mono tabular-nums text-right",
        className,
    )} {...props}> {children} </td>
);

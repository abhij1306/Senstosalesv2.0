"use client";

import React, { memo } from "react";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  variant?: "success" | "warning" | "error" | "neutral" | "info";
  className?: string;
}

// Map common statuses to variants automatically if not provided
const getVariant = (status: string, explicitVariant?: string) => {
  if (explicitVariant) return explicitVariant;

  // Handle numerical statuses (e.g., from some API fields)
  let statusStr = String(status || "");
  if (statusStr === "0") statusStr = "Draft";
  if (statusStr === "1") statusStr = "Active";

  const lower = statusStr.toLowerCase();

  if (
    [
      "received",
      "completed",
      "closed",
      "paid",
      "approved",
      "valid",
    ].includes(lower)
  )
    return "success";
  if (["delivered", "active", "processing", "open"].includes(lower))
    return "info"; // Primary/Active/Delivered is Blue/Info
  if (["pending", "partial"].includes(lower))
    return "warning";
  if (["draft"].includes(lower))
    return "neutral";
  if (["rejected", "failed", "cancelled", "overdue", "missing"].includes(lower))
    return "error";

  return "neutral";
};

const StatusBadgeInternal = ({ status, variant, className }: StatusBadgeProps) => {
  const finalVariant = getVariant(status, variant);

  const styles = {
    success: "status-badge-closed",
    warning: "status-badge-pending",
    error: "bg-rose-500/10 text-rose-500 border-rose-500/20",
    neutral: "status-badge-draft",
    info: "status-badge-delivered",
  };

  const label = String(status) === "0" ? "DRAFT" : String(status) === "1" ? "ACTIVE" : status;

  return (
    <span
      className={cn(
        "status-badge tabular-nums truncate",
        styles[finalVariant as keyof typeof styles],
        className,
      )}
    >
      {label}
    </span>
  );
};

StatusBadgeInternal.displayName = "StatusBadge";

export const StatusBadge = memo(StatusBadgeInternal);

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  Download,
  Truck,
  Receipt,
  TrendingUp,
  Calendar,
  AlertTriangle,
  Activity,
  BarChart3,
  FileDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";

const ReportsCharts = dynamic(() => import("./organisms/ReportsCharts"), {
  ssr: false,
});
import { api } from "@/lib/api";
import { formatDate, formatIndianCurrency, cn } from "@/lib/utils";

// --- FIX 1: Direct Imports (No Barrel Files) ---
import {
  Accounting,
  Body,
  type Column,
  Flex,
  Box,
  DataTable,
  Badge,
  DocumentTemplate,
  Button,
  DatePicker,
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/design-system";
import { ReportsDataCard } from "./organisms/ReportsDataCard";

type ReportType = "sales" | "dc_register" | "invoice_register" | "pending" | "reconciliation";
type ViewMode = "analytics" | "details";

// --- FIX 2: Static Column Definitions (Moved Outside Component) ---
// This prevents the Table from re-rendering on every keystroke.

const salesColumns: Column<any>[] = [
  {
    key: "month",
    label: "MONTH",
    render: (_v, row) => (
      <Body className="table-cell-text font-medium text-app-accent">{row.month}</Body>
    ),
  },
  {
    key: "ordered_value",
    label: "ORDERED VALUE",
    align: "right",
    render: (_v, row) => (
      <Accounting className="font-mono pr-2">
        {formatIndianCurrency(row.ordered_value)}
      </Accounting>
    ),
  },
  {
    key: "delivered_value",
    label: "DELIVERED VALUE",
    align: "right",
    render: (_v, row) => (
      <Accounting className="text-app-status-success font-mono pr-2">
        {formatIndianCurrency(row.delivered_value)}
      </Accounting>
    ),
  },
  {
    key: "variance",
    label: "VARIANCE",
    align: "right",
    render: (_v, row) => {
      const diff = (row.ordered_value || 0) - (row.delivered_value || 0);
      return (
        <Accounting className={cn("font-mono pr-2", diff > 0 ? "text-app-status-warning" : "text-app-fg-muted")}>
          {formatIndianCurrency(diff)}
        </Accounting>
      );
    },
  },
];

const dcColumns: Column<any>[] = [
  {
    key: "dc_number",
    label: "DC NUMBER",
    render: (_v, row) => (
      <Body className="text-app-accent">DC-{row.dc_number}</Body>
    ),
  },
  {
    key: "dc_date",
    label: "DATE",
    render: (_v, row) => (
      <Body className="text-app-fg-muted">
        {formatDate(row.dc_date)}
      </Body>
    ),
  },
  {
    key: "po_number",
    label: "PO REF",
    render: (_v, row) => (
      <Body className="text-app-fg-muted">{row.po_number}</Body>
    ),
  },
  {
    key: "consignee_name",
    label: "CONSIGNEE",
    render: (_v, row) => (
      <Body className="max-w-[200px] truncate">{row.consignee_name}</Body>
    ),
  },
  {
    key: "total_qty",
    label: "QTY",
    align: "right",
    render: (_v, row) => (
      <Accounting className="font-mono pr-2">{row.total_qty}</Accounting>
    ),
  },
];

const invoiceColumns: Column<any>[] = [
  {
    key: "invoice_number",
    label: "INVOICE NO",
    render: (_v, row) => (
      <Body className="table-cell-text text-app-accent">{row.invoice_number}</Body>
    ),
  },
  {
    key: "invoice_date",
    label: "DATE",
    render: (_v, row) => <Body className="font-medium">{formatDate(row.invoice_date)}</Body>,
  },
  {
    key: "customer_gstin",
    label: "CUSTOMER GST",
    render: (_v, row) => (
      <Body className="font-mono block">{row.customer_gstin}</Body>
    ),
  },
  {
    key: "taxable_value",
    label: "TAXABLE",
    align: "right",
    render: (_v, row) => (
      <Accounting className="font-mono pr-2">
        {formatIndianCurrency(row.taxable_value)}
      </Accounting>
    ),
  },
  {
    key: "total_invoice_value",
    label: "TOTAL",
    align: "right",
    render: (_v, row) => (
      <Accounting className="text-app-fg font-mono pr-2">
        {formatIndianCurrency(row.total_invoice_value)}
      </Accounting>
    ),
  },
];

const pendingColumns: Column<any>[] = [
  {
    key: "po_number",
    label: "PO NUMBER",
    width: "15%",
    render: (_v, row) => (
      <Body className="table-cell-text text-app-accent">{row.po_number}</Body>
    ),
  },
  {
    key: "material_description",
    label: "MATERIAL",
    width: "30%",
    render: (_v, row) => (
      <Box className="w-[180px] lg:w-[280px] truncate" title={row.material_description}>
        <Body className="table-cell-text truncate block">{row.material_description}</Body>
      </Box>
    ),
  },
  {
    key: "ord_qty",
    label: "ORD",
    width: "10%",
    align: "right",
    render: (_v, row) => (
      <Accounting className="font-mono pr-2">{row.ord_qty}</Accounting>
    ),
  },
  {
    key: "del_qty",
    label: "DEL",
    width: "10%",
    align: "right",
    render: (_v, row) => (
      <Accounting className="font-mono pr-2">{row.del_qty}</Accounting>
    ),
  },
  {
    key: "pen_qty",
    label: "PEN",
    width: "10%",
    align: "right",
    render: (_v, row) => (
      <Accounting className="text-app-status-error font-mono pr-2">{row.pen_qty}</Accounting>
    ),
  },
];

const reconciliationColumns: Column<any>[] = [
  {
    key: "po_number",
    label: "PO NUMBER",
    width: "15%",
    render: (_v, row) => (
      <Body className="table-cell-text text-app-accent">{row.po_number}</Body>
    ),
  },
  {
    key: "item_description",
    label: "ITEM",
    width: "35%",
    render: (_v, row) => (
      <Box className="w-[200px] lg:w-[320px] truncate" title={row.item_description}>
        <Body className="table-cell-text truncate block">{row.item_description}</Body>
      </Box>
    ),
  },
  {
    key: "ordered_qty",
    label: "ORD",
    width: "10%",
    align: "right",
    render: (_v, row) => (
      <Accounting className="table-cell-number font-medium font-mono text-right block">{row.ordered_qty}</Accounting>
    ),
  },
  {
    key: "total_dispatched",
    label: "DISP",
    width: "10%",
    align: "right",
    render: (_v, row) => (
      <Accounting className="table-cell-number font-medium font-mono text-right block">
        {row.total_dispatched}
      </Accounting>
    ),
  },
  {
    key: "total_accepted",
    label: "ACC",
    width: "15%",
    align: "right",
    render: (_v, row) => (
      <Accounting className="table-cell-number text-app-status-success font-mono text-right block">
        {row.total_accepted}
      </Accounting>
    ),
  },
  {
    key: "total_rejected",
    label: "REJ",
    width: "15%",
    align: "right",
    render: (_v, row) => (
      <Accounting className="table-cell-number text-app-status-error font-mono text-right block">
        {row.total_rejected}
      </Accounting>
    ),
  },
];

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<ReportType>("sales");
  const [viewMode, setViewMode] = useState<ViewMode>("analytics");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [startDate, setStartDate] = useState<string>("2020-01-01");
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [headerPortal, setHeaderPortal] = useState<HTMLElement | null>(null);

  // Automatically switch view mode based on tab type
  useEffect(() => {
    if (activeTab === "sales" || activeTab === "reconciliation") {
      setViewMode("analytics");
    } else {
      setViewMode("details");
    }
  }, [activeTab]);

  // --- CHART DATA GENERATION ---
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    if (activeTab === "sales") {
      return [...data].reverse().map((item) => ({
        name: item.month,
        ordered_value: item.ordered_value,
        delivered_value: item.delivered_value,
      }));
    }

    // Skip chart generation for non-chart tabs
    if (["dc_register", "invoice_register", "pending"].includes(activeTab)) {
      return [];
    }

    if (activeTab === "reconciliation") {
      return [
        {
          name: "Accepted",
          value: data.reduce((s, r) => s + (r.total_accepted || 0), 0),
          color: "rgb(var(--status-success))",  // Green
        },
        {
          name: "Rejected",
          value: data.reduce((s, r) => s + (r.total_rejected || 0), 0),
          color: "rgb(var(--status-error))",  // Red
        },
        {
          name: "Pending",
          value: data.reduce(
            (s, r) =>
              s +
              Math.max(0, (r.ordered_qty || 0) - (r.total_accepted || 0) - (r.total_rejected || 0)),
            0
          ),
          color: "rgb(var(--status-warning))",  // Amber
        },
      ].filter((d) => d.value > 0);
    }

    return [];
  }, [data, activeTab]);

  useEffect(() => {
    setHeaderPortal(document.getElementById("header-action-portal"));
  }, []);

  const loadReport = useCallback(async () => {
    setLoading(true);
    setData([]);
    try {
      const dateParams = `start_date=${startDate}&end_date=${endDate}`;

      // Use centralized API for type-safe fetch
      const result = await api.getReports(activeTab, dateParams);

      const finalData = Array.isArray(result)
        ? result.map((item: any, index: number) => ({
          ...item,
          unique_id: `${activeTab}-${index}-${item.id || item.number || item.po_number || item.dc_number || item.invoice_number || ""}`,
        }))
        : [];

      setData(finalData);
    } catch {
      // Error handled by boundary or silent fail
    } finally {
      setLoading(false);
    }
  }, [activeTab, startDate, endDate]);

  useEffect(() => {
    setPage(1);
    loadReport();
  }, [loadReport]);

  const handleExport = useCallback(() => {
    const dateParams = `start_date=${startDate}&end_date=${endDate}`;
    api.exportReport(activeTab, dateParams);
  }, [activeTab, startDate, endDate]);


  const activeColumns = useMemo(() => {
    switch (activeTab) {
      case "sales":
        return salesColumns;
      case "dc_register":
        return dcColumns;
      case "invoice_register":
        return invoiceColumns;
      case "pending":
        return pendingColumns;
      case "reconciliation":
        return reconciliationColumns;
      default:
        return [];
    }
  }, [activeTab]);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  // --- OPTIMIZATION: Toolbar Portal Content ---
  const toolbarContent = (
    <Flex align="center" gap={3}>
      <Flex
        align="center"
        className="bg-app-overlay/5 backdrop-blur-md border border-white/5 rounded-full overflow-hidden shadow-inner gap-0.5 p-1"
      >
        <Flex
          align="center"
          gap={2}
          className="px-4 py-1.5 hover:bg-white/5 transition-colors rounded-full group"
        >
          <Calendar
            size={14}
            className="text-app-accent group-hover:scale-110 transition-transform opacity-70"
          />
          <DatePicker
            value={startDate}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStartDate(e.target.value)}
            className="w-24 h-auto py-0 px-0 bg-transparent border-none shadow-none text-[11px] font-medium text-text-secondary uppercase tabular-nums focus:ring-0"
          />
        </Flex>
        <div className="w-[1px] h-4 bg-app-fg-muted/10 mx-1" />
        <Flex
          align="center"
          gap={2}
          className="px-4 py-1.5 hover:bg-white/5 transition-colors rounded-full group"
        >
          <DatePicker
            value={endDate}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEndDate(e.target.value)}
            className="w-24 h-auto py-0 px-0 bg-transparent border-none shadow-none text-[11px] font-medium text-text-secondary uppercase tabular-nums focus:ring-0"
          />
        </Flex>
      </Flex>
      <Button
        variant="success"
        onClick={handleExport}
        className="rounded-full h-10 px-5 shadow-sm text-white"
      >
        <FileDown size={16} /> Excel
      </Button>
    </Flex>
  );

  return (
    <DocumentTemplate
      icon={<BarChart3 />}
      title="Reports"
      description="Multi-dimensional trend analysis"
      actions={toolbarContent}
    >
      <div className="space-y-4">
        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as ReportType)} className="w-full">
          <TabsList className="mb-4">
            {[
              { id: "sales", label: "GROWTH", icon: TrendingUp },
              { id: "dc_register", label: "DC REGISTER", icon: Truck },
              { id: "invoice_register", label: "INVOICES", icon: Receipt },
              { id: "pending", label: "SHORTAGES", icon: AlertTriangle },
              { id: "reconciliation", label: "LEDGER AUDIT", icon: Activity },
            ].map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="gap-2"
              >
                <tab.icon size={13} className="opacity-70" />
                <span className="uppercase tracking-widest">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>


        {/* --- DYNAMIC CONTENT SECTION --- */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeTab}-${viewMode}`}
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.99 }}
            transition={{ duration: 0.2 }}
            className="w-full space-y-4"
          >
            {viewMode === "analytics" && (activeTab === "sales" || activeTab === "reconciliation") && (
              <ReportsDataCard
                title="Analytics Intelligence"
                subtitle="Multi-dimensional trend analysis"
                className="bg-app-surface/40 backdrop-blur-xl border-app-border/10"
                actions={
                  <div className="flex bg-app-surface/30 p-1 rounded-2xl shadow-inner-light border-0">
                    <Button
                      variant={viewMode === "analytics" ? "primary" : "ghost"}
                      size="compact"
                      onClick={() => setViewMode("analytics")}
                      className={cn(
                        "rounded-xl px-5 h-8 text-[10px] font-bold uppercase tracking-wider transition-all duration-300",
                        viewMode === "analytics" ? "bg-app-surface-elevated text-action-primary shadow-md scale-[1.05]" : "text-app-fg-muted hover:bg-app-surface/40"
                      )}
                    >
                      Analytics
                    </Button>
                    <Button
                      variant={(viewMode as ViewMode) === "details" ? "primary" : "ghost"}
                      size="compact"
                      onClick={() => setViewMode("details")}
                      className={cn(
                        "rounded-xl px-5 h-8 text-[10px] font-bold uppercase tracking-wider transition-all duration-300",
                        (viewMode as ViewMode) === "details" ? "bg-app-surface-elevated text-action-primary shadow-md scale-[1.05]" : "text-app-fg-muted hover:bg-app-surface/40"
                      )}
                    >
                      Details
                    </Button>
                  </div>
                }
              >
                <ReportsCharts activeTab={activeTab} chartData={chartData} />
              </ReportsDataCard>
            )}

            {viewMode === "details" && (
              <ReportsDataCard
                title={
                  activeTab === "dc_register"
                    ? "Distribution Flow"
                    : activeTab === "invoice_register"
                      ? "Revenue Ledger"
                      : activeTab === "sales"
                        ? "Growth Momentum"
                        : activeTab === "pending"
                          ? "Active Shortages"
                          : "Audit Ledger"
                }
                subtitle="Real-time multi-dimensional intelligence"
                className="bg-app-surface/40 backdrop-blur-xl border-app-border/10"
                actions={
                  <Flex gap={3} align="center">
                    {(activeTab === "sales" || activeTab === "reconciliation") && (
                      <div className="flex bg-app-surface/60 p-1 rounded-xl shadow-inner">
                        <Button
                          variant={(viewMode as ViewMode) === "analytics" ? "primary" : "ghost"}
                          size="compact"
                          onClick={() => setViewMode("analytics")}
                          className="rounded-lg px-4 h-8 text-[11px] font-bold uppercase tracking-wider"
                        >
                          Analytics
                        </Button>
                        <Button
                          variant={viewMode === "details" ? "primary" : "ghost"}
                          size="compact"
                          onClick={() => setViewMode("details")}
                          className="rounded-lg px-4 h-8 text-[11px] font-bold uppercase tracking-wider"
                        >
                          Details
                        </Button>
                      </div>
                    )}
                    <Badge variant="accent" className="font-mono bg-action-primary/10 text-action-primary py-1 px-2.5 rounded-md text-[9px] font-bold border-none">
                      {data.length} RECORDS
                    </Badge>
                  </Flex>
                }
              >
                <DataTable
                  columns={activeColumns}
                  data={data}
                  keyField="unique_id"
                  page={page}
                  pageSize={pageSize}
                  totalItems={data.length}
                  onPageChange={handlePageChange}
                  loading={loading}
                />
              </ReportsDataCard>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </DocumentTemplate>
  );
}




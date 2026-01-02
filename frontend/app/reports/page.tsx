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
} from "@/components/design-system";
import { ReportNavGrid } from "./organisms/ReportNavGrid";
import { ReportsDataCard } from "./organisms/ReportsDataCard";

type ReportType = "sales" | "dc_register" | "invoice_register" | "pending" | "reconciliation";

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
      <Accounting className="table-cell-number font-medium font-mono text-right block">
        {formatIndianCurrency(row.ordered_value)}
      </Accounting>
    ),
  },
  {
    key: "delivered_value",
    label: "DELIVERED VALUE",
    align: "right",
    render: (_v, row) => (
      <Accounting className="table-cell-number text-app-status-success font-mono text-right block">
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
        <Accounting className={cn("table-cell-number font-mono text-right block", diff > 0 ? "text-app-status-warning" : "text-app-fg-muted")}>
          {formatIndianCurrency(diff)}
        </Accounting>
      )
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
      <Accounting className="font-medium font-mono text-right block">{row.total_qty}</Accounting>
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
      <Accounting className="table-cell-number font-medium font-mono text-right block">
        {formatIndianCurrency(row.taxable_value)}
      </Accounting>
    ),
  },
  {
    key: "total_invoice_value",
    label: "TOTAL",
    align: "right",
    render: (_v, row) => (
      <Accounting className="table-cell-number text-app-fg font-mono text-right block">
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
      <Accounting className="table-cell-number font-medium font-mono text-right block">{row.ord_qty}</Accounting>
    ),
  },
  {
    key: "delivered_qty",
    label: "DELIVERED",
    width: "20%",
    align: "right",
    render: (_v, row) => (
      <Accounting className="table-cell-number text-app-status-success font-mono text-right block">
        {row.delivered_qty}
      </Accounting>
    ),
  },
  {
    key: "pending_qty",
    label: "PENDING",
    width: "20%",
    align: "right",
    render: (_v, row) => (
      <Accounting className="table-cell-number text-app-status-warning font-mono text-right block">
        {row.pending_qty}
      </Accounting>
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
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [startDate, setStartDate] = useState<string>("2020-01-01");
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [headerPortal, setHeaderPortal] = useState<HTMLElement | null>(null);

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
          color: "hsl(142, 76%, 36%)",  // Green
        },
        {
          name: "Rejected",
          value: data.reduce((s, r) => s + (r.total_rejected || 0), 0),
          color: "hsl(0, 84%, 60%)",  // Red
        },
        {
          name: "Pending",
          value: data.reduce(
            (s, r) =>
              s +
              Math.max(0, (r.ordered_qty || 0) - (r.total_accepted || 0) - (r.total_rejected || 0)),
            0
          ),
          color: "hsl(38, 92%, 50%)",  // Amber
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
        className="bg-app-surface/40 backdrop-blur-xl border-none rounded-2xl overflow-hidden shadow-sm p-1"
      >
        <Flex
          align="center"
          gap={3}
          className="px-4 py-2 hover:bg-app-surface/40 transition-colors rounded-xl group"
        >
          <Calendar
            size={16}
            className="text-app-accent group-hover:scale-110 transition-transform"
          />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="outline-none bg-transparent text-app-fg-muted text-xs font-regular uppercase"
          />
        </Flex>
        <Box className="w-[1px] h-6 bg-app-fg-muted/10 mx-1" />
        <Flex
          align="center"
          gap={3}
          className="px-4 py-2 hover:bg-app-surface/40 transition-colors rounded-xl group"
        >
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="outline-none bg-transparent text-app-fg-muted text-xs font-regular uppercase"
          />
        </Flex>
      </Flex>
      <Button
        variant="excel"
        onClick={handleExport}
      >
        <FileDown size={16} /> Export
      </Button>
    </Flex>
  );

  return (
    <DocumentTemplate
      icon={<BarChart3 />}
      title="Reports"
      description="Multi-dimensional trend analysis and reconciliation"
      actions={toolbarContent}
    >
      <div className="space-y-6">
        <ReportNavGrid
          items={[
            {
              id: "sales",
              title: "Growth",
              description: "Revenue and tax velocity trends",
              icon: <TrendingUp />,
            },
            {
              id: "dc_register",
              title: "DC Register",
              description: "Dispatch and logistics tracking",
              icon: <Truck />,
            },
            {
              id: "invoice_register",
              title: "Invoices",
              description: "Billing and payment ledger",
              icon: <Receipt />,
            },
            {
              id: "pending",
              title: "Shortages",
              description: "Active pending supply gaps",
              icon: <AlertTriangle />,
            },
            {
              id: "reconciliation",
              title: "Ledger Audit",
              description: "Physical vs System inventory audit",
              icon: <Activity />,
            },
          ]}
          activeId={activeTab}
          onSelect={(id) => {
            setLoading(true);
            setData([]);
            setActiveTab(id as ReportType);
          }}
          className="w-full"
        />

        {/* --- DYNAMIC CHART SECTION --- */}
        <AnimatePresence mode="wait">
          {data.length > 0 && (activeTab === "sales" || activeTab === "reconciliation") && (
            <ReportsDataCard
              title="Analytics Overview"
              subtitle="Multi-dimensional trend analysis"
              className="bg-app-accent/5 border-app-accent/10"
            >
              <ReportsCharts activeTab={activeTab} chartData={chartData} />
            </ReportsDataCard>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="w-full"
          >
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
                        : "Quality Audit"
              }
              subtitle="Real-time multi-dimensional intelligence"
              actions={
                <Badge variant="outline" className="font-mono">
                  {data.length} RECORDS
                </Badge>
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
          </motion.div>
        </AnimatePresence>
      </div>
    </DocumentTemplate>
  );
}




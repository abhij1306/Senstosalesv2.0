// ============================================================
// CENTRALIZED API FETCH
// ============================================================

export const API_BASE_URL =
  typeof window !== "undefined"
    ? ""
    : process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export interface Buyer {
  id: number;
  name: string;
  gstin: string;
  billing_address: string;
  shipping_address?: string;
  designation?: string;
  place_of_supply: string;
  state?: string;
  state_code?: string;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
}

export interface POHeader {
  po_number: string;
  po_date: string;
  supplier_name: string;
  supplier_code: string;
  supplier_email: string;
  department_no: string;
  po_value: number;
  net_po_value: number;
  tin_no: string;
  ecc_no: string;
  remarks: string;
  project_name?: string;
  status?: string;
}
export interface POListItem {
  po_number: number;
  po_date: string;
  vendor_name: string;
  project_name: string;
  items: any[];
  total_amount?: number;
  po_value?: number;
  total_ordered_quantity?: number;
  total_dispatched_quantity?: number;
  total_received_quantity?: number;
  total_rejected_quantity?: number;
  total_pending_quantity?: number;
  total_items_count?: number; // Added
  status: string;
  [key: string]: any;
}

export interface POStats {
  total_pos: number;
  active_count: number; // Added for UI consumption
  total_value: number;
  pending_pos: number;
  completed_pos: number;
  open_orders_count: number;
  pending_approval_count: number;
  total_value_ytd: number;
  total_value_change: number;
  rejection_rate?: number; // Added
}

export interface DCListItem {
  dc_number: string;
  dc_date: string;
  po_number: number;
  consignee_name: string;
  total_value: number;
  status: string;
}

export interface DCStats {
  total_challans: number;
  pending_delivery: number;
  completed_delivery: number;
  total_value: number;
}

export interface DCDetailResponse {
  header: any; // Using any for flexibility during refactor, strictly typed in refactor
  items: any[];
}

export interface InvoiceDetailResponse {
  header: any;
  items: any[];
}

export interface InvoiceListItem {
  invoice_number: string;
  invoice_date: string;
  linked_dc_numbers: string; // Comma separated
  customer_gstin: string;
  total_invoice_value: number;
  status?: string; // Optional if not always present
  [key: string]: any;
}

export interface InvoiceStats {
  total_invoiced: number;
  total_invoiced_change: number;
  gst_collected: number;
  gst_collected_change: number;
  pending_payments: number;
  pending_payments_count: number;
}

export interface Settings {
  supplier_name: string;
  supplier_description: string;
  supplier_address: string;
  supplier_gstin: string;
  supplier_contact: string;
  supplier_state: string;
  supplier_state_code: string;
}

export interface ReconciliationItem {
  id: number;
  po_item_no: number;
  material_code: string;
  material_description: string;
  unit: string;
  ord_qty: number;
  dispatched_qty: number;
  pending_qty: number;
  status: string;
}

export interface PONote {
  id: number;
  title: string;
  content: string;
  updated_at: string;
}

export interface DashboardSummary {
  total_sales_month: number;
  sales_growth: number | string;
  pending_pos: number;
  new_pos_today: number;
  active_challans: number;
  total_po_value: number;
  po_value_growth: number | string;
  active_po_count: number;
  revenue_momentum?: any[];
  total_ordered?: number;
  total_delivered?: number;
  total_received?: number;
}

// Removed conflicting re-exports

import { SRVListItem, SRVStats } from "@/types";
export type { SRVListItem, SRVStats };

export interface ActivityItem {
  type: "PO" | "DC" | "Invoice";
  status: string;
  number: string;
  amount?: number;
  date: string;
}

export interface SearchResult {
  id: string | number;
  type: "PO" | "DC" | "Invoice" | "SRV";
  number: string;
  date: string;
  party: string;
  amount?: number;
  type_label: string;
  status?: string;
}

type FetchOptions = RequestInit & {
  retries?: number;
  timeout?: number;
};

class APIError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: any,
  ) {
    super(message);
    this.name = "APIError";
  }
}

// --- SIMPLE CACHE SYSTEM ---
const GET_CACHE = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5000; // 5 seconds cache for GET requests

// --- DEDUPLICATION SYSTEM ---
const PENDING_REQUESTS = new Map<string, Promise<any>>();

async function apiFetch<T>(
  endpoint: string,
  options: FetchOptions = {},
): Promise<T> {
  const { retries = 0, timeout = 60000, ...fetchOptions } = options;
  const url = `${API_BASE_URL}${endpoint}`;
  const method = fetchOptions.method || "GET";

  // Check Cache for GET requests
  if (method === "GET") {
    const cached = GET_CACHE.get(url);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.debug(`[API] Cache Hit: ${url}`);
      return cached.data as T;
    }

    // Deduplication: If a request for this URL is already in flight, reuse the promise
    const pending = PENDING_REQUESTS.get(url);
    if (pending) {
      console.debug(`[API] Deduplication Reuse: ${url}`);
      return pending as Promise<T>;
    }
  }

  const fetchPromise = (async () => {
    const headers: Record<string, string> = {
      Accept: "application/json",
      ...(fetchOptions.headers as Record<string, string>),
    };

    if (!(fetchOptions.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    // Add Auth Token if exists
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        (headers as any)["Authorization"] = `Bearer ${token}`;
      }
    }

    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeout);

      console.debug(`[API] Fetching ${url} ...`);
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
        signal: controller.signal,
      });
      clearTimeout(id);

      if (!response.ok) {
        // Handle 401 Unauthorized globally
        if (response.status === 401) {
          if (
            typeof window !== "undefined" &&
            !window.location.pathname.startsWith("/auth")
          ) {
            console.warn("[API] 401 Unauthorized - Redirecting to login");
            localStorage.removeItem("token");
            window.location.href = "/auth/login";
          }
          throw new APIError(401, "Unauthorized");
        }

        // Parse error response
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { detail: response.statusText };
        }

        const errorMessage =
          errorData.detail ||
          errorData.message ||
          `Request failed with status ${response.status}`;
        throw new APIError(response.status, errorMessage, errorData);
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return {} as T;
      }

      const data = await response.json();

      // Populate Cache for GET requests
      if (method === "GET") {
        GET_CACHE.set(url, { data, timestamp: Date.now() });
        // Cleanup old cache entries
        if (GET_CACHE.size > 100) {
          const oldestKey = GET_CACHE.keys().next().value;
          if (oldestKey) GET_CACHE.delete(oldestKey);
        }
      }

      return data;
    } catch (error: any) {
      if (error.name === "AbortError") {
        console.error(`[API] Timeout for ${url}`);
        throw new APIError(408, `Request timed out after ${timeout}ms`);
      }

      // Handle Network Errors (TypeError: Failed to fetch)
      if (error instanceof TypeError && error.message === "Failed to fetch") {
        console.error(`[API] Network Error: Could not connect to backend at ${url}. Is the server running?`);
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("api-error", {
              detail: {
                title: "Connection Failed",
                message: "Could not connect to the server. Please check your internet connection or try again later.",
                type: "critical"
              }
            })
          );
        }
        throw new APIError(0, "Network Error: Backend Unreachable");
      }

      if (retries > 0) {
        console.warn(`[API] Retrying ${url} (${retries} attempts left)...`);
        await new Promise((res) => setTimeout(res, 1000));
        // Note: We don't recurse apiFetch here to avoid infinite deduplication loops if we were to just call apiFetch again.
        // Instead we let the error propagate or handle retry logic differently if complex.
        // For simplicity in this deductive model, we remove from pending map and re-throw to let upper layer retry,
        // OR better: we can't easily retry inside the dedup promise without recursion complications.
        // Let's keep it simple: Retries are valuable.
        // We will simple RECURSE, but we need to be careful about PENDING_REQUESTS.
        // Actually, if we recurse, the new call will find the PENDING entry (itself) and wait forever!
        // FIX: Remove from pending before recursing.
        PENDING_REQUESTS.delete(url);
        return apiFetch<T>(endpoint, { ...options, retries: retries - 1 });
      }

      console.error(`[API] Error fetching ${url}:`, error);

      // Dispatch global event for UI to verify
      if (
        typeof window !== "undefined" &&
        options.method &&
        options.method !== "GET"
      ) {
        window.dispatchEvent(
          new CustomEvent("api-error", {
            detail: {
              title: "Operation Failed",
              message: error.message || "Unknown error occurred",
              type: "error",
            },
          }),
        );
      }

      throw error;
    } finally {
      // Clean up pending request
      if (method === "GET") {
        PENDING_REQUESTS.delete(url);
      }
    }
  })();

  if (method === "GET") {
    PENDING_REQUESTS.set(url, fetchPromise);
  }

  return fetchPromise;
}

// ============================================================
// STABLE API CLIENT
// ============================================================

export const api = {
  // DASHBOARD
  getDashboardSummary: () => apiFetch<any>("/api/dashboard/summary"),
  getDashboardInsights: () => apiFetch<any[]>("/api/dashboard/insights"),
  getRecentActivity: (limit = 10) =>
    apiFetch<any[]>(`/api/dashboard/activity?limit=${limit}`),

  // PURCHASE ORDERS
  listPOs: () => apiFetch<POListItem[]>("/api/po/"),
  getPOStats: () => apiFetch<POStats>("/api/po/stats"),
  getPO: (poNumber: string | number) => apiFetch<any>(`/api/po/${poNumber}`), // Alias for internal use
  getPODetail: (poNumber: string | number) =>
    apiFetch<any>(`/api/po/${poNumber}`), // Explicitly called by UI
  checkPOHasDC: (poNumber: string | number) =>
    apiFetch<any>(`/api/po/${poNumber}/dc`),
  updatePO: (poNumber: string | number, data: any, items: any[]) =>
    apiFetch(`/api/po/${poNumber}`, {
      method: "PUT",
      body: JSON.stringify({ header: data, items }),
    }),
  createPO: (data: any) =>
    apiFetch("/api/po/", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  syncPO: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiFetch<any>("/api/po/upload", {
      method: "POST",
      body: formData,
      headers: {},
    });
  },
  uploadPOBatch: (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    return apiFetch<any>("/api/po/upload/batch", {
      method: "POST",
      body: formData,
      headers: {},
      timeout: 600000, // 10 minutes for large batch uploads
    });
  },

  // DELIVERY CHALLANS
  listDCs: () => apiFetch<DCListItem[]>("/api/dc/"),
  getDCStats: () => apiFetch<DCStats>("/api/dc/stats"),
  createDC: (data: any, items: any[]) =>
    apiFetch("/api/dc/", {
      method: "POST",
      body: JSON.stringify({ dc: data, items }),
    }),
  updateDC: (dcNumber: string, data: any, items: any[]) =>
    apiFetch(`/api/dc/${dcNumber}`, {
      method: "PUT",
      body: JSON.stringify({ dc: data, items }),
    }),
  getDC: (dcNumber: string) => apiFetch<any>(`/api/dc/${dcNumber}`),
  getDCDetail: (dcNumber: string | null) =>
    apiFetch<any>(`/api/dc/${dcNumber}`), // Alias for UI
  checkDCHasInvoice: (dcNumber: string | null) =>
    apiFetch<any>(`/api/dc/${dcNumber}/invoice`),
  deleteDC: (dcNumber: string) =>
    apiFetch<any>(`/api/dc/${dcNumber}`, { method: "DELETE" }),

  // INVOICES
  listInvoices: () => apiFetch<InvoiceListItem[]>("/api/invoice/"),
  getInvoiceStats: () => apiFetch<InvoiceStats>("/api/invoice/stats"),
  createInvoice: (data: any) =>
    apiFetch("/api/invoice/", { method: "POST", body: JSON.stringify(data) }),
  getInvoiceDetail: (invoiceNumber: string) =>
    apiFetch<any>(`/api/invoice/${encodeURIComponent(invoiceNumber)}`),

  // COMMON
  checkDuplicateNumber: (
    type: "DC" | "Invoice",
    number: string,
    date: string,
  ) =>
    apiFetch<{ exists: boolean; financial_year: string; conflict_type?: string | null }>(
      `/api/common/check-duplicate?type=${type}&number=${encodeURIComponent(number)}&date=${date}`,
    ),

  // SRVS
  listSRVs: (poId?: number) =>
    apiFetch<SRVListItem[]>(poId ? `/api/srv/po/${poId}/srvs` : "/api/srv/"),
  getSRVStats: () => apiFetch<SRVStats>("/api/srv/stats"),
  uploadSRVBatch: (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    return apiFetch<any>("/api/srv/upload/batch", {
      method: "POST",
      body: formData,
      headers: {},
      timeout: 600000,
    });
  },
  getSRV: (srvNumber: string) => apiFetch<any>(`/api/srv/${encodeURIComponent(srvNumber)}`),
  deleteSRV: (srvNumber: string) =>
    apiFetch<void>(`/api/srv/${srvNumber}`, { method: "DELETE" }),

  // SETTINGS
  getSettings: () => apiFetch<Settings>("/api/settings/"),
  updateSetting: (key: string, value: string) =>
    apiFetch("/api/settings/", {
      method: "POST",
      body: JSON.stringify({ key, value }),
    }),
  updateSettingsBatch: (settings: { key: string; value: string }[]) =>
    apiFetch("/api/settings/batch", {
      method: "POST",
      body: JSON.stringify(settings),
    }),

  // PO NOTES
  getPONotes: () => apiFetch<PONote[]>("/api/po-notes/"),
  getPONote: (id: string | number) => apiFetch<PONote>(`/api/po-notes/${id}`),
  createPONote: (data: Partial<PONote>) =>
    apiFetch<PONote>("/api/po-notes/", { method: "POST", body: JSON.stringify(data) }),
  updatePONote: (id: string | number, data: Partial<PONote>) =>
    apiFetch<PONote>(`/api/po-notes/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deletePONote: (id: string | number) =>
    apiFetch<void>(`/api/po-notes/${id}`, { method: "DELETE" }),

  // REPORTS (RECONCILIATION)
  getReconciliation: (poNumber: number) =>
    apiFetch<any[]>(`/api/reports/reconciliation?po=${poNumber}`), // Corrected to reports endpoint
  getReconciliationLots: (poNumber: number) =>
    apiFetch<any>(`/api/dc/po/${poNumber}/lots`),


  // REPORTS
  getReports: (
    type: "sales" | "reconciliation" | "dc_register" | "invoice_register" | "pending",
    params: string
  ) => {
    // Map internal types to API endpoints if they differ, or use common logic
    // endpoints: /api/reports/sales, /api/reports/reconciliation, /api/reports/register/dc, etc.
    let endpoint = "";
    switch (type) {
      case "sales": endpoint = "/api/reports/sales"; break;
      case "reconciliation": endpoint = "/api/reports/reconciliation"; break;
      case "dc_register": endpoint = "/api/reports/register/dc"; break; // Note: Frontend used /register/dc
      case "invoice_register": endpoint = "/api/reports/register/invoice"; break;
      case "pending": endpoint = "/api/reports/pending"; break;
      default: throw new Error(`Unknown report type: ${type}`);
    }
    return apiFetch<any[]>(`${endpoint}?${params}`);
  },
  getReport: (type: string, dateParams: string) =>
    apiFetch<any[]>(`/api/reports/${type}?${dateParams}`),
  exportReport: (type: string, dateParams: string) => {
    // Reports export usually calls the same endpoint with export=true
    // But we need to handle the URL construction carefully
    // Reusing the logic from getReports but with export flag
    let endpoint = "";
    switch (type) {
      case "sales": endpoint = "/api/reports/sales"; break;
      case "reconciliation": endpoint = "/api/reports/reconciliation"; break;
      case "dc_register": endpoint = "/api/reports/register/dc"; break;
      case "invoice_register": endpoint = "/api/reports/register/invoice"; break;
      case "pending": endpoint = "/api/reports/pending"; break;
      default: endpoint = `/api/reports/${type}`; // Fallback
    }
    const baseUrl = API_BASE_URL;
    window.open(`${baseUrl}${endpoint}?export=true&${dateParams}`, "_blank");
  },

  // SEARCH
  searchGlobal: (q: string) =>
    apiFetch<{ results: SearchResult[] }>(
      `/api/search/?q=${encodeURIComponent(q)}`,
    ).then((res) => res.results),

  // --- Buyers ---
  getBuyers: () => apiFetch<Buyer[]>("/api/buyers"),
  createBuyer: (data: Partial<Buyer>) =>
    apiFetch<Buyer>("/api/buyers", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateBuyer: (id: number, data: Partial<Buyer>) =>
    apiFetch<Buyer>(`/api/buyers/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  setBuyerDefault: (id: number) =>
    apiFetch<Buyer>(`/api/buyers/${id}/default`, { method: "PUT" }),
  deleteBuyer: (id: number) =>
    apiFetch<{ success: boolean }>(`/api/buyers/${id}`, { method: "DELETE" }),

  baseUrl: API_BASE_URL,
};

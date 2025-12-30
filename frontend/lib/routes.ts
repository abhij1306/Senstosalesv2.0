/**
 * Centralized Route Normalizer
 * Enforces catch-all safety for IDs containing / or -
 */
export const normalizeId = (id: string | string[]): string => {
    if (Array.isArray(id)) {
        return id.join("/");
    }
    return id || "";
};

export const poRoute = (id: string | number) =>
    `/po/${encodeURIComponent(String(id).trim())}`;
export const dcRoute = (id: string) =>
    `/dc/${encodeURIComponent(String(id).trim())}`;
export const invoiceRoute = (id: string) =>
    `/invoice/${encodeURIComponent(String(id).trim())}`;

export const createDCRoute = (po: string | number) =>
    `/dc/create?po=${encodeURIComponent(String(po).trim())}`;
export const createInvoiceRoute = (dc: string) =>
    `/invoice/create?dc=${encodeURIComponent(String(dc).trim())}`;

import { api } from "@/lib/api";
import { InvoiceListClient } from "./InvoiceListClient";

async function getInvoicesData() {
  try {
    const [invoicesData, statsData] = await Promise.all([
      api.listInvoices(),
      api.getInvoiceStats(),
    ]);
    return { invoices: invoicesData || [], stats: statsData };
  } catch {
    // console.error("Error fetching invoices in RSC:", err);
    return { invoices: [], stats: null };
  }
}

export default async function InvoicePage() {
  const { invoices, stats } = await getInvoicesData();

  return (
    <InvoiceListClient initialInvoices={invoices} initialStats={stats} />
  );
}

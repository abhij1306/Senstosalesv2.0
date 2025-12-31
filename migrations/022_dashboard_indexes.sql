-- Migration: 022_dashboard_indexes.sql
-- Purpose: Performance Optimization for Strengthened Backend

-- 1. Purchase Orders
CREATE INDEX IF NOT EXISTS idx_po_created_at ON purchase_orders(created_at);
CREATE INDEX IF NOT EXISTS idx_po_status ON purchase_orders(po_status);
CREATE INDEX IF NOT EXISTS idx_po_date ON purchase_orders(po_date);
-- CREATE INDEX IF NOT EXISTS idx_po_buyer ON purchase_orders(buyer_id);

-- 2. PO Items
CREATE INDEX IF NOT EXISTS idx_poi_po_number ON purchase_order_items(po_number);
-- CREATE INDEX IF NOT EXISTS idx_poi_status ON purchase_order_items(status);

-- 3. Delivery Challans
CREATE INDEX IF NOT EXISTS idx_dc_po_number ON delivery_challans(po_number);
CREATE INDEX IF NOT EXISTS idx_dc_created_at ON delivery_challans(created_at);
CREATE INDEX IF NOT EXISTS idx_dc_date ON delivery_challans(dc_date);

-- 4. DC Items
CREATE INDEX IF NOT EXISTS idx_dci_dc_number ON delivery_challan_items(dc_number);
CREATE INDEX IF NOT EXISTS idx_dci_po_item_id ON delivery_challan_items(po_item_id);
CREATE INDEX IF NOT EXISTS idx_dci_lot_no ON delivery_challan_items(po_item_id, lot_no);

-- 5. GST Invoices
CREATE INDEX IF NOT EXISTS idx_invoice_created_at ON gst_invoices(created_at);
CREATE INDEX IF NOT EXISTS idx_invoice_date ON gst_invoices(invoice_date);
CREATE INDEX IF NOT EXISTS idx_invoice_dc_number ON gst_invoices(dc_number);

-- 6. SRVs
CREATE INDEX IF NOT EXISTS idx_srv_po_number ON srvs(po_number);
CREATE INDEX IF NOT EXISTS idx_srv_items_recd ON srv_items(received_qty) WHERE received_qty > 0;
CREATE INDEX IF NOT EXISTS idx_srv_items_srv_number ON srv_items(srv_number);
CREATE INDEX IF NOT EXISTS idx_srv_items_po_item ON srv_items(po_number, po_item_no);

-- Migration: 025_advanced_logic_strengthening.sql
-- Purpose: Implement Advanced Logic Strengthening (TOT-V2, Amendments, Audit Trail)

PRAGMA foreign_keys = OFF;

BEGIN TRANSACTION;

-- 1. STRENGTHEN BUYERS (Add DVN & SupplierCode Uniqueness)
CREATE TABLE IF NOT EXISTS buyers_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    department_no TEXT, -- DVN
    supplier_code TEXT,
    gstin TEXT,
    billing_address TEXT,
    shipping_address TEXT,
    place_of_supply TEXT,
    state TEXT,
    state_code TEXT,
    is_default BOOLEAN DEFAULT 0,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(department_no, supplier_code)
);

INSERT INTO buyers_new (id, name, gstin, billing_address, place_of_supply, is_default, is_active, created_at)
SELECT id, name, gstin, billing_address, place_of_supply, is_default, is_active, created_at FROM buyers;

DROP TABLE buyers;
ALTER TABLE buyers_new RENAME TO buyers;


-- 2. STRENGTHEN INVOICES (Financial Year-wise Uniqueness)
CREATE TABLE IF NOT EXISTS gst_invoices_new (
    invoice_number TEXT NOT NULL,
    invoice_date DATE NOT NULL,
    dc_number TEXT UNIQUE REFERENCES delivery_challans(dc_number),
    financial_year TEXT NOT NULL,
    buyer_name TEXT,
    buyer_gstin TEXT,
    buyer_address TEXT,
    po_numbers TEXT, -- Formerly buyers_order_no, renamed to match invoice.py expectation
    buyers_order_date TEXT,
    gemc_number TEXT,
    gemc_date TEXT,
    mode_of_payment TEXT,
    payment_terms TEXT DEFAULT '45 Days',
    despatch_doc_no TEXT,
    srv_no TEXT,
    srv_date TEXT,
    vehicle_no TEXT,
    lr_no TEXT,
    transporter TEXT,
    destination TEXT,
    terms_of_delivery TEXT,
    buyer_state TEXT,
    buyer_state_code TEXT,
    taxable_value DECIMAL(15,2),
    cgst DECIMAL(15,2) DEFAULT 0,
    sgst DECIMAL(15,2) DEFAULT 0,
    igst DECIMAL(15,2) DEFAULT 0,
    total_invoice_value DECIMAL(15,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (invoice_number, financial_year)
);

INSERT INTO gst_invoices_new (
    invoice_number, invoice_date, dc_number, financial_year, buyer_name, buyer_gstin, buyer_address,
    po_numbers, buyers_order_date, gemc_number, mode_of_payment, payment_terms, despatch_doc_no,
    srv_no, srv_date, vehicle_no, lr_no, transporter, destination, terms_of_delivery, 
    buyer_state, buyer_state_code,
    taxable_value, cgst, sgst, igst, total_invoice_value, created_at
)
SELECT 
    invoice_number, invoice_date, dc_number, 
    COALESCE(SUBSTR(invoice_date, 1, 4) || '-' || (CAST(SUBSTR(invoice_date, 3, 2) AS INTEGER) + 1), '2025-26'), -- Fallback FY
    buyer_name, buyer_gstin, buyer_address,
    po_numbers, buyers_order_date, gemc_number, mode_of_payment, COALESCE(payment_terms, '45 Days'), despatch_doc_no,
    srv_no, srv_date, vehicle_no, lr_no, transporter, destination, terms_of_delivery,
    buyer_state, buyer_state_code,
    taxable_value, cgst, sgst, igst, total_invoice_value, created_at
FROM gst_invoices;

DROP TABLE gst_invoices;
ALTER TABLE gst_invoices_new RENAME TO gst_invoices;


-- 3. REFINED RECONCILIATION VIEW (TOT-5 V2)
DROP VIEW IF EXISTS reconciliation_ledger;
CREATE VIEW reconciliation_ledger AS
SELECT 
    poi.po_number,
    poi.po_item_no,
    poi.status as item_status,
    poi.material_description,
    poi.ord_qty,
    -- TOT High Water Mark: Delivered is MAX(Dispatched, Received)
    MAX(poi.delivered_qty, poi.rcd_qty) as actual_delivered_qty, 
    poi.rcd_qty as accepted_qty,
    poi.rejected_qty,
    -- Amendment Logic: Pending is 0 for Cancelled items
    CASE 
        WHEN poi.status = 'Cancelled' THEN 0 
        ELSE MAX(0, poi.ord_qty - MAX(poi.delivered_qty, poi.rcd_qty)) 
    END as pending_qty
FROM purchase_order_items poi;


-- 4. GLOBAL AUDIT TRIGGERS (updated_at)
CREATE TRIGGER trg_buyers_updated_at AFTER UPDATE ON buyers
BEGIN
    UPDATE buyers SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

CREATE TRIGGER trg_purchase_orders_updated_at AFTER UPDATE ON purchase_orders
BEGIN
    UPDATE purchase_orders SET updated_at = CURRENT_TIMESTAMP WHERE po_number = OLD.po_number;
END;

CREATE TRIGGER trg_purchase_order_items_updated_at AFTER UPDATE ON purchase_order_items
BEGIN
    UPDATE purchase_order_items SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

CREATE TRIGGER trg_gst_invoices_updated_at AFTER UPDATE ON gst_invoices
BEGIN
    UPDATE gst_invoices SET updated_at = CURRENT_TIMESTAMP 
    WHERE invoice_number = OLD.invoice_number AND financial_year = OLD.financial_year;
END;

CREATE TRIGGER trg_srvs_updated_at AFTER UPDATE ON srvs
BEGIN
    UPDATE srvs SET updated_at = CURRENT_TIMESTAMP WHERE srv_number = OLD.srv_number;
END;

COMMIT;

PRAGMA foreign_keys = ON;

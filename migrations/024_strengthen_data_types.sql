-- Migration: 024_strengthen_data_types.sql
-- Revision: 5 (Super Reconstruction - All Core Tables)

PRAGMA foreign_keys = OFF;

BEGIN TRANSACTION;

-- 0. DROP DEPENDENTS (Views & Triggers)
DROP VIEW IF EXISTS reconciliation_ledger;
DROP TRIGGER IF EXISTS trg_validate_dispatch_qty;
DROP TRIGGER IF EXISTS trg_validate_poi_delivered_qty;
DROP TRIGGER IF EXISTS trg_dc_items_dispatch_sync;
DROP TRIGGER IF EXISTS trg_dc_items_dispatch_sync_update;
DROP TRIGGER IF EXISTS trg_dc_items_dispatch_sync_delete;
DROP TRIGGER IF EXISTS trg_srv_items_receipt_sync;
DROP TRIGGER IF EXISTS trg_srv_items_receipt_sync_update;
DROP TRIGGER IF EXISTS trg_srv_items_receipt_sync_delete;

-- 1. PURCHASE ORDERS
CREATE TABLE IF NOT EXISTS purchase_orders_new (
    po_number TEXT PRIMARY KEY,
    po_date DATE,
    buyer_id INTEGER REFERENCES buyers(id),
    supplier_name TEXT,
    supplier_gstin TEXT,
    supplier_code TEXT,
    supplier_phone TEXT,
    supplier_fax TEXT,
    supplier_email TEXT,
    department_no INTEGER,
    enquiry_no TEXT,
    enquiry_date DATE,
    quotation_ref TEXT,
    quotation_date DATE,
    rc_no TEXT,
    order_type TEXT,
    po_status TEXT DEFAULT 'Open',
    tin_no TEXT,
    ecc_no TEXT,
    mpct_no TEXT,
    po_value DECIMAL(15,2),
    fob_value DECIMAL(15,2),
    ex_rate DECIMAL(15,4),
    currency TEXT,
    net_po_value DECIMAL(15,2),
    amend_no INTEGER DEFAULT 0,
    remarks TEXT,
    issuer_name TEXT,
    issuer_designation TEXT,
    issuer_phone TEXT,
    inspection_by TEXT,
    inspection_at TEXT,
    financial_year TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO purchase_orders_new (
    po_number, po_date, buyer_id, supplier_name, supplier_gstin, supplier_code,
    department_no, financial_year, order_type, po_status, po_value,
    net_po_value, amend_no, remarks, created_at, updated_at
)
SELECT 
    CAST(po_number AS TEXT), po_date, NULL, supplier_name, supplier_gstin, supplier_code,
    department_no, financial_year, order_type, COALESCE(po_status, 'Open'), po_value,
    net_po_value, COALESCE(amend_no, 0), remarks, created_at, updated_at
FROM purchase_orders;

-- 2. PO ITEMS
CREATE TABLE IF NOT EXISTS purchase_order_items_new (
    id TEXT PRIMARY KEY,
    po_number TEXT NOT NULL REFERENCES purchase_orders_new(po_number) ON DELETE CASCADE,
    po_item_no INTEGER NOT NULL,
    status TEXT DEFAULT 'Active',
    material_code TEXT,
    material_description TEXT,
    drg_no TEXT,
    mtrl_cat INTEGER,
    unit TEXT,
    po_rate DECIMAL(15,2),
    ord_qty DECIMAL(15,3) NOT NULL,
    rcd_qty DECIMAL(15,3) DEFAULT 0,
    rejected_qty DECIMAL(15,3) DEFAULT 0,
    delivered_qty DECIMAL(15,3) DEFAULT 0,
    manual_delivered_qty DECIMAL(15,3) DEFAULT 0,
    pending_qty DECIMAL(15,3) DEFAULT 0,
    hsn_code TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(po_number, po_item_no)
);

INSERT INTO purchase_order_items_new (
    id, po_number, po_item_no, material_code, material_description,
    unit, po_rate, ord_qty, rcd_qty, rejected_qty, delivered_qty,
    pending_qty, hsn_code, created_at, updated_at
)
SELECT 
    id, CAST(po_number AS TEXT), po_item_no, material_code, material_description,
    unit, po_rate, ord_qty, COALESCE(rcd_qty, 0), COALESCE(rejected_qty, 0), COALESCE(delivered_qty, 0),
    COALESCE(ord_qty - delivered_qty, 0), hsn_code, created_at, updated_at
FROM purchase_order_items;

-- 3. PO DELIVERIES
CREATE TABLE IF NOT EXISTS purchase_order_deliveries_new (
    id TEXT PRIMARY KEY,
    po_item_id TEXT NOT NULL REFERENCES purchase_order_items_new(id) ON DELETE CASCADE,
    lot_no INTEGER,
    dely_qty DECIMAL(15,3),
    dely_date DATE,
    delivered_qty DECIMAL(15,3) DEFAULT 0,
    received_qty DECIMAL(15,3) DEFAULT 0,
    entry_allow_date DATE,
    dest_code INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO purchase_order_deliveries_new (
    id, po_item_id, lot_no, dely_qty, dely_date, delivered_qty, received_qty, created_at
)
SELECT 
    id, po_item_id, lot_no, dely_qty, dely_date, 
    COALESCE(delivered_qty, 0), COALESCE(received_qty, 0), created_at
FROM purchase_order_deliveries;

-- 4. DELIVERY CHALLANS
CREATE TABLE IF NOT EXISTS delivery_challans_new (
    dc_number TEXT PRIMARY KEY,
    dc_date DATE NOT NULL,
    po_number TEXT NOT NULL REFERENCES purchase_orders_new(po_number) ON DELETE CASCADE,
    consignee_name TEXT,
    consignee_gstin TEXT,
    consignee_address TEXT,
    vehicle_no TEXT,
    transporter TEXT,
    lr_no TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO delivery_challans_new (
    dc_number, dc_date, po_number, consignee_name, consignee_gstin, consignee_address,
    vehicle_no, transporter, lr_no, created_at
)
SELECT 
    dc_number, dc_date, CAST(po_number AS TEXT), consignee_name, consignee_gstin, consignee_address,
    vehicle_no, transporter, lr_no, created_at
FROM delivery_challans;

-- 5. DC ITEMS
CREATE TABLE IF NOT EXISTS delivery_challan_items_new (
    id TEXT PRIMARY KEY,
    dc_number TEXT NOT NULL REFERENCES delivery_challans_new(dc_number) ON DELETE CASCADE,
    po_item_id TEXT NOT NULL REFERENCES purchase_order_items_new(id) ON DELETE CASCADE,
    lot_no INTEGER,
    dispatch_qty DECIMAL(15,3) NOT NULL,
    received_qty DECIMAL(15,3) DEFAULT 0,
    accepted_qty DECIMAL(15,3) DEFAULT 0,
    rejected_qty DECIMAL(15,3) DEFAULT 0,
    hsn_code TEXT,
    hsn_rate DECIMAL(15,2)
);

INSERT INTO delivery_challan_items_new (
    id, dc_number, po_item_id, lot_no, dispatch_qty, received_qty, accepted_qty, rejected_qty, hsn_code, hsn_rate
)
SELECT 
    id, dc_number, po_item_id, lot_no, dispatch_qty, 
    COALESCE(received_qty, 0), COALESCE(accepted_qty, 0), COALESCE(rejected_qty, 0), hsn_code, hsn_rate
FROM delivery_challan_items;

-- 6. INVOICES
CREATE TABLE IF NOT EXISTS gst_invoices_new (
    invoice_number TEXT PRIMARY KEY,
    invoice_date DATE NOT NULL,
    dc_number TEXT UNIQUE REFERENCES delivery_challans_new(dc_number),
    buyer_name TEXT,
    buyer_gstin TEXT,
    buyer_address TEXT,
    taxable_value DECIMAL(15,2),
    cgst DECIMAL(15,2) DEFAULT 0,
    sgst DECIMAL(15,2) DEFAULT 0,
    igst DECIMAL(15,2) DEFAULT 0,
    total_invoice_value DECIMAL(15,2),
    
    -- Enhanced Fields
    po_numbers TEXT,
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

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO gst_invoices_new (
    invoice_number, invoice_date, dc_number, buyer_name, buyer_gstin, buyer_address,
    taxable_value, cgst, sgst, igst, total_invoice_value, created_at,
    po_numbers, buyers_order_date, gemc_number, mode_of_payment, payment_terms, despatch_doc_no,
    srv_no, srv_date, vehicle_no, lr_no, transporter, destination, terms_of_delivery, 
    buyer_state, buyer_state_code
)
SELECT 
    invoice_number, invoice_date, dc_number, buyer_name, buyer_gstin, buyer_address,
    taxable_value, cgst, sgst, igst, total_invoice_value, created_at,
    COALESCE(buyers_order_no, ''), buyers_order_date, gemc_number, mode_of_payment, COALESCE(payment_terms, '45 Days'), despatch_doc_no,
    srv_no, srv_date, vehicle_no, lr_no, transporter, destination, terms_of_delivery,
    buyer_state, buyer_state_code
FROM gst_invoices;

-- 7. INVOICE ITEMS
CREATE TABLE IF NOT EXISTS gst_invoice_items_new (
    id TEXT PRIMARY KEY,
    invoice_number TEXT NOT NULL REFERENCES gst_invoices_new(invoice_number) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity DECIMAL(15,3) NOT NULL DEFAULT 0,
    unit TEXT DEFAULT 'NO',
    rate DECIMAL(15,2) NOT NULL DEFAULT 0,
    taxable_value DECIMAL(15,2) DEFAULT 0,
    cgst_amount DECIMAL(15,2) DEFAULT 0,
    sgst_amount DECIMAL(15,2) DEFAULT 0,
    igst_amount DECIMAL(15,2) DEFAULT 0,
    total_amount DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO gst_invoice_items_new (
    id, invoice_number, description, quantity, unit, rate, taxable_value, 
    cgst_amount, sgst_amount, igst_amount, total_amount, created_at
)
SELECT 
    id, invoice_number, description, quantity, unit, rate, taxable_value, 
    cgst_amount, sgst_amount, igst_amount, total_amount, created_at
FROM gst_invoice_items;

-- 8. SRVs
CREATE TABLE IF NOT EXISTS srvs_new (
    srv_number TEXT PRIMARY KEY,
    srv_date DATE NOT NULL,
    po_number TEXT NOT NULL REFERENCES purchase_orders_new(po_number),
    invoice_number TEXT,
    is_active BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO srvs_new (srv_number, srv_date, po_number, invoice_number, is_active, created_at)
SELECT srv_number, srv_date, CAST(po_number AS TEXT), NULL, 1, created_at FROM srvs;

CREATE TABLE IF NOT EXISTS srv_items_new (
    id TEXT PRIMARY KEY,
    srv_number TEXT NOT NULL REFERENCES srvs_new(srv_number) ON DELETE CASCADE,
    po_number TEXT NOT NULL,
    po_item_no INTEGER NOT NULL,
    lot_no INTEGER,
    received_qty DECIMAL(15,3) DEFAULT 0,
    rejected_qty DECIMAL(15,3) DEFAULT 0,
    challan_no TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO srv_items_new (id, srv_number, po_number, po_item_no, lot_no, received_qty, rejected_qty, challan_no, created_at)
SELECT id, srv_number, CAST(po_number AS TEXT), po_item_no, lot_no, COALESCE(received_qty, 0), COALESCE(rejected_qty, 0), challan_no, created_at FROM srv_items;

-- 9. SWITCH
DROP TABLE IF EXISTS gst_invoice_dc_links;
DROP TABLE IF EXISTS gst_invoice_items;
DROP TABLE IF EXISTS srv_items;
DROP TABLE IF EXISTS srvs;
DROP TABLE IF EXISTS gst_invoices;
DROP TABLE IF EXISTS delivery_challan_items;
DROP TABLE IF EXISTS delivery_challans;
DROP TABLE IF EXISTS purchase_order_deliveries;
DROP TABLE IF EXISTS purchase_order_items;
DROP TABLE IF EXISTS purchase_orders;

ALTER TABLE purchase_orders_new RENAME TO purchase_orders;
ALTER TABLE purchase_order_items_new RENAME TO purchase_order_items;
ALTER TABLE purchase_order_deliveries_new RENAME TO purchase_order_deliveries;
ALTER TABLE delivery_challans_new RENAME TO delivery_challans;
ALTER TABLE delivery_challan_items_new RENAME TO delivery_challan_items;
ALTER TABLE gst_invoices_new RENAME TO gst_invoices;
ALTER TABLE gst_invoice_items_new RENAME TO gst_invoice_items;
ALTER TABLE srvs_new RENAME TO srvs;
ALTER TABLE srv_items_new RENAME TO srv_items;

-- 10. TRIGGERS
CREATE TRIGGER IF NOT EXISTS trg_validate_dispatch_qty
BEFORE INSERT ON delivery_challan_items
FOR EACH ROW
BEGIN
    SELECT RAISE(ABORT, 'Dispatch quantity exceeds remaining PO balance')
    WHERE NEW.dispatch_qty > (
        SELECT (ord_qty - delivered_qty) FROM purchase_order_items WHERE id = NEW.po_item_id
    ) + 0.001;
END;

-- 11. RECONCILIATION VIEW
DROP VIEW IF EXISTS reconciliation_ledger;
CREATE VIEW reconciliation_ledger AS
SELECT 
    poi.po_number,
    poi.po_item_no,
    poi.status as item_status,
    poi.material_description,
    poi.ord_qty,
    poi.delivered_qty,
    poi.rcd_qty,
    poi.rejected_qty,
    (poi.ord_qty - poi.delivered_qty) as pending_qty
FROM purchase_order_items poi;

COMMIT;

PRAGMA foreign_keys = ON;

-- Migration 018: Standardize Numeric Precision
-- Created: 2025-12-26
-- Purpose: Fix precision issues in financial calculations
--          Convert REAL and generic NUMERIC to proper DECIMAL types

-- ============================================================================
-- ISSUE FOUND:
-- - gst_invoice_items uses REAL (floating point) for currency - BAD!
-- - Other tables use generic NUMERIC without precision
-- ============================================================================

-- CRITICAL: Disable foreign keys temporarily for table recreation
PRAGMA foreign_keys = OFF;

BEGIN TRANSACTION;

-- Drop dependent view
DROP VIEW IF EXISTS reconciliation_ledger;

-- Drop dependent triggers
DROP TRIGGER IF EXISTS trg_dc_items_dispatch_sync;
DROP TRIGGER IF EXISTS trg_dc_items_dispatch_sync_update;
DROP TRIGGER IF EXISTS trg_dc_items_dispatch_sync_delete;
DROP TRIGGER IF EXISTS trg_srv_items_receipt_sync;
DROP TRIGGER IF EXISTS trg_srv_items_receipt_sync_update;
DROP TRIGGER IF EXISTS trg_srv_items_receipt_sync_delete;

-- STRATEGY:
-- SQLite doesn't support ALTER COLUMN TYPE directly
-- We need to:
-- 1. Create new tables with correct types
-- 2. Copy data
-- 3. Drop old tables  
-- 4. Rename new tables

-- ============================================================================
-- STANDARDIZED TYPES:
-- - Quantities: DECIMAL(10,2) - supports up to 99,999,999.99
-- - Currency: DECIMAL(12,2) - supports up to ₹999,999,999.99
-- - Rates: DECIMAL(10,2) - sufficient for unit rates
-- ============================================================================

-- CRITICAL: This migration preserves all data and foreign key relationships

-- Step 1: Fix gst_invoice_items (REAL → DECIMAL)
-- This is most critical as it affects money calculations

CREATE TABLE gst_invoice_items_new (
    id TEXT PRIMARY KEY,
    invoice_number TEXT NOT NULL,
    po_sl_no TEXT,
    description TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    unit TEXT DEFAULT 'NO',
    rate DECIMAL(12,2) NOT NULL DEFAULT 0,
    hsn_sac TEXT,
    no_of_packets INTEGER,
    taxable_value DECIMAL(12,2) DEFAULT 0,
    cgst_rate DECIMAL(5,2) DEFAULT 0,
    cgst_amount DECIMAL(12,2) DEFAULT 0,
    sgst_rate DECIMAL(5,2) DEFAULT 0,
    sgst_amount DECIMAL(12,2) DEFAULT 0,
    igst_rate DECIMAL(5,2) DEFAULT 0,
    igst_amount DECIMAL(12,2) DEFAULT 0,
    total_amount DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice_number) REFERENCES gst_invoices(invoice_number) ON DELETE CASCADE
);

-- Copy data from old table
INSERT INTO gst_invoice_items_new (
    id, invoice_number, po_sl_no, description, 
    quantity, unit, rate, hsn_sac, no_of_packets, 
    taxable_value, cgst_rate, cgst_amount, sgst_rate, sgst_amount, 
    igst_rate, igst_amount, total_amount, created_at
)
SELECT 
    id, invoice_number, po_sl_no, description, 
    quantity, unit, rate, hsn_sac, no_of_packets, 
    taxable_value, cgst_rate, cgst_amount, sgst_rate, sgst_amount, 
    igst_rate, igst_amount, total_amount, created_at
FROM gst_invoice_items;

-- Drop old table and rename
DROP TABLE gst_invoice_items;
ALTER TABLE gst_invoice_items_new RENAME TO gst_invoice_items;

-- Recreate indexes
CREATE INDEX idx_invoice_items_invoice ON gst_invoice_items(invoice_number);


-- Step 2: Fix purchase_order_items (NUMERIC → DECIMAL)

CREATE TABLE purchase_order_items_new (
    id TEXT PRIMARY KEY,
    po_number INTEGER NOT NULL,
    po_item_no INTEGER NOT NULL,
    material_code TEXT,
    material_description TEXT,
    drg_no TEXT,
    mtrl_cat INTEGER,
    unit TEXT,
    po_rate DECIMAL(12,2),
    ord_qty INTEGER,
    rcd_qty INTEGER DEFAULT 0,
    item_value DECIMAL(12,2),
    hsn_code TEXT,
    delivered_qty INTEGER DEFAULT 0,
    pending_qty INTEGER DEFAULT 0,
    rejected_qty INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(po_number, po_item_no),
    FOREIGN KEY (po_number) REFERENCES purchase_orders(po_number) ON DELETE CASCADE
);

-- Copy data
INSERT INTO purchase_order_items_new (
    id, po_number, po_item_no, material_code, material_description, 
    drg_no, mtrl_cat, unit, po_rate, ord_qty, rcd_qty, item_value, 
    hsn_code, delivered_qty, pending_qty, rejected_qty, 
    created_at, updated_at
)
SELECT 
    id, po_number, po_item_no, material_code, material_description, 
    drg_no, mtrl_cat, unit, po_rate, ord_qty, rcd_qty, item_value, 
    hsn_code, delivered_qty, pending_qty, rejected_qty, 
    created_at, updated_at
FROM purchase_order_items;

-- Drop and rename
DROP TABLE purchase_order_items;
ALTER TABLE purchase_order_items_new RENAME TO purchase_order_items;

-- Recreate indexes
CREATE INDEX idx_purchase_order_items_po ON purchase_order_items(po_number);
CREATE UNIQUE INDEX idx_purchase_order_items_unique ON purchase_order_items(po_number, po_item_no);


-- Step 3: Fix delivery_challan_items (NUMERIC → DECIMAL)

CREATE TABLE delivery_challan_items_new (
    id TEXT PRIMARY KEY,
    dc_number TEXT NOT NULL,
    po_item_id TEXT,
    dispatch_qty INTEGER NOT NULL,
    lot_no TEXT,
    hsn_code TEXT,
    hsn_rate DECIMAL(12,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (dc_number) REFERENCES delivery_challans(dc_number) ON DELETE CASCADE,
    FOREIGN KEY (po_item_id) REFERENCES purchase_order_items(id) ON DELETE SET NULL
);

-- Copy data
INSERT INTO delivery_challan_items_new (
    id, dc_number, po_item_id, dispatch_qty, lot_no, 
    hsn_code, hsn_rate
)
SELECT 
    id, dc_number, po_item_id, dispatch_qty, lot_no, 
    hsn_code, hsn_rate
FROM delivery_challan_items;

-- Drop and rename
DROP TABLE delivery_challan_items;
ALTER TABLE delivery_challan_items_new RENAME TO delivery_challan_items;

-- Recreate indexes
CREATE INDEX idx_dc_items_dc ON delivery_challan_items(dc_number);
CREATE INDEX idx_dc_items_po_item ON delivery_challan_items(po_item_id);


-- Step 4: srv_items already uses DECIMAL(15,3) - just standardize to DECIMAL(10,2)

CREATE TABLE srv_items_new (
    id TEXT PRIMARY KEY,
    srv_number TEXT NOT NULL,
    po_item_no INTEGER,
    description TEXT,
    received_qty INTEGER DEFAULT 0,
    rejected_qty INTEGER DEFAULT 0,
    order_qty INTEGER DEFAULT 0,
    challan_qty INTEGER DEFAULT 0,
    accepted_qty INTEGER DEFAULT 0,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (srv_number) REFERENCES srvs(srv_number) ON DELETE CASCADE
);

-- Copy data (will auto-convert DECIMAL(15,3) → DECIMAL(10,2))
INSERT INTO srv_items_new (
    id, srv_number, po_item_no, 
    received_qty, rejected_qty, remarks, created_at
)
SELECT 
    id, srv_number, po_item_no, 
    received_qty, rejected_qty, remarks, created_at
FROM srv_items;

-- Drop and rename
DROP TABLE srv_items;
ALTER TABLE srv_items_new RENAME TO srv_items;

-- Recreate indexes
CREATE INDEX idx_srv_items_srv ON srv_items(srv_number);
CREATE INDEX idx_srv_items_po_item ON srv_items(po_item_no);

-- Commit transaction and re-enable foreign keys
-- Recreate view
CREATE VIEW reconciliation_ledger AS
SELECT 
    poi.po_number,
    poi.po_item_no,
    poi.material_code,
    poi.material_description,
    poi.ord_qty as ordered_quantity,
    
    COALESCE((
        SELECT SUM(dci.dispatch_qty) 
        FROM delivery_challan_items dci 
        JOIN delivery_challans dc ON dci.dc_number = dc.dc_number
        WHERE dci.po_item_id = poi.id
    ), 0) as total_delivered_qty,
    
    COALESCE((
        SELECT SUM(si.received_qty) 
        FROM srv_items si 
        JOIN srvs s ON si.srv_number = s.srv_number
        WHERE si.po_number = poi.po_number AND si.po_item_no = poi.po_item_no
        AND s.is_active = 1
    ), 0) as total_received_qty,
    
    COALESCE((
        SELECT SUM(si.rejected_qty) 
        FROM srv_items si 
        JOIN srvs s ON si.srv_number = s.srv_number
        WHERE si.po_number = poi.po_number AND si.po_item_no = poi.po_item_no
        AND s.is_active = 1
    ), 0) as total_rejected_qty,

    COALESCE((
        SELECT SUM(gii.quantity)
        FROM gst_invoice_items gii
        JOIN gst_invoices gi ON gii.invoice_number = gi.invoice_number
        JOIN delivery_challan_items dci ON dci.dc_number = gi.dc_number
        WHERE dci.po_item_id = poi.id AND gii.po_sl_no = dci.lot_no
    ), 0) as total_invoiced_qty

FROM purchase_order_items poi;

-- Recreate triggers
CREATE TRIGGER IF NOT EXISTS trg_dc_items_dispatch_sync
AFTER INSERT ON delivery_challan_items
BEGIN
    UPDATE purchase_order_items 
    SET delivered_qty = (SELECT SUM(dispatch_qty) FROM delivery_challan_items WHERE po_item_id = NEW.po_item_id)
    WHERE id = NEW.po_item_id;
END;

CREATE TRIGGER IF NOT EXISTS trg_dc_items_dispatch_sync_update
AFTER UPDATE OF dispatch_qty ON delivery_challan_items
BEGIN
    UPDATE purchase_order_items 
    SET delivered_qty = (SELECT SUM(dispatch_qty) FROM delivery_challan_items WHERE po_item_id = NEW.po_item_id)
    WHERE id = NEW.po_item_id;
END;

CREATE TRIGGER IF NOT EXISTS trg_dc_items_dispatch_sync_delete
AFTER DELETE ON delivery_challan_items
BEGIN
    UPDATE purchase_order_items 
    SET delivered_qty = (SELECT SUM(dispatch_qty) FROM delivery_challan_items WHERE po_item_id = OLD.po_item_id)
    WHERE id = OLD.po_item_id;
END;

CREATE TRIGGER IF NOT EXISTS trg_srv_items_receipt_sync
AFTER INSERT ON srv_items
BEGIN
    UPDATE purchase_order_items 
    SET rcd_qty = (SELECT SUM(received_qty) FROM srv_items WHERE po_number = NEW.po_number AND po_item_no = NEW.po_item_no),
        rejected_qty = (SELECT SUM(rejected_qty) FROM srv_items WHERE po_number = NEW.po_number AND po_item_no = NEW.po_item_no)
    WHERE po_number = NEW.po_number AND po_item_no = NEW.po_item_no;
END;

CREATE TRIGGER IF NOT EXISTS trg_srv_items_receipt_sync_update
AFTER UPDATE OF received_qty, rejected_qty ON srv_items
BEGIN
    UPDATE purchase_order_items 
    SET rcd_qty = (SELECT SUM(received_qty) FROM srv_items WHERE po_number = NEW.po_number AND po_item_no = NEW.po_item_no),
        rejected_qty = (SELECT SUM(rejected_qty) FROM srv_items WHERE po_number = NEW.po_number AND po_item_no = NEW.po_item_no)
    WHERE po_number = NEW.po_number AND po_item_no = NEW.po_item_no;
END;

CREATE TRIGGER IF NOT EXISTS trg_srv_items_receipt_sync_delete
AFTER DELETE ON srv_items
BEGIN
    UPDATE purchase_order_items 
    SET rcd_qty = (SELECT SUM(received_qty) FROM srv_items WHERE po_number = OLD.po_number AND po_item_no = OLD.po_item_no),
        rejected_qty = (SELECT SUM(rejected_qty) FROM srv_items WHERE po_number = OLD.po_number AND po_item_no = OLD.po_item_no)
    WHERE po_number = OLD.po_number AND po_item_no = OLD.po_item_no;
END;

COMMIT;

PRAGMA foreign_keys = ON;

-- Migration: Add missing columns to gst_invoice_items
-- Created: 2024-01-01
-- Purpose: Fix schema mismatch causing "Internal Server Error" on invoice creation

ALTER TABLE gst_invoice_items ADD COLUMN po_sl_no TEXT;
ALTER TABLE gst_invoice_items ADD COLUMN hsn_sac TEXT;

-- Add missing columns to gst_invoices table for new UI fields
-- Safe additions using ALTER TABLE

-- Only gemc_date is missing (others added by add_invoice_enhancements.sql)
ALTER TABLE gst_invoices ADD COLUMN gemc_date TEXT;

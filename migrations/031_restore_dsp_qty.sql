-- Migration: 031_restore_dsp_qty.sql
-- Purpose: Restore dsp_qty column to purchase_order_deliveries table to fix DC creation error.
-- This column is used to track dispatched quantity per lot.

ALTER TABLE purchase_order_deliveries ADD COLUMN dsp_qty REAL DEFAULT 0;

-- Optional: If we need initialized values, we might need a complex UPDATE based on delivery_challan_items
-- For now, defaulting to 0 allows the query to run.
-- The user request "add back dispatch column" implies it might have been there and dropped, or just missing.
-- We will proceed with adding it.

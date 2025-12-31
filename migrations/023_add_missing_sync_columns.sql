-- Migration: 023_add_missing_sync_columns.sql
-- Purpose: Restore columns for atomic sync that were in the legacy backend/migrations folder

-- 1. Add columns to purchase_order_deliveries (Lot Level)
ALTER TABLE purchase_order_deliveries ADD COLUMN delivered_qty INTEGER DEFAULT 0;
ALTER TABLE purchase_order_deliveries ADD COLUMN received_qty INTEGER DEFAULT 0;

-- 2. Add columns to delivery_challan_items (Challan Line Level)
-- These allow tracking how much of a specific DC line has been received
ALTER TABLE delivery_challan_items ADD COLUMN received_qty INTEGER DEFAULT 0;
ALTER TABLE delivery_challan_items ADD COLUMN accepted_qty INTEGER DEFAULT 0;
ALTER TABLE delivery_challan_items ADD COLUMN rejected_qty INTEGER DEFAULT 0;

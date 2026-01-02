-- Migration: 029_add_manual_override_columns.sql
-- Purpose: Ensure manual override columns exist for decoupled delivery logic

-- 1. Add manual_override_qty to lot level
ALTER TABLE purchase_order_deliveries ADD COLUMN manual_override_qty DECIMAL(15,3) DEFAULT 0;

-- 2. Add manual_delivered_qty to item level
ALTER TABLE purchase_order_items ADD COLUMN manual_delivered_qty DECIMAL(15,3) DEFAULT 0;

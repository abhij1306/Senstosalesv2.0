-- Migration: Add Integrity Check Constraints
-- Purpose: Ensure delivered_qty does not exceed ord_qty in purchase_order_items

CREATE TRIGGER IF NOT EXISTS check_delivered_qty_le_ord_qty_insert
BEFORE INSERT ON purchase_order_items
FOR EACH ROW
WHEN NEW.delivered_qty > NEW.ord_qty
BEGIN
    SELECT RAISE(ABORT, 'Delivered quantity cannot exceed ordered quantity');
END;

CREATE TRIGGER IF NOT EXISTS check_delivered_qty_le_ord_qty_update
BEFORE UPDATE ON purchase_order_items
FOR EACH ROW
WHEN NEW.delivered_qty > NEW.ord_qty
BEGIN
    SELECT RAISE(ABORT, 'Delivered quantity cannot exceed ordered quantity');
END;

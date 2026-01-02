-- Migration: 028_add_srv_itm_and_rev_no.sql
-- Purpose: Add srv_item_no and rev_no to srv_items table for full manifest parity

ALTER TABLE srv_items ADD COLUMN srv_item_no INTEGER;
ALTER TABLE srv_items ADD COLUMN rev_no INTEGER;

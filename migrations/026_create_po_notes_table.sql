-- Migration 026: Create PO Notes Table
-- Stores reusable note templates for Purchase Orders
-- NOTE: Table already exists from migration 003 as po_notes_templates
-- This migration ensures it exists if migration 003 was skipped

CREATE TABLE IF NOT EXISTS po_notes_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    is_active INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add index for active notes
CREATE INDEX IF NOT EXISTS idx_po_notes_templates_active ON po_notes_templates(is_active, created_at DESC);

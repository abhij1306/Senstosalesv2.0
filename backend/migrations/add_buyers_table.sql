-- Migration: Add Buyers Table
-- PRD Version: 1.0

CREATE TABLE IF NOT EXISTS buyers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    gstin TEXT NOT NULL UNIQUE,
    billing_address TEXT NOT NULL,
    shipping_address TEXT,
    place_of_supply TEXT NOT NULL,
    state TEXT,
    state_code TEXT,
    is_default BOOLEAN DEFAULT 0,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index for quick lookup of default buyer
CREATE INDEX IF NOT EXISTS idx_buyers_default ON buyers(is_default) WHERE is_default = 1;

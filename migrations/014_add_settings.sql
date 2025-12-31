-- Add settings table for global configuration
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Seed initial settings if table is empty
INSERT OR IGNORE INTO settings (key, value) VALUES ('supplier_name', 'SenstoSales Admin');
INSERT OR IGNORE INTO settings (key, value) VALUES ('supplier_gstin', '');
INSERT OR IGNORE INTO settings (key, value) VALUES ('supplier_address', '');
INSERT OR IGNORE INTO settings (key, value) VALUES ('supplier_contact', '');
INSERT OR IGNORE INTO settings (key, value) VALUES ('supplier_state', 'Madhya Pradesh');
INSERT OR IGNORE INTO settings (key, value) VALUES ('supplier_state_code', '23');

-- Legacy / Fallback
INSERT OR IGNORE INTO settings (key, value) VALUES ('company_name', 'Sensto');
INSERT OR IGNORE INTO settings (key, value) VALUES ('company_gstin', '');
INSERT OR IGNORE INTO settings (key, value) VALUES ('company_address', '');

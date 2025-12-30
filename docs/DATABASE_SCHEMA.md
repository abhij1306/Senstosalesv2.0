# Database Schema Reference

> **Engine**: SQLite | **ORM**: SQLAlchemy | **Version**: 1.2

## 1. Core Tables

### `purchase_orders`
The central contract entity.
- `po_number` (PK, TEXT): Unique Identifier.
- `po_date` (DATE): Issuance date.
- `supplier_code` (TEXT): Vendor ID.
- `department_no` (TEXT): Buyer Unit/Dept.
- `po_status` (TEXT): 'Draft', 'Pending', 'Delivered', 'Closed'.
- `financial_year` (TEXT): Scope.

### `purchase_order_items`
Line items within a PO.
- `id` (PK, UUID).
- `po_number` (FK -> purchase_orders).
- `material_code` (TEXT): SKU.
- `ord_qty` (FLOAT): Total Ordered.
- `delivered_qty` (FLOAT): High Water Mark of fulfillment.
- `unit` (TEXT): UOM.
- `po_rate` (FLOAT): Unit Price.

### `delivery_challans`
Shipment records.
- `dc_number` (PK, TEXT).
- `po_number` (FK -> purchase_orders).
- `dc_date` (DATE).
- `vehicle_no` (TEXT).

### `delivery_challan_items`
Link between DC and PO Items.
- `id` (PK).
- `dc_number` (FK).
- `po_item_id` (FK).
- `dispatch_qty` (FLOAT).

### `gst_invoices`
Tax Invoices.
- `invoice_number` (PK, TEXT).
- `taxable_value` (FLOAT).
- `cgst`, `sgst`, `igst` (FLOAT): Tax components.
- `total_invoice_value` (FLOAT).

### `srvs`
Store Receipt Vouchers (Customer Acceptance).
- `srv_number` (PK, TEXT).
- `po_number` (FK).
- `srv_date` (DATE).

## 2. Master Data

### `buyers`
Customer Registry.
- `id` (PK).
- `name` (TEXT).
- `gstin` (TEXT).
- `state_code` (TEXT): For tax calc.

### `hsn_master`
Tax Rate Lookup.
- `hsn_code` (PK).
- `gst_rate` (FLOAT): 18.0, 12.0, etc.

## 3. Relationships

- **PO -> Items**: One-to-Many.
- **PO -> DC**: One-to-Many.
- **DC -> Invoice**: Many-to-One (Usually 1:1, but system allows aggregation).
- **PO -> SRV**: One-to-Many.

## 4. Constraints & Triggers

- **`chk_qty_integrity`**: `CHECK (delivered_qty <= ord_qty)` on `purchase_order_items`.
- **Foreign Keys**: Cascade Delete is generally restricted (RESTRICT) to prevent data loss, except for Draft items.

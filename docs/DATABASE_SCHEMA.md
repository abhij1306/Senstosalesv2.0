# Database Schema Reference

> **Engine**: SQLite | **Version**: 2.0 (Standardized Precision)

## 1. Core Tables

### `purchase_orders`
The central contract entity.
- `po_number` (PK, TEXT): Unique Identifier (Supports Alphanumeric).
- `po_date` (DATE): Issuance date.
- `buyer_id` (INTEGER): Link to `buyers` master table.
- `supplier_name` (TEXT): Snapshot of supplier name.
- `department_no` (INTEGER): Buyer Unit/Dept ID.
- `po_status` (TEXT): 'Open', 'Pending', 'Delivered', 'Closed'.
- `amend_no` (INTEGER): Amendment counter (starts at 0).
- `financial_year` (TEXT): Format '202X-2X'.
- `updated_at` (TIMESTAMP): Auto-updated via trigger.

### `purchase_order_items`
Line items within a PO.
- `id` (PK, UUID).
- `po_item_no` (INTEGER): Item number from PO document.
- `status` (TEXT): 'Active' or 'Cancelled' (for Amendments).
- `ord_qty` (DECIMAL 15,3).
- `delivered_qty` (DECIMAL 15,3): High Water Mark (MAX of Dispatch/Received).
- `rcd_qty` (DECIMAL 15,3): Total Received from SRVs.
- `rejected_qty` (DECIMAL 15,3): Total Rejected from SRVs.
- `pending_qty` (DECIMAL 15,3): 0 if Cancelled, else (ORD - DLV).
- `unit` (TEXT): UOM.
- `po_rate` (DECIMAL 12,2): Unit Price.
- `item_value` (DECIMAL 12,2): Total Item Value.
- `updated_at` (TIMESTAMP): Auto-updated via trigger.

### `delivery_challans`
Shipment records.
- `dc_number` (PK, TEXT).
- `po_number` (FK -> purchase_orders).
- `dc_date` (DATE).
- `financial_year` (TEXT).
- `UNIQUE(dc_number, financial_year)`

### `delivery_challan_items`
Link between DC and PO Items.
- `id` (PK, UUID).
- `dc_number` (FK -> delivery_challans).
- `po_item_id` (FK -> purchase_order_items).
- `lot_no` (INTEGER).
- `dispatch_qty` (DECIMAL 15,3).
- `received_qty` (DECIMAL 15,3).
- `accepted_qty` (DECIMAL 15,3).
- `rejected_qty` (DECIMAL 15,3).

### `gst_invoices`
Tax Invoices.
- `invoice_number` (PRIMARY KEY, TEXT).
- `invoice_date` (DATE).
- `financial_year` (PRIMARY KEY, TEXT).
- `dc_number` (TEXT, UNIQUE): Linked DC (1:1 Relationship).
- `taxable_value` (DECIMAL 12,2).
- `cgst`, `sgst`, `igst` (DECIMAL 12,2): Tax amounts.
- `total_invoice_value` (DECIMAL 12,2).
- `updated_at` (TIMESTAMP): Auto-updated via trigger.

### `srvs`
Store Receipt Vouchers (Customer Acceptance).
- `srv_number` (PK, TEXT).
- `srv_date` (DATE).
- `po_number` (FK -> purchase_orders).
- `invoice_number` (TEXT, UNIQUE): Linked Invoice (1:1 Relationship).

## 2. Master Data

### `buyers`
Customer Registry.
- `id` (PK, INTEGER).
- `name` (TEXT).
- `department_no` (TEXT, UNIQUE): DVN Code.
- `supplier_code` (TEXT, UNIQUE): Vendor Code.
- `gstin` (TEXT).
- `state_code` (TEXT).
- `is_default` (BOOLEAN).

### `settings`
Global Configuration.
- `key` (PK, TEXT).
- `value` (TEXT).

## 3. Relationships

- **PO -> Items**: One-to-Many.
- **PO -> DC**: One-to-Many.
- **DC -> Invoice**: **One-to-One (Strict)**. Linked via `gst_invoices.dc_number`.
- **Invoice -> SRV**: **One-to-One (Strict)**. Linked via `srvs.invoice_number`.
- **PO -> SRV**: One-to-Many (via PO items).

- **Quantities**: Always `DECIMAL(15,3)`. Supports fractional units (Kg, Mtr).
- **Monetary Values**: Always `DECIMAL(15,2)`. Rounded to 2 digits.
- **Tax Rates**: `DECIMAL(5,2)`.
- **Comparison Tolerance**: `0.001` (to account for floating point errors).

## 5. Constraints & Triggers

- **`Triangle of Truth`**: Atomic triggers/service logic ensure `delivered_qty = MAX(dispatch_qty, received_qty)`.
- **`Atomic Inventory`**: `DC-1` prevents dispatching more than the PO ordered quantity.
- **Foreign Keys**: `ON DELETE CASCADE` for items, `RESTRICT` for headers to maintain history.

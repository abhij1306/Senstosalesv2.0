# BUSINESS LOGIC & SYSTEM INVARIANTS (THE BIBLE)
> **Status**: ENFORCED
> **Last Updated**: 2025-12-30

This document is the **Single Source of Truth** for all business logic, data flows, and system invariants in the SenstoSales application. Any code that violates these rules is considered a critical bug.

---

## 1. SYSTEM CONTEXT (Business Model)

### 1.1 The Role: Supplier
The SenstoSales system is built for a **Supplier** (Vendor) who manages orders from multiple **Buyers** (Customers).
- **User**: The Supplier (e.g., SenstoSales Admin).
- **Counterparty**: The Buyer (e.g., BHEL, NTPC, Various Plant Units).

### 1.2 The Core Workflow
The lifecycle represents the "Order-to-Cash" process from the Supplier's perspective:
1.  **Receive PO (Purchase Order)**: Buyer issues a contract to the Supplier.
2.  **Dispatch Goods (DC)**: Supplier manufactures and ships goods, issuing a **Delivery Challan**.
3.  **Bill Buyer (Invoice)**: Supplier generates a **Tax Invoice** linked to the DC.
4.  **Confirm Receipt (SRV)**: Buyer acknowledges receipt via a **Store Receipt Voucher (SRV)**.

### 1.3 Completion Criteria
A Purchase Order is considered **CLOSED** (Complete) only when:
> `Total Received Quantity (SRV) >= Total Ordered Quantity (PO) - 0.001`

**High-Water Mark (DLV)**: The system enforces that the high-water mark of fulfillment is at least the maximum of shipments (DC) or receipts (SRV).

---

| Term | Definition | Source of Truth |
| :--- | :--- | :--- |
| **PO (Purchase Order)** | Buyer's contract. Supports Alphanumeric IDs. | `purchase_orders` |
| **DC (Delivery Challan)** | Shipment proof. Linked 1:1 with Invoice. | `delivery_challans` |
| **Invoice (GST Invoice)** | Tax bill. Linked 1:1 with DC. | `gst_invoices` |
| **Ordered Qty (ORD)** | Total quantity (supports 3 decimal places). | `purchase_order_items.ord_qty` |
| **Dispatched Qty (DSP)** | Quantity shipped via DCs (3 decimals). | `SUM(dispatch_qty)` |
| **Received Qty (RECD)** | Quantity acknowledged by customer (3 decimals). | `SUM(received_qty)` |
| **Delivered Qty (DLV)** | High Water Mark. `MAX(DSP, RECD) + Tolerance`. | `purchase_order_items.delivered_qty` |
| **Balance (BAL)** | Remaining quantity. `ORD - DLV`. | Calculated (Decimal) |

---

## 3. SYSTEM FEATURES

### 3.1 Multi-Buyer Management
The system is architected to handle multiple distinct Buyers (Units) simultaneously.
- **Buyer Precision**: Unique linkage is established via `Department No` (DVN) and `Supplier Code`.
- **Financial Year Tracking**: All documents (Invoices, DCs) are scoped to a Financial Year (FY) to prevent number collision across cycles.

### 3.2 Taxation & Financials
- **GST Compliance**:
    - **Inter-State (IGST)**: Applied when Supplier State != Buyer State.
    - **Intra-State (CGST + SGST)**: Applied when Supplier State == Buyer State.
- **Tax Calculation**:
    - Tax Rate is derived from the **Item HSN Code** in the PO.
    - Calculation is performed rigidly on the Server Side (Invariant INV-2).

### 3.3 Data Ingestion Features
- **Batch Upload**: Processing of multiple HTML PO files in parallel.
- **Smart Scraper**: Auto-extraction of tables, merged rows, and nested delivery schedules.
- **Amendment Handling (V6.0)**: Detects `Amnt No` revisions.
    - **Soft Cancellation**: Items missing in the latest amendment file are marked `status = 'Cancelled'`.
    - **Pending Protection**: Cancelled items have their `pending_qty` forced to `0` regardless of previous fulfillment.
    - **Item Preservation**: Existing delivery/receipt history for matching items is preserved and reconciled during refresh.
- **TOT-2 (Reconciliation)**: `delivered_qty` is calculated as `MAX(total_dispatched_via_dc, total_received_via_srv)`.
- **TOT-5 (Reconciliation Sync)**: `ReconciliationService.sync_po()` is the atomic authority on quantity state.
- **Precision (P-01)**: All quantities processed with 15,3 decimal precision and 0.001 tolerance.

---

## 4. PO DATA STRUCTURE

The system extracts and stores the following fields from every Purchase Order:

### 4.1 Header Fields
| Field Name | Description |
| :--- | :--- |
| **PO Number** | Unique Identifier (Primary Key). |
| **PO Date** | Date of issuance. |
| **Supplier Details** | Name, Code, Phone, Fax, Email. |
| **References** | Enquiry No/Date, Quotation Ref/Date, RC No. |
| **Department (DVN)** | The specific Buyer Unit requesting goods. |
| **Financials** | PO Value, FOB Value, Net Limit, Currency, Ex Rate. |
| **Amendments** | Amend No, Amend Dates. |
| **Inspection** | Inspection Agency and Location. |
| **Issuer** | Name, Designation, Phone of Buyer's Officer. |

### 4.2 Item Fields (Line Items)
| Field Name | Description |
| :--- | :--- |
| **Item No** | Line Item Number (Unique scope per PO). |
| **Material Code** | Buyer's internal code for the product. |
| **Description** | Full product specification. |
| **Unit** | UOM (No, Set, Mtr). |
| **Quantities** | Ordered Qty, Received Qty, Delivered Qty (3 Decimals). |
| **Rates** | PO Rate (Unit Price), Item Value (2 Decimals). |
| **Status** | Active/Cancelled (Audit trail). |
| **Category** | Material Category Code. |
| **Delivery Schedule** | Lot No, Delivery Date, Delivery Qty, Destination Code. |

---

## 5. SYSTEM INVARIANTS (Strict Rules)

### 5.1 Purchase Order (PO)
- **PO-1 (Immutable)**: `po_number` is the primary key and cannot change.
- **PO-2 (Qty Bounds)**: You cannot deliver more than ordered. `delivered_qty <= ord_qty`.
- **PO-3 (Idempotency)**: Re-uploads of the same PO must performed as an **UPSERT**.
    - Existing downstream links (DCs, Invoices) MUST be preserved.
    - Duplicate PO Numbers are NOT allowed (unless same Financial Year split handling).

### 5.2 Delivery Challan (DC)
- **DC-1 (Dispatch Bounds)**: `dispatch_qty` cannot exceed `(ordered_qty - previously_delivered)`.
    - **Atomic Check**: Must verify inventory snapshot before writing.
- **DC-2 (Single Invoice)**: A DC can be linked to **max ONE Invoice**.

### 5.3 Store Receipt Voucher (SRV)
- **SRV-1 (PO Link)**: Must reference a valid PO.
- **SRV-2 (High Water Mark)**: `Delivered Qty = MAX(Total Dispatched, Total Received)`.

### 5.4 Invoice (INV)
- **INV-1 (Uniqueness)**: Unique primary key is `(invoice_number, financial_year)`.
- **INV-2 (Server Tax)**: Taxes (CGST/SGST/IGST) are calculated **Server-Side Only**.
- **INV-3 (Total)**: `Grand Total = Sum(Line Items) + Taxes`. Rounded to 2 decimals.
- **INV-4 (DC Link)**: Strictly enforced 1:1 relationship with a Delivery Challan.

---

## 6. TRIANGLE OF TRUTH (Reconciliation)

The "Triangle of Truth" ensures consistency between **Ordered** (PO), **Dispatched** (DC), and **Received** (SRV).

### 6.1 The Golden Rule (TOT-5)
All quantity updates MUST go through the **Reconciliation Service**. Ad-hoc `UPDATE` queries on quantity columns are **PROHIBITED**.

### 6.2 Sync Logic
1.  **Delivery Sync (TOT-2)**:
    `purchase_order_items.delivered_qty` refers to the fulfillment status.
    It is automatically updated whenever a DC is Created/Deleted OR an SRV is Ingested.
    Formula: `MAX(Sum(DC Dispatch), Sum(SRV Received))`

2.  **Receipt Sync (TOT-3)**:
    `purchase_order_items.rcd_qty` refers to customer acceptance.
    It is updated solely by SRV ingestion and MUST include `rejected_qty` tracking.
    Formula: `Sum(SRV Received)`

---

## 7. INFRASTRUCTURE & STANDARDS

### 7.1 Global Variables
- **Time**: All timestamps stored in **UTC/ISO-8601**.
- **Quantities**: Stored as **DECIMAL(15,3)** to support fractional units.
- **Money**: Stored and calculated as **DECIMAL(15,2)**.
- **Tolerance**: A global **0.001** tolerance applied to all inventory equality checks.
- **Audit Trail**: Every business entity (`PO`, `Buyer`, `Invoice`, `SRV`) has a `updated_at` trigger.

### 7.2 Status Calculation (Algorithm)
| Condition | Status | Color |
| :--- | :--- | :--- |
| `A_DLV == 0` | **Draft** | Slate |
| `A_DLV > 0` AND `A_DLV < A_ORD` | **Pending** | Amber |
| `A_DLV >= A_ORD` AND `A_RECD < A_ORD` | **Delivered** | Blue |
| `A_RECD >= A_ORD` | **Closed** | Green |

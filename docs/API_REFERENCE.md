# API Reference

> **Base URL**: `/api/v1` | **Auth**: None (Internal) | **Format**: JSON

## 1. Purchase Orders (PO)

### GET `/po`
List all Purchase Orders with summary stats.
- **Query Params**: `page`, `limit`, `status`
- **Response**: List of PO Headers + calculated `completion_percentage`.

### GET `/po/{po_number}`
Get full details of a specific PO.
- **Includes**: Header, Line Items, Delivery Schedule, Linked DCs.

### POST `/po/upload`
Upload a BHEL/Client HTML PO file for ingestion.
- **Body**: `multipart/form-data` (File)
- **Logic**: Upserts PO if exists; triggers Amendment check.

---

## 2. Delivery Challans (DC)

### GET `/dc`
List all Delivery Challans.

### POST `/dc`
Create a new Delivery Challan.
- **Body**:
  ```json
  {
    "po_number": "123456",
    "items": [
      { "po_item_id": 1, "quantity": 10 }
    ],
    "vehicle_no": "KA-01-...",
    "mode_of_transport": "Road"
  }
  ```
- **Validation**: Fails if `quantity > pending_qty`.

### GET `/dc/{dc_number}`
Get DC details + PDF Generation link.

---

## 3. Invoices

### POST `/invoice`
Generate a Tax Invoice from a Delivery Challan.
- **Body**:
  ```json
  {
    "dc_numbers": ["DC-001"],
    "invoice_date": "2024-01-01"
  }
  ```
- **Note**: Tax values are auto-calculated.

### GET `/invoice/{invoice_number}/pdf`
Download the PDF version of the invoice.

---

## 4. Dashboard & Reports

### GET `/dashboard/summary`
Returns high-level KPIs:
- Total Sales (FY)
- Pending Orders (Count)
- Upcoming Deliveries
- Critical Alerts (e.g., SLA Breaches)

### GET `/reports/comprehensive`
Export full system data.
- **Format**: JSON or CSV.
- **Filters**: Date Range, Buyer.

---

## 5. System & Metadata

### GET `/health`
System health check.
- **Response**: `{"status": "ok", "db": "connected", "version": "1.2.0"}`

### GET `/buyers`
List all registered Buyers (Customers).

---

## 6. Error Codes

| Code | HTTP | Meaning |
| :--- | :--- | :--- |
| `VALIDATION_ERROR` | 400 | Invalid Input field. |
| `INVARIANT_VIOLATION` | 409 | Action would break a business rule (e.g., over-delivery). |
| `NOT_FOUND` | 404 | Resource does not exist. |
| `SERVER_ERROR` | 500 | Unexpected failure. |

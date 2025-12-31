# SenstoSales API Documentation

**Generated:** 2025-12-31 17:06:02  
**Base URL:** `http://localhost:8000`

## Endpoints


### BUYERS

#### `POST` /

No description

**Response Model:** `Buyer`

---

#### `PUT` /{id}

No description

**Response Model:** `Buyer`

---

#### `DELETE` /{id}

No description

---

#### `PUT` /{id}/default

No description

---


### COMMON

#### `GET` /check-duplicate

No description

---


### DASHBOARD

#### `GET` /activity

No description

---

#### `GET` /insights



---

#### `GET` /summary

Get dashboard summary statistics

**Response Model:** `DashboardSummary`

---


### DC

#### `POST` /

No description

---

#### `GET` /po/{po_number}/lots



---

#### `GET` /stats

Get DC Page Statistics

**Response Model:** `DCStats`

---

#### `GET` /{dc_number}

Get Delivery Challan detail with items

---

#### `PUT` /{dc_number}

No description

---

#### `DELETE` /{dc_number}



---

#### `GET` /{dc_number}/download

Download DC as Excel

---

#### `GET` /{dc_number}/invoice

No description

---


### HEALTH

#### `GET` /health



---

#### `GET` /health/live



---

#### `GET` /health/metrics



---

#### `GET` /health/ready



---


### INVOICE

#### `POST` /

No description

---

#### `GET` /stats

Get Invoice Page Statistics

**Response Model:** `InvoiceStats`

---

#### `GET` /{invoice_number:path}/download

No description

---

#### `GET` /{invoice_number}

Get Invoice detail with items and linked DCs

---


### PO

#### `POST` /

No description

**Response Model:** `PODetail`

---

#### `GET` /stats

Get PO Page Statistics

**Response Model:** `POStats`

---

#### `POST` /upload

No description

---

#### `POST` /upload/batch

No description

---

#### `GET` /{po_number}

Get Purchase Order detail with items and deliveries

**Response Model:** `PODetail`

---

#### `GET` /{po_number}/context

Fetch PO context (Supplier/Buyer info) for DC/Invoice auto-fill

---

#### `GET` /{po_number}/dc

Check if PO has an associated Delivery Challan

---

#### `GET` /{po_number}/excel

Download PO as Excel

---


### PO_NOTES

#### `POST` /

Create a new PO Note template

**Response Model:** `PONoteOut`

---

#### `GET` /{note_id}

Get a specific PO Note template

**Response Model:** `PONoteOut`

---

#### `PUT` /{note_id}

Update a PO Note template

**Response Model:** `PONoteOut`

---

#### `DELETE` /{note_id}

Soft delete a PO Note template

---


### REPORTS

#### `GET` /daily-dispatch

No description

---

#### `GET` /guarantee-certificate

Generate Guarantee Certificate for a specific DC

---

#### `GET` /kpis

Quick KPIs for dashboard (Legacy support)

---

#### `GET` /pending

Pending PO Items

---

#### `GET` /reconciliation

No description

---

#### `GET` /register/dc

No description

---

#### `GET` /register/invoice

No description

---

#### `GET` /register/po

No description

---

#### `GET` /sales

No description

---


### SEARCH

#### `GET` /

Search across POs, DCs, and Invoices using deterministic logic

**Response Model:** `dict`

---


### SETTINGS

#### `GET` /

Get all settings as a dict mapped to Settings model

**Response Model:** `Settings`

---

#### `POST` /

Update a single setting

---

#### `POST` /batch

Batch update settings

---


### SRV

#### `GET` /stats



**Response Model:** `SRVStats`

---

#### `POST` /upload/batch

No description

---

#### `GET` /{srv_number}



**Response Model:** `SRVDetail`

---

#### `DELETE` /{srv_number}



---


### SYSTEM

#### `POST` /reset-db



---


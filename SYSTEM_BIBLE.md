# SYSTEM BIBLE
**Version**: 3.4.0
**Last Updated**: 2026-01-02

## 1. Numeric Reconciliation Invariants
The following business rules are enforced strictly by the backend service layer (`backend/services/`).

### Purchase Orders (PO)
- **Source of Truth**: `purchase_order_items` via `reconciliation_ledger`.
- **Constraint**: `ord_qty` is the maximum allowed dispatch/delivery limit globally.

### Delivery Challans (DC)
- **Constraint R-01 (Atomic Inventory Check)**:
  - `dispatch_qty` must not exceed `remaining_quantity` for the specific Lot.
  - `dispatch_qty` must not exceed `remaining_quantity` for the Global Item (PO Limit).
  - Enforced via `INSERT ... SELECT` with `WHERE` clause concurrency protection.
- **Constraint DC-1**: Unique DC Number within Financial Year.
- **Constraint DC-2**: One DC can be linked to at most ONE Invoice.

### Invoices (INV)
- **Constraint INV-1**: Unique Invoice Number within Financial Year.
- **Constraint INV-2**: Monetary values (Tax, Totals) are recomputed by Backend. Frontend totals are ignored.
- **Constraint INV-4**: Invoice must reference a valid DC.

### Services (SRV)
- **Constraint SRV-1 (Strict PO Linkage)**: SRV uploads strictly fail if the referenced PO does not exist.
- **Constraint**: `received_qty` updates `purchase_order_items` (via reconciliation).
- **Status Rule**: SRV (Receipt) moves a document from "Delivered" to "Closed" status but does not affect "Delivered" quantity calculations.

## 2. Active API Routes
The following routes are active and registered in `backend/main.py`.

| Category | Prefix | Responsibility |
|---|---|---|
| **Auth/Health** | `/api/health` | System health checks. |
| **Common** | `/api/common` | Shared utilities (Duplicate checks). |
| **Dashboard** | `/api/dashboard` | Aggregated metrics and KPI cards. |
| **PO** | `/api/po` | Purchase Order management, Item details. |
| **DC** | `/api/dc` | Delivery Challan creation, dispatch logic. |
| **Invoice** | `/api/invoice` | Invoice generation, tax calculation. |
| **SRV** | `/api/srv` | Service/Material Receipt Vouchers. |
| **Reports** | `/api/reports` | Business intelligence reports. |
| **Settings** | `/api/settings` | System configuration, default buyer. |
| **Buyers** | `/api/buyers` | Buyer master management. |
| **Search** | `/api/search` | Global search functionality. |
| **PO Notes** | `/api/po-notes` | Annotations for POs. |



## 3. Module Responsibility Map

### Backend Structure (`backend/`)
- **`api/`**: Router definitions. delegates logic to Services.
- **`services/`**: Pure business logic.
    - `dc.py`: Dispatch rules, inventory checks.
    - `invoice.py`: Billing rules, tax engine.
    - `po_service.py`: PO ingestion and status.
    - `reconciliation_service.py`: Syncs PO/DC/SRV states.
- **`db/`**: Database connection (`session.py`) and Schema Models (`models.py`).
- **`core/`**: Configuration, Exceptions, Logging.
- **`validation/`**: Shared validation helpers.
- **`audits/`**: Comparison baselines (MCP outputs).

### Frontend Structure (`frontend/`)
- **`app/`**: Next.js App Router pages.
- **`components/`**: React components (Atoms, Molecules, Organisms).
- **`hooks/`**: Business logic hooks (`useFetch`, etc.).
- **`lib/`**: Utilities (`api.ts`, `utils.ts`).

## 4. Verification & Quality
- **Linting**: Backend enforced via Ruff. Frontend enforced via ESLint.
- **Formatting**: Standardized via Ruff/Prettier.
- **Tests**: Playwright tests (if present in `frontend/tests` or `audits`).

## 5. Deployment Notes
- **Environment**: Production logic relies on `core.config`.
- **Database**: SQLite with explicit transaction management (`BEGIN IMMEDIATE`).

# Backend Architecture & Services

> **Framework**: FastAPI | **Database**: SQLite (Direct `sqlite3`) | **Transaction Control**: Explicit

## 1. Core Principles
The backend uses a layered architecture to ensure separation of concerns and high-density data integrity.

-   **Routers (`api/`)**: Handle HTTP Requests/Responses and Input Validation (Pydantic).
-   **Services (`services/`)**: Contain **PURE Business Logic** and direct SQL interaction using the `sqlite3.Connection` object.
-   **Database Access**: Uses `db.execute()` with atomic transactions and explicit commit/rollback for safety.
-   **Invariants**: Business rules are enforced both in Python logic and via SQLite Triggers.

## 2. Service Catalog

### 2.1 Purchase Order Service (`po_service.py`)
-   **Responsibility**: CRUD for POs, Scraper for HTML uploads.
-   **Key Logic**:
    -   Displays `delivered_qty` and `rcd_qty` from synchronized lots/items.
    -   Implements Balance calculation: `Ordered - Delivered`.
    -   Handles multi-item scraping and amendment detection.

### 2.2 Delivery Challan Service (`dc.py`)
-   **Responsibility**: Creation of Dispatch Documents.
-   **Invariant**: Enforces `dispatch_qty <= Ordered Quantity`.
-   **Locking**: Uses atomic transactions to prevent over-dispatch.

### 2.3 Invoice Service (`invoice.py`)
-   **Responsibility**: GST Tax Calculation and Template-based Excel Generation.
-   **Logic**:
    -   **Server-Side Tax**: Tax is re-calculated based on HSN codes at the point of creation.
    -   **Excel Injection**: Uses `openpyxl` to inject data into `Invoice_4544.xlsx` while preserving layout and styles.

### 2.4 Reconciliation Service (`reconciliation_service.py`)
-   **Responsibility**: The [Triangle of Truth](BUSINESS_LOGIC_SPEC.md).
-   **Logic**: Synchronizes the entire document chain.
    -   `Delivered = Sum(DC Dispatch)`
    -   `Received = Sum(SRV Receipt)`

## 3. Data Integrity Strategy

### 3.1 Database Level
-   **SQLite WAL Mode**: Enabled for maximum concurrency.
-   **Foreign Keys**: Strictly enforced (`PRAGMA foreign_keys = ON`).
-   **Schema Consistency**: Managed via versioned SQL migrations.

### 3.2 Application Level
-   **Pydantic Validation**: Input data is strictly typed before processing.
-   **Atomic Commits**: All multi-table updates (e.g., Creating a DC affects Inventory) happen in a single `session.commit()` block.

## 4. API Structure

### 4.1 Response Wrapper
All successful responses follow the `StandardResponse` schema:
```json
{
  "success": true,
  "data": { ... },
  "meta": { "pagination": ... }
}
```

### 4.2 Error Handling
We use a global exception handler to map Python exceptions to HTTP codes:
-   `ValueError` -> 400 Bad Request
-   `ResourceNotFound` -> 404 Not Found
-   `IntegrityError` -> 409 Conflict

## 5. Deployment Architecture
-   **Server**: Uvicorn (ASGI) behind Nginx (Reverse Proxy).
-   **Process Management**: Supervisor/Systemd for keep-alive.
-   **Workers**: Configurable based on CPU cores (`workers = 2 * CPU + 1`).

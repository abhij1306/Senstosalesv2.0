# Backend Architecture & Services

> **Framework**: FastAPI | **Database**: SQLite (SQLAlchemy) | **Async**: Yes

## 1. Core Principles
The backend uses a layered architecture to ensure separation of concerns, testability, and scalability.

-   **Routers (`api/`)**: Handle HTTP Requests/Responses, Permissions, and Input Validation (Pydantic).
-   **Services (`services/`)**: Contain **PURE Business Logic**. No SQL queries here directly (use Repositories or Models).
-   **Models (`models/`)**: SQLAlchemy ORM definitions mapping to the Database Schema.
-   **Schemas (`schemas/`)**: Pydantic DTOs for data serialization.

## 2. Service Catalog

### 2.1 Purchase Order Service (`po_service.py`)
-   **Responsibility**: CRUD for POs, Parsing HTML uploads.
-   **Key Logic**:
    -   Calculates `delivered_qty` based on linked documents.
    -   Handles "Amendment" detection during ingestion.

### 2.2 Delivery Challan Service (`dc_service.py`)
-   **Responsibility**: Creation of Dispatch Documents.
-   **Invariant**: Enforces `dispatch_qty <= (ordered - delivered)`.
-   **Locking**: Uses atomic transactions to prevent over-dispatch.

### 2.3 Invoice Service (`invoice_service.py`)
-   **Responsibility**: GST Tax Calculation.
-   **Invariant**: Taxes are calculated Server-Side ONLY. Frontend values are ignored.
-   **Logic**:
    -   `IF Buyer_State == Supplier_State THEN CGST + SGST`
    -   `ELSE IGST`

### 2.4 Reconciliation Service (`reconciliation.py`)
-   **Responsibility**: The "Triangle of Truth".
-   **Logic**: Periodically (or event-based) syncs `purchase_order_items` status with `srvs` and `li_challans`.

## 3. Data Integrity Strategy

### 3.1 Database Level
-   **SQLite WAL Mode**: Enabled for high concurrency.
-   **Foreign Keys**: Strictly enforced (`PRAGMA foreign_keys = ON`).
-   **Check Constraints**:
    -   `delivered_qty <= ord_qty` (In-Database Trigger/Check).

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

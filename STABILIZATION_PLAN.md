# SenstoSales Stabilization Plan (Frontend & Backend)

## Goal: "Apple-level Design, Enterprise Stability"
Standardize components, eliminate redundancy, optimize performance, and ensure backend reliability through strict schema and reconciliation logic.

---

## 1. Frontend: Design System Consolidation

### **Structure Refactor**
- **[GLOBAL] `frontend/components/design-system/`**: Strictly for generic components (Atoms, Molecules, and purely generic Organisms like `DataTable`).
- **[LOCAL] `frontend/components/[feature]/organisms/`**: Feature-specific logic (e.g., `PODetailItems`) moves here to prevent global bloat.
- **[PURGE]**: All remaining `Tahoe`, `Legacy`, or duplicate components outside the Atomic Design flow.

### **Typography Standardization**
- **Fonts**: Strict 3-font Apple standard.
  - `SF Pro Display`: Headings (H1-H4).
  - `SF Pro Text`: Body, Labels.
  - `SF Mono`: Numerical data (Accounting), IDs (PO/SRV Numbers).
- **Weights**: Bold (700) restricted to Headers and critical Labels ONLY. Medium (500) for body/data.
- **Sizes**: Standardize on `13px` for body/table content and `11px` for metadata/labels.

### **Performance Optimization**
- **Debouncing**: Implement application-wide debouncing for all search inputs.
- **Memoization**: Wrap all functional components in `memo()` and use `useCallback/useMemo` to prevent unnecessary re-renders in complex lists.
- **Dynamic Imports**: Lazy-load charts and heavy dashboards.

---

## 2. Backend: Data Integrity & Ingestion

### **PO Upload Reliability**
- **Schema Recovery**: Ensure `repair_db.py` is run after any reset to maintain `srv_items` and `alerts` columns.
- **Status Logic**: Standardize `all rejected` vs `parsed` logic. Debug `po_scraper.py` to handle edge-case HTML variations.
- **HWM Sync**: Enforce "Triangle of Truth" reconciliation (PO ↔ DC ↔ SRV) via automated sync triggers.

### **API Efficiency**
- **Direct Queries**: Minimize ORM overhead for large data fetches by using optimized SQL queries.
- **Streaming**: Continue using streaming for Excel exports to minimize memory usage.

---

## 3. Stabilization Steps

| Step | Task | Status |
| :--- | :--- | :--- |
| 1 | **Relocate Organisms** | [/] Move PO/SRV/Reports organisms to local folders |
| 2 | **Fix Global Exports** | [x] Overwrite `design-system/index.ts` to purge deleted paths |
| 3 | **Typography Sync** | [ ] Apply SF Pro fonts and weights to all Atoms |
| 4 | **PO Upload Audit** | [ ] Fix "rejected" upload items and verify schema |
| 5 | **Performance Pass** | [ ] Audit `DataTable` and Search for re-render loops |

---

> [!IMPORTANT]
> This document remains in the root folder as the Single Source of Truth for the stabilization phase. Do not diverge from these standards.

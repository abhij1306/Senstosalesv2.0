# Changelog

All notable changes to the SenstoSales project will be documented in this file.

## [3.0.0] - 2025-12-30

### Added
- **Business Logic Bible**: Consolidated `docs/BUSINESS_LOGIC_SPEC.md` serving as the single source of truth.
- **Triangle of Truth**: Implemented `ReconciliationService.sync_po` for strict PO/SRV/DC synchronization.
- **Atomic Uploads**: `UploadContext` now waits for full batch reconciliation before UI reload.

### Changed
- **PO Batch Handling**: Refactored `ingest_po.py` to use `sync_po`, enforce 2-decimal precision, and ensure idempotency.
- **DC Router**: Consolidated `reconciliation.py` endpoints (e.g., `get_po_limit_lots`) into `dc.py`.
- **System Cleanup**: Aggressively purged unused services `srv_po_linker.py` and routers (`system.py`, `po_notes.py`).

### Fixed
- **Reconciliation Logic**: Enforced "High Water Mark" (`MAX(Disp, Recd)`) for Delivered Quantity.
- **Frontend Glitches**: Fixed "0 items" display during batch upload.

# Changelog

All notable changes to the SenstoSales project will be documented in this file.

## [4.0.0] - 2026-01-03

### Added
- **macOS Tahoe System**: Migrated entire UI to the Tahoe design system (v4.0) with Claymorphism and premium Glassmorphism.
- **Template-Based Invoices**: Support for injecting data into `Invoice_4544.xlsx` while preserving original branding and layouts.
- **Quantity Audit Report**: Automated quantity audit system with de-coupled balance tracking.
- **Global Data Resync**: Added `/api/system/reconcile-all` for mass synchronization of historical PO/DC/SRV data.

### Changed
- **Balance Invariant**: Strictly de-coupled `Balance` from `Received`. New logic: `Balance = Ordered - Delivered`.
- **DC Schema**: Added lot-level tracking to Delivery Challan items for precise PO lot reconciliation.

### Fixed
- **PO List Discrepancies**: Resolved issues where old POs showed '0' balance due to receipt higher than dispatch.
- **Modal Contrast**: Fixed button legibility and background transparency on all system modals.

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
- **Reconciliation Logic**: Shifted from High-Water-Mark to strict physical dispatch tracking for Balance calculations.

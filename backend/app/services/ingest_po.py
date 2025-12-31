"""
PO Ingestion Service - Writes scraper output to database
Normalizes data into items and deliveries tables
"""

import sqlite3
import uuid
from typing import Dict, List, Tuple

from app.core.date_utils import normalize_date
from app.core.number_utils import to_float, to_int, to_qty

def to_money(val) -> float:
    """Enforce SA-2: 2 Decimal Precision"""
    try:
        return round(float(val), 2)
    except (ValueError, TypeError):
        return 0.00


class POIngestionService:
    """Handles PO data ingestion from scraper to database"""

    def ingest_po(
        self, db: sqlite3.Connection, po_header: Dict, po_items: List[Dict]
    ) -> Tuple[bool, List[str]]:
        """
        Ingest PO from scraper output.
        Normalizes data: unique items + delivery schedules

        Args:
            db: Active database connection
            po_header: Dictionary containing PO header details
            po_items: List of dictionaries containing PO item details

        Returns: (success, warnings)
        """
        if not po_items:
            raise ValueError("Scraper returned zero items for this PO. Aborting ingestion.")
            
        print(f"🔥🔥🔥 START INGEST: H={len(po_header)} I={len(po_items)}", flush=True)

        warnings = []
        processed_item_ids = []

        try:
            # 1. Extract & Sanitize PO number
            po_number = str(po_header.get("PURCHASE ORDER", "")).strip()
            if not po_number:
                raise ValueError("Missing PO Number in header")
            
            po_header["PURCHASE ORDER"] = po_number # Ensure internal consistency

            # 2. Find Buyer (Lookup by DVN/SupplierCode if possible, else default)
            dvn = po_header.get("DVN")
            supp_code = po_header.get("SUPP CODE")
            
            buyer_row = None
            if dvn and supp_code:
                buyer_row = db.execute(
                    "SELECT id FROM buyers WHERE department_no = ? AND supplier_code = ?", 
                    (str(dvn), str(supp_code))
                ).fetchone()
                
            if not buyer_row:
                buyer_row = db.execute("SELECT id FROM buyers WHERE is_default = 1").fetchone()
            if not buyer_row:
                buyer_row = db.execute("SELECT id FROM buyers LIMIT 1").fetchone()
                
            buyer_id = buyer_row[0] if buyer_row else None

            # 3. Check for Existing PO
            existing = db.execute(
                "SELECT po_number, amend_no FROM purchase_orders WHERE po_number = ?",
                (po_number,),
            ).fetchone()

            if existing:
                warnings.append(
                    f"⚠️ PO {po_number} already exists (Amendment {existing['amend_no']}). Updating..."
                )

            # 4. Prepare Header Data
            from app.core.validation import get_financial_year
            
            po_date = normalize_date(po_header.get("PO DATE"))
            financial_year = get_financial_year(po_date) if po_date else "2025-26"
            
            header_data = {
                "po_number": po_number,
                "po_date": po_date,
                "buyer_id": buyer_id,
                "supplier_name": po_header.get("SUPP NAME M/S") or po_header.get("supplier_name"),
                "supplier_gstin": po_header.get("TIN NO") or po_header.get("supplier_gstin"), # Scraper often finds TIN as GSTIN
                "supplier_code": po_header.get("SUPP CODE"),
                "supplier_phone": po_header.get("PHONE"),
                "supplier_fax": po_header.get("FAX"),
                "supplier_email": po_header.get("EMAIL") or po_header.get("WEBSITE"),
                "department_no": to_int(po_header.get("DVN")),
                "enquiry_no": po_header.get("ENQUIRY"),
                "enquiry_date": normalize_date(po_header.get("ENQ DATE")),
                "quotation_ref": po_header.get("QUOTATION"),
                "quotation_date": normalize_date(po_header.get("QUOT-DATE")),
                "rc_no": po_header.get("RC NO"),
                "order_type": po_header.get("ORD-TYPE"),
                "po_status": po_header.get("PO STATUS") or "Open",
                "tin_no": po_header.get("TIN NO"),
                "ecc_no": po_header.get("ECC NO"),
                "mpct_no": po_header.get("MPCT NO"),
                "po_value": to_money(po_header.get("PO-VALUE")),
                "fob_value": to_money(po_header.get("FOB VALUE")),
                "ex_rate": to_float(po_header.get("EX RATE")),
                "currency": po_header.get("CURRENCY"),
                "net_po_value": to_money(po_header.get("NET PO VAL")),
                "amend_no": to_int(po_header.get("AMEND NO")) or 0,
                "remarks": po_header.get("REMARKS"),
                "issuer_name": po_header.get("NAME"),
                "issuer_designation": po_header.get("DESIGNATION"),
                "issuer_phone": po_header.get("PHONE NO"),
                "inspection_by": po_header.get("INSPECTION BY"),
                "inspection_at": po_header.get("INSPECTION AT BHEL"),
                "financial_year": financial_year,
            }

            # 5. Upsert Header
            db.execute(
                """
                INSERT INTO purchase_orders (
                    po_number, po_date, buyer_id, supplier_name, supplier_gstin, supplier_code, supplier_phone, 
                    supplier_fax, supplier_email, department_no, enquiry_no, enquiry_date, 
                    quotation_ref, quotation_date, rc_no, order_type, po_status, tin_no, 
                    ecc_no, mpct_no, po_value, fob_value, ex_rate, currency, net_po_value, 
                    amend_no, remarks, issuer_name, issuer_designation, issuer_phone, 
                    inspection_by, inspection_at, financial_year
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(po_number) DO UPDATE SET 
                    po_date=excluded.po_date, buyer_id=excluded.buyer_id, supplier_name=excluded.supplier_name,
                    supplier_gstin=excluded.supplier_gstin, supplier_code=excluded.supplier_code,
                    supplier_phone=excluded.supplier_phone, amend_no=excluded.amend_no, 
                    po_value=excluded.po_value, net_po_value=excluded.net_po_value, 
                    financial_year=excluded.financial_year, updated_at=CURRENT_TIMESTAMP
                """,
                tuple(header_data.values()),
            )

            # 6. Group & Standardize Items
            items_grouped = {}
            for item in po_items:
                po_itm = to_int(item.get("PO ITM"))
                if po_itm not in items_grouped:
                    items_grouped[po_itm] = {"item": item, "deliveries": []}
                items_grouped[po_itm]["deliveries"].append(item)

            # 7. Process Items
            for po_item_no, data in items_grouped.items():
                item = data["item"]
                
                # Use existing ID to prevent breaking FKs on update
                existing_item = db.execute(
                    "SELECT id FROM purchase_order_items WHERE po_number = ? AND po_item_no = ?",
                    (po_number, po_item_no),
                ).fetchone()
                item_id = existing_item["id"] if existing_item else str(uuid.uuid4())
                processed_item_ids.append(item_id)

                ord_qty = to_qty(item.get("ORD QTY") or item.get("ordered_quantity") or 0)
                po_rate = to_money(item.get("PO RATE") or item.get("po_rate") or 0)
                item_val = to_money(item.get("ITEM VALUE") or item.get("item_value") or (ord_qty * po_rate))

                db.execute(
                    """
                    INSERT INTO purchase_order_items (
                        id, po_number, po_item_no, status, material_code, material_description, 
                        drg_no, mtrl_cat, unit, po_rate, ord_qty
                    ) VALUES (?, ?, ?, 'Active', ?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT(po_number, po_item_no) DO UPDATE SET
                        status='Active',
                        material_code=excluded.material_code, material_description=excluded.material_description,
                        drg_no=excluded.drg_no, mtrl_cat=excluded.mtrl_cat, unit=excluded.unit,
                        po_rate=excluded.po_rate, ord_qty=excluded.ord_qty,
                        updated_at=CURRENT_TIMESTAMP
                    """,
                    (
                        item_id, po_number, po_item_no, item.get("MATERIAL CODE"),
                        item.get("DESCRIPTION") or item.get("material_description"),
                        item.get("DRG") or item.get("drg_no"),
                        to_int(item.get("MTRL CAT")), item.get("UNIT"),
                        po_rate, ord_qty
                    ),
                )

                # 8. Manage Deliveries
                # Backup tracking data before refreshing schedules
                existing_tracking = {}
                rows = db.execute(
                    "SELECT lot_no, delivered_qty, received_qty FROM purchase_order_deliveries WHERE po_item_id = ?",
                    (item_id,),
                ).fetchall()
                for row in rows:
                    existing_tracking[to_int(row["lot_no"])] = {
                        "delivered": row["delivered_qty"] or 0,
                        "received": row["received_qty"] or 0,
                    }

                db.execute("DELETE FROM purchase_order_deliveries WHERE po_item_id = ?", (item_id,))

                for dely in data["deliveries"]:
                    lot_no = to_int(dely.get("LOT NO") or 1)
                    track = existing_tracking.get(lot_no, {"delivered": 0, "received": 0})
                    
                    db.execute(
                        """
                        INSERT INTO purchase_order_deliveries (
                            po_item_id, lot_no, dely_qty, dely_date, entry_allow_date, 
                            dest_code, delivered_qty, received_qty
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                        """,
                        (
                            item_id, lot_no, 
                            to_qty(dely.get("DELY QTY") or dely.get("ordered_quantity")),
                            normalize_date(dely.get("DELY DATE")),
                            normalize_date(dely.get("ENTRY ALLOW DATE") or dely.get("DELY DATE")),
                            to_int(dely.get("DEST CODE")),
                            track["delivered"], track["received"]
                        ),
                    )

            # 9. Handle Cancelled Items (Amendments)
            if processed_item_ids:
                placeholders = ",".join(["?"] * len(processed_item_ids))
                db.execute(
                    f"""
                    UPDATE purchase_order_items 
                    SET status = 'Cancelled', updated_at = CURRENT_TIMESTAMP 
                    WHERE po_number = ? AND id NOT IN ({placeholders})
                    """,
                    [po_number] + processed_item_ids
                )

            # 10. Global Reconciliation Sync (TOT-5)
            from app.services.reconciliation_service import ReconciliationService
            # 10. Global Reconciliation Sync (TOT-5)
            from app.services.reconciliation_service import ReconciliationService
            # Link orphan SRVs first
            # po_found column removed in Migration 024. Logic handled by ReconciliationService or join checks.
            ReconciliationService.sync_po(db, po_number)

            warnings.append(f"✅ Ingested PO {po_number} with {len(items_grouped)} items.")
            return True, warnings

        except Exception as e:
            raise ValueError(f"Ingestion Failure: {str(e)}")


# Singleton instance
po_ingestion_service = POIngestionService()

import logging
import sqlite3

from fastapi import APIRouter, Depends, HTTPException

from backend.db.session import get_db
from backend.services.status_service import calculate_entity_status

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/", response_model=dict)
def global_search(q: str, db: sqlite3.Connection = Depends(get_db)):
    """Search across POs, DCs, and Invoices using deterministic logic"""
    results = []

    if not q:
        return {"results": []}

    search_term = f"%{q}%"

    try:
        # 1. Search POs - Use po_number as unique ID
        cursor = db.execute(
            """
            SELECT po_number, po_date as date, supplier_name as party, po_value as amount,
                   (SELECT COALESCE(SUM(ord_qty), 0) FROM purchase_order_items WHERE po_number = po.po_number) as t_ord,
                   (SELECT COALESCE(SUM(dispatch_qty), 0) FROM delivery_challan_items dci JOIN purchase_order_items poi ON dci.po_item_id = poi.id WHERE poi.po_number = po.po_number) as t_del,
                   (SELECT COALESCE(SUM(received_qty), 0) FROM srv_items WHERE CAST(po_number AS TEXT) = CAST(po.po_number AS TEXT)) as t_recd
            FROM purchase_orders po
            WHERE CAST(po_number AS TEXT) LIKE ? OR supplier_name LIKE ?
            LIMIT 5
            """,
            (search_term, search_term),
        )
        for row in cursor.fetchall():
            d = dict(row)
            results.append(
                {
                    "id": str(d["po_number"]),
                    "type": "PO",
                    "type_label": "Purchase Order",
                    "number": str(d["po_number"]),
                    "date": d["date"] or "",
                    "party": d["party"] or "Unknown",
                    "amount": d["amount"] or 0,
                    "status": calculate_entity_status(d["t_ord"], d["t_del"], d["t_recd"]),
                }
            )

        # 2. Search DCs - Use dc_number as unique ID
        cursor = db.execute(
            """
            SELECT dc_number, dc_date as date, consignee_name as party,
                   (SELECT COALESCE(SUM(dispatch_qty), 0) FROM delivery_challan_items WHERE dc_number = dc.dc_number) as t_del,
                   (SELECT COALESCE(SUM(received_qty), 0) FROM srv_items WHERE challan_no = dc.dc_number) as t_recd,
                   -- For DCs, total_ordered is essentially the sum of linked PO items ordered qty
                   (SELECT COALESCE(SUM(poi.ord_qty), 0) FROM delivery_challan_items dci JOIN purchase_order_items poi ON dci.po_item_id = poi.id WHERE dci.dc_number = dc.dc_number) as t_ord
            FROM delivery_challans dc
            WHERE CAST(dc_number AS TEXT) LIKE ? OR consignee_name LIKE ?
            LIMIT 5
            """,
            (search_term, search_term),
        )
        for row in cursor.fetchall():
            d = dict(row)
            results.append(
                {
                    "id": str(d["dc_number"]),
                    "type": "DC",
                    "type_label": "Delivery Challan",
                    "number": str(d["dc_number"]),
                    "date": d["date"] or "",
                    "party": d["party"] or "Unknown",
                    "amount": 0,
                    "status": calculate_entity_status(d["t_ord"], d["t_del"], d["t_recd"]),
                }
            )

        # 3. Search Invoices - Use invoice_number as unique ID
        cursor = db.execute(
            """
            SELECT invoice_number, invoice_date as date, total_invoice_value as amount, dc_number,
                   (SELECT COALESCE(SUM(quantity), 0) FROM gst_invoice_items WHERE invoice_number = inv.invoice_number) as t_del,
                   (SELECT COALESCE(SUM(si.received_qty), 0) FROM srv_items si JOIN srvs s ON si.srv_number = s.srv_number WHERE s.invoice_number = inv.invoice_number) as t_recd,
                   -- Invoice total ordered volume is often same as delivered volume in its context
                   (SELECT COALESCE(SUM(quantity), 0) FROM gst_invoice_items WHERE invoice_number = inv.invoice_number) as t_ord
            FROM gst_invoices inv
            WHERE CAST(invoice_number AS TEXT) LIKE ?
            LIMIT 5
            """,
            (search_term,),
        )
        for row in cursor.fetchall():
            d = dict(row)
            results.append(
                {
                    "id": str(d["invoice_number"]),
                    "type": "Invoice",
                    "type_label": "Tax Invoice",
                    "number": str(d["invoice_number"]),
                    "date": d["date"] or "",
                    "party": "Client",
                    "amount": d["amount"] or 0,
                    "status": calculate_entity_status(d["t_ord"], d["t_del"], d["t_recd"]),
                }
            )

        return {"results": results}

    except Exception as e:
        logger.error(f"Global Search Error: {e}")
        # Return partial results if some succeeded, or raise 500
        if results:
            return {"results": results}
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}") from e

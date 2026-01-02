"""
Centralized Status Logic Service
Enforces global status invariants across PO, DC, and Invoice modules.
"""

def calculate_entity_status(total_ordered: int, total_dispatched: int, total_received: int) -> str:
    """
    Calculate entity status based on standardized quantity checks.
    
    Rules:
    1. Closed: Transaction Complete (All items received/accepted).
    2. Delivered: Physically Shipped (All items dispatched).
    3. Draft: Not started (Zero dispatch).
    4. Pending: In progress (Partial dispatch).
    """
    a_ord = float(total_ordered or 0)
    a_disp = float(total_dispatched or 0)
    a_recd = float(total_received or 0)
    
    # High Water Mark (DLV) as per BUSINESS_LOGIC_SPEC.md
    a_dlv = max(a_disp, a_recd)

    if a_dlv < 0.001:
        return "Draft"
    
    if a_dlv > 0.001 and a_dlv < a_ord - 0.001:
        return "Pending"
    
    if a_dlv >= a_ord - 0.001 and a_recd < a_ord - 0.001:
        return "Delivered"
    
    if a_recd >= a_ord - 0.001:
        return "Closed"
    
    return "Pending"

def translate_raw_status(raw_status: str) -> str:
    """ Maps numeric ERP codes to human readable strings. """
    s = str(raw_status or "").strip()
    if s == "0": return "Open"
    if s == "2": return "Closed"
    return s or "Draft"

def calculate_pending_quantity(ordered: float, delivered: float) -> float:
    """
    Calculate Pending Quantity (Balance) enforcing Global Invariant.
    
    Invariant: Balance = Ordered - Delivered (ORD - DLV)
    """
    from app.core.number_utils import to_qty
    ordered_val = float(ordered or 0)
    delivered_val = float(delivered or 0)
    return to_qty(max(0.0, ordered_val - delivered_val))

"""
Centralized Status Logic Service
Enforces global status invariants across PO, DC, and Invoice modules.
"""

def calculate_entity_status(total_ordered: float, total_dispatched: float, total_received: float) -> str:
    """
    Calculate entity status based on standardized quantity checks.
    
    Rules:
    1. Closed: Transaction Complete (All items received/accepted).
    2. Delivered: Physically Shipped (All items dispatched).
    3. Draft: Not started (Zero dispatch).
    4. Pending: In progress (Partial dispatch).
    """
    t_ord = float(total_ordered or 0)
    t_disp = float(total_dispatched or 0)
    t_recd = float(total_received or 0)
    
    # High Water Mark (DLV) as per BUSINESS_LOGIC_SPEC.md
    t_dlv = max(t_disp, t_recd)

    # EPSILON for float comparison
    EPS = 0.001

    if t_ord > 0 and (t_ord - t_recd) <= EPS:
        return "Closed"
    
    if t_ord > 0 and (t_ord - t_dlv) <= EPS:
        return "Delivered"
    
    if t_dlv <= EPS and t_ord > 0:
        return "Draft"
    
    return "Pending"

def calculate_pending_quantity(ordered: float, delivered: float) -> float:
    """
    Calculate Pending Quantity (Balance) enforcing Global Invariant.
    
    Invariant: Balance = Ordered - Delivered (ORD - DLV)
    Ref: SYSTEM_INVARIANTS.md
    """
    return max(0.0, float(ordered or 0) - float(delivered or 0))

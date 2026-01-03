"""
Centralized Status Logic Service
Enforces global status invariants across PO, DC, and Invoice modules.
"""


def calculate_entity_status(
    total_ordered: float, total_dispatched: float, total_received: float
) -> str:
    """
    Calculate entity status based on standardized quantity checks.

    Rules:
    1. Closed: Transaction Complete (All items received/accepted).
    2. Delivered: Physically Shipped (All items dispatched).
    3. Pending: Not complete (Zero or partial dispatch).
    """
    a_ord = float(total_ordered or 0)
    a_disp = float(total_dispatched or 0)
    a_recd = float(total_received or 0)

    # RULE CHANGE: De-coupled from Received.
    # Delivered status is purely based on Physical Dispatch (DC).
    # Reconciliation (SRV) leads to "Closed" status.

    if a_recd >= a_ord - 0.001:
        # Transaction is complete once everything is received/accepted
        return "Closed"

    if a_disp < 0.001:
        # If no dispatch yet, still considered Pending (not Draft)
        return "Pending"

    if a_disp >= a_ord - 0.001:
        # Fully dispatched but not yet fully received
        return "Delivered"

    # Any partial dispatch is Pending
    return "Pending"


def translate_raw_status(raw_status: str) -> str:
    """Maps numeric ERP codes to human readable strings."""
    s = str(raw_status or "").strip()
    if s == "0":
        return "Open"
    if s == "2":
        return "Closed"
    return s or "Pending"


def calculate_pending_quantity(ordered: float, fulfilled: float) -> float:
    """
    Calculate Pending Quantity (Balance).

    Invariant: Balance = Ordered - Fulfilled
    - At PO level, 'Fulfilled' is typically Total Dispatched.
    - At Invoice/DC level, 'Fulfilled' could be Total Received.
    """
    from backend.core.number_utils import to_qty

    ordered_val = float(ordered or 0)
    fulfilled_val = float(fulfilled or 0)
    return to_qty(max(0.0, ordered_val - fulfilled_val))

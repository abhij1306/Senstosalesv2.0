from typing import List, Optional

from pydantic import BaseModel, BeforeValidator, Field
from typing_extensions import Annotated


# Helper for string coercion from SQLite
def coerce_to_string(v):
    if v is None:
        return None
    return str(v)


StringCoerced = Annotated[Optional[str], BeforeValidator(coerce_to_string)]

# ============================================================
# PURCHASE ORDER MODELS
# ============================================================


class POHeader(BaseModel):
    """Purchase Order Header"""

    po_number: str
    po_date: Optional[str] = Field(None, description="YYYY-MM-DD")
    supplier_name: Optional[str] = None
    supplier_gstin: Optional[str] = None
    supplier_code: Optional[str] = None
    supplier_phone: Optional[str] = None
    supplier_fax: Optional[str] = None
    supplier_email: Optional[str] = None
    department_no: StringCoerced = None

    # Reference Info
    enquiry_no: Optional[str] = None
    enquiry_date: Optional[str] = Field(None, description="YYYY-MM-DD")
    quotation_ref: Optional[str] = None
    quotation_date: Optional[str] = Field(None, description="YYYY-MM-DD")
    rc_no: Optional[str] = None
    order_type: Optional[str] = None
    po_status: Optional[str] = None
    financial_year: Optional[str] = None

    # Financials & Tax
    tin_no: Optional[str] = None
    ecc_no: Optional[str] = None
    mpct_no: Optional[str] = None
    po_value: Optional[float] = None
    fob_value: Optional[float] = None
    ex_rate: Optional[float] = None
    currency: Optional[str] = None
    net_po_value: Optional[float] = None
    amend_no: Optional[int] = 0
    inspection_by: Optional[str] = None
    inspection_at: Optional[str] = None
    issuer_name: Optional[str] = None
    issuer_designation: Optional[str] = None
    issuer_phone: Optional[str] = None
    remarks: Optional[str] = None
    consignee_name: Optional[str] = None
    consignee_address: Optional[str] = None


class PODelivery(BaseModel):
    """Purchase Order Delivery Schedule"""

    id: Optional[str] = None
    lot_no: Optional[int] = None
    ordered_quantity: Optional[float] = 0.0
    delivered_quantity: Optional[float] = 0.0
    received_quantity: Optional[float] = 0.0
    manual_override_qty: Optional[float] = 0.0  # Added for TOT-5
    dely_date: Optional[str] = Field(None, description="YYYY-MM-DD")
    entry_allow_date: Optional[str] = Field(None, description="YYYY-MM-DD")
    dest_code: Optional[int] = None


class POItem(BaseModel):
    """Purchase Order Item"""

    id: Optional[str] = None
    po_item_no: int
    material_code: Optional[str] = None
    material_description: Optional[str] = None
    drg_no: Optional[str] = None
    mtrl_cat: Optional[int] = None
    unit: Optional[str] = None
    po_rate: Optional[float] = None
    ordered_quantity: Optional[float] = None
    received_quantity: Optional[float] = 0  # Sum from SRVs
    rejected_quantity: Optional[float] = 0  # Sum from SRVs (NEW)
    item_value: Optional[float] = None
    hsn_code: StringCoerced = None
    delivered_quantity: Optional[float] = 0
    pending_quantity: Optional[float] = None
    deliveries: List["PODelivery"] = []


class POListItem(BaseModel):
    """Purchase Order List Item (Summary)"""

    po_number: str
    po_date: Optional[str] = None
    supplier_name: Optional[str] = None
    po_value: Optional[float] = None
    amend_no: Optional[int] = 0
    po_status: Optional[str] = None
    financial_year: Optional[str] = None
    linked_dc_numbers: Optional[str] = None
    total_ordered_quantity: float = 0.0
    total_dispatched_quantity: float = 0.0
    total_received_quantity: float = 0.0
    total_rejected_quantity: float = 0.0
    total_pending_quantity: float = 0.0
    total_items_count: int = 0  # NEW: Total line items count
    drg_no: Optional[str] = None  # Added for summary visibility
    created_at: Optional[str] = None


class POStats(BaseModel):
    """PO Page KPIs"""

    open_orders_count: int
    pending_approval_count: int
    total_value_ytd: float
    total_value_change: float  # Mock percentage change


class PODetail(BaseModel):
    """Purchase Order Detail (Full)"""

    header: POHeader
    items: List[POItem]


# ============================================================
# DELIVERY CHALLAN MODELS
# ============================================================


class DCCreate(BaseModel):
    """Create Delivery Challan"""

    dc_number: str
    dc_date: str = Field(..., description="YYYY-MM-DD")
    po_number: Optional[str] = None
    department_no: StringCoerced = None
    consignee_name: Optional[str] = None
    consignee_gstin: Optional[str] = None
    consignee_address: Optional[str] = None
    inspection_company: Optional[str] = None
    eway_bill_no: Optional[str] = None
    vehicle_no: Optional[str] = None
    lr_no: Optional[str] = None
    transporter: Optional[str] = None
    mode_of_transport: Optional[str] = None
    remarks: Optional[str] = None


class DCListItem(BaseModel):
    """Delivery Challan List Item"""

    dc_number: str
    dc_date: str = Field(..., description="YYYY-MM-DD")
    po_number: Optional[str] = None
    consignee_name: Optional[str] = None
    status: Optional[str] = "Pending"
    total_value: float = 0.0
    created_at: Optional[str] = None
    total_ordered_quantity: float = 0.0
    total_dispatched_quantity: float = 0.0
    total_pending_quantity: float = 0.0
    total_received_quantity: float = 0.0


class DCStats(BaseModel):
    """Delivery Challan KPIs"""

    total_challans: int
    total_challans_change: float = 0.0
    pending_delivery: int
    completed_delivery: int
    completed_change: float = 0.0
    total_value: float = 0.0


# ============================================================
# INVOICE MODELS
# ============================================================


class InvoiceCreate(BaseModel):
    """Create Invoice"""

    invoice_number: str
    invoice_date: str = Field(..., description="YYYY-MM-DD")
    dc_number: Optional[str] = None
    po_numbers: Optional[str] = None
    buyer_gstin: Optional[str] = None
    place_of_supply: Optional[str] = None
    taxable_value: Optional[float] = None
    cgst: Optional[float] = 0
    sgst: Optional[float] = 0
    igst: Optional[float] = 0
    total_invoice_value: Optional[float] = None
    remarks: Optional[str] = None


class InvoiceListItem(BaseModel):
    """Invoice List Item"""

    invoice_number: str
    invoice_date: str = Field(..., description="YYYY-MM-DD")
    po_numbers: Optional[str] = None
    dc_number: Optional[str] = None  # Added
    buyer_gstin: Optional[str] = None  # Added
    taxable_value: Optional[float] = None  # Added
    total_items: int = 0  # Total invoice items count
    total_ordered_quantity: float = 0.0
    total_dispatched_quantity: float = 0.0
    total_pending_quantity: float = 0.0
    total_received_quantity: float = 0.0
    total_invoice_value: Optional[float] = None
    status: Optional[str] = "Pending"
    created_at: Optional[str] = None


class InvoiceStats(BaseModel):
    """Invoice Page KPIs"""

    total_invoiced: float
    pending_payments: float
    gst_collected: float
    total_invoiced_change: float  # Percentage change


# ============================================================
# DASHBOARD MODELS
# ============================================================


class DashboardSummary(BaseModel):
    """Dashboard KPIs"""

    total_sales_month: float
    sales_growth: float
    pending_pos: int
    new_pos_today: int
    active_challans: int
    active_challans_growth: str  # e.g. "Stable"
    total_po_value: float
    po_value_growth: float
    # Global Reconciliation Totals
    total_ordered: float = 0
    total_delivered: float = 0
    total_received: float = 0


class ActivityItem(BaseModel):
    """Recent Activity Item"""

    type: str  # "PO", "DC", "Invoice"
    number: str
    date: str
    description: str
    created_at: str


# ============================================================
# SRV (STORES RECEIPT VOUCHER) MODELS
# ============================================================


class SRVHeader(BaseModel):
    """SRV Header"""

    srv_number: str
    srv_date: str
    po_number: str
    srv_status: Optional[str] = "Received"
    po_found: Optional[bool] = True  # Whether PO exists in database
    file_hash: Optional[str] = None
    is_active: Optional[bool] = True
    created_at: Optional[str] = None


class SRVItem(BaseModel):
    """SRV Item"""

    id: Optional[str] = None
    po_item_no: int
    lot_no: Optional[int] = None
    srv_item_no: Optional[int] = None
    rev_no: Optional[int] = None
    received_qty: float
    rejected_qty: float
    order_qty: Optional[float] = 0
    challan_qty: Optional[float] = 0
    accepted_qty: Optional[float] = 0
    unit: Optional[str] = None
    challan_no: Optional[str] = None
    challan_date: Optional[str] = None
    invoice_no: Optional[str] = None
    invoice_date: Optional[str] = None
    div_code: Optional[str] = None
    pmir_no: Optional[str] = None
    finance_date: Optional[str] = None
    cnote_no: Optional[str] = None
    cnote_date: Optional[str] = None
    remarks: Optional[str] = None


class SRVDetail(BaseModel):
    """SRV Detail (Full)"""

    header: SRVHeader
    items: List[SRVItem]


class SRVListItem(BaseModel):
    """SRV List Item (Summary)"""

    srv_number: str
    srv_date: str
    po_number: str
    total_received_qty: float = 0.0
    total_rejected_qty: float = 0.0
    total_order_qty: float = 0.0
    total_challan_qty: float = 0.0
    total_accepted_qty: float = 0.0
    po_ordered_qty: float = 0.0  # Actual PO ordered quantity
    po_found: Optional[bool] = True  # Whether PO exists in database
    warning_message: Optional[str] = None  # Warning if PO not found
    challan_numbers: Optional[str] = None
    invoice_numbers: Optional[str] = None
    created_at: Optional[str] = None


class SRVStats(BaseModel):
    """SRV Page KPIs"""

    total_srvs: int
    total_received_qty: float
    total_rejected_qty: float
    rejection_rate: float  # Percentage
    missing_po_count: int  # Count of SRVs with PO not found


# ============================================================
# SETTINGS MODELS
# ============================================================


class Settings(BaseModel):
    """Business Settings"""

    supplier_name: Optional[str] = None
    supplier_description: Optional[str] = None
    supplier_address: Optional[str] = None
    supplier_gstin: Optional[str] = None
    supplier_contact: Optional[str] = None
    supplier_state: Optional[str] = None
    supplier_state_code: Optional[str] = None

    company_name: Optional[str] = None  # Legacy support
    company_gstin: Optional[str] = None  # Legacy support
    company_address: Optional[str] = None  # Legacy support

    buyer_name: Optional[str] = None
    buyer_address: Optional[str] = None
    buyer_gstin: Optional[str] = None
    buyer_state: Optional[str] = None
    buyer_state_code: Optional[str] = None
    buyer_place_of_supply: Optional[str] = None
    buyer_designation: Optional[str] = None


class SettingsUpdate(BaseModel):
    """Partial Update of Settings"""

    key: str
    value: str


# ============================================================
# BUYER MODELS (NEW)
# ============================================================


class Buyer(BaseModel):
    """Buyer Entity"""

    id: Optional[int] = None
    name: str
    designation: Optional[str] = None
    gstin: Optional[str] = None
    billing_address: Optional[str] = None
    state: Optional[str] = None
    state_code: Optional[str] = None
    department_no: Optional[str] = None  # DVN
    supplier_code: Optional[str] = None
    is_default: bool = False
    is_active: bool = True
    created_at: Optional[str] = None


# ============================================================
# PO NOTE MODELS (NEW)
# ============================================================
class PONote(BaseModel):
    """PO Note Template"""

    id: Optional[int] = None
    title: str
    content: str
    updated_at: Optional[str] = None


# ============================================================
# SEARCH MODELS (NEW)
# ============================================================
class SearchResult(BaseModel):
    """Global Search Result"""

    id: str
    type: str  # "PO", "DC", "Invoice"
    number: str
    date: str
    party: str
    amount: float = 0.0
    type_label: str
    status: str

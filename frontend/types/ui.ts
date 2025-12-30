export interface InvoiceItemUI {
    lotNumber: string | number;
    description: string;
    hsnCode: string;
    quantity: number;
    unit: string;
    rate: number;
    taxableValue: number;
    tax: {
        cgstRate: number;
        cgstAmount: number;
        sgstRate: number;
        sgstAmount: number;
        igstRate: number;
        igstAmount: number;
    };
    totalAmount: number;
    numberOfPackets?: number;
}

export interface InvoiceFormData {
    invoice_number: string;
    invoice_date: string;
    dc_number: string;
    challan_date?: string;
    buyers_order_no?: string;
    buyers_order_date?: string;
    buyer_name: string;
    buyer_address?: string;
    buyer_gstin?: string;
    buyer_state?: string;
    buyer_state_code?: string;
    place_of_supply?: string;
    vehicle_no?: string;
    transporter?: string;
    lr_no?: string;
    destination?: string;
    terms_of_delivery?: string;
    gemc_number?: string;
    gemc_date?: string;
    mode_of_payment?: string;
    payment_terms?: string;
    despatch_doc_no?: string;
    srv_no?: string;
    srv_date?: string;
    remarks?: string;
    taxable_value?: number;
    cgst?: number;
    sgst?: number;
    total_invoice_value?: number;
}

export interface InvoiceUI {
    invoiceNumber: string;
    invoiceDate: string;
    dcNumber: string;
    poNumber: string;
    buyer: {
        name: string;
        address: string;
        gstin: string;
        state: string;
        stateCode: string;
        placeOfSupply: string;
    };
    order: {
        orderNumber: string;
        orderDate: string;
    };
    transport: {
        vehicleNumber: string;
        lrNumber: string;
        transporterName: string;
        destination: string;
        termsOfDelivery: string;
    };
    payment: {
        gemcNumber: string;
        modeOfPayment: string;
        paymentTerms: string;
    };
    documents: {
        despatchDocNumber: string;
        srvNumber: string;
        srvDate: string;
    };
    items: InvoiceItemUI[];
    totals: {
        taxableValue: number;
        cgst: number;
        sgst: number;
        igst: number;
        totalInvoiceValue: number;
    };
    remarks: string;
    createdAt?: string;
}

export interface InvoiceCreateRequest {
    invoice_number: string;
    invoice_date: string;
    dc_number: string;
    buyer_name: string;
    buyer_address?: string;
    buyer_gstin?: string;
    buyer_state?: string;
    buyer_state_code?: string;
    place_of_supply?: string;
    buyers_order_no?: string;
    buyers_order_date?: string;
    vehicle_no?: string;
    lr_no?: string;
    transporter?: string;
    destination?: string;
    terms_of_delivery?: string;
    gemc_number?: string;
    mode_of_payment?: string;
    payment_terms?: string;
    despatch_doc_no?: string;
    srv_no?: string;
    srv_date?: string;
    remarks?: string;
}

export interface DCItemUIRow {
    id: string;
    lotNumber: string;
    description: string;
    orderedQuantity: number;
    remainingQuantity: number;
    dispatchQuantity: number;
    poItemId: number;
    hsnCode: string;
    hsnRate: number;
}

export interface DCUI {
    dcNumber: string;
    dcDate: string;
    poNumber: number;
    supplier: {
        phone: string;
        gstin: string;
    };
    consignee: {
        name: string;
        address: string;
        gstin: string;
    };
    departmentNumber: string;
    transport: {
        modeOfTransport: string;
        vehicleNumber: string;
        transporterName: string;
        lrNumber: string;
        ewayBillNumber: string;
    };
    inspectionCompany: string;
    items: DCItemUIRow[];
    remarks: string;
    createdAt?: string;
}

export interface DCFormData {
    dcNumber: string;
    dcDate: string;
    poNumber: string;
    supplierPhone?: string;
    supplierGstin?: string;
    consigneeName: string;
    consigneeAddress: string;
    consigneeGstin: string;
    departmentNo: string;
    modeOfTransport: string;
    vehicleNumber: string;
    transporterName: string;
    lrNumber: string;
    ewayBillNumber: string;
    inspectionCompany: string;
    remarks: string;
}

export interface DCCreateRequest {
    dc_number: string;
    dc_date: string;
    po_number?: number;
    department_no: string;
    consignee_name: string;
    consignee_gstin: string;
    consignee_address: string;
    inspection_company: string;
    eway_bill_no: string;
    vehicle_no: string;
    lr_no: string;
    transporter: string;
    mode_of_transport: string;
    remarks: string;
}

export interface DCItemRequest {
    po_item_id: number;
    lot_no?: number;
    dispatch_qty: number;
    hsn_code: string;
    hsn_rate: number;
}


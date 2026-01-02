import { create } from "zustand";
import { InvoiceDetail, InvoiceHeader, InvoiceItem } from "@/types";

interface InvoiceState {
    data: InvoiceDetail | null;
    isEditing: boolean;
    dcData: any | null; // For creation flow
    isCheckingNumber: boolean;
    isDuplicateNumber: boolean;

    setInvoice: (data: InvoiceDetail) => void;
    setHeader: (header: InvoiceHeader) => void;
    updateHeader: (field: string, value: any) => void;
    updateItem: (index: number, field: string, value: any) => void;
    setEditing: (isEditing: boolean) => void;
    setDCData: (data: any) => void;
    setItems: (items: InvoiceItem[]) => void;
    setNumberStatus: (checking: boolean, duplicate: boolean) => void;
    reset: () => void;
}

export const useInvoiceStore = create<InvoiceState>((set) => ({
    data: null,
    isEditing: false,
    dcData: null,
    isCheckingNumber: false,
    isDuplicateNumber: false,

    setInvoice: (data) => set({ data, isEditing: false }),
    setHeader: (header) => set((state) => ({
        data: state.data ? { ...state.data, header } : { header, items: [] } as any
    })),
    updateHeader: (field, value) => set((state) => {
        if (!state.data) return state;
        return {
            data: {
                ...state.data,
                header: {
                    ...state.data.header,
                    [field]: value
                }
            }
        };
    }),
    updateItem: (index, field, value) => set((state) => {
        if (!state.data || !state.data.items) return state;
        const newItems = [...state.data.items];
        newItems[index] = { ...newItems[index], [field]: value };
        return {
            data: {
                ...state.data,
                items: newItems
            }
        };
    }),
    setEditing: (isEditing) => set({ isEditing }),
    setDCData: (dcData) => set({ dcData }),
    setItems: (items) => set((state) => ({
        data: state.data ? { ...state.data, items } : { items } as any
    })),
    setNumberStatus: (isCheckingNumber, isDuplicateNumber) => set({ isCheckingNumber, isDuplicateNumber }),
    reset: () => set({ data: null, isEditing: false, dcData: null, isCheckingNumber: false, isDuplicateNumber: false })
}));

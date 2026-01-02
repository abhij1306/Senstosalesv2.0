import { create } from 'zustand';
import { PODetail, POItem, PODelivery } from '@/types';

interface POState {
    data: PODetail | null;
    setPO: (po: PODetail | null) => void;
    setHeader: (header: any) => void;
    setItems: (items: POItem[]) => void;
    updateHeader: (field: string, value: any) => void;
    updateItem: (index: number, field: string, value: any) => void;
    addItem: () => void;
    removeItem: (index: number) => void;
    addDelivery: (itemIdx: number) => void;
    removeDelivery: (itemIdx: number, deliveryIdx: number) => void;
    updateDelivery: (itemIdx: number, deliveryIdx: number, field: string, value: any) => void;
    reset: () => void;
}

export const usePOStore = create<POState>((set) => ({
    data: null,
    setPO: (po) => set({ data: po }),
    setHeader: (header) => set((state) => ({
        data: state.data ? { ...state.data, header } : { header, items: [] }
    })),
    setItems: (items) => set((state) => ({
        data: state.data ? { ...state.data, items } : { header: {} as any, items }
    })),
    updateHeader: (field, value) => set((state) => {
        if (!state.data) return state;
        return {
            data: {
                ...state.data,
                header: { ...state.data.header, [field]: value }
            }
        };
    }),
    updateItem: (index, field, value) => set((state) => {
        if (!state.data || !state.data.items) return state;
        const newItems = [...state.data.items];
        newItems[index] = { ...newItems[index], [field]: value };

        // Auto-calculate item value if rate or quantity changes
        if (field === "po_rate" || field === "ordered_quantity") {
            newItems[index].item_value =
                (newItems[index].ordered_quantity || 0) * (newItems[index].po_rate || 0);
        }

        return { data: { ...state.data, items: newItems } };
    }),
    addItem: () => set((state) => {
        if (!state.data) return state;
        const items = state.data.items || [];
        const maxItemNo = Math.max(...items.map((i) => i.po_item_no || 0), 0);
        const newItem: POItem = {
            po_item_no: maxItemNo + 1,
            material_code: "",
            material_description: "NEW PROCUREMENT ITEM",
            drg_no: "",
            unit: "NOS",
            ordered_quantity: 0,
            po_rate: 0,
            item_value: 0,
            delivered_quantity: 0,
            deliveries: [{
                lot_no: 1,
                ordered_quantity: 0,
                delivered_quantity: 0,
                received_quantity: 0,
                manual_override_qty: 0,
                dely_date: new Date().toISOString().split("T")[0],
            }],
        };
        return { data: { ...state.data, items: [...items, newItem] } };
    }),
    removeItem: (index) => set((state) => {
        if (!state.data || !state.data.items) return state;
        const newItems = state.data.items.filter((_, i) => i !== index);
        return { data: { ...state.data, items: newItems } };
    }),
    addDelivery: (itemIdx) => set((state) => {
        if (!state.data || !state.data.items) return state;
        const newItems = [...state.data.items];
        const item = newItems[itemIdx];
        const deliveries = item.deliveries || [];
        const maxLotNo = Math.max(...deliveries.map((d) => d.lot_no || 0), 0);
        const newLot: PODelivery = {
            lot_no: maxLotNo + 1,
            ordered_quantity: 0,
            delivered_quantity: 0,
            received_quantity: 0,
            manual_override_qty: 0,
            dely_date: new Date().toISOString().split("T")[0],
        };
        newItems[itemIdx].deliveries = [...deliveries, newLot];
        return { data: { ...state.data, items: newItems } };
    }),
    removeDelivery: (itemIdx, deliveryIdx) => set((state) => {
        if (!state.data || !state.data.items) return state;
        const newItems = [...state.data.items];
        newItems[itemIdx].deliveries = newItems[itemIdx].deliveries.filter((_, i) => i !== deliveryIdx);
        return { data: { ...state.data, items: newItems } };
    }),
    updateDelivery: (itemIdx, deliveryIdx, field, value) => set((state) => {
        if (!state.data || !state.data.items) return state;
        const newItems = [...state.data.items];
        const item = newItems[itemIdx];
        const newDeliveries = [...item.deliveries];
        newDeliveries[deliveryIdx] = { ...newDeliveries[deliveryIdx], [field]: value };

        // Handle manual override flag
        if (field === "delivered_quantity") {
            newDeliveries[deliveryIdx].manual_override_qty = value;
        }

        newItems[itemIdx].deliveries = newDeliveries;
        return { data: { ...state.data, items: newItems } };
    }),
    reset: () => set({ data: null }),
}));

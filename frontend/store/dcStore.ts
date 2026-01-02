import { create } from "zustand";
import { DCDetail, DCItemRow, POHeader } from "@/types";

interface DCState {
    data: DCDetail | null;
    originalData: DCDetail | null;
    isEditing: boolean;
    poData: POHeader | null;
    notes: string[];
    isCheckingNumber: boolean;
    isDuplicateNumber: boolean;
    conflictType: string | null;

    setDC: (data: DCDetail) => void;
    setHeader: (header: any) => void;
    updateHeader: (field: string, value: any) => void;
    updateItem: (index: number, field: string, value: any) => void;
    setEditing: (isEditing: boolean) => void;
    reset: () => void;

    setPOData: (data: POHeader | null) => void;
    setItems: (items: DCItemRow[]) => void;
    setNotes: (notes: string[]) => void;
    addNote: () => void;
    updateNote: (index: number, value: string) => void;
    removeNote: (index: number) => void;
    setNumberStatus: (isChecking: boolean, isDuplicate: boolean, conflictType: string | null) => void;
}

export const useDCStore = create<DCState>((set) => ({
    data: null,
    originalData: null,
    isEditing: false,
    poData: null,
    notes: [],
    isCheckingNumber: false,
    isDuplicateNumber: false,
    conflictType: null,

    setDC: (data) => set({
        data,
        originalData: data,
        notes: data.header.remarks ? data.header.remarks.split("\n\n") : []
    }),
    setHeader: (header) => set((state) => ({
        data: state.data ? { ...state.data, header } : { header, items: [] }
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
    reset: () => set((state) => ({ data: state.originalData, isEditing: false })),

    setPOData: (poData) => set({ poData }),
    setItems: (items) => set((state) => ({
        data: state.data ? { ...state.data, items } : { header: {} as any, items }
    })),
    setNotes: (notes) => set({ notes }),
    addNote: () => set((state) => ({ notes: [...state.notes, ""] })),
    updateNote: (index, value) => set((state) => {
        const newNotes = [...state.notes];
        newNotes[index] = value;
        return { notes: newNotes };
    }),
    removeNote: (index) => set((state) => ({
        notes: state.notes.filter((_, i) => i !== index)
    })),
    setNumberStatus: (isCheckingNumber, isDuplicateNumber, conflictType) =>
        set({ isCheckingNumber, isDuplicateNumber, conflictType })
}));

import {create} from 'zustand'
import { fetchRecapByClass, getClassSummary, getStudentsByClass, getGlobalStatistics } from "../services/reportService";

const useReportStore = create((set, get) => ({
    reportData: [],
    classSummary: [],
    globalStats: null,
    loading: false,
    error: null,
    
    fetchRecapByClass: async (params) => {
        set({ loading: true, error: null });
        try {
            const data = await fetchRecapByClass(params);
            set({ reportData: data, loading: false });
            return data;
        } catch (err) {
            const message = err?.response?.data?.message || err?.message || err;
            set({ error: message, loading: false });
            throw err;
        }
    },

    getClassSummary: async () => {
        set({ loading: true, error: null });
        try {
            const data = await getClassSummary();
            set({ classSummary: data, loading: false });
            return data;
        } catch (err) {
            const message = err?.response?.data?.message || err?.message || err;
            set({ error: message, loading: false });
            throw err;
        }
    },

    getGlobalStatistics: async () => {
        set({ loading: true, error: null });
        try {
            const data = await getGlobalStatistics();
            set({ globalStats: data, loading: false });
            return data;
        } catch (err) {
            const message = err?.response?.data?.message || err?.message || err;
            set({ error: message, loading: false });
            throw err;
        }
    },

    getStudentsByClass: async (className, params) => {
        set({ loading: true, error: null });
        try {
            const data = await getStudentsByClass(className, params);
            set({ loading: false });
            return data;
        } catch (err) {
            const message = err?.response?.data?.message || err?.message || err;
            set({ error: message, loading: false });
            throw err;
        }
    },

    clearError: () => set({ error: null }),
}));

export default useReportStore;
import {create} from 'zustand'
import { fetchRecapByClass } from "../services/reportService";

const useReportStore = create((set) => ({
    reportData: [],
    loading: false,
    error: null,
    fetchRecapByClass: async () => {
        set({ loading: true, error: null });
        try {
            const data = await fetchRecapByClass();
            set({ reportData: data, loading: false });
            return data;
        } catch (err) {
            const message = err?.message || err;
            set({ error: message, loading: false });
            throw err;
        }
    },
}));

export default useReportStore;
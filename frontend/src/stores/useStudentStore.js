import { create } from "zustand";
import { createStudentCsv, getStudentsList, getAvailableClasses } from "../services/studentService";

const useStudentStore = create((set, get) => ({
    loading: false,
    error: null,
    successMessage: null,
    students: [],
    classes: [],
    pagination: null,
    
    getStudentsList: async (params) => {
        set({ loading: true, error: null });
        try {
            const data = await getStudentsList(params);
            set({ 
                loading: false, 
                students: data.students, 
                pagination: data.pagination,
                error: null 
            });
            return data;
        } catch (err) {
            const message = err?.response?.data?.message || err.message;
            set({ error: message, loading: false });
            throw err;
        }
    },

    getAvailableClasses: async () => {
        try {
            const data = await getAvailableClasses();
            set({ classes: data, error: null });
            return data;
        } catch (err) {
            const message = err?.response?.data?.message || err.message;
            set({ error: message });
            throw err;
        }
    },

    createStudentCsv: async (file) => {
        set({ loading: true, error: null, successMessage: null });
        try {
            const formData = new FormData();
            formData.append('file', file);
            const data = await createStudentCsv(formData);
            set({ loading: false, successMessage: "Students created successfully", error: null });
            return data;
        } catch (err) {
            const message = err?.response?.data?.message || err.message;
            set({ error: message, loading: false, successMessage: null });
            throw err;
        }
    },
    
    clearMessages: () => set({ error: null, successMessage: null }),
}));

export { useStudentStore };
export default useStudentStore;
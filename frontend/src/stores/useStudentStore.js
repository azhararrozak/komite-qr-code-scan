import { create } from "zustand";
import { createStudentCsv } from "../services/studentService";

const useStudentStore = create((set) => ({
    loading: false,
    error: null,
    successMessage: null,
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

export default useStudentStore;
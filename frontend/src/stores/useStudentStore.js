import { create } from "zustand";
import { 
    createStudentCsv, 
    getStudentsList, 
    getAvailableClasses, 
    createStudentsFromCSVWithQR,
    generateStudentQR,
    getQRCodesByClass
} from "../services/studentService";

const useStudentStore = create((set, get) => ({
    loading: false,
    error: null,
    successMessage: null,
    students: [],
    classes: [],
    pagination: null,
    qrCodes: [],
    qrLoading: false,
    
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
    
    createStudentsFromCSVWithQR: async (file) => {
        set({ loading: true, error: null, successMessage: null });
        try {
            const formData = new FormData();
            formData.append('csvFile', file);
            const data = await createStudentsFromCSVWithQR(formData);
            set({ 
                loading: false, 
                successMessage: `Successfully created ${data.totalStudents} students and generated ${data.totalQRCodes} QR codes`, 
                error: null,
                qrCodes: data.qrCodes || []
            });
            return data;
        } catch (err) {
            const message = err?.response?.data?.message || err.message;
            set({ error: message, loading: false, successMessage: null });
            throw err;
        }
    },

    generateStudentQR: async (studentId) => {
        set({ qrLoading: true, error: null });
        try {
            const data = await generateStudentQR(studentId);
            set({ qrLoading: false, error: null });
            return data;
        } catch (err) {
            const message = err?.response?.data?.message || err.message;
            set({ error: message, qrLoading: false });
            throw err;
        }
    },

    getQRCodesByClass: async (className) => {
        set({ qrLoading: true, error: null });
        try {
            const data = await getQRCodesByClass(className);
            set({ 
                qrLoading: false, 
                qrCodes: data.qrCodes || [],
                error: null 
            });
            return data;
        } catch (err) {
            const message = err?.response?.data?.message || err.message;
            set({ error: message, qrLoading: false });
            throw err;
        }
    },

    clearMessages: () => set({ error: null, successMessage: null }),
}));

export { useStudentStore };
export default useStudentStore;
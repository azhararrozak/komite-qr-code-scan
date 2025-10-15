import api from "./api";

export async function fetchRecapByClass(params) {
    try {
        const res = await api.get('/reports/student/class', { params });
        return res.data;
    } catch (error) {
        console.error("Error fetching recap by class:", error);
        throw error;
    }
}

export async function getClassSummary() {
    try {
        const res = await api.get('/reports/class/summary');
        return res.data;
    } catch (error) {
        console.error("Error fetching class summary:", error);
        throw error;
    }
}

export async function getStudentsByClass(className, params) {
    try {
        const res = await api.get(`/reports/class/${className}/students`, { params });
        return res.data;
    } catch (error) {
        console.error("Error fetching students by class:", error);
        throw error;
    }
}

export async function getGlobalStatistics() {
    try {
        const res = await api.get('/reports/statistics');
        return res.data;
    } catch (error) {
        console.error("Error fetching global statistics:", error);
        throw error;
    }
}

export default { fetchRecapByClass, getClassSummary, getStudentsByClass, getGlobalStatistics };
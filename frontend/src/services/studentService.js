import api from "./api";

export async function createStudentCsv(formData) {
    try {
        const res = await api.post('/students/csv', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return res.data;
    } catch (error) {
        console.error("Error creating students via CSV:", error);
        throw error;
    }
}

export async function getStudentsList(params) {
    try {
        const res = await api.get('/students/list', { params });
        return res.data;
    } catch (error) {
        console.error("Error fetching students list:", error);
        throw error;
    }
}

export async function getAvailableClasses() {
    try {
        const res = await api.get('/students/classes');
        return res.data;
    } catch (error) {
        console.error("Error fetching available classes:", error);
        throw error;
    }
}

export default { createStudentCsv, getStudentsList, getAvailableClasses };
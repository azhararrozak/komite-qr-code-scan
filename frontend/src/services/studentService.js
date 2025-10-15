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

export default { createStudentCsv };
import api from "./api";

export async function fetchRecapByClass() {
    try {
        const res = await api.get('/reports/student/class');
        return res.data;
    } catch (error) {
        console.error("Error fetching recap by class:", error);
        throw error;
    }
}  

export default { fetchRecapByClass };
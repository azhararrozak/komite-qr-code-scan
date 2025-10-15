import api from "./api";

export async function getAllWaliKelas() {
    try {
        const res = await api.get('/users/walikelas');
        return res.data;
    } catch (error) {
        console.error("Error fetching wali kelas:", error);
        throw error;
    }
}

export default { getAllWaliKelas };
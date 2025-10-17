import api from "./api";

export async function getAllWaliKelas() {
  try {
    const res = await api.get("/users/walikelas");
    return res.data;
  } catch (error) {
    console.error("Error fetching wali kelas:", error);
    throw error;
  }
}

export async function createWaliKelas(data) {
  try {
    const res = await api.post("/users/walikelas", data);
    return res.data;
  } catch (error) {
    console.error("Error creating wali kelas:", error);
    throw error;
  }
}

export default { getAllWaliKelas, createWaliKelas };

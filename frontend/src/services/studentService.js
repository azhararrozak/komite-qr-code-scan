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

// Create students from CSV with QR generation
export async function createStudentsFromCSVWithQR(formData) {
    try {
        const res = await api.post('/students/csv-with-qr', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return res.data;
    } catch (error) {
        console.error("Error creating students with QR from CSV:", error);
        throw error;
    }
}

// Generate QR code for single student
export async function generateStudentQR(studentId) {
    try {
        const res = await api.post(`/students/${studentId}/generate-qr`);
        return res.data;
    } catch (error) {
        console.error("Error generating student QR:", error);
        throw error;
    }
}

// Get QR codes by class
export async function getQRCodesByClass(className) {
    try {
        const res = await api.get(`/students/qr/class/${className}`);
        return res.data;
    } catch (error) {
        console.error("Error fetching QR codes by class:", error);
        throw error;
    }
}

// Get download URL for QR code
export function getQRDownloadUrl(className, fileName) {
    return `/api/students/qr/download/${className}/${fileName}`;
}

export default { 
    createStudentCsv, 
    getStudentsList, 
    getAvailableClasses, 
    createStudentsFromCSVWithQR,
    generateStudentQR,
    getQRCodesByClass,
    getQRDownloadUrl
};
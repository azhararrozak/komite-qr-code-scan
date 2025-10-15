import api from "./api";

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

export async function getAllStudentsWithPaymentInfo(params) {
    try {
        const classSummary = await getClassSummary();
        const allStudents = [];
        
        for (const cls of classSummary) {
            allStudents.push(...cls.students);
        }
        
        let filteredStudents = allStudents;
        
        if (params?.search) {
            const searchTerm = params.search.toLowerCase();
            filteredStudents = allStudents.filter(student => 
                student.name.toLowerCase().includes(searchTerm) ||
                student.nis.toLowerCase().includes(searchTerm)
            );
        }
        
        if (params?.status) {
            const statusMap = {
                'PAID': 'Lunas',
                'PARTIAL': 'Belum Lunas', 
                'UNPAID': 'Belum Dibayar'
            };
            const targetStatus = statusMap[params.status];
            if (targetStatus) {
                filteredStudents = filteredStudents.filter(student => student.status === targetStatus);
            }
        }
        
        filteredStudents.sort((a, b) => b.remainingAmount - a.remainingAmount);
        
        return filteredStudents;
    } catch (error) {
        console.error("Error fetching all students with payment info:", error);
        throw error;
    }
}

export default { getClassSummary, getStudentsByClass, getGlobalStatistics, getAllStudentsWithPaymentInfo };
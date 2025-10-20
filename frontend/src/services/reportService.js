import api from "./api";

export async function getClassSummary() {
  try {
    const res = await api.get("/reports/class/summary");
    return res.data;
  } catch (error) {
    console.error("Error fetching class summary:", error);
    throw error;
  }
}

export async function getStudentsByClass(className, params) {
  try {
    const res = await api.get(`/reports/class/${className}/students`, {
      params,
    });
    return res.data;
  } catch (error) {
    console.error("Error fetching students by class:", error);
    throw error;
  }
}

export async function getGlobalStatistics() {
  try {
    const res = await api.get("/reports/statistics");
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

    if (params?.q) {
      const searchTerm = params.q.toLowerCase();
      filteredStudents = allStudents.filter(
        (student) =>
          student.name.toLowerCase().includes(searchTerm) ||
          student.nis.toLowerCase().includes(searchTerm)
      );
    }

    if (params?.status) {
      const statusMap = {
        PAID: "Lunas",
        PARTIAL: "Belum Lunas",
        UNPAID: "Belum Dibayar",
      };
      const targetStatus = statusMap[params.status];
      if (targetStatus) {
        filteredStudents = filteredStudents.filter(
          (student) => student.status === targetStatus
        );
      }
    }

    filteredStudents.sort((a, b) => b.remainingAmount - a.remainingAmount);

    return filteredStudents;
  } catch (error) {
    console.error("Error fetching all students with payment info:", error);
    throw error;
  }
}

// Get payment history for a specific student by NIS
export async function getStudentPaymentHistory(nis) {
  try {
    const res = await api.get(`/reports/student/${nis}/history`);
    return res.data;
  } catch (error) {
    console.error("Error fetching student payment history:", error);
    throw error;
  }
}

// Get payment history for all students in a class
export async function getClassPaymentHistory(className) {
  try {
    const res = await api.get(`/reports/class/${className}/history`);
    return res.data;
  } catch (error) {
    console.error("Error fetching class payment history:", error);
    throw error;
  }
}

export default {
  getClassSummary,
  getStudentsByClass,
  getGlobalStatistics,
  getAllStudentsWithPaymentInfo,
  getStudentPaymentHistory,
  getClassPaymentHistory,
};

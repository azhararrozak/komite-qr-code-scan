import { useEffect, useState } from "react";
import useReportStore from "../../../stores/useReportStore";
import useAuthStore from "../../../stores/useAuthStore";
import handleExportToExcelRekapDataSiswa from "../../../utils/ExportToExcel";

const RekapDataWaliKelas = () => {
  const { studentsByClass, loading, error, getStudentsByClass, clearError } =
    useReportStore();

  const user = useAuthStore((s) => s.user);
  const classAssigned = user?.classAssigned || "";

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [classStats, setClassStats] = useState({
    totalStudents: 0,
    totalTarget: 0,
    totalPaid: 0,
    totalRemaining: 0,
    lunas: 0,
    belumLunas: 0,
    belumDibayar: 0,
  });

  useEffect(() => {
    if (classAssigned) {
      loadClassData();
    }
  }, [classAssigned]);

  const loadClassData = async () => {
    try {
      const data = await getStudentsByClass(classAssigned, {
        search,
        status: statusFilter,
      });

      // Sort data by name alphabetically (A-Z)
      const sortedData = [...data].sort((a, b) => {
        const nameA = a.name?.toLowerCase() || "";
        const nameB = b.name?.toLowerCase() || "";
        return nameA.localeCompare(nameB);
      });

      calculateStats(sortedData);
    } catch (err) {
      console.error("Error loading class data:", err);
    }
  };

  const calculateStats = (students) => {
    const stats = students.reduce(
      (acc, student) => {
        acc.totalStudents++;
        acc.totalTarget += student.targetAmount || 0;
        acc.totalPaid += student.paidAmount || 0;
        acc.totalRemaining += student.remainingAmount || 0;

        if (student.status === "Lunas") acc.lunas++;
        else if (student.status === "Belum Lunas") acc.belumLunas++;
        else acc.belumDibayar++;

        return acc;
      },
      {
        totalStudents: 0,
        totalTarget: 0,
        totalPaid: 0,
        totalRemaining: 0,
        lunas: 0,
        belumLunas: 0,
        belumDibayar: 0,
      }
    );

    setClassStats(stats);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadClassData();
  };

  const getStatusBadge = (status) => {
    const colors = {
      Lunas: "bg-green-100 text-green-800",
      "Belum Lunas": "bg-yellow-100 text-yellow-800",
      "Belum Dibayar": "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const formatRupiah = (amount) => {
    return `Rp ${amount?.toLocaleString("id-ID") || "0"}`;
  };

  const getProgressPercentage = () => {
    return classStats.totalTarget > 0
      ? Math.round((classStats.totalPaid / classStats.totalTarget) * 100)
      : 0;
  };

  // Sort students by name alphabetically
  const sortedStudents = [...studentsByClass].sort((a, b) => {
    const nameA = a.name?.toLowerCase() || "";
    const nameB = b.name?.toLowerCase() || "";
    return nameA.localeCompare(nameB, "id");
  });

  if (!classAssigned) {
    return (
      <div className="p-6">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          Anda belum ditugaskan untuk mengelola kelas tertentu. Hubungi
          administrator.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        Rekap Data Kelas {classAssigned}
      </h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
          <button
            onClick={clearError}
            className="ml-2 text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="text-sm font-medium text-blue-600">Total Siswa</h3>
          <p className="text-2xl font-bold text-blue-900">
            {classStats.totalStudents}
          </p>
        </div>
        <div className="bg-green-50 p-6 rounded-lg">
          <h3 className="text-sm font-medium text-green-600">Terkumpul</h3>
          <p className="text-2xl font-bold text-green-900">
            {formatRupiah(classStats.totalPaid)}
          </p>
        </div>
        <div className="bg-orange-50 p-6 rounded-lg">
          <h3 className="text-sm font-medium text-orange-600">Target</h3>
          <p className="text-2xl font-bold text-orange-900">
            {formatRupiah(classStats.totalTarget)}
          </p>
        </div>
        <div className="bg-purple-50 p-6 rounded-lg">
          <h3 className="text-sm font-medium text-purple-600">Progress</h3>
          <p className="text-2xl font-bold text-purple-900">
            {getProgressPercentage()}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-green-50 p-6 rounded-lg">
          <h3 className="text-sm font-medium text-green-600">Siswa Lunas</h3>
          <p className="text-3xl font-bold text-green-900">
            {classStats.lunas}
          </p>
        </div>
        <div className="bg-yellow-50 p-6 rounded-lg">
          <h3 className="text-sm font-medium text-yellow-600">Belum Lunas</h3>
          <p className="text-3xl font-bold text-yellow-900">
            {classStats.belumLunas}
          </p>
        </div>
        <div className="bg-red-50 p-6 rounded-lg">
          <h3 className="text-sm font-medium text-red-600">Belum Bayar</h3>
          <p className="text-3xl font-bold text-red-900">
            {classStats.belumDibayar}
          </p>
        </div>
      </div>

      <form onSubmit={handleSearchSubmit} className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Cari siswa berdasarkan nama atau NIS..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Semua Status</option>
          <option value="lunas">Lunas</option>
          <option value="belum_lunas">Belum Lunas</option>
          <option value="belum_dibayar">Belum Dibayar</option>
        </select>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Cari
        </button>
      </form>

      {/* Button Export to Excel */}
      <div className="mb-4">
        <button
          onClick={() =>
            handleExportToExcelRekapDataSiswa(
              sortedStudents,
              `Rekap_Data_Kelas_${classAssigned}`
            )
          }
          className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
        >
          Export to Excel
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2">Memuat data...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    NIS
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Nama
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Gender
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Target
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Dibayar
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Sisa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedStudents.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      Tidak ada data siswa
                    </td>
                  </tr>
                ) : (
                  sortedStudents.map((student) => (
                    <tr key={student._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {student.nis}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {student.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {student.gender ? "Laki-laki" : "Perempuan"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {formatRupiah(student.targetAmount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                        {formatRupiah(student.paidAmount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-600">
                        {formatRupiah(student.remainingAmount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(
                            student.status
                          )}`}
                        >
                          {student.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default RekapDataWaliKelas;

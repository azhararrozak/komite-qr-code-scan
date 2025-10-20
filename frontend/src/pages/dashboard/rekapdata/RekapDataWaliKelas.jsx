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

      <form onSubmit={handleSearchSubmit} className="mb-6">
        <div className="flex flex-col md:flex-row gap-3">
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
            className="w-full md:w-auto px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Semua Status</option>
            <option value="lunas">Lunas</option>
            <option value="belum_lunas">Belum Lunas</option>
            <option value="belum_dibayar">Belum Dibayar</option>
          </select>
          <button
            type="submit"
            className="w-full md:w-auto px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-150"
          >
            Cari
          </button>
        </div>
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
          className="w-full md:w-auto px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-150 flex items-center justify-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <span>Export to Excel</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2">Memuat data...</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      NIS
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nama
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Gender
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Target
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dibayar
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sisa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {student.nis}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {student.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {student.gender ? "Laki-laki" : "Perempuan"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatRupiah(student.targetAmount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                          {formatRupiah(student.paidAmount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-orange-600">
                          {formatRupiah(student.remainingAmount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(
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

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {sortedStudents.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
                Tidak ada data siswa
              </div>
            ) : (
              sortedStudents.map((student) => (
                <div
                  key={student._id}
                  className="bg-white rounded-lg shadow p-4 space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {student.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        NIS: {student.nis}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {student.gender ? "Laki-laki" : "Perempuan"}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(
                        student.status
                      )}`}
                    >
                      {student.status}
                    </span>
                  </div>

                  <div className="border-t pt-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Target:</span>
                      <span className="font-medium text-gray-900">
                        {formatRupiah(student.targetAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Dibayar:</span>
                      <span className="font-medium text-green-600">
                        {formatRupiah(student.paidAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Sisa:</span>
                      <span className="font-medium text-orange-600">
                        {formatRupiah(student.remainingAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="pt-2">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Progress Pembayaran</span>
                      <span>
                        {student.targetAmount > 0
                          ? Math.round(
                              (student.paidAmount / student.targetAmount) * 100
                            )
                          : 0}
                        %
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${
                            student.targetAmount > 0
                              ? Math.round(
                                  (student.paidAmount / student.targetAmount) *
                                    100
                                )
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default RekapDataWaliKelas;

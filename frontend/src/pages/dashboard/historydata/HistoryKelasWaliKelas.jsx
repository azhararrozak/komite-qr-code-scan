import { useState, useEffect } from "react";
import { getClassPaymentHistory } from "../../../services/reportService";
import useAuthStore from "../../../stores/useAuthStore";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";

const HistoryKelasWaliKelas = () => {
  const user = useAuthStore((s) => s.user);
  const classAssigned = user?.classAssigned || "";

  const [loading, setLoading] = useState(false);
  const [classData, setClassData] = useState(null);
  const [expandedStudents, setExpandedStudents] = useState(new Set());

  useEffect(() => {
    if (classAssigned) {
      loadClassData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classAssigned]);

  const loadClassData = async () => {
    if (!classAssigned) {
      toast.error("Anda belum memiliki kelas yang ditugaskan");
      return;
    }

    setLoading(true);
    try {
      const data = await getClassPaymentHistory(classAssigned);
      setClassData(data);

      if (data.length === 0) {
        toast.error("Tidak ada data siswa di kelas ini");
      } else {
        toast.success(
          `Data kelas ${classAssigned} berhasil dimuat (${data.length} siswa)`
        );
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.message || "Gagal mengambil data kelas");
      setClassData(null);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear().toString().slice(-2);
    return `${day}/${month}/${year}`;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const toggleStudent = (studentId) => {
    const newExpanded = new Set(expandedStudents);
    if (newExpanded.has(studentId)) {
      newExpanded.delete(studentId);
    } else {
      newExpanded.add(studentId);
    }
    setExpandedStudents(newExpanded);
  };

  const expandAll = () => {
    if (classData) {
      setExpandedStudents(new Set(classData.map((s) => s.student._id)));
    }
  };

  const collapseAll = () => {
    setExpandedStudents(new Set());
  };

  const downloadExcel = () => {
    if (!classData || classData.length === 0) return;

    const excelData = [
      [`HISTORY PEMBAYARAN KELAS ${classAssigned}`],
      [],
      ["Total Siswa", classData.length],
      ["Tanggal Export", new Date().toLocaleDateString("id-ID")],
      [],
    ];

    // Summary statistics
    const totalTarget = classData.reduce(
      (sum, s) => sum + s.student.targetAmount,
      0
    );
    const totalPaid = classData.reduce(
      (sum, s) => sum + s.summary.totalPaid,
      0
    );
    const totalRemaining = classData.reduce(
      (sum, s) => sum + s.summary.remainingAmount,
      0
    );
    const lunasCount = classData.filter(
      (s) => s.summary.status === "Lunas"
    ).length;
    const belumLunasCount = classData.filter(
      (s) => s.summary.status === "Belum Lunas"
    ).length;
    const belumBayarCount = classData.filter(
      (s) => s.summary.status === "Belum Dibayar"
    ).length;

    excelData.push(
      ["RINGKASAN KELAS"],
      ["Total Target Pembayaran", totalTarget],
      ["Total Sudah Dibayar", totalPaid],
      ["Total Sisa Pembayaran", totalRemaining],
      [
        "Persentase Terkumpul",
        `${
          totalTarget > 0 ? ((totalPaid / totalTarget) * 100).toFixed(2) : 0
        }%`,
      ],
      [],
      ["Siswa Lunas", lunasCount],
      ["Siswa Belum Lunas", belumLunasCount],
      ["Siswa Belum Dibayar", belumBayarCount],
      [],
      []
    );

    // Add each student's data
    classData.forEach((studentData, index) => {
      const { student, summary, paymentHistory } = studentData;

      excelData.push(
        [`${index + 1}. ${student.name.toUpperCase()}`],
        ["NIS", student.nis],
        ["Kelas", student.class],
        ["Target Pembayaran", student.targetAmount],
        ["Sudah Dibayar", summary.totalPaid],
        ["Sisa Pembayaran", summary.remainingAmount],
        ["Status", summary.status],
        ["Persentase", `${summary.paymentPercentage}%`],
        [],
        ["DETAIL PEMBAYARAN"],
        [
          "No",
          "Pembayaran Ke",
          "Jumlah",
          "Tanggal",
          "Metode",
          "Dikumpulkan Oleh",
          "Catatan",
        ]
      );

      if (paymentHistory.length > 0) {
        paymentHistory.forEach((payment, idx) => {
          excelData.push([
            idx + 1,
            `Bayar ke-${payment.paymentNumber}`,
            payment.amount,
            formatDate(payment.paidAt),
            payment.method,
            payment.collectedBy?.name || payment.collectedBy?.username || "-",
            payment.note || "-",
          ]);
        });
      } else {
        excelData.push(["Belum ada pembayaran"]);
      }

      excelData.push([], []); // Spacing between students
    });

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(excelData);

    // Set column widths
    ws["!cols"] = [
      { wch: 5 },
      { wch: 20 },
      { wch: 15 },
      { wch: 12 },
      { wch: 10 },
      { wch: 20 },
      { wch: 25 },
    ];

    XLSX.utils.book_append_sheet(wb, ws, `Kelas ${classAssigned}`);

    const filename = `History_Kelas_${classAssigned}_${new Date()
      .toISOString()
      .slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, filename);

    toast.success("File Excel berhasil didownload");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Lunas":
        return "bg-green-100 text-green-800 border-green-300";
      case "Belum Lunas":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "Belum Dibayar":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  if (!classAssigned) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <svg
              className="mx-auto h-16 w-16 text-red-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Kelas Tidak Ditemukan
            </h3>
            <p className="text-gray-500">
              Anda belum memiliki kelas yang ditugaskan. Hubungi admin untuk
              mendapatkan kelas.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            History Pembayaran Kelas {classAssigned}
          </h1>
          <p className="text-gray-600">
            Lihat detail riwayat pembayaran semua siswa di kelas Anda
          </p>
        </div>

        {/* Action Buttons */}
        {classData && classData.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex gap-3 flex-wrap">
            <button
              onClick={loadClassData}
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 transition-colors font-medium flex items-center gap-2"
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
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              {loading ? "Memuat..." : "Refresh Data"}
            </button>
            <button
              onClick={downloadExcel}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
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
              Download Excel
            </button>
          </div>
        )}

        {/* Class Summary */}
        {classData && classData.length > 0 && (
          <>
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Ringkasan Kelas {classAssigned}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-blue-600 font-medium mb-1">
                    Total Siswa
                  </p>
                  <p className="text-2xl font-bold text-blue-900">
                    {classData.length}
                  </p>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-sm text-purple-600 font-medium mb-1">
                    Target Total
                  </p>
                  <p className="text-xl font-bold text-purple-900">
                    {formatCurrency(
                      classData.reduce(
                        (sum, s) => sum + s.student.targetAmount,
                        0
                      )
                    )}
                  </p>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-green-600 font-medium mb-1">
                    Total Terkumpul
                  </p>
                  <p className="text-xl font-bold text-green-900">
                    {formatCurrency(
                      classData.reduce((sum, s) => sum + s.summary.totalPaid, 0)
                    )}
                  </p>
                </div>

                <div className="bg-orange-50 rounded-lg p-4">
                  <p className="text-sm text-orange-600 font-medium mb-1">
                    Total Sisa
                  </p>
                  <p className="text-xl font-bold text-orange-900">
                    {formatCurrency(
                      classData.reduce(
                        (sum, s) => sum + s.summary.remainingAmount,
                        0
                      )
                    )}
                  </p>
                </div>

                <div className="bg-indigo-50 rounded-lg p-4">
                  <p className="text-sm text-indigo-600 font-medium mb-1">
                    Persentase
                  </p>
                  <p className="text-2xl font-bold text-indigo-900">
                    {(() => {
                      const total = classData.reduce(
                        (sum, s) => sum + s.student.targetAmount,
                        0
                      );
                      const paid = classData.reduce(
                        (sum, s) => sum + s.summary.totalPaid,
                        0
                      );
                      return total > 0
                        ? `${((paid / total) * 100).toFixed(1)}%`
                        : "0%";
                    })()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="bg-green-50 rounded-lg p-3 border-l-4 border-green-500">
                  <p className="text-sm text-green-600 font-medium">Lunas</p>
                  <p className="text-xl font-bold text-green-900">
                    {
                      classData.filter((s) => s.summary.status === "Lunas")
                        .length
                    }{" "}
                    siswa
                  </p>
                </div>

                <div className="bg-yellow-50 rounded-lg p-3 border-l-4 border-yellow-500">
                  <p className="text-sm text-yellow-600 font-medium">
                    Belum Lunas
                  </p>
                  <p className="text-xl font-bold text-yellow-900">
                    {
                      classData.filter(
                        (s) => s.summary.status === "Belum Lunas"
                      ).length
                    }{" "}
                    siswa
                  </p>
                </div>

                <div className="bg-red-50 rounded-lg p-3 border-l-4 border-red-500">
                  <p className="text-sm text-red-600 font-medium">
                    Belum Dibayar
                  </p>
                  <p className="text-xl font-bold text-red-900">
                    {
                      classData.filter(
                        (s) => s.summary.status === "Belum Dibayar"
                      ).length
                    }{" "}
                    siswa
                  </p>
                </div>
              </div>
            </div>

            {/* Expand/Collapse Controls */}
            <div className="mb-4 flex gap-2">
              <button
                onClick={expandAll}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Buka Semua
              </button>
              <button
                onClick={collapseAll}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
              >
                Tutup Semua
              </button>
            </div>

            {/* Students List */}
            <div className="space-y-4">
              {classData.map((studentData, index) => {
                const { student, summary, paymentHistory } = studentData;
                const isExpanded = expandedStudents.has(student._id);

                return (
                  <div
                    key={student._id}
                    className="bg-white rounded-lg shadow-md overflow-hidden"
                  >
                    {/* Student Header - Clickable */}
                    <div
                      onClick={() => toggleStudent(student._id)}
                      className="cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <div className="p-4 sm:p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4 flex-1">
                            {/* Number */}
                            <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                              <span className="text-indigo-700 font-bold">
                                {index + 1}
                              </span>
                            </div>

                            {/* Student Info */}
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-bold text-gray-900 mb-1">
                                {student.name}
                              </h3>
                              <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                                    />
                                  </svg>
                                  NIS: {student.nis}
                                </span>
                                <span className="flex items-center gap-1">
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                    />
                                  </svg>
                                  {summary.totalPayments} pembayaran
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Status Badge */}
                          <div className="flex items-center gap-3">
                            <div
                              className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                                summary.status
                              )}`}
                            >
                              {summary.status}
                            </div>
                            <svg
                              className={`w-6 h-6 text-gray-400 transition-transform ${
                                isExpanded ? "rotate-180" : ""
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </div>
                        </div>

                        {/* Summary Row */}
                        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="text-sm">
                            <p className="text-gray-500">Target</p>
                            <p className="font-semibold text-gray-900">
                              {formatCurrency(student.targetAmount)}
                            </p>
                          </div>
                          <div className="text-sm">
                            <p className="text-gray-500">Sudah Dibayar</p>
                            <p className="font-semibold text-green-600">
                              {formatCurrency(summary.totalPaid)}
                            </p>
                          </div>
                          <div className="text-sm">
                            <p className="text-gray-500">Sisa</p>
                            <p className="font-semibold text-orange-600">
                              {formatCurrency(summary.remainingAmount)}
                            </p>
                          </div>
                          <div className="text-sm">
                            <p className="text-gray-500">Persentase</p>
                            <p className="font-semibold text-indigo-600">
                              {summary.paymentPercentage}%
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Payment History - Expandable */}
                    {isExpanded && (
                      <div className="border-t border-gray-200 bg-gray-50 p-4 sm:p-6">
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <svg
                            className="w-5 h-5 text-indigo-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                            />
                          </svg>
                          Riwayat Pembayaran
                        </h4>

                        {paymentHistory.length > 0 ? (
                          <>
                            {/* Desktop Table View */}
                            <div className="hidden md:block overflow-x-auto">
                              <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-100">
                                  <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Pembayaran
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Jumlah
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Tanggal
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Metode
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Dikumpulkan Oleh
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Catatan
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {paymentHistory.map((payment) => (
                                    <tr
                                      key={payment._id}
                                      className="hover:bg-gray-50"
                                    >
                                      <td className="px-4 py-3 whitespace-nowrap">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                          Bayar ke-{payment.paymentNumber}
                                        </span>
                                      </td>
                                      <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-green-600">
                                        {formatCurrency(payment.amount)}
                                      </td>
                                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                        {formatDate(payment.paidAt)}
                                      </td>
                                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 capitalize">
                                        {payment.method}
                                      </td>
                                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                        {payment.collectedBy?.name ||
                                          payment.collectedBy?.username ||
                                          "-"}
                                      </td>
                                      <td className="px-4 py-3 text-sm text-gray-600">
                                        {payment.note || "-"}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>

                            {/* Mobile Card View */}
                            <div className="md:hidden space-y-3">
                              {paymentHistory.map((payment) => (
                                <div
                                  key={payment._id}
                                  className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm"
                                >
                                  {/* Header */}
                                  <div className="flex justify-between items-start mb-3">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                      Pembayaran ke-{payment.paymentNumber}
                                    </span>
                                    <span className="text-lg font-bold text-green-600">
                                      {formatCurrency(payment.amount)}
                                    </span>
                                  </div>

                                  {/* Details */}
                                  <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                      <span className="text-gray-500">Tanggal:</span>
                                      <span className="font-medium text-gray-900">
                                        {formatDate(payment.paidAt)}
                                      </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                      <span className="text-gray-500">Metode:</span>
                                      <span className="font-medium text-gray-900 capitalize">
                                        {payment.method}
                                      </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                      <span className="text-gray-500">Dikumpulkan oleh:</span>
                                      <span className="font-medium text-gray-900">
                                        {payment.collectedBy?.name ||
                                          payment.collectedBy?.username ||
                                          "-"}
                                      </span>
                                    </div>
                                    {payment.note && (
                                      <div className="pt-2 border-t border-gray-100">
                                        <p className="text-xs text-gray-500 mb-1">Catatan:</p>
                                        <p className="text-sm text-gray-700">{payment.note}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <svg
                              className="mx-auto h-12 w-12 text-gray-400 mb-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                              />
                            </svg>
                            Belum ada pembayaran
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Memuat data...</p>
          </div>
        )}

        {/* No Data State */}
        {!loading && classData && classData.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <svg
              className="mx-auto h-16 w-16 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Tidak Ada Data
            </h3>
            <p className="text-gray-500">
              Kelas {classAssigned} belum memiliki data siswa
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryKelasWaliKelas;

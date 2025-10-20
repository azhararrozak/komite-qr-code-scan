import { useState } from "react";
import { getStudentPaymentHistory } from "../../services/reportService";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";

const HistoryPembayaran = () => {
  const [nis, setNis] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyData, setHistoryData] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!nis.trim()) {
      toast.error("Masukkan NIS siswa");
      return;
    }

    setLoading(true);
    try {
      const data = await getStudentPaymentHistory(nis.trim());
      setHistoryData(data);
      toast.success("Data history berhasil dimuat");
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.message || "Gagal mengambil data history");
      setHistoryData(null);
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

  const downloadExcel = () => {
    if (!historyData) return;

    const { student, summary, paymentHistory } = historyData;

    // Prepare data for Excel
    const excelData = [
      ["HISTORY PEMBAYARAN SISWA"],
      [],
      ["NIS", student.nis],
      ["Nama", student.name],
      ["Kelas", student.class],
      ["Jenis Kelamin", student.gender ? "Laki-laki" : "Perempuan"],
      [],
      ["Target Pembayaran", formatCurrency(student.targetAmount)],
      ["Total Sudah Dibayar", formatCurrency(summary.totalPaid)],
      ["Sisa Pembayaran", formatCurrency(summary.remainingAmount)],
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
      ],
    ];

    // Add payment history rows
    paymentHistory.forEach((payment, index) => {
      excelData.push([
        index + 1,
        `Bayar ke-${payment.paymentNumber}`,
        payment.amount,
        formatDate(payment.paidAt),
        payment.method,
        payment.collectedBy?.name || payment.collectedBy?.username || "-",
        payment.note || "-",
      ]);
    });

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(excelData);

    // Set column widths
    ws["!cols"] = [
      { wch: 5 }, // No
      { wch: 15 }, // Pembayaran Ke
      { wch: 15 }, // Jumlah
      { wch: 12 }, // Tanggal
      { wch: 10 }, // Metode
      { wch: 20 }, // Dikumpulkan Oleh
      { wch: 25 }, // Catatan
    ];

    XLSX.utils.book_append_sheet(wb, ws, "History Pembayaran");

    // Generate filename with NIS and name
    const filename = `History_${student.name.replace(/\s+/g, "_")}_${
      student.nis
    }.xlsx`;
    XLSX.writeFile(wb, filename);

    toast.success("File Excel berhasil didownload");
  };

  const handleReset = () => {
    setNis("");
    setHistoryData(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            History Pembayaran Siswa
          </h1>
          <p className="text-gray-600">
            Lihat detail riwayat pembayaran siswa berdasarkan NIS
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={nis}
                onChange={(e) => setNis(e.target.value)}
                placeholder="Masukkan NIS Siswa"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 transition-colors font-medium"
            >
              {loading ? "Mencari..." : "Cari"}
            </button>
            {historyData && (
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                Reset
              </button>
            )}
          </form>
        </div>

        {/* Results */}
        {historyData && (
          <>
            {/* Student Info Card */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {historyData.student.name}
                  </h2>
                  <div className="space-y-1 text-gray-600">
                    <p>
                      <span className="font-semibold">NIS:</span>{" "}
                      {historyData.student.nis}
                    </p>
                    <p>
                      <span className="font-semibold">Kelas:</span>{" "}
                      {historyData.student.class}
                    </p>
                    <p>
                      <span className="font-semibold">Jenis Kelamin:</span>{" "}
                      {historyData.student.gender ? "Laki-laki" : "Perempuan"}
                    </p>
                  </div>
                </div>
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

              {/* Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-blue-600 font-medium mb-1">
                    Target Pembayaran
                  </p>
                  <p className="text-xl font-bold text-blue-900">
                    {formatCurrency(historyData.student.targetAmount)}
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-green-600 font-medium mb-1">
                    Sudah Dibayar
                  </p>
                  <p className="text-xl font-bold text-green-900">
                    {formatCurrency(historyData.summary.totalPaid)}
                  </p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4">
                  <p className="text-sm text-orange-600 font-medium mb-1">
                    Sisa Pembayaran
                  </p>
                  <p className="text-xl font-bold text-orange-900">
                    {formatCurrency(historyData.summary.remainingAmount)}
                  </p>
                </div>
                <div
                  className={`rounded-lg p-4 ${
                    historyData.summary.status === "Lunas"
                      ? "bg-green-50"
                      : historyData.summary.status === "Belum Lunas"
                      ? "bg-yellow-50"
                      : "bg-red-50"
                  }`}
                >
                  <p className="text-sm font-medium mb-1">Status</p>
                  <p
                    className={`text-xl font-bold ${
                      historyData.summary.status === "Lunas"
                        ? "text-green-900"
                        : historyData.summary.status === "Belum Lunas"
                        ? "text-yellow-900"
                        : "text-red-900"
                    }`}
                  >
                    {historyData.summary.status}
                  </p>
                  <p className="text-sm mt-1">
                    {historyData.summary.paymentPercentage}%
                  </p>
                </div>
              </div>
            </div>

            {/* Payment History Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600">
                <h3 className="text-xl font-bold text-white">
                  Riwayat Pembayaran ({historyData.summary.totalPayments}{" "}
                  transaksi)
                </h3>
              </div>

              {historyData.paymentHistory.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          No
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Pembayaran Ke
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Jumlah
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tanggal
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Metode
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Dikumpulkan Oleh
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Catatan
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {historyData.paymentHistory.map((payment, index) => (
                        <tr key={payment._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {index + 1}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                              Bayar ke-{payment.paymentNumber}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                            {formatCurrency(payment.amount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(payment.paidAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                            {payment.method}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {payment.collectedBy?.name ||
                              payment.collectedBy?.username ||
                              "-"}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {payment.note || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="px-6 py-12 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p className="mt-4 text-gray-500">
                    Belum ada riwayat pembayaran
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Empty State */}
        {!historyData && !loading && (
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
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Cari History Pembayaran
            </h3>
            <p className="text-gray-500">
              Masukkan NIS siswa untuk melihat riwayat pembayaran
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPembayaran;

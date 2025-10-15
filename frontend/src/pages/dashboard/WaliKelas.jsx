import { useEffect, useState } from "react";
import useUserStore from "../../stores/useUserStore";

const WaliKelas = () => {
  const { waliKelas, fetchWaliKelas } = useUserStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchWaliKelas();
      } catch (error) {
        console.error("Error loading wali kelas:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [fetchWaliKelas]);

  console.log("Wali Kelas data:", waliKelas);

  // Ensure waliKelas is always an array
  const waliKelasList = Array.isArray(waliKelas) ? waliKelas : [];

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <p className="mt-2">Memuat data...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">List Wali Kelas</h1>
      {/* Table of Wali Kelas */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                No
              </th>
              <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nama
              </th>
              <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kelas
              </th>
            </tr>
          </thead>
          <tbody>
            {waliKelasList.length === 0 ? (
              <tr>
                <td
                  colSpan="4"
                  className="px-6 py-4 border-b border-gray-200 text-center text-sm text-gray-500"
                >
                  Tidak ada data wali kelas.
                </td>
              </tr>
            ) : (
              waliKelasList.map((wali, index) => (
                <tr
                  key={wali._id || wali.id || index}
                  className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="px-6 py-4 border-b border-gray-200 text-sm text-gray-900">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 border-b border-gray-200 text-sm text-gray-900">
                    {wali.name}
                  </td>
                  <td className="px-6 py-4 border-b border-gray-200 text-sm text-gray-900">
                    {wali.email}
                  </td>
                  <td className="px-6 py-4 border-b border-gray-200 text-sm text-gray-900">
                    {wali.classAssigned || wali.class || "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WaliKelas;

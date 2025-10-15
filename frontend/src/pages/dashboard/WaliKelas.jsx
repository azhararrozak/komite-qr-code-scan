import { useEffect, useState } from "react";
import useUserStore from "../../stores/useUserStore"

const WaliKelas = () => {
  const { waliKelas, fetchWaliKelas } = useUserStore();

  useEffect(() => {
    fetchWaliKelas();
  }, [fetchWaliKelas]);

  console.log("Wali Kelas data:", waliKelas);

  return (
    <div>
        <h1 className="text-2xl font-bold mb-4">List Wali Kelas</h1>
        {/* Table of Wali Kelas */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kelas</th>
              </tr>
            </thead>
            <tbody>
              {waliKelas.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-4 border-b border-gray-200 text-center text-sm text-gray-500">
                    Tidak ada data wali kelas.
                  </td>
                </tr>
              ) : (
                waliKelas.map((wali, index) => (
                  <tr key={wali.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-6 py-4 border-b border-gray-200 text-sm text-gray-900">{index + 1}</td>
                    <td className="px-6 py-4 border-b border-gray-200 text-sm text-gray-900">{wali.name}</td>
                    <td className="px-6 py-4 border-b border-gray-200 text-sm text-gray-900">{wali.email}</td>
                    <td className="px-6 py-4 border-b border-gray-200 text-sm text-gray-900">{wali.class}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
    </div>
  )
}

export default WaliKelas;
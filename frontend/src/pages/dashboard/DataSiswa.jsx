import { useState, useEffect } from 'react'
import { useStudentStore } from '../../stores/useStudentStore'

const DataSiswa = () => {
  const { 
    students, 
    pagination, 
    loading, 
    error, 
    getStudentsList, 
    getAvailableClasses, 
    classes,
    generateStudentQR,
    qrLoading
  } = useStudentStore()
  const [search, setSearch] = useState('')
  const [selectedClass, setSelectedClass] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [showQRModal, setShowQRModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [qrCodeData, setQRCodeData] = useState(null)

  useEffect(() => {
    getAvailableClasses()
    loadStudents()
  }, [])

  useEffect(() => {
    loadStudents()
  }, [search, selectedClass, currentPage])

  const loadStudents = () => {
    const params = {
      page: currentPage,
      limit: 20,
      search: search.trim(),
      class: selectedClass || ''
    }
    console.log('Loading students with params:', params)
    getStudentsList(params)
  }

  const handleSearchChange = (e) => {
    setSearch(e.target.value)
    setCurrentPage(1)
  }

  const handleClassChange = (e) => {
    setSelectedClass(e.target.value)
    setCurrentPage(1)
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handleGenerateQR = async (student) => {
    try {
      setSelectedStudent(student)
      const qrData = await generateStudentQR(student._id)
      setQRCodeData(qrData)
      setShowQRModal(true)
    } catch (error) {
      console.error('Error generating QR:', error)
    }
  }

  const handleCloseModal = () => {
    setShowQRModal(false)
    setSelectedStudent(null)
    setQRCodeData(null)
  }

  const handleDownloadQR = () => {
    if (qrCodeData && qrCodeData.qrCodeImage) {
      const link = document.createElement('a')
      link.href = qrCodeData.qrCodeImage
      link.download = `QR_${selectedStudent.nis}_${selectedStudent.name.replace(/\s+/g, '_')}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const renderPagination = () => {
    if (!pagination || pagination.totalPages <= 1) return null

    const pages = []
    const maxVisible = 5
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2))
    let endPage = Math.min(pagination.totalPages, startPage + maxVisible - 1)

    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 mx-1 rounded ${
            i === currentPage 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          {i}
        </button>
      )
    }

    return (
      <div className="flex justify-center items-center mt-6">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 mx-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        {pages}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === pagination.totalPages}
          className="px-3 py-1 mx-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Data Siswa</h1>
      
      <div className="mb-6 flex flex-wrap gap-4">
        <div className="flex-1 min-w-64">
          <input
            type="text"
            placeholder="Cari berdasarkan nama atau NIS..."
            value={search}
            onChange={handleSearchChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <select
            value={selectedClass}
            onChange={handleClassChange}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Semua Kelas</option>
            {classes.map((cls) => (
              <option key={cls.className} value={cls.className}>
                {cls.className} ({cls.studentCount} siswa)
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2">Memuat data...</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
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
                      Kelas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Gender
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      QR Code
                    </th>
                    {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Target
                    </th> */}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {students.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                        Tidak ada data siswa
                      </td>
                    </tr>
                  ) : (
                    students.map((student) => (
                      <tr key={student._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {student.nis}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {student.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {student.class}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {student.gender ? 'Laki-laki' : 'Perempuan'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <button
                            onClick={() => handleGenerateQR(student)}
                            disabled={qrLoading}
                            className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-3 py-1 rounded text-xs transition-colors duration-200"
                          >
                            {qrLoading ? 'Loading...' : 'Generate QR'}
                          </button>
                        </td>
                        {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          Rp {student.targetAmount?.toLocaleString('id-ID') || '0'}
                        </td> */}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {pagination && (
            <div className="mt-4 flex justify-between items-center text-sm text-gray-700">
              <div>
                Menampilkan {((currentPage - 1) * 20) + 1} - {Math.min(currentPage * 20, pagination.total)} dari {pagination.total} siswa
              </div>
              {renderPagination()}
            </div>
          )}
        </>
      )}

      {/* QR Code Modal */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">QR Code - {selectedStudent?.name}</h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>
            
            {qrCodeData ? (
              <div className="text-center">
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-2">
                    <div><strong>NIS:</strong> {selectedStudent?.nis}</div>
                    <div><strong>Nama:</strong> {selectedStudent?.name}</div>
                    <div><strong>Kelas:</strong> {selectedStudent?.class}</div>
                    <div><strong>Gender:</strong> {selectedStudent?.gender ? 'Laki-laki' : 'Perempuan'}</div>
                  </div>
                </div>
                
                <div className="mb-4 flex justify-center">
                  <img 
                    src={qrCodeData.qrCodeImage} 
                    alt={`QR Code for ${selectedStudent?.name}`}
                    className="border rounded-lg"
                    style={{ maxWidth: '250px', maxHeight: '250px' }}
                  />
                </div>
                
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={handleDownloadQR}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition-colors duration-200"
                  >
                    Download QR
                  </button>
                  <button
                    onClick={handleCloseModal}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors duration-200"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <p className="mt-2">Generating QR Code...</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default DataSiswa
import { useState, useEffect } from 'react'
import { useStudentStore } from '../../stores/useStudentStore'

const QRCodeManager = () => {
  const { 
    classes, 
    getAvailableClasses, 
    getQRCodesByClass, 
    qrCodes, 
    qrLoading, 
    error 
  } = useStudentStore()
  
  const [selectedClass, setSelectedClass] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [selectedQR, setSelectedQR] = useState(null)

  useEffect(() => {
    getAvailableClasses()
  }, [])

  const handleClassSelect = async (className) => {
    if (className) {
      setSelectedClass(className)
      await getQRCodesByClass(className)
    }
  }

  const handleViewQR = (qrCode) => {
    setSelectedQR(qrCode)
    setShowModal(true)
  }

  const handleDownloadQR = (qrCode) => {
    const link = document.createElement('a')
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://komite-qr-code-scan-production.up.railway.app'
    link.href = `${baseUrl}${qrCode.downloadUrl}`
    link.download = qrCode.fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleDownloadAllQR = () => {
    if (selectedClass) {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://komite-qr-code-scan-production.up.railway.app/'
      const link = document.createElement('a')
      link.href = `${baseUrl}/api/students/qr/download-zip/${selectedClass}`
      link.download = `QR_Codes_${selectedClass}.zip`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">QR Code Manager</h1>
      
      {/* Class Selection */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Pilih Kelas</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {classes.map((cls) => (
            <button
              key={cls.className}
              onClick={() => handleClassSelect(cls.className)}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                selectedClass === cls.className
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="text-center">
                <div className="text-lg font-semibold">{cls.className}</div>
                <div className="text-sm text-gray-600">{cls.studentCount} siswa</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* QR Codes Display */}
      {selectedClass && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              QR Codes - Kelas {selectedClass}
            </h3>
            {qrCodes.length > 0 && (
              <button
                onClick={handleDownloadAllQR}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition-colors duration-200"
              >
                📦 Download All (ZIP)
              </button>
            )}
          </div>

          {qrLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="mt-2">Memuat QR codes...</p>
            </div>
          ) : qrCodes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Belum ada QR code untuk kelas {selectedClass}</p>
              <p className="text-sm mt-1">Upload siswa dengan mode QR untuk membuat QR codes</p>
            </div>
          ) : (
            <>
              <div className="mb-4 text-sm text-gray-600">
                Ditemukan {qrCodes.length} QR codes
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {qrCodes.map((qrCode, index) => {
                  // Extract info from filename
                  const parts = qrCode.fileName.replace('.png', '').split('_')
                  const nis = parts[0]
                  const name = parts.slice(1).join(' ').replace(/_/g, ' ')
                  
                  return (
                    <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="text-center mb-3">
                        <div className="text-sm font-medium text-gray-900">{name}</div>
                        <div className="text-xs text-gray-500">NIS: {nis}</div>
                        <div className="text-xs text-gray-500">
                          {(qrCode.size / 1024).toFixed(1)} KB
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewQR(qrCode)}
                          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded text-xs transition-colors"
                        >
                          👁️ View
                        </button>
                        <button
                          onClick={() => handleDownloadQR(qrCode)}
                          className="flex-1 bg-green-500 hover:bg-green-600 text-white py-1 px-2 rounded text-xs transition-colors"
                        >
                          📥 Download
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* QR Code Modal */}
      {showModal && selectedQR && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">QR Code Preview</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>
            
            <div className="text-center">
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">
                  <div><strong>File:</strong> {selectedQR.fileName}</div>
                  <div><strong>Size:</strong> {(selectedQR.size / 1024).toFixed(1)} KB</div>
                  <div><strong>Created:</strong> {new Date(selectedQR.created).toLocaleString('id-ID')}</div>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="text-sm text-gray-500 mb-2">QR Code akan dimuat setelah download</div>
                <div className="w-48 h-48 bg-gray-100 border rounded-lg flex items-center justify-center mx-auto">
                  <span className="text-gray-400 text-sm">QR Code Image</span>
                </div>
              </div>
              
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => handleDownloadQR(selectedQR)}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition-colors duration-200"
                >
                  📥 Download QR
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors duration-200"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default QRCodeManager
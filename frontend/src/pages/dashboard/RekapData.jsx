import { useEffect, useState } from 'react'
import useReportStore from '../../stores/useReportStore'

const RekapData = () => {
  const { 
    reportData, 
    classSummary, 
    globalStats, 
    loading, 
    error, 
    fetchRecapByClass, 
    getClassSummary, 
    getGlobalStatistics,
    clearError 
  } = useReportStore()
  
  const [activeTab, setActiveTab] = useState('overview')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      await Promise.all([
        getGlobalStatistics(),
        getClassSummary(),
        fetchRecapByClass({ q: search, status: statusFilter })
      ])
    } catch (err) {
      console.error('Error loading initial data:', err)
    }
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    fetchRecapByClass({ q: search, status: statusFilter })
  }

  const getStatusBadge = (status) => {
    const colors = {
      'Lunas': 'bg-green-100 text-green-800',
      'Belum Lunas': 'bg-yellow-100 text-yellow-800',
      'Belum Dibayar': 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const formatRupiah = (amount) => {
    return `Rp ${amount?.toLocaleString('id-ID') || '0'}`
  }

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="text-sm font-medium text-blue-600">Total Siswa</h3>
          <p className="text-2xl font-bold text-blue-900">{globalStats?.totalStudents || 0}</p>
        </div>
        <div className="bg-green-50 p-6 rounded-lg">
          <h3 className="text-sm font-medium text-green-600">Total Terkumpul</h3>
          <p className="text-2xl font-bold text-green-900">{formatRupiah(globalStats?.totalPaidAmount)}</p>
        </div>
        <div className="bg-orange-50 p-6 rounded-lg">
          <h3 className="text-sm font-medium text-orange-600">Target Total</h3>
          <p className="text-2xl font-bold text-orange-900">{formatRupiah(globalStats?.totalTargetAmount)}</p>
        </div>
        <div className="bg-purple-50 p-6 rounded-lg">
          <h3 className="text-sm font-medium text-purple-600">Persentase</h3>
          <p className="text-2xl font-bold text-purple-900">{globalStats?.collectionPercentage || 0}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-green-50 p-6 rounded-lg">
          <h3 className="text-sm font-medium text-green-600">Siswa Lunas</h3>
          <p className="text-3xl font-bold text-green-900">{globalStats?.studentsStatus?.lunas || 0}</p>
        </div>
        <div className="bg-yellow-50 p-6 rounded-lg">
          <h3 className="text-sm font-medium text-yellow-600">Belum Lunas</h3>
          <p className="text-3xl font-bold text-yellow-900">{globalStats?.studentsStatus?.belumLunas || 0}</p>
        </div>
        <div className="bg-red-50 p-6 rounded-lg">
          <h3 className="text-sm font-medium text-red-600">Belum Bayar</h3>
          <p className="text-3xl font-bold text-red-900">{globalStats?.studentsStatus?.belumDibayar || 0}</p>
        </div>
      </div>
    </div>
  )

  const renderClassSummary = () => (
    <div className="space-y-4">
      {classSummary.map((cls) => (
        <div key={cls.className} className="bg-white border rounded-lg p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold">{cls.className}</h3>
            <span className="text-sm text-gray-500">{cls.totalStudents} siswa</span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-600">Target</p>
              <p className="font-semibold">{formatRupiah(cls.totalTargetAmount)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Terkumpul</p>
              <p className="font-semibold text-green-600">{formatRupiah(cls.totalPaidAmount)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Sisa</p>
              <p className="font-semibold text-orange-600">{formatRupiah(cls.totalRemainingAmount)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Progress</p>
              <p className="font-semibold text-blue-600">
                {cls.totalTargetAmount > 0 ? Math.round((cls.totalPaidAmount / cls.totalTargetAmount) * 100) : 0}%
              </p>
            </div>
          </div>

          <div className="flex space-x-4 text-sm">
            <span className="text-green-600">Lunas: {cls.paidStudents}</span>
            <span className="text-yellow-600">Belum Lunas: {cls.partialPaidStudents}</span>
            <span className="text-red-600">Belum Bayar: {cls.unpaidStudents}</span>
          </div>
        </div>
      ))}
    </div>
  )

  const renderStudentList = () => (
    <div className="space-y-4">
      <form onSubmit={handleSearchSubmit} className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Cari siswa..."
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
          <option value="PAID">Lunas</option>
          <option value="PARTIAL">Belum Lunas</option>
          <option value="UNPAID">Belum Dibayar</option>
        </select>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Cari
        </button>
      </form>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">NIS</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kelas</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Target</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dibayar</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sisa</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reportData.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{student.nis}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{student.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{student.className}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{formatRupiah(student.targetAmount)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">{formatRupiah(student.paidAmount)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-600">{formatRupiah(student.remaining)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(student.status)}`}>
                      {student.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Rekap Data Pembayaran</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
          <button onClick={clearError} className="ml-2 text-red-500 hover:text-red-700">×</button>
        </div>
      )}

      <div className="mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('classes')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'classes'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Per Kelas
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'students'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Detail Siswa
          </button>
        </nav>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2">Memuat data...</p>
        </div>
      ) : (
        <div>
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'classes' && renderClassSummary()}
          {activeTab === 'students' && renderStudentList()}
        </div>
      )}
    </div>
  )
}

export default RekapData
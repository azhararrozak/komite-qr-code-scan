import { useNavigate } from 'react-router-dom'
import useAuthStore from '../../../stores/useAuthStore'

const DashboardHeader = () => {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)

  const handleLogout = () => {
     useAuthStore.getState().logout()
    navigate('/')
  }

  return (
    <header className="flex items-center justify-between p-4 bg-white border-b">
      <h1 className="text-xl font-semibold">Dashboard</h1>
      <div className="flex items-center space-x-4">
        {user && (
          <div className="text-sm">
            <div className="font-medium">{user.username || user.name || 'User'}</div>
            <div className="text-gray-500">{user.email || ''}</div>
          </div>
        )}
        <button onClick={handleLogout} className="px-3 py-1 bg-red-600 text-white rounded">Logout</button>
      </div>
    </header>
  )
}

export default DashboardHeader

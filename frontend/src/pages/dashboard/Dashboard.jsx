import useAuthStore from '../../stores/useAuthStore'

const Dashboard = () => {
  const user = useAuthStore((s) => s.user)

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-semibold mb-4">Profile</h2>
      {user ? (
        <div className="space-y-2">
          <div><span className="font-medium">Username:</span> {user.username || user.name}</div>
          <div><span className="font-medium">Email:</span> {user.email}</div>
          <div><span className="font-medium">Access Token:</span> <code className="break-all">{user.accessToken}</code></div>
        </div>
      ) : (
        <div>User not found.</div>
      )}
    </div>
  )
}

export default Dashboard
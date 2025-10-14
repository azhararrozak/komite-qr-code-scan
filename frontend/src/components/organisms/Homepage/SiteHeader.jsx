import Button from '../../atoms/Button'
import { Link } from 'react-router-dom'
import useAuthStore from '../../../stores/useAuthStore'

const SiteHeader = () => {
  const user = useAuthStore((s) => s.user)

  return (
    <header className="flex items-center justify-between p-4 bg-white border-b">
      <Link to="/" className="text-lg font-bold">SatuDev</Link>
      <nav className="space-x-4">
        {!user ? (
          <Link to="/auth/login"><Button variant="secondary">Sign in</Button></Link>
        ) : (
          <Link to="/dashboard"><Button variant="ghost">Dashboard</Button></Link>
        )}
      </nav>
    </header>
  )
}

export default SiteHeader

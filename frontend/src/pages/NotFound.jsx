import MainLayouts from '../layouts/MainLayouts'
import { Link } from 'react-router-dom'

const NotFound = () => {
  return (
    <MainLayouts>
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-6xl font-bold mb-4">404</h1>
          <p className="text-xl mb-6">Page Not Found</p>
          <Link to="/" className="inline-block px-6 py-3 bg-indigo-600 text-white rounded">Go home</Link>
        </div>
      </div>
    </MainLayouts>
  )
}

export default NotFound

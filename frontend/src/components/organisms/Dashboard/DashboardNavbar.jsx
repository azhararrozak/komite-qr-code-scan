import { NavLink } from 'react-router-dom'

const DashboardNavbar = () => {
  return (
    <nav className="p-4">
      <ul className="space-y-2">
        <li>
          <NavLink end to="/dashboard" className={({isActive}) => isActive ? 'block px-4 py-2 bg-gray-200 rounded' : 'block px-4 py-2 hover:bg-gray-50 rounded'}>Profile</NavLink>
        </li>
        <li>
          <NavLink to="/dashboard/setting" className={({isActive}) => isActive ? 'block px-4 py-2 bg-gray-200 rounded' : 'block px-4 py-2 hover:bg-gray-50 rounded'}>Settings</NavLink>
        </li>
      </ul>
    </nav>
  )
}

export default DashboardNavbar

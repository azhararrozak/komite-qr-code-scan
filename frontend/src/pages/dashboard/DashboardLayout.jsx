import { Outlet } from 'react-router-dom'
import DashboardLayouts from '../../layouts/DashboardLayouts'

const DashboardLayout = () => {
  return (
    <DashboardLayouts>
      <Outlet />
    </DashboardLayouts>
  )
}

export default DashboardLayout

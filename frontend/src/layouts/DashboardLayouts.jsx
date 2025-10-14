/* eslint-disable react/prop-types */
import DashboardHeader from '../components/organisms/Dashboard/DashboardHeader'
import DashboardNavbar from '../components/organisms/Dashboard/DashboardNavbar'

const DashboardLayouts = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-100">
      <DashboardHeader />
      <div className="flex flex-col min-h-[calc(100vh-64px)]">
        <div className="flex flex-1">
          <aside className="w-64 border-r bg-white">
            <DashboardNavbar />
          </aside>
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>

        <footer className="bg-white border-t px-6 py-4">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between">
            <div className="text-sm text-gray-600">© {new Date().getFullYear()} SatuDev Dashboard</div>
            <div className="mt-2 sm:mt-0 space-x-4">
              <a href="#" className="text-sm text-indigo-600">Support</a>
              <a href="#" className="text-sm text-gray-600">Privacy</a>
              <a href="#" className="text-sm text-gray-600">Terms</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default DashboardLayouts
/* eslint-disable react/prop-types */
import { useState } from "react";
import DashboardHeader from "../components/organisms/Dashboard/DashboardHeader";
import DashboardNavbar from "../components/organisms/Dashboard/DashboardNavbar";

const DashboardLayouts = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <DashboardHeader />

      <div className="flex flex-col min-h-[calc(100vh-64px)]">
        <div className="flex flex-1 relative">
          {/* Overlay - only visible on mobile when sidebar is open */}
          {isSidebarOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={closeSidebar}
            />
          )}

          {/* Sidebar */}
          <aside
            className={`
              fixed lg:sticky top-0 left-0 h-screen w-64 
              bg-white border-r z-50 
              transform transition-transform duration-300 ease-in-out
              ${
                isSidebarOpen
                  ? "translate-x-0"
                  : "-translate-x-full lg:translate-x-0"
              }
            `}
          >
            {/* Sidebar Header with Close Button - only on mobile */}
            <div className="lg:hidden flex items-center justify-between p-4 border-b bg-white">
              <h2 className="font-semibold text-gray-800">Menu</h2>
              <button
                onClick={closeSidebar}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Close sidebar"
              >
                <svg
                  className="w-6 h-6 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
            </div>

            <DashboardNavbar closeSidebar={closeSidebar} />
          </aside>

          {/* Main Content */}
          <main className="flex-1 flex flex-col">
            {/* Mobile Menu Button */}
            <div className="lg:hidden bg-white border-b p-3 sticky top-0 z-30">
              <button
                onClick={toggleSidebar}
                className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Open sidebar"
              >
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
                <span className="text-sm font-medium text-gray-700">Menu</span>
              </button>
            </div>

            {/* Page Content */}
            <div className="flex-1 p-4 lg:p-6">{children}</div>
          </main>
        </div>

        <footer className="bg-white border-t px-6 py-4">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between">
            <div className="text-sm text-gray-600">
              © {new Date().getFullYear()} Komite QR Code Scan. All rights
              reserved.
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default DashboardLayouts;

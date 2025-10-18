import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import useAuthStore from "../../../stores/useAuthStore";

const HomepageHeader = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    useAuthStore.getState().logout();
    navigate("/");
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-gray-200">
      <div className="flex justify-between items-center p-5">
        {/* Logo */}
        <div className="flex items-center space-x-5">
          <Link to="/" onClick={closeMenu}>
            <img
              className="w-15 object-contain cursor-pointer"
              src="/SatuDev.svg"
              alt="Logo"
            />
          </Link>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-5 font-bold">
          {!user ? (
            <Link
              to="/auth/login"
              className="active:scale-90 transition duration-100 hover:text-blue-600"
            >
              Sign In
            </Link>
          ) : (
            <>
              <Link
                to="/dashboard"
                className="active:scale-90 transition duration-100 hover:text-blue-600"
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="text-red-600 hover:text-red-800 active:scale-90 transition duration-100"
              >
                Sign Out
              </button>
            </>
          )}
        </div>

        {/* Hamburger Button (Mobile) */}
        <button
          onClick={toggleMenu}
          className="md:hidden p-2 rounded-lg hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? (
            // Close Icon (X)
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            // Hamburger Icon
            <svg
              className="w-6 h-6"
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
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isMenuOpen ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-5 py-4 space-y-3 bg-gray-100 border-t border-gray-300">
          {!user ? (
            <Link
              to="/auth/login"
              onClick={closeMenu}
              className="block px-4 py-2 font-bold rounded-lg hover:bg-gray-200 active:scale-95 transition duration-100"
            >
              Sign In
            </Link>
          ) : (
            <>
              <Link
                to="/dashboard"
                onClick={closeMenu}
                className="block px-4 py-2 font-bold rounded-lg hover:bg-gray-200 active:scale-95 transition duration-100"
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 font-bold text-red-600 rounded-lg hover:bg-gray-200 active:scale-95 transition duration-100"
              >
                Sign Out
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default HomepageHeader;

import { NavLink } from "react-router-dom";
import useAuthStore from "../../../stores/useAuthStore";

const DashboardNavbar = () => {
  const user = useAuthStore((state) => state.user);

  // Check if user is admin
  const isAdmin = user?.roles?.includes("ROLE_ADMIN");

  return (
    <nav className="p-4">
      <ul className="space-y-2">
        <li>
          <NavLink
            end
            to="/dashboard"
            className={({ isActive }) =>
              isActive
                ? "block px-4 py-2 bg-gray-200 rounded"
                : "block px-4 py-2 hover:bg-gray-50 rounded"
            }
          >
            Profile
          </NavLink>
        </li>
        {/* <li>
          <NavLink to="/dashboard/setting" className={({isActive}) => isActive ? 'block px-4 py-2 bg-gray-200 rounded' : 'block px-4 py-2 hover:bg-gray-50 rounded'}>Settings</NavLink>
        </li> */}

        {/* Only show Tambah Siswa for Admin */}
        {isAdmin && (
          <li>
            <NavLink
              to="/dashboard/tambah-siswa"
              className={({ isActive }) =>
                isActive
                  ? "block px-4 py-2 bg-gray-200 rounded"
                  : "block px-4 py-2 hover:bg-gray-50 rounded"
              }
            >
              Tambah Siswa
            </NavLink>
          </li>
        )}
        {isAdmin && (
          <li>
            <NavLink
              to="/dashboard/data-siswa"
              className={({ isActive }) =>
                isActive
                  ? "block px-4 py-2 bg-gray-200 rounded"
                  : "block px-4 py-2 hover:bg-gray-50 rounded"
              }
            >
              Data Siswa
            </NavLink>
          </li>
        )}

        <li>
          <NavLink
            to="/dashboard/rekap-data"
            className={({ isActive }) =>
              isActive
                ? "block px-4 py-2 bg-gray-200 rounded"
                : "block px-4 py-2 hover:bg-gray-50 rounded"
            }
          >
            Rekap Data
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default DashboardNavbar;

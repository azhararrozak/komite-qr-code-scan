/* eslint-disable react/prop-types */
import { Navigate, useLocation } from "react-router-dom";
import useAuthStore from "../stores/useAuthStore";

/**
 * AdminRoute - redirects to /auth/login if not authenticated,
 * redirects to /dashboard if authenticated but not admin.
 * @param {{children: import('react').ReactNode}} props
 */
const AdminRoute = ({ children }) => {
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  if (!user) {
    // Not logged in — redirect to login page
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Check if user has admin role
  const isAdmin = user.roles && user.roles.includes("ROLE_ADMIN");

  if (!isAdmin) {
    // Logged in but not admin — redirect to dashboard with error state
    return (
      <Navigate
        to="/dashboard"
        state={{
          error: "Akses ditolak. Hanya admin yang dapat mengakses halaman ini.",
        }}
        replace
      />
    );
  }

  return children;
};

export default AdminRoute;

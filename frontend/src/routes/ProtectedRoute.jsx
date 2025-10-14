/* eslint-disable react/prop-types */
import { Navigate, useLocation } from "react-router-dom";
import useAuthStore from "../stores/useAuthStore";

/**
 * ProtectedRoute - redirects to /auth/login if user is not authenticated.
 * @param {{children: import('react').ReactNode}} props
 */
const ProtectedRoute = ({ children }) => {
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  if (!user) {
    // Not logged in — redirect to login page, keep the attempted location in state
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;

/* eslint-disable react/prop-types */
import { Navigate } from "react-router-dom";
import useAuthStore from "../stores/useAuthStore";

/**
 * GuestRoute - redirects to /dashboard if user is authenticated.
 * @param {{children: import('react').ReactNode}} props
 */
const GuestRoute = ({ children }) => {
  const user = useAuthStore((s) => s.user);

  // If user is logged in, redirect to dashboard (or home)
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default GuestRoute;

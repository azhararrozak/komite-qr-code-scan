import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../../../stores/useAuthStore";

const HomepageHeader = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const handleLogout = () => {
    useAuthStore.getState().logout();
    navigate("/");
  };

  return (
    <header className="flex justify-between p-5 bg-gray-200">
      <div className="flex items-center space-x-5">
        <Link to="/">
          <img
            className="w-15 object-contain cursor-pointer"
            src="/SatuDev.svg"
            alt=""
          />
        </Link>
      </div>

      <div className="hidden sm:flex items-center space-x-5 font-bold cursor-pointer">
        {!user ? (
          <Link to="/auth/login" className="active:scale-90 transition duration-100">Sign In</Link>
        ) : (
          <>
            <Link to="/dashboard" className="active:scale-90 transition duration-100">Dashboard</Link>
            <button onClick={handleLogout} className="ml-4 text-red-600">Sign Out</button>
          </>
        )}
      </div>
    </header>
  );
};

export default HomepageHeader;

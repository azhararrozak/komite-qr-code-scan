import { useLocation } from "react-router-dom";
import useAuthStore from "../../stores/useAuthStore";

const Dashboard = () => {
  const user = useAuthStore((s) => s.user);
  const location = useLocation();
  const errorMessage = location.state?.error;

  return (
    <div className="space-y-4">
      {/* Error Alert */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{errorMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-semibold mb-4">Profile</h2>
        {user ? (
          <div className="space-y-2">
            <div>
              <span className="font-medium">Username:</span>{" "}
              {user.username || user.name}
            </div>
            <div>
              <span className="font-medium">Email:</span> {user.email}
            </div>
            <div>
              <span className="font-medium">Roles:</span>{" "}
              {user.roles && user.roles.length > 0 ? (
                <span className="inline-flex gap-2">
                  {user.roles.map((role) => (
                    <span
                      key={role}
                      className="px-2 py-1 text-xs rounded bg-indigo-100 text-indigo-700"
                    >
                      {role.replace("ROLE_", "")}
                    </span>
                  ))}
                </span>
              ) : (
                "No roles"
              )}
            </div>
            <div>
              <span className="font-medium">Access Token:</span>{" "}
              <code className="break-all text-xs bg-gray-100 p-1 rounded">
                {user.accessToken}
              </code>
            </div>
          </div>
        ) : (
          <div>User not found.</div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

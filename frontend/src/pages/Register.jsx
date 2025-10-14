import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import useAuthStore from "../stores/useAuthStore";
import FormField from "../components/molecules/FormField";
import Button from "../components/atoms/Button";


const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState("");

  const navigate = useNavigate();
  const register = useAuthStore((s) => s.register)

  const onChangeUsername = (e) => {
    const username = e.target.value;
    setUsername(username);
  }

  const onChangeEmail = (e) => {
    const email = e.target.value;
    setEmail(email);
  }

  const onChangePassword = (e) => {
    const password = e.target.value;
    setPassword(password);
  }

  const onChangeConfirmPassword = (e) => {
    const confirmPassword = e.target.value;
    setConfirmPassword(confirmPassword);
  }

  const handleRegister = (e) => {
    e.preventDefault();

    setMessage("");

    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    register(username, email, confirmPassword).then(
      (response) => {
  // server may return a message - show it if present
  setMessage(response?.message || "Registration successful");
        navigate("/auth/login");
      }
    ).catch((error) => {
      const resMessage =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      setMessage(resMessage);
    });
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 px-4">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create an account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleRegister}>
            <FormField id="username" label="Username" value={username} onChange={onChangeUsername} />
            <FormField id="email" label="Email address" type="email" value={email} onChange={onChangeEmail} />

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  className="appearance-none block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={password}
                  onChange={onChangePassword}
                />
                <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute inset-y-0 right-2 flex items-center text-gray-500" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 3C5 3 1.73 6.11.5 10c1.23 3.89 4.5 7 9.5 7s8.27-3.11 9.5-7C18.27 6.11 15 3 10 3zm0 12a5 5 0 110-10 5 5 0 010 10z" />
                      <path d="M10 8a2 2 0 100 4 2 2 0 000-4z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0110 19c-5 0-8.27-3.11-9.5-7a12.03 12.03 0 012.72-4.042M6.11 6.11A9.953 9.953 0 0110 5c5 0 8.27 3.11 9.5 7a11.98 11.98 0 01-1.39 2.95M3 3l18 18" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
              <div className="mt-1 relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  className="appearance-none block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={confirmPassword}
                  onChange={onChangeConfirmPassword}
                />
                <button type="button" onClick={() => setShowConfirmPassword(v => !v)} className="absolute inset-y-0 right-2 flex items-center text-gray-500" aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}>
                  {showConfirmPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 3C5 3 1.73 6.11.5 10c1.23 3.89 4.5 7 9.5 7s8.27-3.11 9.5-7C18.27 6.11 15 3 10 3zm0 12a5 5 0 110-10 5 5 0 010 10z" />
                      <path d="M10 8a2 2 0 100 4 2 2 0 000-4z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0110 19c-5 0-8.27-3.11-9.5-7a12.03 12.03 0 012.72-4.042M6.11 6.11A9.953 9.953 0 0110 5c5 0 8.27 3.11 9.5 7a11.98 11.98 0 01-1.39 2.95M3 3l18 18" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div>
              <Button type="submit" className="w-full">Register</Button>
            </div>
          </form>
          {message && (
            <div className="mt-4 text-sm text-green-600 text-center">{message}</div>
          )}
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Already have an account? <Link to="/auth/login" className="text-indigo-600 hover:text-indigo-500">Sign in here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
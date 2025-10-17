import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { editWaliKelas, getAllWaliKelas } from "../../../services/userService";

const EditWaliKelas = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    classAssigned: "",
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const users = await getAllWaliKelas();
        const user = users.find((u) => u._id === id);

        if (user) {
          setFormData({
            username: user.username || "",
            email: user.email || "",
            password: "",
            confirmPassword: "",
            classAssigned: user.classAssigned || "",
          });
        } else {
          toast.error("Wali Kelas tidak ditemukan");
          navigate("/dashboard/wali-kelas");
        }
      } catch {
        toast.error("Gagal memuat data wali kelas");
        navigate("/dashboard/wali-kelas");
      } finally {
        setFetchingData(false);
      }
    };

    fetchUserData();
  }, [id, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error("Password dan Konfirmasi Password tidak cocok!", {
        duration: 4000,
        position: "top-right",
      });
      return;
    }

    if (formData.password && formData.password.length < 6) {
      toast.error("Password minimal 6 karakter!", {
        duration: 4000,
        position: "top-right",
      });
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading("Mengupdate data wali kelas...");

    try {
      // eslint-disable-next-line no-unused-vars
      const { confirmPassword, ...dataToSend } = formData;

      // Remove password from dataToSend if it's empty
      if (!dataToSend.password) {
        delete dataToSend.password;
      }

      await editWaliKelas(id, dataToSend);

      toast.dismiss(loadingToast);
      toast.success("Wali Kelas berhasil diupdate!", {
        duration: 3000,
        position: "top-right",
      });

      // Redirect after success
      setTimeout(() => {
        navigate("/dashboard/wali-kelas");
      }, 1500);
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(
        error.response?.data?.message || "Gagal mengupdate wali kelas",
        {
          duration: 5000,
          position: "top-right",
        }
      );
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <Toaster position="top-right" />

      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/dashboard/wali-kelas")}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <svg
              className="w-4 h-4 mr-2"
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
            Kembali
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Edit Wali Kelas</h1>
          <p className="mt-1 text-sm text-gray-600">
            Update data akun wali kelas
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4">
            <h2 className="text-xl font-semibold text-white">
              Form Edit Data Wali Kelas
            </h2>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Username */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Username <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                placeholder="Masukkan username"
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                placeholder="email@example.com"
              />
            </div>

            {/* Class Assigned */}
            <div>
              <label
                htmlFor="classAssigned"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Kelas yang Dipegang <span className="text-red-500">*</span>
              </label>
              <select
                id="classAssigned"
                name="classAssigned"
                value={formData.classAssigned}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              >
                <option value="">Pilih Kelas</option>
                <option value="7A">7A</option>
                <option value="7B">7B</option>
                <option value="7C">7C</option>
                <option value="7D">7D</option>
                <option value="7E">7E</option>
                <option value="7F">7F</option>
                <option value="7G">7G</option>
                <option value="7H">7H</option>
                <option value="7I">7I</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Kelas yang akan dipegang oleh wali kelas ini
              </p>
            </div>

            {/* Password Section */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Ubah Password (Opsional)
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Kosongkan jika tidak ingin mengubah password
              </p>

              {/* Password */}
              <div className="mb-4">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Password Baru
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  minLength={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="Minimal 6 karakter (kosongkan jika tidak diubah)"
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Konfirmasi Password Baru
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  minLength={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="Ketik ulang password baru"
                />
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate("/dashboard/wali-kelas")}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
                disabled={loading}
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Memproses...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Update Wali Kelas
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditWaliKelas;

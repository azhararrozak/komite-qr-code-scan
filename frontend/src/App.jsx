import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/dashboard/Dashboard";
import DashboardLayout from "./pages/dashboard/DashboardLayout";
import Setting from "./pages/dashboard/Setting";
import ProtectedRoute from "./routes/ProtectedRoute";
import AdminRoute from "./routes/AdminRoute";
import GuestRoute from "./routes/GuestRoute";
import NotFound from "./pages/NotFound";
import TambahData from "./pages/dashboard/TambahData";
import RekapData from "./pages/dashboard/RekapData";
import TambahSiswa from "./pages/dashboard/TambahSiswa";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      {/* Auth routes - only accessible when NOT logged in */}
      <Route
        path="/auth/login"
        element={
          <GuestRoute>
            <Login />
          </GuestRoute>
        }
      />
      <Route
        path="/auth/register"
        element={
          <GuestRoute>
            <Register />
          </GuestRoute>
        }
      />

      {/* Protected dashboard with nested routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="setting" element={<Setting />} />
        <Route path="rekap-data" element={<RekapData />} />
      </Route>

      {/* Admin-only route: Tambah Siswa via CSV */}
      <Route
        path="/dashboard/tambah-siswa"
        element={
          <AdminRoute>
            <DashboardLayout />
          </AdminRoute>
        }
      >
        <Route index element={<TambahSiswa />} />
      </Route>

      {/* Reader QR with protected route */}
      <Route
        path="/tambah-data/:nis"
        element={
          <ProtectedRoute>
            <TambahData />
          </ProtectedRoute>
        }
      />
      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;

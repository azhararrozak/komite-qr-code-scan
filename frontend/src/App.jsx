import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/dashboard/profile/Dashboard";
import DashboardLayout from "./pages/dashboard/DashboardLayout";
import ProtectedRoute from "./routes/ProtectedRoute";
import AdminRoute from "./routes/AdminRoute";
import GuestRoute from "./routes/GuestRoute";
import NotFound from "./pages/NotFound";
import TambahData from "./pages/dashboard/TambahData";
import RekapDataAdmin from "./pages/dashboard/rekapdata/RekapDataAdmin";
import RekapDataWaliKelas from "./pages/dashboard/rekapdata/RekapDataWaliKelas";
import TambahSiswa from "./pages/dashboard/TambahSiswa";
import DataSiswa from "./pages/dashboard/DataSiswa";
import WaliKelas from "./pages/dashboard/walikelas/WaliKelas";
import WaliKelasLayout from "./pages/dashboard/walikelas/WaliKelasLayout";
import TambahWaliKelas from "./pages/dashboard/walikelas/TambahWaliKelas";
import ScanQr from "./pages/dashboard/ScanQr";
import EditWaliKelas from "./pages/dashboard/walikelas/EditWaliKelas";

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
        <Route
          path="rekap-data-admin"
          element={
            <AdminRoute>
              <RekapDataAdmin />
            </AdminRoute>
          }
        />
        <Route path="rekap-data" element={<RekapDataWaliKelas />} />
        <Route path="data-siswa" element={<DataSiswa />} />
        <Route
          path="wali-kelas"
          element={
            <AdminRoute>
              <WaliKelasLayout />
            </AdminRoute>
          }
        >
          <Route index element={<WaliKelas />} />
          <Route path="tambah" element={<TambahWaliKelas />} />
          <Route path="edit/:id" element={<EditWaliKelas />} />
        </Route>
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

      <Route
        path="/qr-scan"
        element={
          <ProtectedRoute>
            <ScanQr />
          </ProtectedRoute>
        }
      />

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

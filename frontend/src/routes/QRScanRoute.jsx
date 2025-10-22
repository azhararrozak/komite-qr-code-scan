import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const QRScanRoute = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Cek apakah user datang dari QR scan
    const isFromQRScan = sessionStorage.getItem('fromQRScan');
    const currentPath = location.pathname;
    
    // Jika mengakses tambah-data tanpa melalui QR scan
    if (currentPath.includes('/tambah-data/') && !isFromQRScan) {
      // Clear any existing flag
      sessionStorage.removeItem('fromQRScan');
      
      // Redirect ke halaman QR scan
      navigate('/qr-scan', { 
        replace: true,
        state: { 
          message: 'Silakan scan QR code terlebih dahulu untuk mengakses halaman pembayaran'
        }
      });
      return;
    }

    // Jika sudah benar dari QR scan, flag akan tetap ada selama di halaman ini
    // dan akan dihapus ketika pindah halaman melalui cleanup di TambahData component
  }, [navigate, location.pathname]);

  // Effect untuk cleanup ketika browser refresh atau back/forward navigation
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Hapus flag ketika browser refresh
      sessionStorage.removeItem('fromQRScan');
    };

    const handleVisibilityChange = () => {
      // Hapus flag ketika tab tidak aktif (user pindah tab)
      if (document.hidden) {
        sessionStorage.removeItem('fromQRScan');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return children;
};

export default QRScanRoute;
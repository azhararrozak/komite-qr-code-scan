import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";

const ScanQr = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isScanning, setIsScanning] = useState(false);
  const [cameraStatus, setCameraStatus] = useState("Belum dimulai");
  const [cameras, setCameras] = useState([]);
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0);
  const scannerRef = useRef(null);
  const lastScanRef = useRef(0);

  // Check if redirected from direct access
  const redirectMessage = location.state?.message;

  // Function to extract NIS from QR data
  const extractNIS = (text) => {
    try {
      const parsed = JSON.parse(text);
      if (parsed.nis) {
        return String(parsed.nis);
      }
    } catch {
      if (/^\d{3,20}$/.test(text.trim())) {
        return text.trim();
      }
    }
    return null;
  };

  // Function to handle QR scan and redirect
  const handleQRScan = (decodedText) => {
    const now = Date.now();

    // Cooldown 2 seconds to prevent double scan
    if (now - lastScanRef.current < 2000) {
      return;
    }

    const nis = extractNIS(decodedText);

    if (!nis) {
      setCameraStatus("❌ QR tidak memiliki NIS yang valid");
      return;
    }

    // Validate NIS format
    if (!/^\d{3,20}$/.test(nis)) {
      setCameraStatus(`❌ Format NIS tidak valid: ${nis}`);
      return;
    }

    setCameraStatus(`✅ QR Berhasil! NIS: ${nis} - Mengalihkan...`);
    lastScanRef.current = now;

    // Set flag bahwa user sudah scan QR
    sessionStorage.setItem('fromQRScan', 'true');

    // Stop scanner before redirect
    if (scannerRef.current) {
      scannerRef.current.stop().catch(() => {});
    }

    // Redirect after short delay
    setTimeout(() => {
      navigate(`/tambah-data/${nis}`);
    }, 1000);
  };

  useEffect(() => {
    // Get available cameras
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length) {
          setCameras(devices);
          setCameraStatus("Kamera tersedia - Klik 'Mulai Scan'");

          // Find back camera (environment facing) or use last camera
          let defaultCameraId = devices[0].id;
          let defaultCameraIndex = 0;

          // Try to find back camera
          const backCameraIndex = devices.findIndex(
            (device) =>
              device.label.toLowerCase().includes("back") ||
              device.label.toLowerCase().includes("rear") ||
              device.label.toLowerCase().includes("environment")
          );

          if (backCameraIndex !== -1) {
            defaultCameraId = devices[backCameraIndex].id;
            defaultCameraIndex = backCameraIndex;
          } else if (devices.length > 1) {
            // If no back camera found by label, use last camera (usually back camera on mobile)
            defaultCameraId = devices[devices.length - 1].id;
            defaultCameraIndex = devices.length - 1;
          }

          setCurrentCameraIndex(defaultCameraIndex);

          // Auto start camera with back camera
          const startFirstCamera = async () => {
            try {
              if (!scannerRef.current) {
                scannerRef.current = new Html5Qrcode("qr-reader");
              }

              const config = {
                fps: 10,
                qrbox: { width: 250, height: 250 },
              };

              await scannerRef.current.start(
                defaultCameraId,
                config,
                (decodedText) => {
                  handleQRScan(decodedText);
                },
                () => {}
              );

              setIsScanning(true);
              setCameraStatus("🎥 Kamera aktif - Scan QR code");
            } catch (err) {
              setCameraStatus("Error: " + err.message);
            }
          };

          startFirstCamera();
        } else {
          setCameraStatus("Tidak ada kamera ditemukan");
        }
      })
      .catch((err) => {
        setCameraStatus("Error: " + err.message);
      });

    // Cleanup on unmount
    return () => {
      if (scannerRef.current && isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startScanning = async (cameraId) => {
    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode("qr-reader");
      }

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
      };

      // Use provided cameraId or find back camera
      let cameraToUse = cameraId;
      if (!cameraToUse && cameras.length > 0) {
        // Find back camera
        const backCamera = cameras.find(
          (device) =>
            device.label.toLowerCase().includes("back") ||
            device.label.toLowerCase().includes("rear") ||
            device.label.toLowerCase().includes("environment")
        );
        cameraToUse = backCamera
          ? backCamera.id
          : cameras[cameras.length - 1].id;
      }

      await scannerRef.current.start(
        cameraToUse || { facingMode: "environment" },
        config,
        (decodedText) => {
          handleQRScan(decodedText);
        },
        () => {}
      );

      setIsScanning(true);
      setCameraStatus("🎥 Kamera aktif - Scan QR code");
    } catch (err) {
      setCameraStatus("Error: " + err.message);
      setIsScanning(false);
    }
  };

  const stopScanning = async () => {
    try {
      if (scannerRef.current && isScanning) {
        await scannerRef.current.stop();
        scannerRef.current.clear();
        scannerRef.current = null;
        setIsScanning(false);
        setCameraStatus("Scanner dihentikan");
      }
    } catch {
      setCameraStatus("Error saat menghentikan scanner");
    }
  };

  const switchCamera = async () => {
    if (cameras.length <= 1) return;

    try {
      // Stop current scanner
      if (scannerRef.current && isScanning) {
        await scannerRef.current.stop();
        scannerRef.current.clear();
        scannerRef.current = null;
      }

      // Switch to next camera
      const nextCameraIndex = (currentCameraIndex + 1) % cameras.length;
      setCurrentCameraIndex(nextCameraIndex);

      // Start with new camera
      setCameraStatus("🔄 Beralih kamera...");

      scannerRef.current = new Html5Qrcode("qr-reader");

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
      };

      await scannerRef.current.start(
        cameras[nextCameraIndex].id,
        config,
        (decodedText) => {
          handleQRScan(decodedText);
        },
        () => {}
      );

      setIsScanning(true);
      setCameraStatus("🎥 Kamera aktif - Scan QR code");
    } catch (err) {
      setCameraStatus("Error saat beralih kamera: " + err.message);
      setIsScanning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-4 px-4 sm:py-6 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Redirect Message */}
        {redirectMessage && (
          <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700 font-medium">
                  {redirectMessage}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <svg
              className="w-8 h-8 sm:w-10 sm:h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
              />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Scan QR Code Siswa
          </h1>
          <p className="text-sm sm:text-base text-gray-600 px-4">
            Scan QR code untuk mengambil data siswa
          </p>
        </div>

        {/* Scanner Card */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden">
          <div className="p-4 sm:p-6 lg:p-8">
            {/* Camera container */}
            <div
              id="qr-reader"
              className="w-full min-h-[280px] sm:min-h-[320px] lg:min-h-[400px] bg-gray-100 rounded-xl sm:rounded-2xl overflow-hidden"
            ></div>

            {/* Status */}
            <div className="mt-4 sm:mt-6 text-center">
              <span
                className={`inline-block text-sm sm:text-base font-medium px-4 py-2 rounded-lg ${
                  isScanning
                    ? "text-green-700 bg-green-50"
                    : "text-gray-700 bg-gray-100"
                }`}
              >
                {cameraStatus}
              </span>
            </div>

            {/* Control Buttons */}
            <div className="mt-4 sm:mt-6 flex flex-wrap gap-3 justify-center items-center">
              {!isScanning ? (
                <button
                  onClick={() => cameras.length > 0 && startScanning()}
                  disabled={cameras.length === 0}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed font-medium shadow-lg transition-all duration-200 text-sm sm:text-base"
                >
                  ▶️ Mulai Scan
                </button>
              ) : (
                <>
                  <button
                    onClick={stopScanning}
                    className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 font-medium shadow-lg transition-all duration-200 text-sm sm:text-base"
                  >
                    ⏹️ Stop Scan
                  </button>

                  {cameras.length > 1 && (
                    <button
                      onClick={switchCamera}
                      className="px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 font-medium shadow-lg transition-all duration-200 text-sm sm:text-base flex items-center gap-2"
                      title="Beralih Kamera"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                      <span className="hidden sm:inline">Switch</span>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-4 py-3 sm:py-4 text-center border-t border-gray-100">
            <p className="text-xs sm:text-sm text-gray-600">
              Scanner akan otomatis mendeteksi QR code
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScanQr;

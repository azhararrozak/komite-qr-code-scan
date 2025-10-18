import { useState, useRef } from "react";
import Button from "../../components/atoms/Button";
import useStudentStore from "../../stores/useStudentStore";

const TambahSiswa = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [uploadResult, setUploadResult] = useState(null);
  const fileInputRef = useRef(null);

  const createStudentCsv = useStudentStore((state) => state.createStudentCsv);

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle drop
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  // Handle file selection
  const handleFileChange = (selectedFile) => {
    // Validate file type
    if (selectedFile && !selectedFile.name.endsWith(".csv")) {
      setMessage({ type: "error", text: "Hanya file CSV yang diperbolehkan!" });
      return;
    }

    setFile(selectedFile);
    setMessage({ type: "", text: "" });
    setUploadResult(null);
  };

  // Handle file input change
  const onFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileChange(e.target.files[0]);
    }
  };

  // Handle browse click
  const onBrowseClick = () => {
    fileInputRef.current?.click();
  };

  // Handle upload
  const handleUpload = async () => {
    if (!file) {
      setMessage({ type: "error", text: "Pilih file CSV terlebih dahulu!" });
      return;
    }

    setUploading(true);
    setMessage({ type: "", text: "" });
    setUploadResult(null);

    try {
      // Call the API to upload the file
        const result = await createStudentCsv(file);
        
        // Handle different response formats from backend
        const inserted = result.inserted || result.totalStudents || 0;
        const total = result.total || result.totalQRCodes || csvData?.length || 0;
        
        const successMessage = `Upload berhasil! ${inserted} siswa ditambahkan${total > 0 ? ` dari ${total} data` : ''}.`;
        setMessage({ type: "success", text: successMessage });
        
        // Normalize the result format for display
        const normalizedResult = {
          inserted: inserted,
          total: total,
          ...result
        };
        setUploadResult(normalizedResult);
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Upload gagal!";
      setMessage({ type: "error", text: errorMsg });
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setFile(null);
    setMessage({ type: "", text: "" });
    setUploadResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Download template CSV
  const downloadTemplate = () => {
    const csvContent =
      "nis;nama;class;gender\n14454;ADE GIAT MULYANA;7I;L\n14455;SITI NURHALIZA;7I;P\n14456;BUDI SANTOSO;7II;L";
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "template_siswa.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Tambah Siswa dari CSV
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Upload file CSV untuk menambahkan banyak siswa sekaligus
        </p>
      </div>

      {/* Instructions Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">
          📋 Format CSV yang diperlukan:
        </h3>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>
            Delimiter: <strong>semicolon (;)</strong>
          </li>
          <li>
            Header:{" "}
            <code className="bg-blue-100 px-1 rounded">
              nis;nama;class;gender
            </code>
          </li>
          <li>
            Gender: <code className="bg-blue-100 px-1 rounded">L</code> untuk
            laki-laki, <code className="bg-blue-100 px-1 rounded">P</code> untuk
            perempuan
          </li>
          <li>Encoding: UTF-8</li>
        </ul>
        <button
          onClick={downloadTemplate}
          className="mt-3 text-sm text-blue-700 hover:text-blue-900 underline font-medium"
        >
          📥 Download Template CSV
        </button>
      </div>

      {/* Upload Area */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? "border-indigo-500 bg-indigo-50"
              : file
              ? "border-green-400 bg-green-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={onFileInputChange}
            className="hidden"
          />

          {!file ? (
            <div className="space-y-4">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="text-sm text-gray-600">
                <button
                  type="button"
                  onClick={onBrowseClick}
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Pilih file
                </button>
                <span className="pl-1">atau drag & drop di sini</span>
              </div>
              <p className="text-xs text-gray-500">CSV hingga 10MB</p>
            </div>
          ) : (
            <div className="space-y-4">
              <svg
                className="mx-auto h-12 w-12 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-gray-900">{file.name}</p>
                <p className="text-xs text-gray-500">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
              <button
                type="button"
                onClick={handleCancel}
                className="text-sm text-red-600 hover:text-red-800"
              >
                ✕ Hapus file
              </button>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-3">
          <Button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="flex-1"
          >
            {uploading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                Uploading...
              </>
            ) : (
              "📤 Upload CSV"
            )}
          </Button>
          {file && !uploading && (
            <Button variant="secondary" onClick={handleCancel}>
              Batal
            </Button>
          )}
        </div>
      </div>

      {/* Message Alert */}
      {message.text && (
        <div
          className={`rounded-lg p-4 mb-6 ${
            message.type === "success"
              ? "bg-green-50 border border-green-200"
              : "bg-red-50 border border-red-200"
          }`}
        >
          <div className="flex">
            <div className="flex-shrink-0">
              {message.type === "success" ? (
                <svg
                  className="h-5 w-5 text-green-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
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
              )}
            </div>
            <div className="ml-3">
              <p
                className={`text-sm font-medium ${
                  message.type === "success" ? "text-green-800" : "text-red-800"
                }`}
              >
                {message.text}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Upload Result */}
      {uploadResult && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            📊 Hasil Upload
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-green-600 font-medium">
                Berhasil ditambahkan
              </p>
              <p className="text-3xl font-bold text-green-700">
                {uploadResult.inserted || uploadResult.totalStudents || 0}
              </p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-600 font-medium">
                Total data diproses
              </p>
              <p className="text-3xl font-bold text-blue-700">
                {uploadResult.total || uploadResult.totalQRCodes || (uploadResult.students && uploadResult.students.length) || 0}
              </p>
            </div>
          </div>
          {(uploadResult.inserted !== uploadResult.total && uploadResult.total > 0) && (
            <p className="mt-3 text-sm text-gray-600">
              ⚠️ {uploadResult.total - uploadResult.inserted} data dilewati
              (data tidak lengkap atau duplikat)
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default TambahSiswa;

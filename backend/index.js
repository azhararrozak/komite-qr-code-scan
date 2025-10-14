// Mengimpor modul-modul yang diperlukan
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config(); // Memuat variabel lingkungan dari file .env

// --- INISIALISASI APLIKASI EXPRESS ---
const app = express();
const PORT = process.env.PORT || 5000; // Menggunakan port dari Railway atau default 5000

// --- MIDDLEWARE ---
app.use(cors()); // Mengaktifkan Cross-Origin Resource Sharing
app.use(express.json()); // Mem-parsing body request JSON
app.use(express.urlencoded({ extended: true })); // Mem-parsing body request URL-encoded

// --- KONEKSI DATABASE MONGODB ---
// Gunakan MONGO_URL dari environment variables yang disediakan Railway
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Koneksi ke MongoDB berhasil.'))
.catch(err => console.error('Koneksi ke MongoDB gagal:', err));

// --- RUTE API ANDA ---
// Tempatkan semua rute API Anda di sini.
// Contoh:
// const authRoutes = require('./src/routes/authRoutes');
// const userRoutes = require('./src/routes/userRoutes');
// app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);

app.get('/api/test', (req, res) => {
    res.json({ message: 'Hello from backend API!' });
});


// --- KODE UNTUK MENYAJIKAN FRONTEND SAAT DEPLOYMENT ---
// Bagian ini akan menyajikan file-file statis dari build React Anda
if (process.env.NODE_ENV === 'production') {
  // Menentukan path ke folder build frontend
  // Berdasarkan script build di package.json Anda, file akan ada di folder 'client'
  const buildPath = path.resolve(__dirname, 'client');
  
  // Sajikan semua file statis (JS, CSS, gambar, dll.) dari folder tersebut
  app.use(express.static(buildPath));

  // Untuk semua request GET yang tidak cocok dengan rute API di atas,
  // kirimkan file index.html dari React.
  // Ini memungkinkan React Router untuk menangani routing di sisi klien.
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(buildPath, 'index.html'));
  });
}
// --- AKHIR DARI KODE DEPLOYMENT ---


// --- MENJALANKAN SERVER ---
app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});

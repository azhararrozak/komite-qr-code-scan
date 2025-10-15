// Mengimpor modul-modul yang diperlukan
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config(); // Memuat variabel lingkungan dari file .env

// --- INISIALISASI APLIKASI EXPRESS ---
const app = express();
const PORT = process.env.PORT || 8080; // Menggunakan port dari Railway atau default 5000
const db = require('./src/models');
const Role = db.role;

// --- MIDDLEWARE ---

const corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions)); // Mengaktifkan Cross-Origin Resource Sharing
app.use(express.json()); // Mem-parsing body request JSON
app.use(express.urlencoded({ extended: true })); // Mem-parsing body request URL-encoded

// --- KONEKSI DATABASE MONGODB ---
// Gunakan MONGO_URL dari environment variables yang disediakan Railway
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Successfully connect to MongoDB.");
    initial();
  })
  .catch((err) => {
    console.error("Connection error", err);
    process.exit();
  });

// --- RUTE API ANDA ---
// Tempatkan semua rute API Anda di sini.
// Contoh:
// const authRoutes = require('./src/routes/authRoutes');
// const userRoutes = require('./src/routes/userRoutes');
// app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);

require('./src/routes/auth.routes')(app);
require('./src/routes/user.routes')(app);
//require('./src/routes/student.routes')(app);
//require('./src/routes/payment.routes')(app);
//require('./src/routes/qr.routes')(app);


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

//Initial MOngo
async function initial() {
    try {
      const count = await Role.estimatedDocumentCount();
  
      if (count === 0) {
        await new Role({
          name: "user",
        }).save();
  
        await new Role({
          name: "admin",
        }).save();
  
        console.log("Added 'user' and 'admin' to roles collection");
      }
    } catch (err) {
      console.error("Error:", err);
    }
  }


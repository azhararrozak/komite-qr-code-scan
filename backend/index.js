// --- Modul yang Diperlukan ---
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path'); // PENTING: Menambahkan 'path' yang hilang
require('dotenv').config();

const app = express();

// --- Middleware ---
const corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Koneksi Database & Inisialisasi Role ---
const db = require('./src/models');
const Role = db.role;

// PERBAIKAN: Menggunakan MONGO_URL dan menghapus opsi yang tidak berlaku
mongoose
  .connect(process.env.MONGO_URL) 
  .then(() => {
    console.log("Successfully connect to MongoDB.");
    initial(); // Menjalankan fungsi initial setelah koneksi berhasil
  })
  .catch((err) => {
    console.error("Connection error", err);
    process.exit();
  });

// --- Rute API Anda ---
// Rute ini harus didefinisikan SEBELUM kode penyajian frontend
require('./src/routes/auth.routes')(app);
require('./src/routes/user.routes')(app);
require('./src/routes/student.routes')(app);
require('./src/routes/payment.routes')(app);
require('./src/routes/qr.routes')(app);

app.get('/api/health', (_req, res) => res.json({ ok: true }));


// --- Kode untuk Menyajikan Frontend (Harus di bagian paling bawah) ---
// Bagian ini akan menyajikan file-file statis dari build React Anda
if (process.env.NODE_ENV === 'production') {
    const buildPath = path.resolve(__dirname, 'client');
    
    // Sajikan semua file statis (JS, CSS, gambar, dll.)
    app.use(express.static(buildPath));
  
    // Untuk semua request lain, kirimkan index.html dari React
    // Ini memungkinkan React Router untuk bekerja
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(buildPath, 'index.html'));
    });
}

// --- Menjalankan Server ---
// PERBAIKAN: Hanya ada satu deklarasi PORT
const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});


// --- Fungsi untuk Inisialisasi Role di Database ---
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
      console.error("Error during initial role setup:", err);
    }
}


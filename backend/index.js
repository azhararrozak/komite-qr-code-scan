const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

const corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const db = require('./src/models');
const Role = db.role;

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

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.get('/api/health', (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3000;

require('./src/routes/auth.routes')(app);
require('./src/routes/user.routes')(app);
require('./src/routes/student.routes')(app);
require('./src/routes/payment.routes')(app);
require('./src/routes/qr.routes')(app);

// === Serve Frontend Build ===
// Hasil build React akan dicopy ke: backend/client
const clientPath = path.join(__dirname, 'client');
app.use(express.static(clientPath));

// SPA fallback (HARUS terakhir setelah rute API)
app.get('*', (req, res) => {
  res.sendFile(path.join(clientPath, 'index.html'));
});

// --- Start server ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});

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

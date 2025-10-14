const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const path = require('path');

const app = express();

// === CORS SETUP ===
const corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// === DATABASE CONNECTION ===
const db = require('./src/models');
const Role = db.role;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Successfully connected to MongoDB');
    initial();
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err);
    process.exit();
  });

// === ROUTES ===
app.get('/', (req, res) => {
  res.send('Hello World from Backend!');
});

require('./src/routes/auth.routes')(app);
require('./src/routes/user.routes')(app);
require('./src/routes/student.routes')(app);
require('./src/routes/payment.routes')(app);
require('./src/routes/qr.routes')(app);

// === SERVE FRONTEND (VITE BUILD) ===
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '../frontend/dist');
  app.use(express.static(frontendPath));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(frontendPath, 'index.html'));
  });
}

// === PORT SETUP ===
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// === INITIAL ROLE SEEDER ===
async function initial() {
  try {
    const count = await Role.estimatedDocumentCount();

    if (count === 0) {
      await new Role({ name: 'user' }).save();
      await new Role({ name: 'admin' }).save();
      console.log("✅ Added default roles: 'user', 'admin'");
    }
  } catch (err) {
    console.error('Error initializing roles:', err);
  }
}

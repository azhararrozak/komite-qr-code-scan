const multer = require('multer');
const path = require('path');
const fs = require('fs');

// store uploads in backend/uploads with original filename prefixed by timestamp
const uploadDir = path.join(__dirname, '../../uploads');
// ensure upload directory exists
try {
  fs.mkdirSync(uploadDir, { recursive: true });
} catch (e) {
  // ignore
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ts = Date.now();
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${ts}_${safeName}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: function (req, file, cb) {
    // accept csv files only
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.csv') {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  }
});

module.exports = upload;

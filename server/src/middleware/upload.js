const multer = require('multer');
const AppError = require('../utils/AppError');

const ALLOWED_MIMES = new Set(['image/jpeg', 'image/png']);

const uploadImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIMES.has(file.mimetype)) {
      return cb(new AppError('Unsupported image type', 415));
    }
    cb(null, true);
  },
});

module.exports = { uploadImage };

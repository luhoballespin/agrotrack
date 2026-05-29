const multer = require("multer");

// Memory storage para subir directo a Cloudinary (sin tocar disco).
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

module.exports = { upload };


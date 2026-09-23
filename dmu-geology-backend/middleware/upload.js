const multer = require('multer');
const path = require('path');
const fs = require('fs');

['uploads/materials', 'uploads/profiles', 'uploads/publications', 'uploads/news'].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const storage = (folder) => multer.diskStorage({
  destination: (req, file, cb) => cb(null, `uploads/${folder}/`),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, unique);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp|pdf|doc|docx|ppt|pptx|mp4|mp3|wav|xlsx|csv|txt/;
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.test(ext)) cb(null, true);
  else cb(new Error('File type not allowed'));
};

const limits = { fileSize: 50 * 1024 * 1024 };

const uploadMaterial = multer({ storage: storage('materials'), fileFilter, limits });
const uploadProfile = multer({ storage: storage('profiles'), fileFilter, limits });
const uploadPublication = multer({ storage: storage('publications'), fileFilter, limits });
const uploadNews = multer({ storage: storage('news'), fileFilter, limits });

module.exports = { uploadMaterial, uploadProfile, uploadPublication, uploadNews };
import multer from 'multer';
import path from 'path';

// ✅ Configure multer for memory storage
const storage = multer.memoryStorage();

// ✅ File filter to allow only .glb files
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.glb'];
  const fileExtension = path.extname(file.originalname).toLowerCase();

  if (
    allowedExtensions.includes(fileExtension) ||
    file.mimetype === 'model/gltf-binary' ||
    file.mimetype === 'application/octet-stream'
  ) {
    cb(null, true); // ✅ Accept file
  } else {
    cb(new Error('Only GLB files are allowed'), false); // ❌ Reject file
  }
};

// ✅ Multer upload setup
const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100 MB
  },
  fileFilter,
});

// ✅ Custom error handler for multer
const handleUploadErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File too large. Maximum size is 100MB',
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        error: 'Unexpected field',
      });
    }
  } else if (err) {
    return res.status(400).json({
      success: false,
      error: err.message,
    });
  }
  next();
};

// ✅ Export middlewares
export const uploadMiddleware = upload.single('model');
export { handleUploadErrors };

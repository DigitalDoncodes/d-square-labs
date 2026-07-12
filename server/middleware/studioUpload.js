const multer = require('multer');

// Content Studio accepts every publishable type; per-module middlewares
// (upload.js, docUpload.js) stay untouched for backwards compatibility.
const MIME_TO_TYPE = {
  'application/pdf': 'pdf',
  'application/msword': 'word',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'word',
  'application/vnd.ms-excel': 'excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'excel',
  'text/csv': 'excel',
  'application/vnd.ms-powerpoint': 'ppt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'ppt',
  'application/zip': 'zip',
  'application/x-zip-compressed': 'zip',
  'text/markdown': 'markdown',
  'text/x-markdown': 'markdown',
  'text/plain': 'text',
};

function detectType(file) {
  if (MIME_TO_TYPE[file.mimetype]) {
    // .md often arrives as text/plain — trust the extension.
    if (file.mimetype === 'text/plain' && /\.(md|markdown)$/i.test(file.originalname)) {
      return 'markdown';
    }
    return MIME_TO_TYPE[file.mimetype];
  }
  if (file.mimetype.startsWith('image/')) return 'image';
  if (file.mimetype.startsWith('video/')) return 'video';
  if (file.mimetype.startsWith('audio/')) return 'audio';
  return null;
}

const studioUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024, files: 10 }, // 100 MB, 10 files/request
  fileFilter: (req, file, cb) => {
    if (detectType(file)) return cb(null, true);
    cb(new Error(`Unsupported file type: ${file.mimetype}`));
  },
});

studioUpload.detectType = detectType;
module.exports = studioUpload;

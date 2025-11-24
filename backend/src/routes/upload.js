const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { postUploadPhoto, postGeneratePresignedUrl } = require('../controllers/uploadController');

// POST /api/upload - Upload student photo
router.post('/', upload.single('photo'), postUploadPhoto);

// POST /api/upload/presigned - Generate pre-signed URL
router.post('/presigned', postGeneratePresignedUrl);

module.exports = router;

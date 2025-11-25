const express = require('express');
const router = express.Router();
const { adminAuthMiddleware } = require('../utils/auth');
const {
  postAdminLogin,
  getAdminClasses,
  downloadImage,
  downloadClass,
  downloadAllClasses,
  getAdminStats,
} = require('../controllers/adminController');

// Public route - no authentication required
router.post('/login', postAdminLogin);

// Protected routes - require authentication
router.get('/classes', adminAuthMiddleware, getAdminClasses);
router.get('/stats', adminAuthMiddleware, getAdminStats);
router.get('/download/image/:className/:studentName', adminAuthMiddleware, downloadImage);
router.get('/download/class/:className', adminAuthMiddleware, downloadClass);
router.get('/download/all', adminAuthMiddleware, downloadAllClasses);

module.exports = router;

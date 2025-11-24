const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const classRoutes = require('./routes/classes');
const studentRoutes = require('./routes/students');
const uploadRoutes = require('./routes/upload');
const adminRoutes = require('./routes/admin');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API Routes
app.use('/api/classes', classRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Student Photo Capture API',
    version: '1.0.0',
    endpoints: {
      classes: {
        'GET /api/classes': 'List all classes',
        'POST /api/classes': 'Create a new class',
      },
      students: {
        'GET /api/students/:className': 'Get all students in a class',
      },
      upload: {
        'POST /api/upload': 'Upload student photo',
        'POST /api/upload/presigned': 'Get pre-signed upload URL',
      },
      admin: {
        'POST /api/admin/login': 'Admin login',
        'GET /api/admin/classes': 'Get all classes with students (Auth required)',
        'GET /api/admin/stats': 'Get statistics (Auth required)',
        'GET /api/admin/download/image/:className/:studentName': 'Download image (Auth required)',
        'GET /api/admin/download/class/:className': 'Download class as ZIP (Auth required)',
      },
      health: {
        'GET /health': 'Health check',
      },
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
  });
});

// Error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🪣 S3 Bucket: ${process.env.S3_BUCKET_NAME || 'Not configured'}`);
  console.log(`🌍 Region: ${process.env.AWS_REGION || 'Not configured'}`);
  if (process.env.S3_ENDPOINT_URL) {
    console.log(`🔗 S3 Endpoint: ${process.env.S3_ENDPOINT_URL}`);
  }
  console.log(`\n✨ Ready to capture student photos!\n`);
});

module.exports = app;

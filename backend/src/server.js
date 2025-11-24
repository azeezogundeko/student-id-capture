const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const classRoutes = require('./routes/classes');
const studentRoutes = require('./routes/students');
const uploadRoutes = require('./routes/upload');
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
  console.log(`\n✨ Ready to capture student photos!\n`);
});

module.exports = app;

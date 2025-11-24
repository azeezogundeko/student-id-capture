const { S3Client } = require('@aws-sdk/client-s3');
require('dotenv').config();

// S3 Configuration
const S3_ENDPOINT_URL = process.env.S3_ENDPOINT_URL;
const BUCKET_NAME = process.env.S3_BUCKET_NAME;

// Initialize S3 Client with AWS SDK v3
// Supports both AWS S3 and S3-compatible services (MinIO, DigitalOcean Spaces, Wasabi, etc.)
const s3ClientConfig = {
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
};

// Add custom endpoint for S3-compatible services
if (S3_ENDPOINT_URL) {
  s3ClientConfig.endpoint = S3_ENDPOINT_URL;
  s3ClientConfig.forcePathStyle = true; // Required for most S3-compatible services
  console.log(`🔗 Using custom S3 endpoint: ${S3_ENDPOINT_URL}`);
}

const s3Client = new S3Client(s3ClientConfig);

// Validate configuration
if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
  console.error('⚠️  S3 credentials not configured properly');
}

if (!BUCKET_NAME) {
  console.error('⚠️  S3_BUCKET_NAME not configured');
}

if (!S3_ENDPOINT_URL) {
  console.warn('ℹ️  S3_ENDPOINT_URL not set. Using AWS S3 default endpoints.');
}

module.exports = {
  s3Client,
  BUCKET_NAME,
};

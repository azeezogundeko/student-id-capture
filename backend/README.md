# Student Photo Capture Backend

Express.js backend API for the Student Photo Capture System with AWS S3 integration.

---

## Features

- RESTful API endpoints for class and student management
- AWS S3 integration for photo storage
- Pre-signed URL generation for efficient uploads
- Input validation and sanitization
- File upload with Multer
- Comprehensive error handling
- CORS support
- Security headers with Helmet

---

## Tech Stack

- **Node.js** 18+
- **Express** - Web framework
- **AWS SDK v3** - S3 integration
- **Multer** - File upload handling
- **Helmet** - Security headers
- **CORS** - Cross-origin requests
- **dotenv** - Environment configuration

---

## Installation

```bash
npm install
```

---

## Configuration

Create a `.env` file based on `.env.example`:

```env
PORT=5000
NODE_ENV=development
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
S3_BUCKET_NAME=student-photo-capture
FRONTEND_URL=http://localhost:3000
MAX_FILE_SIZE=5242880
```

---

## Usage

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

Server runs on `http://localhost:5000` (or configured PORT)

---

## API Endpoints

### Health Check
```
GET /health
```

### Classes
```
GET /api/classes          # List all classes
POST /api/classes         # Create a class
```

### Students
```
GET /api/students/:className    # Get students in a class
```

### Upload
```
POST /api/upload                # Upload photo
POST /api/upload/presigned      # Get pre-signed URL
```

For complete API documentation, see [../docs/API_DOCUMENTATION.md](../docs/API_DOCUMENTATION.md)

---

## Testing

### Run automated tests:
```bash
npm test
```

### Run bash tests:
```bash
chmod +x tests/test.sh
./tests/test.sh
```

---

## Project Structure

```
backend/
├── src/
│   ├── server.js              # Main application
│   ├── config/
│   │   └── s3.js              # S3 configuration
│   ├── controllers/           # Request handlers
│   │   ├── classController.js
│   │   ├── studentController.js
│   │   └── uploadController.js
│   ├── middleware/            # Express middleware
│   │   ├── errorHandler.js
│   │   └── upload.js
│   ├── routes/                # API routes
│   │   ├── classes.js
│   │   ├── students.js
│   │   └── upload.js
│   ├── services/              # Business logic
│   │   └── s3Service.js
│   └── utils/                 # Utilities
│       └── validation.js
├── tests/                     # Test scripts
│   ├── test-upload.js
│   └── test.sh
├── package.json
└── .env.example
```

---

## Security

### Input Validation
- Class names: alphanumeric, spaces, hyphens only (max 100 chars)
- Student names: alphanumeric, spaces, hyphens only (max 100 chars)
- File types: JPEG, PNG, WebP only
- File size: 5MB limit (configurable)

### S3 Security
- Least-privilege IAM policy
- Pre-signed URLs with expiration
- Bucket not publicly accessible

---

## Deployment

See [../docs/DEPLOYMENT.md](../docs/DEPLOYMENT.md) for deployment guides to:
- Render
- Railway
- AWS EC2

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| PORT | No | Server port (default: 5000) |
| NODE_ENV | No | Environment (development/production) |
| AWS_ACCESS_KEY_ID | Yes | AWS access key |
| AWS_SECRET_ACCESS_KEY | Yes | AWS secret key |
| AWS_REGION | Yes | AWS region |
| S3_BUCKET_NAME | Yes | S3 bucket name |
| FRONTEND_URL | Yes | Frontend URL for CORS |
| MAX_FILE_SIZE | No | Max file size in bytes (default: 5242880) |

---

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message"
}
```

HTTP status codes:
- `200` - Success (GET)
- `201` - Created (POST)
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `500` - Internal Server Error

---

## Logging

Logs are output to console. For production, consider using:
- Winston for structured logging
- CloudWatch for AWS deployments
- LogDNA or Datadog for centralized logging

---

## License

MIT

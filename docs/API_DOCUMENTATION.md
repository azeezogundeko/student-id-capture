# Student Photo Capture System - API Documentation

## Base URL
```
http://localhost:5000
```

For production, replace with your deployed backend URL.

---

## Endpoints

### Health Check

#### `GET /health`
Check API health status.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "environment": "development"
}
```

---

### Classes

#### `GET /api/classes`
Retrieve all classes.

**Response:**
```json
{
  "success": true,
  "count": 3,
  "classes": [
    {
      "className": "JSS1 Jasper",
      "prefix": "JSS1 Jasper/"
    },
    {
      "className": "JSS1 Gold",
      "prefix": "JSS1 Gold/"
    },
    {
      "className": "SS2 Emerald",
      "prefix": "SS2 Emerald/"
    }
  ]
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Failed to list classes: <error message>"
}
```

---

#### `POST /api/classes`
Create a new class.

**Request Body:**
```json
{
  "className": "JSS1 Jasper"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Class created successfully",
  "class": {
    "success": true,
    "className": "JSS1 Jasper",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Responses:**
- **400 Bad Request:**
```json
{
  "success": false,
  "error": "Class name is required"
}
```

```json
{
  "success": false,
  "error": "Class name contains no valid characters"
}
```

- **500 Internal Server Error:**
```json
{
  "success": false,
  "error": "Failed to create class: <error message>"
}
```

---

### Students

#### `GET /api/students/:className`
Get all students in a specific class.

**URL Parameters:**
- `className` (string, required) - The name of the class (URL encoded)

**Example:**
```
GET /api/students/JSS1%20Jasper
```

**Response:**
```json
{
  "success": true,
  "className": "JSS1 Jasper",
  "count": 2,
  "students": [
    {
      "studentName": "John Doe",
      "key": "JSS1 Jasper/John Doe.jpeg",
      "size": 125678,
      "lastModified": "2024-01-15T10:30:00.000Z",
      "url": "https://student-photo-capture.s3.us-east-1.amazonaws.com/..."
    },
    {
      "studentName": "Jane Smith",
      "key": "JSS1 Jasper/Jane Smith.jpeg",
      "size": 134562,
      "lastModified": "2024-01-15T11:45:00.000Z",
      "url": "https://student-photo-capture.s3.us-east-1.amazonaws.com/..."
    }
  ]
}
```

**Notes:**
- Pre-signed URLs are valid for 1 hour
- URLs can be used to display images in the browser

**Error Responses:**
- **400 Bad Request:**
```json
{
  "success": false,
  "error": "Class name is required"
}
```

- **500 Internal Server Error:**
```json
{
  "success": false,
  "error": "Failed to list students: <error message>"
}
```

---

### Upload

#### `POST /api/upload`
Upload a student photo to S3.

**Content-Type:** `multipart/form-data`

**Form Data:**
- `className` (string, required) - The class name
- `studentName` (string, required) - The student's name
- `photo` (file, required) - The photo file (JPEG, PNG, or WebP)

**Example using cURL:**
```bash
curl -X POST http://localhost:5000/api/upload \
  -F "className=JSS1 Jasper" \
  -F "studentName=John Doe" \
  -F "photo=@/path/to/photo.jpg"
```

**Response:**
```json
{
  "success": true,
  "message": "Photo uploaded successfully",
  "data": {
    "className": "JSS1 Jasper",
    "studentName": "John Doe",
    "s3Key": "JSS1 Jasper/John Doe.jpeg",
    "url": "https://student-photo-capture.s3.us-east-1.amazonaws.com/JSS1%20Jasper/John%20Doe.jpeg"
  }
}
```

**Validation Rules:**
- Class name: alphanumeric, spaces, and hyphens only (max 100 characters)
- Student name: alphanumeric, spaces, and hyphens only (max 100 characters)
- File type: JPEG, PNG, or WebP only
- File size: Maximum 5MB (configurable via `MAX_FILE_SIZE` env variable)

**Error Responses:**
- **400 Bad Request:**
```json
{
  "success": false,
  "error": "Class name and student name are required"
}
```

```json
{
  "success": false,
  "error": "Photo file is required"
}
```

```json
{
  "success": false,
  "error": "Invalid file type. Only JPEG, PNG, and WebP images are allowed"
}
```

```json
{
  "success": false,
  "error": "File size exceeds maximum allowed size of 5MB"
}
```

```json
{
  "success": false,
  "error": "Class name contains no valid characters"
}
```

- **500 Internal Server Error:**
```json
{
  "success": false,
  "error": "Failed to upload photo: <error message>"
}
```

---

#### `POST /api/upload/presigned`
Generate a pre-signed URL for client-side upload (efficient for large files).

**Request Body:**
```json
{
  "className": "JSS1 Jasper",
  "studentName": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Pre-signed URL generated",
  "data": {
    "uploadUrl": "https://student-photo-capture.s3.us-east-1.amazonaws.com/...",
    "className": "JSS1 Jasper",
    "studentName": "John Doe",
    "expiresIn": 300
  }
}
```

**Usage:**
1. Request a pre-signed URL from this endpoint
2. Use the returned `uploadUrl` to upload directly to S3:

```javascript
// Example client-side upload
const response = await fetch(uploadUrl, {
  method: 'PUT',
  body: imageFile,
  headers: {
    'Content-Type': 'image/jpeg'
  }
});
```

**Notes:**
- Pre-signed URLs expire in 5 minutes
- Upload directly to S3 without going through the backend
- More efficient for large files

**Error Responses:**
- **400 Bad Request:**
```json
{
  "success": false,
  "error": "Class name and student name are required"
}
```

- **500 Internal Server Error:**
```json
{
  "success": false,
  "error": "Failed to generate upload URL: <error message>"
}
```

---

## Error Handling

All endpoints follow a consistent error response format:

```json
{
  "success": false,
  "error": "Error message here"
}
```

### HTTP Status Codes
- `200` - Success (GET requests)
- `201` - Created (POST requests)
- `400` - Bad Request (validation errors)
- `404` - Not Found (endpoint doesn't exist)
- `500` - Internal Server Error

---

## Security

### Input Validation
- All class names and student names are sanitized
- Special characters (except spaces and hyphens) are removed
- File types are validated (JPEG, PNG, WebP only)
- File sizes are limited (5MB default)

### CORS
The API uses CORS to allow requests from the frontend origin specified in `FRONTEND_URL` environment variable.

### S3 Security
- Backend uses IAM credentials with least-privilege access
- Pre-signed URLs have short expiration times
- All uploads are validated before processing

---

## Rate Limiting

Currently, no rate limiting is implemented. For production:
- Consider using `express-rate-limit`
- Implement per-IP rate limiting
- Set appropriate limits (e.g., 100 requests per 15 minutes)

---

## Testing with cURL

### Create a class:
```bash
curl -X POST http://localhost:5000/api/classes \
  -H "Content-Type: application/json" \
  -d '{"className":"JSS1 Jasper"}'
```

### List all classes:
```bash
curl http://localhost:5000/api/classes
```

### Upload a photo:
```bash
curl -X POST http://localhost:5000/api/upload \
  -F "className=JSS1 Jasper" \
  -F "studentName=John Doe" \
  -F "photo=@./photo.jpg"
```

### Get students in a class:
```bash
curl http://localhost:5000/api/students/JSS1%20Jasper
```

### Get pre-signed URL:
```bash
curl -X POST http://localhost:5000/api/upload/presigned \
  -H "Content-Type: application/json" \
  -d '{"className":"JSS1 Jasper","studentName":"John Doe"}'
```

---

## Environment Variables

Required environment variables for the backend:

```env
PORT=5000
NODE_ENV=production
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
S3_BUCKET_NAME=student-photo-capture
FRONTEND_URL=https://your-frontend.vercel.app
MAX_FILE_SIZE=5242880
```

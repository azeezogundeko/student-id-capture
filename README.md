# Student Photo Profile Capture System

A complete production-ready web application for capturing and managing student photos organized by class. Built with Next.js, Express, and AWS S3.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## Features

- **Class Management**: Create and manage multiple classes (e.g., JSS1 Jasper, SS2 Emerald)
- **Camera Capture**: Browser-based camera integration for instant photo capture
- **Student Photos**: Capture, name, and save student photos to AWS S3
- **Gallery View**: View all students in a class with their photos
- **Secure Storage**: Photos stored securely in AWS S3 with proper access controls
- **Pre-signed URLs**: Efficient file uploads using S3 pre-signed URLs
- **Input Validation**: Comprehensive validation and sanitization of all inputs
- **Mobile Responsive**: Works seamlessly on desktop, tablet, and mobile devices
- **Production Ready**: Complete with deployment guides, tests, and documentation

---

## Tech Stack

### Frontend
- **Framework**: Next.js 14 (React 18)
- **Styling**: Tailwind CSS
- **Camera**: React Webcam
- **HTTP Client**: Axios
- **Language**: TypeScript

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express
- **Cloud Storage**: AWS S3 (SDK v3)
- **Security**: Helmet, CORS
- **File Upload**: Multer

### Infrastructure
- **Storage**: AWS S3
- **Frontend Hosting**: Vercel
- **Backend Hosting**: Render / Railway / AWS EC2
- **Authentication**: IAM (AWS)

---

## Project Structure

```
student-id-capture/
├── frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/             # Next.js app router
│   │   │   ├── page.tsx     # Main application page
│   │   │   ├── layout.tsx   # Root layout
│   │   │   └── globals.css  # Global styles
│   │   ├── components/      # React components
│   │   │   ├── CameraCapture.tsx
│   │   │   ├── ClassSelector.tsx
│   │   │   └── StudentGallery.tsx
│   │   └── lib/             # Utilities and API client
│   │       └── api.ts
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   └── next.config.js
│
├── backend/                  # Express backend API
│   ├── src/
│   │   ├── server.js        # Main server file
│   │   ├── config/          # Configuration
│   │   │   └── s3.js        # S3 client setup
│   │   ├── controllers/     # Route controllers
│   │   │   ├── classController.js
│   │   │   ├── studentController.js
│   │   │   └── uploadController.js
│   │   ├── middleware/      # Express middleware
│   │   │   ├── errorHandler.js
│   │   │   └── upload.js
│   │   ├── routes/          # API routes
│   │   │   ├── classes.js
│   │   │   ├── students.js
│   │   │   └── upload.js
│   │   ├── services/        # Business logic
│   │   │   └── s3Service.js
│   │   └── utils/           # Utilities
│   │       └── validation.js
│   ├── tests/               # Test scripts
│   │   ├── test-upload.js   # Node.js test suite
│   │   └── test.sh          # Bash test script
│   ├── package.json
│   └── .env.example
│
└── docs/                     # Documentation
    ├── API_DOCUMENTATION.md
    ├── AWS_S3_SETUP.md
    ├── DEPLOYMENT.md
    └── Student_Photo_Capture_API.postman_collection.json
```

---

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- AWS Account with S3 access
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/student-id-capture.git
cd student-id-capture
```

### 2. Setup AWS S3

Follow the comprehensive guide in [docs/AWS_S3_SETUP.md](docs/AWS_S3_SETUP.md) to:
- Create an S3 bucket
- Configure IAM user with least-privilege access
- Set up CORS for browser uploads
- Get AWS credentials

**Quick S3 Setup:**
```bash
# Create bucket
aws s3 mb s3://student-photo-capture --region us-east-1

# Enable encryption
aws s3api put-bucket-encryption \
  --bucket student-photo-capture \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }]
  }'
```

### 3. Setup Backend

```bash
cd backend
npm install

# Create environment file
cp .env.example .env

# Edit .env with your credentials
nano .env
```

**Backend .env file:**
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

**Start backend:**
```bash
npm run dev
```

Backend will run at `http://localhost:5000`

### 4. Setup Frontend

```bash
cd frontend
npm install

# Create environment file
cp .env.example .env.local

# Edit .env.local
nano .env.local
```

**Frontend .env.local file:**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

**Start frontend:**
```bash
npm run dev
```

Frontend will run at `http://localhost:3000`

### 5. Test the Application

Open your browser and navigate to `http://localhost:3000`

**Test Flow:**
1. Create a class (e.g., "JSS1 Jasper")
2. Click on the class
3. Click "Add Student"
4. Allow camera permissions
5. Take a photo
6. Enter student name
7. Save to S3
8. View in gallery

---

## API Documentation

Complete API documentation is available in [docs/API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md)

### Quick API Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/api/classes` | GET | List all classes |
| `/api/classes` | POST | Create a class |
| `/api/students/:className` | GET | Get students in a class |
| `/api/upload` | POST | Upload student photo |
| `/api/upload/presigned` | POST | Get pre-signed upload URL |

### Example API Calls

**Create a class:**
```bash
curl -X POST http://localhost:5000/api/classes \
  -H "Content-Type: application/json" \
  -d '{"className":"JSS1 Jasper"}'
```

**Upload a photo:**
```bash
curl -X POST http://localhost:5000/api/upload \
  -F "className=JSS1 Jasper" \
  -F "studentName=John Doe" \
  -F "photo=@./photo.jpg"
```

**List students:**
```bash
curl http://localhost:5000/api/students/JSS1%20Jasper
```

---

## Testing

### Automated Tests (Node.js)

```bash
cd backend
npm test
```

This runs a comprehensive test suite that checks:
- Health check endpoint
- Class creation and listing
- Photo upload
- Student retrieval
- Pre-signed URL generation
- Input validation

### Manual Tests (Bash)

```bash
cd backend
chmod +x tests/test.sh
./tests/test.sh
```

### Postman Collection

Import the Postman collection from `docs/Student_Photo_Capture_API.postman_collection.json` for interactive API testing.

---

## Deployment

Complete deployment guides available in [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

### Quick Deployment

**Frontend to Vercel:**
```bash
cd frontend
npm install -g vercel
vercel
```

**Backend to Render:**
1. Push code to GitHub
2. Create new Web Service on [Render](https://render.com)
3. Connect repository
4. Add environment variables
5. Deploy

**Detailed guides for:**
- Vercel (Frontend)
- Render (Backend)
- Railway (Backend)
- AWS EC2 (Backend)
- Netlify (Frontend alternative)

---

## Security

### Input Validation
- Class names and student names are sanitized
- Only alphanumeric characters, spaces, and hyphens allowed
- Maximum 100 characters per field

### File Upload Security
- Only JPEG, PNG, and WebP images allowed
- 5MB file size limit (configurable)
- Files validated before upload

### S3 Security
- Least-privilege IAM policy
- Bucket not publicly accessible
- Pre-signed URLs with short expiration
- CORS configured for specific origins only

### Environment Variables
- Never commit `.env` files
- Use different credentials for dev/prod
- Rotate access keys regularly

---

## Environment Variables Reference

### Backend Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `production` |
| `AWS_ACCESS_KEY_ID` | AWS access key | `AKIAIOSFODNN7EXAMPLE` |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | `wJalrXUtnFEMI/K7MDENG...` |
| `AWS_REGION` | AWS region | `us-east-1` |
| `S3_BUCKET_NAME` | S3 bucket name | `student-photo-capture` |
| `FRONTEND_URL` | Frontend URL for CORS | `https://app.vercel.app` |
| `MAX_FILE_SIZE` | Max upload size (bytes) | `5242880` |

### Frontend Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:5000` |

---

## Troubleshooting

### Backend won't start

**Problem**: Port already in use
```
Solution: Change PORT in .env or kill process on port 5000
```

**Problem**: AWS credentials error
```
Solution: Verify AWS credentials in .env are correct
```

### Frontend can't connect to backend

**Problem**: CORS error
```
Solution: Add frontend URL to backend FRONTEND_URL environment variable
```

**Problem**: Network error
```
Solution: Verify backend is running and NEXT_PUBLIC_API_URL is correct
```

### Camera not working

**Problem**: Permission denied
```
Solution: Ensure site is served over HTTPS (required for camera access)
Check browser permissions for camera
```

### Upload failing

**Problem**: S3 access denied
```
Solution: Verify IAM policy includes PutObject permission
Check bucket name matches S3_BUCKET_NAME
```

### Images not loading

**Problem**: Pre-signed URL expired
```
Solution: Pre-signed URLs expire after 1 hour
Refresh the student list to get new URLs
```

---

## Browser Support

- **Chrome**: ✅ Latest
- **Firefox**: ✅ Latest
- **Safari**: ✅ Latest
- **Edge**: ✅ Latest
- **Mobile Safari**: ✅ iOS 12+
- **Chrome Mobile**: ✅ Android 8+

**Note**: Camera access requires HTTPS in production.

---

## Cost Estimates

### Development (Free Tier)
- Vercel: Free
- Render: Free (750 hours/month)
- AWS S3: ~$0 (within free tier for small usage)

### Production (Small School)
- Vercel: $0-20/month
- Render: $7/month (Starter plan)
- AWS S3: $0.005-1/month (depending on usage)
- **Total**: ~$7-28/month

### Scaling (Large School)
- Consider AWS CloudFront CDN for image delivery
- Upgrade Render plan for more resources
- Implement caching strategies

---

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License. See LICENSE file for details.

---

## Support & Documentation

- **API Documentation**: [docs/API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md)
- **AWS S3 Setup**: [docs/AWS_S3_SETUP.md](docs/AWS_S3_SETUP.md)
- **Deployment Guide**: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)
- **Postman Collection**: [docs/Student_Photo_Capture_API.postman_collection.json](docs/Student_Photo_Capture_API.postman_collection.json)

---

## Roadmap

Future enhancements:
- [ ] User authentication (admin login)
- [ ] Database integration (PostgreSQL/MongoDB)
- [ ] Bulk photo upload
- [ ] Export class roster as PDF
- [ ] Search and filter students
- [ ] Photo editing tools (crop, rotate)
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Analytics dashboard
- [ ] Backup and restore functionality

---

## Credits

Built with:
- [Next.js](https://nextjs.org/)
- [Express](https://expressjs.com/)
- [AWS SDK for JavaScript](https://aws.amazon.com/sdk-for-javascript/)
- [React Webcam](https://github.com/mozmorris/react-webcam)
- [Tailwind CSS](https://tailwindcss.com/)

---

## Contact

For questions, issues, or feature requests, please open an issue on GitHub.

---

**Made with ❤️ for schools**

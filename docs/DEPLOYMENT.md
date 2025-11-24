# Deployment Guide

This guide covers deploying the Student Photo Capture System to production.

---

## Architecture Overview

```
Frontend (Next.js)          Backend (Node.js/Express)      Storage
    Vercel          →          Render/Railway         →     AWS S3
                               /AWS EC2
```

---

## Prerequisites

- AWS S3 bucket configured (see [AWS_S3_SETUP.md](./AWS_S3_SETUP.md))
- GitHub account (for connecting repositories)
- Domain name (optional, for custom domains)

---

## Part 1: Deploy Backend

We'll cover three deployment options for the backend.

---

### Option A: Deploy to Render (Recommended)

Render offers a generous free tier and easy deployment.

#### Steps:

1. **Push your code to GitHub:**
   ```bash
   cd backend
   git init
   git add .
   git commit -m "Initial backend commit"
   git remote add origin https://github.com/yourusername/student-photo-backend.git
   git push -u origin main
   ```

2. **Sign up at [Render](https://render.com)**

3. **Create a new Web Service:**
   - Click **"New +"** → **"Web Service"**
   - Connect your GitHub repository
   - Select the backend repository

4. **Configure the service:**
   - **Name:** `student-photo-capture-api`
   - **Environment:** `Node`
   - **Region:** Choose closest to your users
   - **Branch:** `main`
   - **Root Directory:** Leave empty (or `backend` if using monorepo)
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free tier is sufficient

5. **Add Environment Variables:**
   Click **"Environment"** and add:
   ```
   NODE_ENV=production
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   AWS_REGION=us-east-1
   S3_BUCKET_NAME=student-photo-capture
   FRONTEND_URL=https://your-app.vercel.app
   MAX_FILE_SIZE=5242880
   ```

6. **Deploy:**
   - Click **"Create Web Service"**
   - Wait for deployment to complete
   - Note your backend URL: `https://student-photo-capture-api.onrender.com`

#### Health Check:
```bash
curl https://student-photo-capture-api.onrender.com/health
```

---

### Option B: Deploy to Railway

Railway offers automatic deployments and easy scaling.

#### Steps:

1. **Sign up at [Railway](https://railway.app)**

2. **Create a new project:**
   - Click **"New Project"**
   - Select **"Deploy from GitHub repo"**
   - Authorize Railway to access your repository
   - Select your backend repository

3. **Configure deployment:**
   - Railway auto-detects Node.js
   - Set root directory to `backend` if using monorepo

4. **Add Environment Variables:**
   - Go to **"Variables"** tab
   - Add the same environment variables as Render (above)

5. **Generate Domain:**
   - Go to **"Settings"** → **"Networking"**
   - Click **"Generate Domain"**
   - Note your backend URL

6. **Deploy:**
   - Railway automatically deploys on push to main branch

---

### Option C: Deploy to AWS EC2

For full control and potentially lower costs at scale.

#### Steps:

1. **Launch EC2 Instance:**
   ```bash
   # Using AWS CLI
   aws ec2 run-instances \
     --image-id ami-0c55b159cbfafe1f0 \
     --instance-type t2.micro \
     --key-name your-key-pair \
     --security-groups student-photo-sg
   ```

2. **Configure Security Group:**
   Allow inbound traffic:
   - Port 22 (SSH)
   - Port 5000 (API)
   - Port 80/443 (if using reverse proxy)

3. **SSH into instance:**
   ```bash
   ssh -i your-key.pem ec2-user@your-ec2-ip
   ```

4. **Install Node.js:**
   ```bash
   curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
   sudo yum install -y nodejs
   node --version
   ```

5. **Clone and setup:**
   ```bash
   git clone https://github.com/yourusername/student-photo-backend.git
   cd student-photo-backend
   npm install
   ```

6. **Create environment file:**
   ```bash
   nano .env
   # Add your environment variables
   ```

7. **Install PM2 (process manager):**
   ```bash
   sudo npm install -g pm2
   pm2 start src/server.js --name student-photo-api
   pm2 startup
   pm2 save
   ```

8. **Setup Nginx reverse proxy (optional):**
   ```bash
   sudo yum install -y nginx
   sudo nano /etc/nginx/conf.d/student-photo.conf
   ```

   Add:
   ```nginx
   server {
     listen 80;
     server_name your-domain.com;

     location / {
       proxy_pass http://localhost:5000;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_cache_bypass $http_upgrade;
     }
   }
   ```

   ```bash
   sudo systemctl start nginx
   sudo systemctl enable nginx
   ```

9. **Setup SSL with Let's Encrypt:**
   ```bash
   sudo yum install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

---

## Part 2: Deploy Frontend

### Deploy to Vercel (Recommended)

Vercel is the creator of Next.js and offers seamless deployment.

#### Steps:

1. **Push frontend to GitHub:**
   ```bash
   cd frontend
   git init
   git add .
   git commit -m "Initial frontend commit"
   git remote add origin https://github.com/yourusername/student-photo-frontend.git
   git push -u origin main
   ```

2. **Sign up at [Vercel](https://vercel.com)**

3. **Import project:**
   - Click **"Add New"** → **"Project"**
   - Import your GitHub repository
   - Vercel auto-detects Next.js

4. **Configure project:**
   - **Framework Preset:** Next.js
   - **Root Directory:** Leave empty (or `frontend` if monorepo)
   - **Build Command:** `npm run build` (auto-detected)
   - **Output Directory:** `.next` (auto-detected)

5. **Add Environment Variables:**
   ```
   NEXT_PUBLIC_API_URL=https://student-photo-capture-api.onrender.com
   ```

6. **Deploy:**
   - Click **"Deploy"**
   - Wait for build to complete
   - Note your frontend URL: `https://your-app.vercel.app`

7. **Update Backend CORS:**
   Go back to your backend deployment and update the `FRONTEND_URL` environment variable:
   ```
   FRONTEND_URL=https://your-app.vercel.app
   ```

#### Custom Domain (Optional):
1. Go to **"Settings"** → **"Domains"**
2. Add your custom domain
3. Follow DNS configuration instructions

---

### Alternative: Deploy to Netlify

#### Steps:

1. **Sign up at [Netlify](https://netlify.com)**

2. **Import from Git:**
   - Click **"Add new site"** → **"Import an existing project"**
   - Connect to GitHub
   - Select your frontend repository

3. **Configure build:**
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
   - **Environment variables:**
     ```
     NEXT_PUBLIC_API_URL=https://your-backend-url.com
     ```

4. **Deploy:**
   - Click **"Deploy site"**
   - Wait for deployment to complete

---

## Part 3: Update S3 CORS

After deploying, update your S3 CORS configuration to include production URLs:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "HEAD"],
    "AllowedOrigins": [
      "http://localhost:3000",
      "https://your-app.vercel.app",
      "https://your-custom-domain.com"
    ],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

---

## Part 4: Post-Deployment Checklist

### Backend:
- [ ] Health check endpoint returns 200
- [ ] API endpoints are accessible
- [ ] Environment variables are set correctly
- [ ] S3 connection is working
- [ ] CORS allows frontend origin
- [ ] Logs are being generated

### Frontend:
- [ ] Application loads without errors
- [ ] Can connect to backend API
- [ ] Camera permissions work
- [ ] Can create classes
- [ ] Can capture and upload photos
- [ ] Can view student gallery
- [ ] Images load from S3

### Security:
- [ ] HTTPS is enabled
- [ ] Environment variables are secure
- [ ] S3 bucket is not public
- [ ] CORS is configured correctly
- [ ] No credentials in code/logs

---

## Part 5: Monitoring & Maintenance

### Render Monitoring:
- Dashboard shows metrics (CPU, memory, requests)
- View logs in real-time
- Set up email alerts for failures

### Railway Monitoring:
- Built-in metrics dashboard
- Real-time logs
- Usage and cost tracking

### AWS CloudWatch (for EC2):
```bash
# Install CloudWatch agent
sudo yum install amazon-cloudwatch-agent

# Configure monitoring
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-config-wizard
```

### Application Logging:
Add Winston logger to backend:

```bash
npm install winston
```

Update `src/server.js`:
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}
```

---

## Part 6: Continuous Deployment

### GitHub Actions (Automated deployment)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: backend
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
      # Render auto-deploys on push

  deploy-frontend:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: frontend
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      # Vercel auto-deploys on push
```

---

## Part 7: Scaling Considerations

### When traffic increases:

1. **Backend Scaling:**
   - **Render:** Upgrade to paid plan for more instances
   - **Railway:** Auto-scales based on traffic
   - **AWS:** Use ECS/Fargate for container orchestration or Auto Scaling Groups

2. **Frontend Scaling:**
   - Vercel auto-scales globally
   - No action needed for most use cases

3. **S3 Optimization:**
   - Enable CloudFront CDN for faster image delivery
   - Use S3 Intelligent-Tiering for cost optimization
   - Implement image optimization (WebP, compression)

4. **Database (if needed in future):**
   - Add PostgreSQL/MongoDB for metadata
   - Use managed services (RDS, MongoDB Atlas)

---

## Part 8: Backup Strategy

### Automated S3 Backups:

1. **Enable Versioning:**
   ```bash
   aws s3api put-bucket-versioning \
     --bucket student-photo-capture \
     --versioning-configuration Status=Enabled
   ```

2. **Cross-Region Replication:**
   ```bash
   # Create backup bucket in different region
   aws s3 mb s3://student-photo-capture-backup --region us-west-2

   # Setup replication rule
   aws s3api put-bucket-replication \
     --bucket student-photo-capture \
     --replication-configuration file://replication.json
   ```

3. **Automated Snapshots (EBS for EC2):**
   ```bash
   aws dlm create-lifecycle-policy \
     --execution-role-arn arn:aws:iam::ACCOUNT_ID:role/DLMRole \
     --description "Daily EC2 snapshots" \
     --state ENABLED \
     --policy-details file://snapshot-policy.json
   ```

---

## Troubleshooting

### Issue: "Cannot connect to backend"

**Solutions:**
1. Check backend URL in frontend environment variables
2. Verify backend is running: `curl https://your-backend/health`
3. Check CORS configuration
4. View backend logs for errors

### Issue: "Camera not working"

**Solutions:**
1. Ensure frontend is served over HTTPS (required for camera access)
2. Check browser permissions
3. Test on different browsers/devices

### Issue: "Upload failing"

**Solutions:**
1. Check S3 credentials in backend environment
2. Verify IAM permissions
3. Check file size limits
4. View backend logs for specific errors

---

## Cost Estimates

### Render (Backend):
- Free tier: 750 hours/month (sufficient for one instance)
- Starter: $7/month for persistent instance

### Vercel (Frontend):
- Hobby: Free (perfect for small schools)
- Pro: $20/month (for custom domains, more bandwidth)

### AWS S3:
- ~$0.023/GB/month
- Example: 1000 students × 200KB = $0.005/month

### Total Monthly Cost:
- **Free tier:** $0 (with limitations)
- **Production:** ~$10-30/month

---

## Support Resources

- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [AWS EC2 Documentation](https://docs.aws.amazon.com/ec2/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

---

## Next Steps

After deployment:
1. Test all functionality in production
2. Monitor logs and metrics
3. Set up alerts for errors
4. Create admin user accounts
5. Train school administrators
6. Gather user feedback

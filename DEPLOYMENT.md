# Deployment Instructions for Student Photo Capture System

## Issue Diagnosis

The "page not found" error was caused by **two critical issues**:

1. **Missing environment variables** - The `.env` file wasn't created, which means Docker Compose couldn't load the required S3 and admin authentication credentials.
2. **Domain routing conflict** - Both frontend and backend were using the same domain with conflicting Traefik rules, causing routing issues.

## Fixed Issues

1. ✅ Added `ADMIN_PASSWORD` and `JWT_SECRET` to docker-compose.yml
2. ✅ Created `.env` file with all required configuration variables
3. ✅ **Implemented subdomain routing** for proper Traefik configuration:
   - **Frontend**: `studentscapture.boboyii.app`
   - **Backend API**: `api.studentscapture.boboyii.app`
4. ✅ Updated API URL configuration in frontend to use correct backend subdomain
5. ✅ Removed unnecessary port mappings (Traefik connects via Docker network)

## Deployment Steps

### 1. Configure DNS Records

**IMPORTANT**: You need to add a DNS A record for the API subdomain:

```
api.studentscapture.boboyii.app → [Your Server IP]
```

This should point to the same IP as your main domain. In your DNS provider:
- **Record Type**: A
- **Name**: `api.studentscapture` or `api`
- **Value**: Your server's IP address
- **TTL**: 300 (or your preference)

### 2. Configure Environment Variables

Edit the `.env` file in the project root and replace the placeholder values with your actual credentials:

```bash
# S3 Configuration - REQUIRED
AWS_ACCESS_KEY_ID=your_actual_access_key_id
AWS_SECRET_ACCESS_KEY=your_actual_secret_access_key
AWS_REGION=us-east-1  # or your S3 region
S3_BUCKET_NAME=your-bucket-name

# S3 Endpoint URL - REQUIRED for S3-compatible services
# Remove or leave empty if using AWS S3
S3_ENDPOINT_URL=https://your-actual-s3-endpoint.com

# Admin Credentials
ADMIN_PASSWORD=EngrOgundeko  # Keep this or change to your preferred password
JWT_SECRET=your_secure_random_string_min_32_characters  # Change this to a secure random string
```

### 2. Upload .env File to Server

Upload the configured `.env` file to your server in the project root directory:

```bash
scp .env your-server:/path/to/student-id-capture/.env
```

Or if you're already on the server, create it directly:

```bash
nano /path/to/student-id-capture/.env
# Paste the content and save
```

### 3. Rebuild and Restart Containers

On your server, navigate to the project directory and rebuild the containers:

```bash
cd /path/to/student-id-capture

# Stop existing containers
docker compose down

# Rebuild images (required after code changes)
docker compose build --no-cache

# Start containers
docker compose up -d

# Check container status
docker compose ps

# Check logs for any errors
docker compose logs -f
```

### 4. Verify Deployment

Run these commands on your server to verify everything is working:

```bash
# Check if containers are running
docker compose ps

# Check backend health
curl http://localhost:5000/health

# Check frontend
curl -I http://localhost:3006

# View backend logs
docker compose logs backend --tail=50

# View frontend logs
docker compose logs frontend --tail=50
```

## Troubleshooting

### If containers fail to start:

1. **Check S3 credentials:**
   ```bash
   docker compose exec backend env | grep -E "S3|AWS"
   ```

2. **Check backend logs for errors:**
   ```bash
   docker compose logs backend
   ```

3. **Verify .env file is loaded:**
   ```bash
   cat .env
   ```

### If "page not found" persists:

1. **Check Traefik routing:**
   ```bash
   docker logs traefik --tail=50
   ```

2. **Verify DNS points to your server:**
   ```bash
   nslookup studentscapture.boboyii.app
   ```

3. **Check if dokploy-network exists:**
   ```bash
   docker network ls | grep dokploy
   ```

4. **Verify containers are on the network:**
   ```bash
   docker network inspect dokploy-network
   ```

### Common Issues:

- **S3 connection errors**: Verify S3_ENDPOINT_URL, credentials, and bucket name
- **Container crashes**: Check logs with `docker compose logs [service-name]`
- **Traefik not routing**: Ensure dokploy-network exists and containers are connected
- **Health check failures**: Wait 30 seconds for health checks to pass

## Testing the Application

Once deployed successfully:

1. **Access the frontend:** https://studentscapture.boboyii.app
2. **Verify API endpoint:** https://api.studentscapture.boboyii.app/health (should return `{"status":"ok"}`)
3. **Test camera capture:** Allow camera permissions when prompted
4. **Create a class:** e.g., "JSS1 Jasper"
5. **Capture photos:** Take photos of students
6. **Access admin dashboard:** https://studentscapture.boboyii.app/admin
   - Password: `EngrOgundeko` (or what you set in .env)
7. **Test downloads:** Download individual images or entire classes as ZIP

## Security Notes

⚠️ **IMPORTANT:**

1. **Never commit the `.env` file to git** - It contains sensitive credentials
2. **Change JWT_SECRET** to a secure random string (at least 32 characters)
3. **Use strong S3 credentials** with minimal required permissions
4. **Keep ADMIN_PASSWORD secure** - Consider changing it from the default
5. **Enable S3 bucket encryption** for storing student photos
6. **Regularly backup your S3 bucket**

## Support

If you encounter any issues:

1. Run the troubleshooting script: `./troubleshoot.sh` (requires Docker on the machine)
2. Check Docker Compose logs: `docker compose logs`
3. Verify environment variables: `docker compose config`
4. Check container health: `docker compose ps`

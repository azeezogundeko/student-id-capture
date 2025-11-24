# Docker Deployment Guide

Complete guide for deploying the Student Photo Capture System using Docker and Docker Compose with Traefik reverse proxy.

---

## Overview

This deployment uses:
- **Docker Compose** for container orchestration
- **Traefik** as reverse proxy with automatic SSL (Let's Encrypt)
- **Dokploy Network** for container networking
- **Domain**: `studentscapture.boboyii.app`

---

## Architecture

```
Internet
    ↓
Traefik (Reverse Proxy + SSL)
    ↓
┌─────────────────────────────────┐
│  dokploy-network                │
│                                 │
│  ┌──────────────────────────┐  │
│  │  Frontend (Next.js)      │  │
│  │  Port: 3000              │  │
│  │  studentscapture.        │  │
│  │  boboyii.app             │  │
│  └──────────────────────────┘  │
│             ↓                   │
│  ┌──────────────────────────┐  │
│  │  Backend (Express)       │  │
│  │  Port: 5000              │  │
│  │  /api/* /health          │  │
│  └──────────────────────────┘  │
│             ↓                   │
│         AWS S3                  │
└─────────────────────────────────┘
```

---

## Prerequisites

- Docker 20.10+ installed
- Docker Compose 2.0+ installed
- Traefik configured with Let's Encrypt
- Dokploy network created
- AWS S3 bucket configured
- Domain DNS pointing to your server

### Verify Prerequisites

```bash
# Check Docker
docker --version
docker compose version

# Check if dokploy-network exists
docker network ls | grep dokploy-network

# If not, create it
docker network create dokploy-network
```

---

## Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/student-id-capture.git
cd student-id-capture
```

### 2. Configure Environment Variables

```bash
# Copy environment template
cp .env.example .env

# Edit with your AWS credentials
nano .env
```

**Required Environment Variables:**

```env
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_REGION=us-east-1
S3_BUCKET_NAME=student-photo-capture

# Optional Configuration
MAX_FILE_SIZE=5242880
```

### 3. Build and Deploy

```bash
# Build and start containers
docker compose up -d

# View logs
docker compose logs -f

# Check status
docker compose ps
```

### 4. Verify Deployment

```bash
# Check backend health
curl https://studentscapture.boboyii.app/health

# Check frontend
curl https://studentscapture.boboyii.app
```

---

## Docker Compose Configuration

### Services

#### Backend Service
- **Image**: Built from `./backend/Dockerfile`
- **Port**: 5000 (internal)
- **URL**: `https://studentscapture.boboyii.app/api/*`
- **Healthcheck**: Every 30s via `/health` endpoint

#### Frontend Service
- **Image**: Built from `./frontend/prod.Dockerfile`
- **Port**: 3000 (internal)
- **URL**: `https://studentscapture.boboyii.app`
- **Depends on**: Backend service (waits for healthy status)

### Traefik Labels

#### Backend Labels
```yaml
# Route API requests
- "traefik.http.routers.student-capture-api.rule=Host(`studentscapture.boboyii.app`) && PathPrefix(`/api`, `/health`)"

# Enable HTTPS with Let's Encrypt
- "traefik.http.routers.student-capture-api.entrypoints=websecure"
- "traefik.http.routers.student-capture-api.tls.certResolver=letsencrypt"

# CORS middleware
- "traefik.http.middlewares.student-capture-cors.headers.accesscontrolalloworiginlist=https://studentscapture.boboyii.app"
```

#### Frontend Labels
```yaml
# Route all other requests to frontend
- "traefik.http.routers.student-capture-app.rule=Host(`studentscapture.boboyii.app`)"

# Security headers
- "traefik.http.middlewares.student-capture-security.headers.stsSeconds=31536000"
- "traefik.http.middlewares.student-capture-security.headers.framedeny=true"
```

---

## DNS Configuration

Point your domain to your server:

```
A Record:
  Name: studentscapture.boboyii.app
  Type: A
  Value: YOUR_SERVER_IP
  TTL: 3600
```

Or if using a subdomain:

```
A Record:
  Name: studentscapture
  Type: A
  Value: YOUR_SERVER_IP
  TTL: 3600
```

---

## SSL Certificate

Traefik automatically obtains SSL certificates from Let's Encrypt.

**Requirements:**
- Domain must resolve to your server
- Port 80 and 443 must be accessible
- Traefik must be configured with Let's Encrypt resolver

**Verify SSL:**
```bash
curl -I https://studentscapture.boboyii.app
# Should show: HTTP/2 200
```

---

## Docker Commands

### Start Services
```bash
# Start in detached mode
docker compose up -d

# Start with rebuild
docker compose up -d --build

# Start specific service
docker compose up -d frontend
```

### Stop Services
```bash
# Stop all services
docker compose down

# Stop and remove volumes
docker compose down -v

# Stop specific service
docker compose stop backend
```

### View Logs
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f frontend
docker compose logs -f backend

# Last 100 lines
docker compose logs --tail=100
```

### Restart Services
```bash
# Restart all
docker compose restart

# Restart specific service
docker compose restart backend
```

### Execute Commands
```bash
# Open shell in backend
docker compose exec backend sh

# Run Node.js script
docker compose exec backend node -v

# Check backend environment
docker compose exec backend env
```

### Health Status
```bash
# Check health status
docker compose ps

# Inspect container
docker inspect student-id-capture-backend-1
```

---

## Monitoring

### Container Status
```bash
# View running containers
docker compose ps

# View resource usage
docker stats

# View container logs
docker compose logs -f --tail=100
```

### Health Checks

Both services have built-in health checks:

**Backend:**
```bash
docker compose exec backend wget -q -O- http://localhost:5000/health
```

**Frontend:**
```bash
docker compose exec frontend wget -q -O- http://localhost:3000
```

### Application Logs

**Backend logs:**
```bash
docker compose logs -f backend | grep -i error
```

**Frontend logs:**
```bash
docker compose logs -f frontend | grep -i error
```

---

## Updating the Application

### Pull Latest Changes
```bash
# Pull from git
git pull origin main

# Rebuild and restart
docker compose up -d --build

# Check logs
docker compose logs -f
```

### Update Single Service
```bash
# Update only backend
docker compose up -d --build backend

# Update only frontend
docker compose up -d --build frontend
```

---

## Troubleshooting

### Issue: Containers Won't Start

**Check logs:**
```bash
docker compose logs
```

**Common causes:**
- Missing environment variables
- Port conflicts
- Network issues

**Solution:**
```bash
# Remove containers and start fresh
docker compose down -v
docker compose up -d --build
```

### Issue: SSL Certificate Not Working

**Verify domain resolves:**
```bash
nslookup studentscapture.boboyii.app
```

**Check Traefik logs:**
```bash
docker logs traefik
```

**Solution:**
- Ensure domain points to server
- Wait a few minutes for DNS propagation
- Check Traefik Let's Encrypt configuration

### Issue: Backend Can't Connect to S3

**Check environment variables:**
```bash
docker compose exec backend env | grep AWS
```

**Test S3 connection:**
```bash
docker compose exec backend node -e "
const { S3Client, ListBucketsCommand } = require('@aws-sdk/client-s3');
const client = new S3Client({ region: process.env.AWS_REGION });
client.send(new ListBucketsCommand({}))
  .then(() => console.log('S3 connection successful'))
  .catch(err => console.error('S3 error:', err));
"
```

### Issue: Frontend Can't Reach Backend

**Check network connectivity:**
```bash
docker compose exec frontend ping backend
```

**Verify environment variable:**
```bash
docker compose exec frontend env | grep NEXT_PUBLIC_API_URL
```

**Solution:**
- Rebuild frontend with correct API URL
- Check Traefik routing configuration

### Issue: CORS Errors

**Check CORS middleware:**
```bash
curl -I -X OPTIONS https://studentscapture.boboyii.app/api/classes \
  -H "Origin: https://studentscapture.boboyii.app"
```

**Update CORS configuration:**
Edit `docker-compose.yml` and update:
```yaml
- "traefik.http.middlewares.student-capture-cors.headers.accesscontrolalloworiginlist=https://studentscapture.boboyii.app"
```

### Issue: Out of Disk Space

**Check disk usage:**
```bash
df -h
docker system df
```

**Clean up:**
```bash
# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Complete cleanup
docker system prune -a --volumes
```

---

## Backup and Restore

### Backup Docker Volumes
```bash
# List volumes
docker volume ls

# Backup (if using volumes)
docker run --rm -v student-id-capture_data:/data -v $(pwd):/backup alpine tar czf /backup/backup.tar.gz /data
```

### Backup S3 Data
```bash
# Sync S3 bucket to local
aws s3 sync s3://student-photo-capture ./backup/s3-backup/
```

### Restore
```bash
# Restore volume
docker run --rm -v student-id-capture_data:/data -v $(pwd):/backup alpine tar xzf /backup/backup.tar.gz

# Restore S3
aws s3 sync ./backup/s3-backup/ s3://student-photo-capture
```

---

## Performance Optimization

### Resource Limits

Add to `docker-compose.yml`:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M

  frontend:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

### Caching

Docker uses layer caching. To optimize builds:

1. Copy package files first
2. Install dependencies
3. Copy application code last

This ensures dependency installation is cached.

---

## Security Best Practices

### 1. Use Non-Root Users
Both Dockerfiles create and use non-root users:
- Backend: `expressjs` user
- Frontend: `nextjs` user

### 2. Environment Variables
Never commit `.env` files:
```bash
# Ensure .env is in .gitignore
echo ".env" >> .gitignore
```

### 3. Security Headers
Traefik adds security headers:
- HSTS (HTTP Strict Transport Security)
- Frame-Deny
- Content-Type-Nosniff
- XSS Protection

### 4. Network Isolation
Services communicate via internal Docker network, not exposed ports.

### 5. Regular Updates
```bash
# Update Docker images
docker compose pull

# Rebuild with latest base images
docker compose build --pull
```

---

## Scaling

### Horizontal Scaling

Scale frontend instances:
```bash
docker compose up -d --scale frontend=3
```

**Note:** Requires load balancer configuration in Traefik.

### Vertical Scaling

Increase resources in `docker-compose.yml`:
```yaml
deploy:
  resources:
    limits:
      cpus: '2.0'
      memory: 2G
```

---

## Production Checklist

- [ ] Domain DNS configured
- [ ] SSL certificate working (HTTPS)
- [ ] Environment variables set
- [ ] AWS S3 bucket configured
- [ ] S3 CORS configured for domain
- [ ] Health checks passing
- [ ] Logs being monitored
- [ ] Backup strategy in place
- [ ] Resource limits configured
- [ ] Security headers active
- [ ] Non-root users in containers

---

## Monitoring and Logging

### Docker Compose Logs

```bash
# View all logs
docker compose logs -f

# Specific timeframe
docker compose logs --since 1h

# Save logs to file
docker compose logs > logs.txt
```

### External Monitoring

Consider integrating:
- **Prometheus** for metrics
- **Grafana** for visualization
- **ELK Stack** for log aggregation
- **Uptime Robot** for availability monitoring

---

## Cost Optimization

### Resource Usage

Monitor resource usage:
```bash
docker stats --no-stream

# Example output:
# CONTAINER    CPU %    MEM USAGE / LIMIT    MEM %
# backend      1.5%     128MiB / 512MiB     25%
# frontend     2.0%     256MiB / 1GiB       25%
```

### Optimization Tips

1. **Use Alpine images** (already implemented)
2. **Multi-stage builds** (already implemented)
3. **Minimize layers** in Dockerfiles
4. **Clean up after installations**
5. **Use .dockerignore** (already implemented)

---

## Support

For issues or questions:
- Check logs: `docker compose logs -f`
- Review Docker documentation
- Check GitHub issues
- Verify environment configuration

---

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Traefik Documentation](https://doc.traefik.io/traefik/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [Dokploy Documentation](https://dokploy.com/docs)

---

## Next Steps

1. Configure DNS for `studentscapture.boboyii.app`
2. Set up AWS S3 bucket and credentials
3. Create `.env` file with AWS credentials
4. Deploy with `docker compose up -d`
5. Verify SSL certificate is active
6. Test the application
7. Set up monitoring and backups

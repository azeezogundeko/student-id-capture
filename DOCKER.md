# Docker Quick Start Guide

Quick reference for deploying the Student Photo Capture System with Docker.

---

## Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- Domain configured: `studentscapture.boboyii.app`
- AWS S3 bucket ready

---

## Quick Deploy (3 Steps)

### 1. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your AWS credentials:
```env
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_REGION=us-east-1
S3_BUCKET_NAME=student-photo-capture
MAX_FILE_SIZE=5242880
```

### 2. Deploy

```bash
docker compose up -d
```

### 3. Verify

```bash
# Check status
docker compose ps

# View logs
docker compose logs -f

# Test endpoints
curl https://studentscapture.boboyii.app/health
curl https://studentscapture.boboyii.app
```

---

## Services

### Frontend
- **URL**: https://studentscapture.boboyii.app
- **Port**: 3000 (internal)
- **Image**: Built from `frontend/prod.Dockerfile`

### Backend
- **URL**: https://studentscapture.boboyii.app/api
- **Port**: 5000 (internal)
- **Image**: Built from `backend/Dockerfile`

---

## Common Commands

```bash
# Start services
docker compose up -d

# Stop services
docker compose down

# Restart services
docker compose restart

# View logs
docker compose logs -f

# View specific service logs
docker compose logs -f frontend
docker compose logs -f backend

# Rebuild and restart
docker compose up -d --build

# Check health
docker compose ps
```

---

## Architecture

```
Internet → Traefik (SSL/TLS) → Frontend (Next.js)
                              ↓
                            Backend (Express) → AWS S3
```

**Network**: `dokploy-network` (external)

---

## SSL/TLS

Traefik automatically provisions SSL certificates via Let's Encrypt.

**Requirements:**
- Domain resolves to your server
- Ports 80 and 443 accessible
- Traefik configured with Let's Encrypt

---

## Environment Variables

### Required
- `AWS_ACCESS_KEY_ID` - AWS access key
- `AWS_SECRET_ACCESS_KEY` - AWS secret key
- `AWS_REGION` - AWS region (e.g., us-east-1)
- `S3_BUCKET_NAME` - S3 bucket name

### Optional
- `MAX_FILE_SIZE` - Max upload size in bytes (default: 5242880)

---

## Troubleshooting

### Services won't start
```bash
# Check logs
docker compose logs

# Verify environment
docker compose config

# Restart fresh
docker compose down -v
docker compose up -d --build
```

### SSL not working
```bash
# Verify DNS
nslookup studentscapture.boboyii.app

# Check Traefik logs
docker logs traefik
```

### Can't connect to S3
```bash
# Check AWS credentials
docker compose exec backend env | grep AWS

# Test S3 connection
docker compose exec backend node -e "console.log(process.env.AWS_REGION)"
```

---

## Monitoring

### Health Checks
```bash
# Backend health
curl https://studentscapture.boboyii.app/health

# Frontend health
curl -I https://studentscapture.boboyii.app
```

### Resource Usage
```bash
docker stats
```

### Logs
```bash
# All services
docker compose logs -f

# Last 100 lines
docker compose logs --tail=100

# Specific service
docker compose logs -f backend

# Search logs
docker compose logs | grep -i error
```

---

## Updating

```bash
# Pull latest code
git pull

# Rebuild and restart
docker compose up -d --build

# Verify
docker compose ps
```

---

## Backup

### S3 Data
```bash
aws s3 sync s3://student-photo-capture ./backup/
```

### Docker Volumes (if using)
```bash
docker run --rm -v volume_name:/data -v $(pwd):/backup alpine tar czf /backup/backup.tar.gz /data
```

---

## Complete Documentation

For detailed information, see [docs/DOCKER_DEPLOYMENT.md](docs/DOCKER_DEPLOYMENT.md)

---

## Support

**Issues?**
1. Check logs: `docker compose logs -f`
2. Verify environment variables: `docker compose config`
3. Review documentation: [docs/DOCKER_DEPLOYMENT.md](docs/DOCKER_DEPLOYMENT.md)
4. Check GitHub issues

**Quick Fix:**
```bash
docker compose down -v
docker compose up -d --build
```

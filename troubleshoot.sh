#!/bin/bash

# Troubleshooting Script for Student Photo Capture System

echo "==================================="
echo "Student Photo Capture Diagnostics"
echo "==================================="
echo ""

# Check if Docker Compose is running
echo "1. Checking Docker Compose services..."
docker compose ps
echo ""

# Check container logs
echo "2. Checking backend logs (last 50 lines)..."
docker compose logs --tail=50 backend
echo ""

echo "3. Checking frontend logs (last 50 lines)..."
docker compose logs --tail=50 frontend
echo ""

# Check health status
echo "4. Checking container health..."
docker inspect --format='{{.State.Health.Status}}' $(docker compose ps -q backend) 2>/dev/null || echo "Backend health check not available"
docker inspect --format='{{.State.Health.Status}}' $(docker compose ps -q frontend) 2>/dev/null || echo "Frontend health check not available"
echo ""

# Check if ports are exposed
echo "5. Checking exposed ports..."
docker compose ps | grep -E "backend|frontend"
echo ""

# Check Traefik routing (if accessible)
echo "6. Testing backend health endpoint..."
curl -s http://localhost:5000/health || echo "Backend not accessible on localhost:5000"
echo ""

echo "7. Testing frontend..."
curl -s -I http://localhost:3006 || echo "Frontend not accessible on localhost:3006"
echo ""

# Check environment variables
echo "8. Checking backend environment variables..."
docker compose exec backend env | grep -E "S3|AWS|PORT|NODE_ENV" || echo "Cannot access backend environment"
echo ""

echo "==================================="
echo "Diagnostics Complete"
echo "==================================="

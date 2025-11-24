#!/bin/bash

echo "==================================="
echo "Frontend Routing Diagnostics"
echo "==================================="
echo ""

echo "1. Checking if frontend container is on dokploy-network..."
docker network inspect dokploy-network --format '{{range .Containers}}{{.Name}} {{end}}' | grep -o 'frontend' || echo "❌ Frontend NOT on dokploy-network!"
echo ""

echo "2. Checking Traefik labels on frontend container..."
docker inspect $(docker compose ps -q frontend) --format '{{range $key, $value := .Config.Labels}}{{$key}}: {{$value}}{{"\n"}}{{end}}' | grep traefik
echo ""

echo "3. Testing direct access to frontend from host..."
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://localhost:3006 || echo "❌ Cannot reach frontend on localhost:3006"
echo ""

echo "4. Checking if frontend container is healthy..."
docker inspect $(docker compose ps -q frontend) --format='Container: {{.Name}} | Status: {{.State.Status}} | Health: {{.State.Health.Status}}'
echo ""

echo "5. Checking container network settings..."
docker inspect $(docker compose ps -q frontend) --format='{{range .NetworkSettings.Networks}}Network: {{.NetworkID}} | IP: {{.IPAddress}}{{end}}'
echo ""

echo "==================================="
echo "Diagnostics Complete"
echo "==================================="

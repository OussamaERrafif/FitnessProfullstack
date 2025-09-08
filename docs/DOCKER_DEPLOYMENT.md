# Docker Deployment Guide

This guide provides comprehensive instructions for deploying the FitnessPr application using Docker and Docker Compose.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Architecture Overview](#architecture-overview)
- [Configuration](#configuration)
- [Deployment Options](#deployment-options)
- [Monitoring and Health Checks](#monitoring-and-health-checks)
- [Troubleshooting](#troubleshooting)
- [Security Considerations](#security-considerations)
- [Scaling and Performance](#scaling-and-performance)

## Prerequisites

### System Requirements

- **Docker**: Version 20.10.0 or higher
- **Docker Compose**: Version 2.0.0 or higher
- **System Memory**: Minimum 2GB RAM (4GB recommended)
- **Storage**: Minimum 5GB free disk space
- **Network**: Open ports 3000 (frontend) and 8000 (backend)

### Installation

#### Docker Desktop (Windows/macOS)
```bash
# Download from https://www.docker.com/products/docker-desktop
# Install and restart system
docker --version
docker-compose --version
```

#### Linux Installation
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt-get update
sudo apt-get install docker-compose-plugin

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

## Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/OussamaERrafif/FitnessProfullstack.git
cd FitnessProfullstack
```

### 2. Environment Setup
```bash
# Copy and configure environment files
cp backend/.env.example backend/.env
cp fitnesspr/.env.example fitnesspr/.env

# Edit configuration files as needed
# See Configuration section below
```

### 3. Build and Start Services
```bash
# Build and start all services
docker-compose up --build

# Or run in background
docker-compose up --build -d
```

### 4. Verify Deployment
```bash
# Check service status
docker-compose ps

# View logs
docker-compose logs -f

# Test endpoints
curl http://localhost:8000/health  # Backend health
curl http://localhost:3000         # Frontend
```

## Architecture Overview

### Service Architecture
```
┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │
│   (Next.js)     │◄──►│   (FastAPI)     │
│   Port: 3000    │    │   Port: 8000    │
└─────────────────┘    └─────────────────┘
         │                       │
         └───────────────────────┘
                   │
         ┌─────────────────┐
         │   SQLite DB     │
         │  (File-based)   │
         └─────────────────┘
```

### Container Details

#### Backend Container
- **Base Image**: `python:3.11-slim`
- **Framework**: FastAPI with Uvicorn
- **Database**: SQLite (development) / PostgreSQL (production)
- **Features**: 
  - Automatic database initialization
  - Health checks every 30 seconds
  - Hot reload in development mode
  - API documentation at `/docs`

#### Frontend Container
- **Base Image**: `node:18-alpine`
- **Framework**: Next.js 14 with TypeScript
- **Features**:
  - Server-side rendering (SSR)
  - Static optimization
  - Built-in image optimization
  - Automatic code splitting

### Network Configuration
- **Network Name**: `fitnesspr_network`
- **Driver**: Bridge
- **Internal Communication**: Container-to-container via service names
- **External Access**: Host ports 3000 and 8000

## Configuration

### Environment Variables

#### Backend Configuration (`backend/.env`)
```bash
# Database Configuration
USE_SQLITE=true
SQLITE_URL=sqlite:///./fitnesspr.db
# For PostgreSQL production deployment:
# DATABASE_URL=postgresql://user:password@db:5432/fitnesspr

# Security
SECRET_KEY=your-super-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS Configuration
BACKEND_CORS_ORIGINS=http://localhost:3000,http://frontend:3000

# Application Settings
PROJECT_NAME=FitnessPr Backend
API_V1_STR=/api/v1
DEBUG=false

# File Upload
MAX_FILE_SIZE=10485760  # 10MB
UPLOAD_DIRECTORY=./uploads
```

#### Frontend Configuration (`fitnesspr/.env`)
```bash
# Backend API URL
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-change-in-production

# Application Settings
NEXT_PUBLIC_APP_NAME=FitnessPr
NEXT_PUBLIC_APP_VERSION=1.0.0

# Development Settings
NODE_ENV=production
```

### Docker Compose Configuration

#### Production Optimizations
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  backend:
    build: 
      context: ./backend
      dockerfile: Dockerfile.prod
    environment:
      - USE_SQLITE=false
      - DATABASE_URL=postgresql://postgres:password@db:5432/fitnesspr
    depends_on:
      - db
    restart: unless-stopped
    
  frontend:
    build:
      context: ./fitnesspr
      dockerfile: Dockerfile.prod
    restart: unless-stopped
    
  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=fitnesspr
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=secure-password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

## Deployment Options

### Development Deployment
```bash
# Start with hot reload and debugging
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build

# Features:
# - Volume mounts for live code changes
# - Debug logging enabled
# - Development-specific environment variables
```

### Production Deployment
```bash
# Production-optimized build
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d

# Features:
# - Optimized build process
# - PostgreSQL database
# - Security hardening
# - Resource limits
# - Restart policies
```

### Cloud Deployment

#### AWS ECS Deployment
```bash
# Install AWS CLI and ECS CLI
pip install awscli
sudo curl -Lo /usr/local/bin/ecs-cli https://amazon-ecs-cli.s3.amazonaws.com/ecs-cli-linux-amd64-latest

# Configure ECS
ecs-cli configure --cluster fitnesspr-cluster --region us-west-2
ecs-cli up --keypair your-key-pair --capability-iam --size 2 --instance-type t2.medium

# Deploy
ecs-cli compose --file docker-compose.prod.yml up
```

#### Docker Swarm Deployment
```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.prod.yml fitnesspr

# Check services
docker service ls
```

## Monitoring and Health Checks

### Built-in Health Checks
```yaml
# Backend health check
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s

# Frontend health check
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3000"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 60s
```

### Monitoring Commands
```bash
# Check container health
docker-compose ps

# View real-time logs
docker-compose logs -f

# Monitor resource usage
docker stats

# Check specific service logs
docker-compose logs backend
docker-compose logs frontend
```

### Log Management
```bash
# Configure log rotation
# Add to docker-compose.yml
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"

# View logs with timestamps
docker-compose logs -t -f
```

## Troubleshooting

### Common Issues

#### Port Conflicts
```bash
# Check port usage
netstat -tulpn | grep :3000
netstat -tulpn | grep :8000

# Stop conflicting services
sudo systemctl stop nginx  # If using port 3000/8000
```

#### Database Connection Issues
```bash
# Check database container
docker-compose logs db

# Reset database
docker-compose down -v
docker-compose up --build

# Manual database inspection
docker-compose exec backend python -c "from app.core.database import engine; print(engine.url)"
```

#### Memory Issues
```bash
# Check memory usage
docker stats --no-stream

# Increase Docker memory limit (Docker Desktop)
# Settings > Resources > Memory > Increase limit

# Add memory limits to docker-compose.yml
deploy:
  resources:
    limits:
      memory: 512M
    reservations:
      memory: 256M
```

#### Build Failures
```bash
# Clean rebuild
docker-compose down --rmi all --volumes --remove-orphans
docker system prune -a
docker-compose up --build

# Check build context
docker-compose build --no-cache backend
docker-compose build --no-cache frontend
```

### Debugging Tips
```bash
# Access container shell
docker-compose exec backend bash
docker-compose exec frontend sh

# Check environment variables
docker-compose exec backend env
docker-compose exec frontend env

# Test internal connectivity
docker-compose exec frontend ping backend
docker-compose exec backend ping frontend
```

## Security Considerations

### Production Security Checklist

#### Environment Variables
- [ ] Change all default secrets and passwords
- [ ] Use strong, randomly generated SECRET_KEY
- [ ] Configure proper CORS origins
- [ ] Set DEBUG=false in production
- [ ] Use environment-specific database credentials

#### Network Security
```yaml
# Restrict external access
ports:
  - "127.0.0.1:3000:3000"  # Only localhost access
  - "127.0.0.1:8000:8000"

# Use internal networks
networks:
  fitnesspr_internal:
    driver: bridge
    internal: true  # No external access
```

#### Container Security
```dockerfile
# Run as non-root user
RUN adduser --disabled-password --gecos '' appuser
USER appuser

# Read-only root filesystem
security_opt:
  - no-new-privileges:true
read_only: true
tmpfs:
  - /tmp
```

#### Data Security
```yaml
# Encrypt volumes
volumes:
  postgres_data:
    driver_opts:
      encrypted: "true"

# Backup configuration
volumes:
  - ./backups:/backups:ro
```

### SSL/TLS Configuration
```bash
# Using Nginx reverse proxy
# Create nginx.conf
upstream backend {
    server backend:8000;
}

upstream frontend {
    server frontend:3000;
}

server {
    listen 443 ssl;
    server_name yourdomain.com;
    
    ssl_certificate /etc/ssl/certs/cert.pem;
    ssl_certificate_key /etc/ssl/private/key.pem;
    
    location /api/ {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location / {
        proxy_pass http://frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Scaling and Performance

### Horizontal Scaling
```yaml
# docker-compose.scale.yml
version: '3.8'

services:
  backend:
    scale: 3
    deploy:
      replicas: 3
      update_config:
        parallelism: 1
        delay: 10s
      restart_policy:
        condition: on-failure
        
  frontend:
    scale: 2
    deploy:
      replicas: 2
```

### Performance Optimization
```yaml
# Resource limits and reservations
deploy:
  resources:
    limits:
      cpus: '0.50'
      memory: 512M
    reservations:
      cpus: '0.25'
      memory: 256M

# Enable caching
volumes:
  - node_modules_cache:/app/node_modules
  - pip_cache:/root/.cache/pip
```

### Load Balancing
```bash
# Using Docker Swarm
docker service create \
  --name fitnesspr-lb \
  --replicas 1 \
  --network fitnesspr_network \
  --publish 80:80 \
  --mount type=bind,source=/path/to/nginx.conf,target=/etc/nginx/nginx.conf \
  nginx:alpine
```

## Maintenance Commands

### Regular Maintenance
```bash
# Update images
docker-compose pull
docker-compose up -d

# Clean unused resources
docker system prune -f

# Backup database
docker-compose exec backend python scripts/backup_db.py

# Update application
git pull origin main
docker-compose up --build -d
```

### Backup and Restore
```bash
# Backup volumes
docker run --rm \
  -v fitnesspr_backend_data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/backup.tar.gz -C /data .

# Restore volumes
docker run --rm \
  -v fitnesspr_backend_data:/data \
  -v $(pwd):/backup \
  alpine tar xzf /backup/backup.tar.gz -C /data
```

---

## 📞 Support

For deployment issues or questions:
- Check the [main README](../README.md) for general setup
- Review [troubleshooting documentation](./TROUBLESHOOTING.md)
- Open an issue on GitHub with deployment logs
- Join our community Discord for real-time support
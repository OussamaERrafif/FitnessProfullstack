# Troubleshooting Guide

This comprehensive troubleshooting guide helps diagnose and resolve common issues in the FitnessPr application.

## 📋 Table of Contents

- [Quick Diagnosis](#quick-diagnosis)
- [Backend Issues](#backend-issues)
- [Frontend Issues](#frontend-issues)
- [Database Issues](#database-issues)
- [Authentication Problems](#authentication-problems)
- [Performance Issues](#performance-issues)
- [Docker Issues](#docker-issues)
- [Development Environment](#development-environment)
- [Production Issues](#production-issues)

## Quick Diagnosis

### Health Check Commands
```bash
# Check all services status
docker-compose ps

# Test backend API
curl -f http://localhost:8000/health
curl -f http://localhost:8000/api/v1/docs

# Test frontend
curl -f http://localhost:3000

# Check logs for errors
docker-compose logs --tail=50 -f backend
docker-compose logs --tail=50 -f frontend
```

### System Requirements Check
```bash
# Check Docker version
docker --version  # Should be 20.10.0+
docker-compose --version  # Should be 2.0.0+

# Check available memory
free -h  # Should have 2GB+ available

# Check disk space
df -h  # Should have 5GB+ available

# Check port availability
netstat -tulpn | grep -E ':3000|:8000'
```

## Backend Issues

### 🚨 API Server Not Starting

#### Symptoms
- Backend container exits immediately
- 500 Internal Server Error responses
- "Connection refused" errors

#### Diagnosis
```bash
# Check backend logs
docker-compose logs backend

# Check backend container status
docker-compose ps backend

# Inspect backend configuration
docker-compose exec backend env | grep -E 'DATABASE|SECRET|CORS'
```

#### Common Solutions

**1. Database Connection Issues**
```bash
# Check database URL format
echo $DATABASE_URL
# Should be: sqlite:///./fitnesspr.db or postgresql://user:pass@host:port/db

# Reset database
docker-compose down -v
docker-compose up --build
```

**2. Missing Environment Variables**
```bash
# Check for required variables
cat backend/.env | grep -E 'SECRET_KEY|DATABASE_URL'

# Generate new secret key
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

**3. Port Conflicts**
```bash
# Check if port 8000 is in use
sudo lsof -i :8000

# Kill conflicting processes
sudo kill -9 <PID>

# Use alternative port
docker-compose -f docker-compose.yml up --build
```

### 🚨 Database Migration Errors

#### Symptoms
- "Table doesn't exist" errors
- "Migration failed" messages
- SQLAlchemy errors in logs

#### Solutions
```bash
# Reset database and migrations
docker-compose down -v
rm -rf backend/migrations/versions/*
docker-compose up --build

# Manual migration
docker-compose exec backend alembic upgrade head

# Create new migration
docker-compose exec backend alembic revision --autogenerate -m "Initial migration"
```

### 🚨 Authentication Errors

#### Symptoms
- JWT token validation failures
- "Invalid signature" errors
- 401 Unauthorized responses

#### Solutions
```bash
# Check SECRET_KEY consistency
docker-compose exec backend python -c "from app.core.config import settings; print(settings.SECRET_KEY)"

# Generate new secret key
docker-compose exec backend python -c "import secrets; print(secrets.token_urlsafe(32))"

# Clear existing tokens
# Users need to log in again after changing SECRET_KEY
```

### 🚨 CORS Errors

#### Symptoms
- "Access-Control-Allow-Origin" errors in browser
- Cross-origin request blocked
- Frontend can't reach backend API

#### Solutions
```bash
# Check CORS configuration
docker-compose exec backend python -c "from app.core.config import settings; print(settings.BACKEND_CORS_ORIGINS)"

# Update CORS origins in backend/.env
BACKEND_CORS_ORIGINS=http://localhost:3000,http://frontend:3000,https://yourdomain.com

# Restart backend
docker-compose restart backend
```

## Frontend Issues

### 🚨 Next.js Build Failures

#### Symptoms
- Frontend container fails to start
- Build process errors
- TypeScript compilation errors

#### Diagnosis
```bash
# Check frontend build logs
docker-compose logs frontend

# Check Node.js version
docker-compose exec frontend node --version

# Check package.json dependencies
docker-compose exec frontend npm ls
```

#### Solutions

**1. Dependency Issues**
```bash
# Clear node_modules and reinstall
docker-compose exec frontend rm -rf node_modules package-lock.json
docker-compose exec frontend npm install

# Or rebuild container
docker-compose build --no-cache frontend
```

**2. TypeScript Errors**
```bash
# Check TypeScript configuration
docker-compose exec frontend npx tsc --noEmit

# Fix common issues
# - Update type definitions
# - Check import paths
# - Verify component prop types
```

**3. Environment Variable Issues**
```bash
# Check environment variables
docker-compose exec frontend env | grep NEXT_PUBLIC

# Verify backend URL accessibility
docker-compose exec frontend curl http://backend:8000/health
```

### 🚨 API Connection Issues

#### Symptoms
- "Network Error" in browser console
- API requests failing
- Infinite loading states

#### Solutions
```bash
# Verify backend URL configuration
echo $NEXT_PUBLIC_BACKEND_URL
# Should be: http://localhost:8000 (development) or your production URL

# Test API connectivity
curl http://localhost:8000/api/v1/docs

# Check network configuration
docker network ls
docker network inspect fitnesspr_fitnesspr_network
```

### 🚨 Static File Issues

#### Symptoms
- Images not loading
- CSS/JS files 404 errors
- Static assets missing

#### Solutions
```bash
# Check static file mounting
docker-compose exec frontend ls -la /app/public

# Verify Next.js configuration
docker-compose exec frontend cat next.config.js

# Rebuild with fresh static files
docker-compose build --no-cache frontend
```

## Database Issues

### 🚨 SQLite Issues

#### Symptoms
- "Database is locked" errors
- "No such table" errors
- Database file corruption

#### Solutions
```bash
# Check database file permissions
docker-compose exec backend ls -la fitnesspr.db

# Reset database
docker-compose down -v
rm -f backend/fitnesspr.db
docker-compose up --build

# Manual database initialization
docker-compose exec backend python -c "
from app.core.database import engine, Base
from app.models import user, trainer, client, exercise, meal, payment, program, progress
Base.metadata.create_all(bind=engine)
"
```

### 🚨 PostgreSQL Issues (Production)

#### Symptoms
- Connection timeout errors
- Authentication failures
- Performance issues

#### Solutions
```bash
# Check PostgreSQL container
docker-compose logs db

# Test database connection
docker-compose exec backend python -c "
from sqlalchemy import create_engine
import os
engine = create_engine(os.getenv('DATABASE_URL'))
with engine.connect() as conn:
    result = conn.execute('SELECT 1')
    print('Database connection successful')
"

# Check database configuration
docker-compose exec db psql -U postgres -d fitnesspr -c '\l'

# Performance optimization
docker-compose exec db psql -U postgres -d fitnesspr -c '
ANALYZE;
REINDEX DATABASE fitnesspr;
'
```

## Authentication Problems

### 🚨 Login Failures

#### Symptoms
- "Invalid credentials" for correct passwords
- Users can't log in after password change
- Session expires immediately

#### Diagnosis
```bash
# Check user exists in database
docker-compose exec backend python -c "
from app.core.database import SessionLocal
from app.models.user import User
db = SessionLocal()
user = db.query(User).filter(User.email == 'user@example.com').first()
print(f'User found: {user is not None}')
if user:
    print(f'User active: {user.is_active}')
db.close()
"

# Verify password hashing
docker-compose exec backend python -c "
from app.core.security import verify_password
print(verify_password('plaintext_password', 'hashed_password'))
"
```

#### Solutions
```bash
# Reset user password
docker-compose exec backend python -c "
from app.core.database import SessionLocal
from app.models.user import User
from app.core.security import get_password_hash
db = SessionLocal()
user = db.query(User).filter(User.email == 'user@example.com').first()
if user:
    user.hashed_password = get_password_hash('new_password')
    db.commit()
    print('Password updated successfully')
db.close()
"

# Create superuser
docker-compose exec backend python -c "
from app.core.database import SessionLocal
from app.models.user import User
from app.core.security import get_password_hash
db = SessionLocal()
user = User(
    email='admin@example.com',
    hashed_password=get_password_hash('admin_password'),
    full_name='Admin User',
    is_superuser=True,
    is_active=True
)
db.add(user)
db.commit()
print('Superuser created successfully')
db.close()
"
```

### 🚨 Token Issues

#### Symptoms
- "Token expired" errors
- Invalid token format
- Authentication header missing

#### Solutions
```bash
# Check token configuration
docker-compose exec backend python -c "
from app.core.config import settings
print(f'Token expire time: {settings.ACCESS_TOKEN_EXPIRE_MINUTES} minutes')
print(f'Algorithm: {settings.ALGORITHM}')
"

# Test token generation
docker-compose exec backend python -c "
from app.core.security import create_access_token
from datetime import timedelta
token = create_access_token(
    data={'sub': 'test@example.com'},
    expires_delta=timedelta(minutes=30)
)
print(f'Generated token: {token}')
"
```

## Performance Issues

### 🚨 Slow API Responses

#### Symptoms
- API endpoints taking >5 seconds
- Timeout errors
- High CPU usage

#### Diagnosis
```bash
# Monitor container resources
docker stats --no-stream

# Check API endpoint performance
time curl -s http://localhost:8000/api/v1/exercises/ > /dev/null

# Profile specific endpoints
docker-compose exec backend python -c "
import time
import requests
start = time.time()
response = requests.get('http://localhost:8000/api/v1/exercises/')
end = time.time()
print(f'Response time: {end - start:.2f} seconds')
print(f'Status code: {response.status_code}')
"
```

#### Solutions
```bash
# Add database indexes
docker-compose exec backend python -c "
from app.core.database import SessionLocal
from sqlalchemy import text
db = SessionLocal()
# Add missing indexes
db.execute(text('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)'))
db.execute(text('CREATE INDEX IF NOT EXISTS idx_exercises_category ON exercises(category)'))
db.commit()
db.close()
"

# Enable query optimization
# Add to backend/.env
SQLALCHEMY_ENGINE_OPTIONS='{"pool_pre_ping": true, "pool_recycle": 300}'

# Increase container resources
# Add to docker-compose.yml
deploy:
  resources:
    limits:
      memory: 1G
      cpus: '0.5'
```

### 🚨 Memory Issues

#### Symptoms
- Container restarts due to OOM
- Gradual memory increase
- Swap usage high

#### Solutions
```bash
# Monitor memory usage
docker stats --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"

# Add memory limits
# In docker-compose.yml
mem_limit: 512m
memswap_limit: 512m

# Optimize Python memory usage
# Add to backend Dockerfile
ENV PYTHONOPTIMIZE=1
ENV PYTHONDONTWRITEBYTECODE=1
```

## Docker Issues

### 🚨 Container Build Failures

#### Symptoms
- "Build failed" errors
- Package installation failures
- Layer caching issues

#### Solutions
```bash
# Clean rebuild
docker-compose down --rmi all --volumes --remove-orphans
docker system prune -a
docker-compose build --no-cache
docker-compose up

# Check build context
docker-compose build --progress=plain backend 2>&1 | tee build.log

# Fix common issues
# 1. Check Dockerfile syntax
# 2. Verify base image availability
# 3. Update package managers
# 4. Check network connectivity
```

### 🚨 Volume Mount Issues

#### Symptoms
- Files not persisting
- Permission denied errors
- Volume data missing

#### Solutions
```bash
# Check volume mounts
docker volume ls
docker volume inspect fitnesspr_backend_data

# Fix permissions
docker-compose exec backend chown -R 1000:1000 /app

# Reset volumes
docker-compose down -v
docker volume prune -f
docker-compose up --build
```

### 🚨 Network Connectivity

#### Symptoms
- Service-to-service communication failing
- DNS resolution errors
- Port binding failures

#### Solutions
```bash
# Check network configuration
docker network ls
docker network inspect fitnesspr_fitnesspr_network

# Test connectivity
docker-compose exec frontend ping backend
docker-compose exec backend ping frontend

# Recreate network
docker-compose down
docker network prune -f
docker-compose up --build
```

## Development Environment

### 🚨 Hot Reload Not Working

#### Symptoms
- Code changes not reflected
- Container needs manual restart
- File watching not working

#### Solutions
```bash
# Check volume mounts in docker-compose.dev.yml
volumes:
  - ./backend:/app
  - ./fitnesspr:/app

# Enable file watching
# Add to docker-compose.dev.yml
environment:
  - WATCHDOG_POLLING=true
  - CHOKIDAR_USEPOLLING=true

# Fix file permissions
chmod -R 755 ./backend ./fitnesspr
```

### 🚨 IDE Integration Issues

#### Symptoms
- IntelliSense not working
- Debugging not connecting
- Extensions failing

#### Solutions
```bash
# VS Code Docker extension setup
# Create .vscode/settings.json
{
  "python.defaultInterpreterPath": "/usr/local/bin/python",
  "python.linting.enabled": true,
  "python.linting.pylintEnabled": true
}

# Expose debugging ports
# Add to docker-compose.dev.yml
ports:
  - "5678:5678"  # Python debugger
  - "9229:9229"  # Node.js debugger
```

## Production Issues

### 🚨 SSL/TLS Problems

#### Symptoms
- HTTPS not working
- Certificate errors
- Mixed content warnings

#### Solutions
```bash
# Check certificate validity
openssl x509 -in /path/to/cert.pem -text -noout

# Verify certificate chain
openssl s_client -connect yourdomain.com:443 -showcerts

# Update certificates
# Use Let's Encrypt with certbot
certbot --nginx -d yourdomain.com
```

### 🚨 Load Balancer Issues

#### Symptoms
- Uneven request distribution
- Health check failures
- Service unavailability

#### Solutions
```bash
# Check service health
docker service ls
docker service ps fitnesspr_backend

# Update health check configuration
# In docker-compose.prod.yml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
  interval: 10s
  timeout: 5s
  retries: 3
  start_period: 30s

# Scale services
docker service scale fitnesspr_backend=3
```

### 🚨 Backup and Recovery

#### Symptoms
- Data loss
- Corruption recovery needed
- Migration failures

#### Solutions
```bash
# Create backup
docker run --rm \
  -v fitnesspr_postgres_data:/data \
  -v $(pwd):/backup \
  postgres:15-alpine \
  pg_dump -h db -U postgres fitnesspr > /backup/backup.sql

# Restore from backup
docker run --rm \
  -v fitnesspr_postgres_data:/data \
  -v $(pwd):/backup \
  postgres:15-alpine \
  psql -h db -U postgres fitnesspr < /backup/backup.sql

# Point-in-time recovery
# Configure PostgreSQL with WAL archiving
# Restore from specific timestamp
```

## 🆘 Emergency Procedures

### Complete System Reset
```bash
#!/bin/bash
# emergency_reset.sh
echo "🚨 EMERGENCY RESET - This will destroy all data!"
read -p "Are you sure? (type 'YES' to continue): " confirm

if [ "$confirm" = "YES" ]; then
    echo "Stopping all services..."
    docker-compose down --remove-orphans
    
    echo "Removing all containers, volumes, and images..."
    docker system prune -a --volumes -f
    
    echo "Rebuilding from scratch..."
    docker-compose up --build -d
    
    echo "Reset complete. Check logs: docker-compose logs -f"
else
    echo "Reset cancelled."
fi
```

### Data Recovery Script
```bash
#!/bin/bash
# data_recovery.sh
echo "🔧 Attempting data recovery..."

# Check for backup files
if [ -f "backup.sql" ]; then
    echo "Found database backup, restoring..."
    docker-compose exec db psql -U postgres fitnesspr < backup.sql
fi

# Recreate admin user
docker-compose exec backend python -c "
from app.core.database import SessionLocal
from app.models.user import User
from app.core.security import get_password_hash
db = SessionLocal()
admin = User(
    email='admin@recovery.com',
    hashed_password=get_password_hash('recovery123'),
    full_name='Recovery Admin',
    is_superuser=True,
    is_active=True
)
db.merge(admin)
db.commit()
print('Recovery admin created: admin@recovery.com / recovery123')
"

echo "Recovery procedures completed."
```

---

## 📞 Getting Help

If these troubleshooting steps don't resolve your issue:

1. **Check the logs first**: `docker-compose logs -f`
2. **Search existing issues**: GitHub repository issues section
3. **Create detailed issue report**:
   - Error messages and logs
   - System information
   - Steps to reproduce
   - Expected vs actual behavior
4. **Join community support**: Discord or forum links
5. **Emergency contact**: For critical production issues

### Issue Report Template
```markdown
## Issue Description
Brief description of the problem

## Environment
- OS: 
- Docker version: 
- Docker Compose version: 
- Application version/commit: 

## Steps to Reproduce
1. 
2. 
3. 

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Logs
```
# paste relevant logs here
```

## Additional Context
Any other relevant information
```
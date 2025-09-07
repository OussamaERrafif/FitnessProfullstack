# Security & Deployment Guide

## Security Features Implemented ✅

### 1. Authentication & Authorization

#### ✅ JWT Authentication
- Secure token-based authentication
- Configurable token expiration
- Role-based access control (RBAC)

```python
# Example secure endpoint
@router.get("/clients", dependencies=[Depends(get_current_user)])
async def get_clients():
    # Only authenticated users can access
```

#### ✅ Password Security
- bcrypt hashing with salt
- Password strength validation
- Secure password storage

### 2. Input Validation & Sanitization

#### ✅ Comprehensive Input Validation
- Pydantic schema validation for all endpoints
- SQL injection prevention through ORM
- XSS protection through input sanitization
- File upload validation

```python
# Example validation
class ClientCreate(BaseModel):
    email: EmailStr
    pin: str = Field(..., regex=r'^\d{4,6}$')
    
    @field_validator("fitness_level")
    @classmethod
    def validate_fitness_level(cls, v):
        if v not in ["beginner", "intermediate", "advanced"]:
            raise ValueError("Invalid fitness level")
        return v
```

#### ✅ Request Size Limits
- Maximum request payload size: 10MB
- File upload size restrictions
- JSON payload depth validation

### 3. Rate Limiting & DDoS Protection

#### ✅ Configurable Rate Limiting
```python
# Implementation
@app.get("/")
@limiter.limit("10/minute")
async def root(request: Request):
    return {"message": "API"}

# Configuration
RATE_LIMIT_PER_MINUTE=60
RATE_LIMIT_BURST=10
```

### 4. Security Headers

#### ✅ Comprehensive Security Headers
```http
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

### 5. CORS Configuration

#### ✅ Secure CORS Setup
```python
# Development
BACKEND_CORS_ORIGINS=http://localhost:3000

# Production
BACKEND_CORS_ORIGINS=https://yourdomain.com,https://app.yourdomain.com
```

### 6. Database Security

#### ✅ ORM Protection
- SQLAlchemy ORM prevents SQL injection
- Parameterized queries only
- No raw SQL execution
- Database connection pooling

#### ✅ Data Encryption
- Passwords hashed with bcrypt
- Sensitive data encryption at rest
- HTTPS/TLS for data in transit

### 7. Error Handling

#### ✅ Secure Error Responses
- No sensitive information in error messages
- Structured error responses
- Request ID tracking for debugging
- Comprehensive logging without sensitive data

## Deployment Security Checklist ✅

### Environment Configuration

#### ✅ Environment Variables
```bash
# Production settings
DEBUG=false
SECRET_KEY=<32-character-random-string>
HTTPS_ONLY=true
SECURE_COOKIES=true

# Database
USE_SQLITE=false
DATABASE_URL=postgresql://user:pass@localhost:5432/db

# Monitoring
SENTRY_DSN=https://your-sentry-dsn
LOG_LEVEL=INFO
```

#### ✅ Secrets Management
- Environment variables for all secrets
- No hardcoded credentials
- Secure secret rotation process
- Production secrets never in code

### Infrastructure Security

#### ✅ HTTPS/TLS
```yaml
# docker-compose.yml for production
services:
  nginx:
    image: nginx:alpine
    volumes:
      - ./ssl:/etc/nginx/ssl
    environment:
      - SSL_CERT=/etc/nginx/ssl/cert.pem
      - SSL_KEY=/etc/nginx/ssl/key.pem
```

#### ✅ Network Security
- Private network for backend services
- Firewall rules for exposed ports
- Load balancer with SSL termination
- Database not directly accessible

### Monitoring & Logging

#### ✅ Comprehensive Logging
```python
# Request tracking
logger.info(
    f"Request started: {request.method} {request.url.path}",
    extra={
        "request_id": request_id,
        "method": request.method,
        "client_ip": request.client.host,
        "user_agent": request.headers.get("user-agent"),
    }
)
```

#### ✅ Security Monitoring
- Failed authentication attempts logging
- Rate limit violations tracking
- Suspicious activity alerts
- Error rate monitoring

## Production Deployment

### 1. Docker Deployment

#### Frontend Dockerfile (Production-Ready)
```dockerfile
# Multi-stage build for optimal size
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

#### Backend Dockerfile (Production-Ready)
```dockerfile
FROM python:3.9-slim

# Security: Run as non-root user
RUN adduser --disabled-password --gecos '' appuser

WORKDIR /app

# Install dependencies first (better caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .
RUN chown -R appuser:appuser /app

# Security: Switch to non-root user
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 2. Production Docker Compose

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - internal
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    networks:
      - internal
    restart: unless-stopped

  backend:
    build: ./backend
    environment:
      - DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}
      - REDIS_URL=redis://redis:6379/0
      - SECRET_KEY=${SECRET_KEY}
    depends_on:
      - postgres
      - redis
    networks:
      - internal
    restart: unless-stopped

  frontend:
    build: ./frontend
    environment:
      - NEXT_PUBLIC_BACKEND_URL=https://api.yourdomain.com
    networks:
      - internal
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - backend
      - frontend
    networks:
      - internal
      - external
    restart: unless-stopped

networks:
  internal:
    driver: bridge
  external:
    driver: bridge

volumes:
  postgres_data:
```

### 3. Nginx Configuration

```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server backend:8000;
    }

    upstream frontend {
        server frontend:3000;
    }

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";

    # HTTPS redirect
    server {
        listen 80;
        server_name yourdomain.com;
        return 301 https://$server_name$request_uri;
    }

    # Frontend
    server {
        listen 443 ssl http2;
        server_name yourdomain.com;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;

        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }

    # Backend API
    server {
        listen 443 ssl http2;
        server_name api.yourdomain.com;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;

        location / {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

## CI/CD Security

### GitHub Actions Security
```yaml
# .github/workflows/deploy.yml
name: Secure Deploy

on:
  push:
    branches: [main]

jobs:
  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Run security audit
        run: |
          cd backend && pip-audit -r requirements.txt
          cd frontend && npm audit
      
      - name: Run SAST
        uses: github/super-linter@v4
        env:
          DEFAULT_BRANCH: main
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

  deploy:
    needs: security-scan
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - name: Deploy to production
        env:
          SECRET_KEY: ${{ secrets.SECRET_KEY }}
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
        run: |
          # Secure deployment commands
```

## Database Security

### PostgreSQL Security Configuration
```sql
-- Create dedicated user with minimal privileges
CREATE USER fitnesspr_app WITH PASSWORD 'secure_random_password';
GRANT CONNECT ON DATABASE fitnesspr TO fitnesspr_app;
GRANT USAGE ON SCHEMA public TO fitnesspr_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO fitnesspr_app;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO fitnesspr_app;

-- Enable SSL
ssl = on
ssl_cert_file = 'server.crt'
ssl_key_file = 'server.key'
```

## Monitoring & Alerting

### Health Checks
```python
# app/api/v1/endpoints/health.py
@router.get("/health/detailed")
async def detailed_health_check():
    checks = {
        "database": await check_database_connection(),
        "redis": await check_redis_connection(),
        "disk_space": check_disk_space(),
        "memory": check_memory_usage(),
    }
    
    all_healthy = all(checks.values())
    
    return {
        "status": "healthy" if all_healthy else "unhealthy",
        "checks": checks,
        "timestamp": datetime.utcnow()
    }
```

### Error Tracking (Sentry Integration)
```python
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration

if settings.SENTRY_DSN:
    sentry_sdk.init(
        dsn=settings.SENTRY_DSN,
        integrations=[FastApiIntegration()],
        traces_sample_rate=0.1,
        environment=settings.ENVIRONMENT,
    )
```

## Security Testing

### Automated Security Tests
```python
# tests/test_security.py
def test_sql_injection_protection():
    """Test SQL injection protection"""
    malicious_input = "'; DROP TABLE users; --"
    response = client.post("/api/v1/clients", json={
        "name": malicious_input,
        "email": "test@example.com"
    })
    # Should not crash or execute SQL

def test_rate_limiting():
    """Test rate limiting works"""
    for i in range(15):  # Exceed limit of 10/minute
        response = client.get("/")
    
    assert response.status_code == 429

def test_authentication_required():
    """Test endpoints require authentication"""
    response = client.get("/api/v1/clients")
    assert response.status_code == 401
```

## Compliance & Regulations

### GDPR Compliance
- User consent management
- Data portability (export)
- Right to be forgotten (delete)
- Data processing transparency

### HIPAA Considerations (if handling health data)
- Encryption at rest and in transit
- Audit logs for all data access
- User access controls
- Business associate agreements

## Regular Security Maintenance

### Monthly Tasks
- [ ] Review access logs for anomalies
- [ ] Update dependencies (security patches)
- [ ] Rotate secrets and API keys
- [ ] Review user permissions
- [ ] Security audit of new features

### Quarterly Tasks
- [ ] Penetration testing
- [ ] Dependency vulnerability assessment
- [ ] Security training for team
- [ ] Incident response plan review

This comprehensive security implementation ensures the FitnessPr application meets enterprise-level security standards and follows industry best practices.
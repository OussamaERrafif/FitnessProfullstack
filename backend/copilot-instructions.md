# GitHub Copilot Instructions for FitnessPr Backend

## 🎯 Purpose

This AI acts as a senior backend architect and API design specialist with deep expertise in:

- FastAPI (Python 3.9+)
- SQLAlchemy 2.0+ (Core & ORM)
- Alembic (Database Migrations)
- Pydantic v2 (Data Validation & Serialization)
- JWT Authentication with python-jose
- Async/Await patterns
- PostgreSQL/SQLite databases
- Stripe Payment Integration
- Redis & Celery (Background Tasks)
- pytest (Testing Framework)

Its job is to build a robust, scalable, and secure REST API backend for the FitnessPr fitness trainer management system.

## 📝 System Architecture

### Core Components

1. **FastAPI Application** (`app/main.py`) - ASGI server with middleware stack
2. **Database Layer** (`app/models/`) - SQLAlchemy ORM models with relationships
3. **API Layer** (`app/api/v1/`) - RESTful endpoints with proper HTTP methods
4. **Business Logic** (`app/services/`) - Service classes for domain operations
5. **Data Validation** (`app/schemas/`) - Pydantic models for request/response
6. **Configuration** (`app/core/config.py`) - Environment-based settings
7. **Security** (`app/core/security.py`) - JWT, hashing, authorization
8. **Background Tasks** - Celery workers for async operations

## 🏗️ Database Design Principles

### User Management
- **Trainers**: Professional accounts with client management capabilities
- **Clients**: PIN-based access, profile management, progress tracking
- **Role-Based Access Control**: Different permissions for trainers vs clients

### Data Models
- **User** (Base class for trainers/clients)
- **Trainer** (Professional profile, credentials)
- **Client** (PIN auth, health metrics, goals)
- **Program** (Training programs created by trainers)
- **Exercise** (Exercise library with muscle groups)
- **Meal** (Recipes, nutrition info, meal plans)
- **Progress** (Client progress logs, measurements)
- **Payment** (Stripe integration, invoicing)

## 🔑 Authentication & Security

### JWT Token System
```python
# Token Structure
{
  "sub": "user_id",
  "role": "trainer|client", 
  "trainer_id": "optional_trainer_reference",
  "exp": "expiration_timestamp",
  "iat": "issued_at"
}
```

### PIN-Based Client Authentication
- Clients authenticate using unique PIN codes (6-8 digits)
- PIN validation with rate limiting and lockout protection
- Session management with secure token generation

### Security Headers & Middleware
- CORS configuration for frontend integration
- Rate limiting per endpoint
- Input validation and sanitization
- SQL injection prevention
- XSS protection headers

## 📡 API Design Standards

### RESTful Endpoint Structure
```
/api/v1/
├── auth/           # Authentication endpoints
├── trainers/       # Trainer CRUD operations
├── clients/        # Client management
├── programs/       # Training programs
├── exercises/      # Exercise library
├── meals/          # Meal planning & recipes
├── progress/       # Progress tracking
├── payments/       # Payment processing
└── uploads/        # File upload handling
```

### HTTP Methods & Status Codes
- **GET**: Retrieve resources (200, 404)
- **POST**: Create resources (201, 400, 409)
- **PUT**: Full resource updates (200, 404)
- **PATCH**: Partial updates (200, 404)
- **DELETE**: Remove resources (204, 404)

### Response Format Standards
```python
# Success Response
{
  "success": True,
  "data": {...},
  "message": "Operation completed successfully"
}

# Error Response
{
  "success": False,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [...]
  }
}

# Pagination Response
{
  "success": True,
  "data": [...],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 100,
    "pages": 5
  }
}
```

## 🗂️ File Organization Guidelines

### Directory Structure
```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI app initialization
│   ├── api/
│   │   └── v1/
│   │       ├── __init__.py
│   │       ├── api.py          # Router aggregation
│   │       └── endpoints/      # Individual endpoint modules
│   ├── core/
│   │   ├── config.py           # Application settings
│   │   ├── security.py         # Auth utilities
│   │   ├── database.py         # DB connection
│   │   └── exceptions.py       # Custom exceptions
│   ├── models/                 # SQLAlchemy models
│   ├── schemas/                # Pydantic models
│   ├── services/               # Business logic
│   └── utils/                  # Helper functions
├── migrations/                 # Alembic migrations
├── tests/                      # Test suite
├── requirements.txt            # Dependencies
└── pyproject.toml             # Poetry configuration
```

### Naming Conventions
- **Files**: snake_case (user_service.py)
- **Classes**: PascalCase (UserService, ClientModel)
- **Functions/Variables**: snake_case (get_user_by_id)
- **Constants**: UPPER_SNAKE_CASE (DATABASE_URL)
- **Database Tables**: snake_case (training_programs)

## 🔧 Development Guidelines

### Model Definition (SQLAlchemy)
```python
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

class Client(Base):
    __tablename__ = "clients"
    
    id = Column(Integer, primary_key=True, index=True)
    pin_code = Column(String(8), unique=True, nullable=False, index=True)
    trainer_id = Column(Integer, ForeignKey("trainers.id"), nullable=False)
    
    # Relationships
    trainer = relationship("Trainer", back_populates="clients")
    progress_logs = relationship("Progress", back_populates="client")
```

### Schema Definition (Pydantic)
```python
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class ClientCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: Optional[str] = Field(None, regex=r'^\+?[\d\s-()]+$')
    
class ClientResponse(BaseModel):
    id: int
    name: str
    email: str
    pin_code: str
    created_at: datetime
    
    class Config:
        from_attributes = True
```

### Service Layer Pattern
```python
from sqlalchemy.orm import Session
from app.models.client import Client
from app.schemas.client import ClientCreate

class ClientService:
    def __init__(self, db: Session):
        self.db = db
    
    async def create_client(self, client_data: ClientCreate, trainer_id: int) -> Client:
        # Business logic here
        pin_code = self.generate_unique_pin()
        db_client = Client(
            **client_data.dict(),
            trainer_id=trainer_id,
            pin_code=pin_code
        )
        self.db.add(db_client)
        self.db.commit()
        return db_client
```

### API Endpoint Pattern
```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.client_service import ClientService

router = APIRouter(prefix="/clients", tags=["clients"])

@router.post("/", response_model=ClientResponse)
async def create_client(
    client_data: ClientCreate,
    db: Session = Depends(get_db),
    current_trainer: Trainer = Depends(get_current_trainer)
):
    service = ClientService(db)
    try:
        client = await service.create_client(client_data, current_trainer.id)
        return client
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
```

## 🔒 Security Implementation

### Password Hashing
```python
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)
```

### JWT Implementation
```python
from jose import jwt, JWTError
from datetime import datetime, timedelta

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
```

### Authorization Decorators
```python
from functools import wraps

def require_trainer_role(func):
    @wraps(func)
    async def wrapper(*args, **kwargs):
        current_user = kwargs.get('current_user')
        if not current_user or current_user.role != 'trainer':
            raise HTTPException(status_code=403, detail="Trainer access required")
        return await func(*args, **kwargs)
    return wrapper
```

## 📊 Database Migrations (Alembic)

### Migration Commands
```bash
# Create new migration
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1
```

### Migration Best Practices
- Always review auto-generated migrations
- Test migrations on development data
- Include both upgrade and downgrade operations
- Use descriptive migration messages
- Handle data migrations separately from schema changes

## 🧪 Testing Strategy

### Test Structure
```python
import pytest
from httpx import AsyncClient
from app.main import app

@pytest.mark.asyncio
async def test_create_client():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post(
            "/api/v1/clients/",
            json={"name": "John Doe", "email": "john@example.com"},
            headers={"Authorization": f"Bearer {trainer_token}"}
        )
    assert response.status_code == 201
    assert response.json()["name"] == "John Doe"
```

### Test Categories
- **Unit Tests**: Service layer logic
- **Integration Tests**: API endpoints
- **Database Tests**: Model relationships
- **Authentication Tests**: Security flows

## 🚀 Performance Optimization

### Database Optimization
- Use database indexes strategically
- Implement query optimization with SQLAlchemy
- Connection pooling configuration
- Async database operations where beneficial

### Caching Strategy
- Redis for session storage
- Query result caching for static data
- API response caching with proper invalidation

### Background Tasks
```python
from celery import Celery

celery_app = Celery("fitnesspr")

@celery_app.task
def send_email_notification(recipient: str, subject: str, body: str):
    # Email sending logic
    pass

@celery_app.task
def generate_progress_report(client_id: int):
    # Report generation logic
    pass
```

## 💳 Payment Integration (Stripe)

### Payment Flow
1. Create payment intent on backend
2. Send client secret to frontend
3. Process payment with Stripe
4. Handle webhooks for payment confirmation
5. Update database records

### Webhook Handling
```python
import stripe
from fastapi import Request

@router.post("/stripe/webhook")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, STRIPE_WEBHOOK_SECRET
        )
        # Handle different event types
        if event['type'] == 'payment_intent.succeeded':
            await handle_payment_success(event['data']['object'])
            
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
```

## 🔧 Configuration Management

### Environment Variables
```python
# Development (.env)
DATABASE_URL=sqlite:///./fitnesspr.db
DEBUG=True
SECRET_KEY=dev-secret-key

# Production
DATABASE_URL=postgresql://user:pass@host:port/db
DEBUG=False
SECRET_KEY=secure-production-key
STRIPE_SECRET_KEY=sk_live_...
REDIS_URL=redis://localhost:6379
```

### Settings Validation
```python
from pydantic import field_validator
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str
    secret_key: str
    debug: bool = False
    
    @field_validator('secret_key')
    def validate_secret_key(cls, v):
        if len(v) < 32:
            raise ValueError('Secret key must be at least 32 characters')
        return v
```

## 📝 API Documentation Standards

### OpenAPI/Swagger Configuration
- Comprehensive endpoint descriptions
- Request/response examples
- Error code documentation
- Authentication requirements
- Rate limiting information

### Code Documentation
```python
async def get_client_progress(
    client_id: int,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db)
) -> List[ProgressResponse]:
    """
    Retrieve client progress data within a date range.
    
    Args:
        client_id: Unique identifier for the client
        start_date: Optional start date for filtering (defaults to 30 days ago)
        end_date: Optional end date for filtering (defaults to today)
        db: Database session dependency
        
    Returns:
        List of progress entries sorted by date
        
    Raises:
        HTTPException: 404 if client not found
        HTTPException: 403 if user lacks permission
    """
```

## 🚨 Error Handling

### Custom Exception Classes
```python
class FitnessPrException(Exception):
    """Base exception for FitnessPr application"""
    pass

class ClientNotFoundError(FitnessPrException):
    """Raised when client is not found"""
    pass

class InvalidPINError(FitnessPrException):
    """Raised when PIN validation fails"""
    pass
```

### Global Exception Handler
```python
from fastapi import Request
from fastapi.responses import JSONResponse

@app.exception_handler(ClientNotFoundError)
async def client_not_found_handler(request: Request, exc: ClientNotFoundError):
    return JSONResponse(
        status_code=404,
        content={
            "success": False,
            "error": {
                "code": "CLIENT_NOT_FOUND",
                "message": "The specified client could not be found"
            }
        }
    )
```

## 📋 Deployment Checklist

### Pre-Deployment
- [ ] Run all tests (`pytest`)
- [ ] Check code quality (`black`, `isort`, `flake8`, `mypy`)
- [ ] Update database migrations
- [ ] Environment variables configured
- [ ] Security headers enabled
- [ ] Rate limiting configured

### Production Considerations
- Database connection pooling
- Proper logging configuration
- Health check endpoints
- Monitoring and alerting
- Backup strategies
- SSL/TLS configuration

## 🎯 Key Features Implementation

### PIN-Based Client Authentication
```python
class PINAuthService:
    def authenticate_client_pin(self, pin: str) -> Optional[Client]:
        # Rate limiting check
        # PIN validation
        # Return client if valid
        pass
        
    def generate_client_pin(self) -> str:
        # Generate unique 6-8 digit PIN
        pass
```

### Training Program Management
```python
class ProgramService:
    def create_program(self, program_data: ProgramCreate, trainer_id: int):
        # Create training program with exercises
        pass
        
    def assign_program_to_client(self, program_id: int, client_id: int):
        # Assign program and track progress
        pass
```

### Progress Tracking
```python
class ProgressService:
    def log_client_progress(self, client_id: int, metrics: ProgressMetrics):
        # Record measurements, photos, notes
        pass
        
    def generate_progress_report(self, client_id: int, period: str):
        # Generate PDF reports
        pass
```

When generating code for this backend:

1. **Follow FastAPI best practices** with proper dependency injection
2. **Use async/await** for database operations where beneficial
3. **Implement comprehensive error handling** with custom exceptions
4. **Follow the service layer pattern** for business logic separation
5. **Use Pydantic models** for all data validation and serialization
6. **Include proper type hints** throughout the codebase
7. **Write testable code** with clear separation of concerns
8. **Follow security best practices** for authentication and authorization
9. **Use SQLAlchemy relationships** properly for data integrity
10. **Include comprehensive logging** for debugging and monitoring

## 🔄 Development Workflow

### Code Quality Checks
```bash
# Format code
black app/
isort app/

# Lint code  
flake8 app/
mypy app/

# Run tests
pytest -v --cov=app
```

### Database Development
```bash
# Create migration
alembic revision --autogenerate -m "Add client PIN authentication"

# Apply migration
alembic upgrade head

# Seed development data
python app/utils/init_db.py
```

This instruction file should guide all backend development to ensure consistency, security, and maintainability across the FitnessPr backend system.

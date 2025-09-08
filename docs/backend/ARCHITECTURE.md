# Backend Architecture Documentation

## Overview

The FitnessPr backend is built using **FastAPI**, a modern, fast web framework for building APIs with Python. The architecture follows clean architecture principles with clear separation of concerns and dependency injection.

## Project Structure

```
backend/
├── app/
│   ├── api/                    # API layer
│   │   └── v1/                 # API version 1
│   │       ├── endpoints/      # Individual endpoint modules
│   │       │   ├── auth.py     # Authentication endpoints
│   │       │   ├── trainers.py # Trainer management
│   │       │   ├── clients.py  # Client management
│   │       │   ├── exercises.py# Exercise library
│   │       │   ├── programs.py # Workout programs
│   │       │   ├── meals.py    # Meal planning
│   │       │   ├── progress.py # Progress tracking
│   │       │   └── payments.py # Payment processing
│   │       └── api.py          # API router aggregation
│   ├── core/                   # Core application modules
│   │   ├── config.py          # Configuration management
│   │   ├── database.py        # Database connection & session
│   │   ├── security.py        # Security utilities (JWT, hashing)
│   │   ├── exceptions.py      # Custom exception handlers
│   │   ├── logging.py         # Logging configuration
│   │   └── middleware.py      # Custom middleware
│   ├── models/                 # SQLAlchemy ORM models
│   │   ├── base.py           # Base model class
│   │   ├── user.py           # User model
│   │   ├── trainer.py        # Trainer profile model
│   │   ├── client.py         # Client model
│   │   ├── exercise.py       # Exercise model
│   │   ├── program.py        # Program model
│   │   ├── meal.py           # Meal model
│   │   ├── progress.py       # Progress tracking model
│   │   └── payment.py        # Payment model
│   ├── schemas/                # Pydantic schemas for validation
│   │   ├── auth.py           # Authentication schemas
│   │   ├── trainer.py        # Trainer schemas
│   │   ├── client.py         # Client schemas
│   │   ├── exercise.py       # Exercise schemas
│   │   ├── program.py        # Program schemas
│   │   ├── meal.py           # Meal schemas
│   │   ├── progress.py       # Progress schemas
│   │   └── payment.py        # Payment schemas
│   ├── services/               # Business logic layer
│   │   ├── user_service.py    # User management logic
│   │   ├── trainer_service.py # Trainer business logic
│   │   ├── client_service.py  # Client management logic
│   │   ├── exercise_service.py# Exercise library logic
│   │   ├── program_service.py # Program management logic
│   │   ├── meal_service.py    # Meal planning logic
│   │   ├── progress_service.py# Progress tracking logic
│   │   └── payment_service.py # Payment processing logic
│   ├── utils/                  # Utility functions
│   │   └── init_db.py         # Database initialization
│   └── main.py                 # Application entry point
├── tests/                      # Test suite
├── migrations/                 # Database migration files
├── requirements.txt            # Python dependencies
├── pyproject.toml             # Project configuration
└── Dockerfile                 # Container configuration
```

## Architecture Patterns

### 1. Layered Architecture

The application follows a layered architecture pattern:

- **API Layer** (`api/`): HTTP endpoints, request/response handling
- **Service Layer** (`services/`): Business logic and application rules
- **Data Layer** (`models/`): Database models and data access
- **Schema Layer** (`schemas/`): Data validation and serialization

### 2. Dependency Injection

FastAPI's dependency injection system is used throughout:

```python
# Database session injection
def get_trainer(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Endpoint logic
```

### 3. Repository Pattern (via Services)

Services act as repositories, encapsulating data access logic:

```python
class TrainerService:
    def __init__(self, db: Session):
        self.db = db
    
    def get(self, id: int) -> Optional[Trainer]:
        return self.db.query(Trainer).filter(Trainer.id == id).first()
```

## Data Flow

1. **HTTP Request** → API endpoint
2. **Authentication** → JWT token validation
3. **Validation** → Pydantic schema validation
4. **Business Logic** → Service layer processing
5. **Database** → SQLAlchemy ORM operations
6. **Response** → Pydantic schema serialization
7. **HTTP Response** → JSON response to client

## Authentication & Authorization

### JWT Token Flow

1. User logs in with credentials
2. Server validates credentials against database
3. Server generates JWT token with user claims
4. Client includes token in Authorization header
5. Server validates token on each request
6. Server extracts user information from token

### Security Features

- **Password Hashing**: bcrypt for secure password storage
- **JWT Tokens**: Stateless authentication with configurable expiration
- **Rate Limiting**: Request throttling to prevent abuse
- **CORS Protection**: Configurable cross-origin request policies
- **Input Validation**: Comprehensive validation using Pydantic
- **SQL Injection Protection**: SQLAlchemy ORM prevents injection attacks

## Database Design

### Core Entities

- **Users**: Base user accounts (trainers and clients)
- **Trainers**: Professional trainer profiles with certifications
- **Clients**: Client profiles with goals and preferences
- **Exercises**: Exercise library with instructions and metadata
- **Programs**: Workout programs assigned to clients
- **Meals**: Meal plans and nutrition tracking
- **Progress**: Progress tracking and measurements
- **Payments**: Payment processing and subscription management

### Relationships

- User → Trainer (1:1): One user can be one trainer
- User → Client (1:1): One user can be one client
- Trainer → Clients (1:N): One trainer can have many clients
- Trainer → Programs (1:N): One trainer can create many programs
- Client → Programs (1:N): One client can have many programs
- Program → Exercises (N:N): Programs contain multiple exercises
- Client → Progress (1:N): Clients have multiple progress entries

## Configuration Management

Environment-based configuration using Pydantic settings:

```python
class Settings(BaseSettings):
    PROJECT_NAME: str = "FitnessPr Backend"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database
    USE_SQLITE: bool = True
    SQLITE_URL: str = "sqlite:///./fitnesspr.db"
    DATABASE_URL: Optional[str] = None
    
    # Security
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000"]
    ALLOWED_HOSTS: List[str] = ["localhost", "127.0.0.1"]
    
    class Config:
        env_file = ".env"
```

## Error Handling

Centralized error handling with custom exceptions:

```python
class FitnessPrException(Exception):
    """Base exception for FitnessPr application"""
    pass

class EntityNotFound(FitnessPrException):
    """Raised when a requested entity is not found"""
    pass

class ValidationError(FitnessPrException):
    """Raised when data validation fails"""
    pass
```

## Testing Strategy

- **Unit Tests**: Testing individual functions and methods
- **Integration Tests**: Testing API endpoints and database interactions
- **Coverage Reports**: Ensuring comprehensive test coverage
- **Test Database**: Isolated test database for safe testing

## Performance Considerations

- **Connection Pooling**: Database connection pooling for efficiency
- **Query Optimization**: Efficient SQLAlchemy queries with relationships
- **Pagination**: All list endpoints support pagination
- **Caching**: Redis integration ready for caching frequently accessed data
- **Rate Limiting**: Protection against API abuse

## Deployment

- **Docker Support**: Containerized deployment
- **Environment Variables**: Configuration through environment variables
- **Health Checks**: Built-in health check endpoints
- **Logging**: Comprehensive logging for monitoring and debugging
- **Security Headers**: Production-ready security headers

## API Documentation

- **OpenAPI/Swagger**: Automatic API documentation generation
- **Interactive Docs**: Available at `/docs` and `/redoc`
- **Schema Validation**: Request/response validation with detailed error messages
- **Example Responses**: Comprehensive examples for all endpoints

## Future Enhancements

- **WebSocket Support**: Real-time features for live workout sessions
- **File Upload**: Support for profile pictures and exercise videos
- **Email Notifications**: Automated email notifications for important events
- **Advanced Analytics**: Detailed analytics and reporting features
- **Mobile API**: Optimized endpoints for mobile applications
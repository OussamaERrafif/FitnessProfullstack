# API Documentation

## Overview

FitnessPr Backend API is a comprehensive fitness trainer management system built with FastAPI. It provides secure, scalable endpoints for managing trainers, clients, exercises, programs, meals, progress tracking, and payments.

## Base URL

- **Development**: `http://localhost:8000`
- **API Version**: `/api/v1`
- **Documentation**: `/docs` (Swagger UI)
- **ReDoc**: `/redoc`

## Authentication

The API uses JWT (JSON Web Tokens) for authentication.

### Token Request

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "trainer@example.com",
  "password": "securepassword"
}
```

### Response

```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer",
  "expires_in": 691200
}
```

### Using the Token

Include the token in the Authorization header:

```http
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

## Rate Limiting

API endpoints are rate-limited to prevent abuse:

- **General endpoints**: 60 requests per minute
- **Health endpoints**: 30 requests per minute
- **Root endpoint**: 10 requests per minute

## Error Handling

The API returns structured error responses:

```json
{
  "error": true,
  "message": "Validation failed",
  "status_code": 422,
  "request_id": "123e4567-e89b-12d3-a456-426614174000",
  "details": [
    {
      "field": "email",
      "message": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Validation Error
- `429` - Rate Limit Exceeded
- `500` - Internal Server Error

## Endpoints

### Health & Status

#### Health Check
```http
GET /health
```

Returns API health status.

**Response:**
```json
{
  "status": "healthy"
}
```

#### Root Info
```http
GET /
```

Returns basic API information.

**Response:**
```json
{
  "message": "FitnessPr API",
  "version": "0.1.0",
  "status": "running"
}
```

### Authentication

#### Login
```http
POST /api/v1/auth/login
```

**Request Body:**
```json
{
  "email": "trainer@example.com",
  "password": "password123"
}
```

#### Register
```http
POST /api/v1/auth/register
```

**Request Body:**
```json
{
  "email": "newtrainer@example.com",
  "password": "securepassword",
  "full_name": "John Doe",
  "specialization": "Weight Training"
}
```

#### Get Current User
```http
GET /api/v1/auth/me
Authorization: Bearer <token>
```

### Trainers

#### List Trainers
```http
GET /api/v1/trainers?skip=0&limit=10
Authorization: Bearer <token>
```

#### Create Trainer
```http
POST /api/v1/trainers
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "trainer@example.com",
  "full_name": "Jane Smith",
  "specialization": "Yoga & Pilates",
  "bio": "Certified yoga instructor with 5 years experience",
  "hourly_rate": 75.00
}
```

#### Get Trainer
```http
GET /api/v1/trainers/{trainer_id}
Authorization: Bearer <token>
```

#### Update Trainer
```http
PUT /api/v1/trainers/{trainer_id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "full_name": "Jane Smith-Wilson",
  "hourly_rate": 80.00
}
```

#### Delete Trainer
```http
DELETE /api/v1/trainers/{trainer_id}
Authorization: Bearer <token>
```

### Clients

#### List Clients
```http
GET /api/v1/clients?skip=0&limit=10
Authorization: Bearer <token>
```

#### Create Client
```http
POST /api/v1/clients
Authorization: Bearer <token>
Content-Type: application/json

{
  "full_name": "John Client",
  "email": "client@example.com",
  "phone": "+1234567890",
  "date_of_birth": "1990-01-01",
  "gender": "male",
  "fitness_level": "beginner",
  "goals": "Weight loss and muscle building",
  "pin": "1234"
}
```

#### Get Client
```http
GET /api/v1/clients/{client_id}
Authorization: Bearer <token>
```

#### Update Client
```http
PUT /api/v1/clients/{client_id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "fitness_level": "intermediate",
  "goals": "Advanced strength training"
}
```

### Exercises

#### List Exercises
```http
GET /api/v1/exercises?category=strength&skip=0&limit=10
Authorization: Bearer <token>
```

#### Create Exercise
```http
POST /api/v1/exercises
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Push-ups",
  "description": "Basic bodyweight exercise for upper body strength",
  "category": "strength",
  "muscle_groups": ["chest", "shoulders", "triceps"],
  "equipment_needed": "none",
  "difficulty_level": "beginner",
  "instructions": ["Start in plank position", "Lower chest to ground", "Push back up"]
}
```

### Programs

#### List Programs
```http
GET /api/v1/programs?skip=0&limit=10
Authorization: Bearer <token>
```

#### Create Program
```http
POST /api/v1/programs
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Beginner Strength Program",
  "description": "12-week program for building foundational strength",
  "client_id": "client-uuid",
  "duration_weeks": 12,
  "difficulty_level": "beginner"
}
```

### Meals

#### List Meals
```http
GET /api/v1/meals?skip=0&limit=10
Authorization: Bearer <token>
```

#### Create Meal
```http
POST /api/v1/meals
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Post-Workout Smoothie",
  "description": "Protein-rich recovery drink",
  "meal_type": "snack",
  "calories": 350,
  "protein": 25,
  "carbs": 40,
  "fat": 8,
  "ingredients": ["banana", "protein powder", "almond milk"],
  "instructions": "Blend all ingredients until smooth"
}
```

### Progress

#### List Progress Records
```http
GET /api/v1/progress?client_id=client-uuid&skip=0&limit=10
Authorization: Bearer <token>
```

#### Create Progress Record
```http
POST /api/v1/progress
Authorization: Bearer <token>
Content-Type: application/json

{
  "client_id": "client-uuid",
  "measurement_type": "weight",
  "value": 72.5,
  "unit": "kg",
  "notes": "Weekly weigh-in"
}
```

### Payments

#### List Payments
```http
GET /api/v1/payments?skip=0&limit=10
Authorization: Bearer <token>
```

#### Create Payment
```http
POST /api/v1/payments
Authorization: Bearer <token>
Content-Type: application/json

{
  "client_id": "client-uuid",
  "amount": 150.00,
  "currency": "USD",
  "payment_type": "session",
  "description": "Personal training session"
}
```

## Security Features

### Input Validation
- All inputs are validated using Pydantic schemas
- SQL injection protection through ORM
- XSS prevention through input sanitization

### Rate Limiting
- Configurable rate limits per endpoint
- IP-based limiting to prevent abuse

### CORS
- Configurable CORS origins
- Secure defaults for production

### Headers
- Security headers automatically added
- Content Security Policy configured
- HTTPS enforcement in production

## Pagination

Most list endpoints support pagination:

```http
GET /api/v1/clients?skip=0&limit=10
```

**Parameters:**
- `skip` - Number of records to skip (default: 0)
- `limit` - Maximum number of records to return (default: 10, max: 100)

**Response:**
```json
{
  "items": [...],
  "total": 150,
  "skip": 0,
  "limit": 10
}
```

## Environment Variables

See `.env.example` for all configuration options:

```bash
# Database
USE_SQLITE=true
SQLITE_URL=sqlite:///./fitnesspr.db

# Security
SECRET_KEY=your-secret-key
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# CORS
BACKEND_CORS_ORIGINS=http://localhost:3000
ALLOWED_HOSTS=localhost,127.0.0.1

# Rate Limiting
RATE_LIMIT_PER_MINUTE=60
```

## Testing

Run the test suite:

```bash
pytest tests/ -v --cov=app
```

## Monitoring

The API includes comprehensive logging and monitoring:

- Request/response logging with unique request IDs
- Error tracking with full stack traces
- Performance metrics
- Health check endpoints

## Support

For API support:
- Check the interactive documentation at `/docs`
- Review error messages and status codes
- Enable debug logging for development
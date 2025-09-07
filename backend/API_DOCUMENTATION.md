# FitnessPr Backend API Documentation

## Overview
Complete REST API backend for fitness trainer management system with comprehensive CRUD operations, authentication, and business logic.

## Base URL
- Development: `http://localhost:8001`
- API Version: `/api/v1`

## Authentication
All protected endpoints require Bearer token authentication.

### Get Token
```bash
curl -X POST "/api/v1/auth/login" \
-H "Content-Type: application/x-www-form-urlencoded" \
-d "username=your@email.com&password=yourpassword"
```

## Available Endpoints

### 🔐 Authentication (`/api/v1/auth/`)
- `POST /register` - Register new user
- `POST /login` - Login user (get access token)
- `GET /me` - Get current user profile
- `POST /test-token` - Test access token validity

### 👨‍🏫 Trainers (`/api/v1/trainers/`)
- `GET /` - List all trainers
- `POST /` - Create trainer profile
- `GET /{trainer_id}` - Get trainer by ID
- `PUT /{trainer_id}` - Update trainer
- `DELETE /{trainer_id}` - Delete trainer

### 👥 Clients (`/api/v1/clients/`)
- `GET /` - List trainer's clients
- `POST /` - Create new client
- `GET /{client_id}` - Get client by ID
- `PUT /{client_id}` - Update client
- `DELETE /{client_id}` - Delete client
- `GET /search/` - Search clients with filters

### 💪 Exercises (`/api/v1/exercises/`)
- `GET /` - List all exercises
- `POST /` - Create new exercise
- `GET /{exercise_id}` - Get exercise by ID
- `PUT /{exercise_id}` - Update exercise
- `DELETE /{exercise_id}` - Delete exercise
- `POST /search/` - Search exercises with filters
- `GET /categories/` - Get exercise categories
- `GET /muscle-groups/` - Get muscle groups list
- `GET /category/{category}` - Get exercises by category

### 📋 Programs (`/api/v1/programs/`)
- `GET /` - List programs
- `POST /` - Create new workout program
- `GET /{program_id}` - Get program with exercises
- `PUT /{program_id}` - Update program
- `DELETE /{program_id}` - Delete program
- `POST /{program_id}/exercises` - Add exercise to program
- `DELETE /{program_id}/exercises/{exercise_id}` - Remove exercise from program
- `GET /client/{client_id}` - Get client's programs

### 🍽️ Meals (`/api/v1/meals/`)
- `GET /` - List meals
- `POST /` - Create new meal
- `GET /{meal_id}` - Get meal by ID
- `PUT /{meal_id}` - Update meal
- `DELETE /{meal_id}` - Delete meal
- `GET /templates/` - Get meal templates
- `GET /plans/` - List meal plans
- `POST /plans/` - Create meal plan
- `GET /plans/{plan_id}` - Get meal plan by ID

### 💳 Payments (`/api/v1/payments/`)
- `GET /` - List payments
- `POST /` - Create payment
- `GET /{payment_id}` - Get payment by ID
- `GET /subscriptions/` - List subscriptions
- `POST /subscriptions/` - Create subscription
- `PUT /subscriptions/{subscription_id}/cancel` - Cancel subscription
- `GET /payment-methods/` - Get payment methods
- `POST /payment-methods/` - Add payment method
- `PUT /payment-methods/{payment_method_id}/default` - Set default payment method
- `POST /webhooks/stripe` - Stripe webhook handler

### 📊 Progress (`/api/v1/progress/`)
- `GET /` - List progress entries
- `POST /` - Create progress entry
- `GET /{progress_id}` - Get progress entry
- `PUT /{progress_id}` - Update progress entry
- `DELETE /{progress_id}` - Delete progress entry
- `GET /workouts/` - List workout logs
- `POST /workouts/` - Create workout log
- `GET /workouts/stats/{client_id}` - Get workout statistics
- `GET /goals/` - List goals
- `POST /goals/` - Create goal
- `PUT /goals/{goal_id}/achieve` - Mark goal as achieved

## Data Models

### User
- Authentication and basic profile information
- Supports both trainers and clients

### Trainer
- Professional information, specialization, rates
- Linked to user account

### Client
- Personal fitness information, goals, medical conditions
- Assigned to a trainer

### Exercise
- Exercise library with categories, muscle groups
- Difficulty levels and equipment requirements

### Program
- Workout programs with scheduled exercises
- Sets, reps, weights, and progression

### Meal
- Nutrition information and meal planning
- Templates and assigned meal plans

### Payment
- Payment processing and subscription management
- Stripe integration ready

### Progress
- Progress tracking, workout logs, and goals
- Photos, measurements, and achievements

## Example Usage

### Register and Login
```bash
# Register
curl -X POST "http://localhost:8001/api/v1/auth/register" \
-H "Content-Type: application/json" \
-d '{
  "email": "trainer@example.com",
  "password": "secure123",
  "full_name": "John Trainer",
  "is_trainer": true
}'

# Login
curl -X POST "http://localhost:8001/api/v1/auth/login" \
-H "Content-Type: application/x-www-form-urlencoded" \
-d "username=trainer@example.com&password=secure123"
```

### Create Exercise
```bash
curl -X POST "http://localhost:8001/api/v1/exercises/" \
-H "Authorization: Bearer YOUR_TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "name": "Squats",
  "description": "Compound leg exercise",
  "category": "strength",
  "muscle_groups": "quadriceps, glutes, hamstrings",
  "difficulty_level": "intermediate",
  "equipment_needed": "none"
}'
```

### Search Exercises
```bash
curl -X POST "http://localhost:8001/api/v1/exercises/search/" \
-H "Authorization: Bearer YOUR_TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "category": "strength",
  "muscle_groups": "chest",
  "difficulty_level": "beginner"
}'
```

## Features

### ✅ Implemented
- **Authentication**: JWT-based auth with role management
- **CRUD Operations**: Complete Create, Read, Update, Delete for all entities
- **Search & Filtering**: Advanced search across all models
- **Relationships**: Proper foreign key relationships
- **Validation**: Comprehensive input validation
- **Documentation**: Auto-generated OpenAPI/Swagger docs
- **Error Handling**: Proper HTTP status codes and error messages
- **Pagination**: All list endpoints support pagination
- **Role-based Access**: Trainer vs Client permissions

### 🚀 Production Ready
- **Database**: SQLite (dev) / PostgreSQL (production)
- **Security**: Password hashing, JWT tokens, CORS protection
- **Scalability**: Modular service architecture
- **Performance**: Efficient database queries with relationships
- **Monitoring**: Health check endpoints
- **Deployment**: Docker-ready configuration

## Technology Stack
- **Framework**: FastAPI (Python)
- **Database**: SQLAlchemy ORM with SQLite/PostgreSQL
- **Authentication**: JWT with python-jose
- **Validation**: Pydantic models
- **Testing**: pytest framework
- **Documentation**: OpenAPI/Swagger automatic generation
- **Security**: bcrypt password hashing, CORS protection

## Development

### Start Server
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

### API Documentation
- **Swagger UI**: http://localhost:8001/docs
- **ReDoc**: http://localhost:8001/redoc
- **OpenAPI JSON**: http://localhost:8001/api/v1/openapi.json

### Database
```python
# Create tables
from app.core.database import engine, Base
from app.models import *
Base.metadata.create_all(bind=engine)
```

This backend provides a complete foundation for a fitness management application with all necessary endpoints, proper authentication, and comprehensive data models.
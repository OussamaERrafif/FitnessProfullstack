# Developer Documentation

## Table of Contents

1. [Getting Started](#getting-started)
2. [Development Environment Setup](#development-environment-setup)
3. [Coding Standards](#coding-standards)
4. [Project Architecture](#project-architecture)
5. [API Development](#api-development)
6. [Frontend Development](#frontend-development)
7. [Database Management](#database-management)
8. [Testing Guidelines](#testing-guidelines)
9. [Deployment Process](#deployment-process)
10. [Troubleshooting](#troubleshooting)

## Getting Started

### Prerequisites

Ensure you have the following installed:

- **Node.js 18+** (LTS recommended)
- **Python 3.9+**
- **PostgreSQL 13+** (for production) or SQLite (for development)
- **Git** for version control
- **Docker** (optional but recommended)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/OussamaERrafif/FitnessProfullstack.git
   cd FitnessProfullstack
   ```

2. **Backend Setup**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   cp .env.example .env
   # Edit .env with your configuration
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

3. **Frontend Setup**
   ```bash
   cd fitnesspr
   npm install
   cp .env.local.example .env.local
   # Edit .env.local with your configuration
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

## Development Environment Setup

### Backend Environment

1. **Virtual Environment**
   ```bash
   python -m venv venv
   source venv/bin/activate
   ```

2. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   pip install -r requirements-dev.txt  # Development dependencies
   ```

3. **Environment Variables**
   Create `.env` file in backend directory:
   ```env
   # Database
   USE_SQLITE=true
   SQLITE_URL=sqlite:///./fitnesspr.db
   
   # Security
   SECRET_KEY=your-secret-key-here
   ACCESS_TOKEN_EXPIRE_MINUTES=10080
   
   # CORS
   BACKEND_CORS_ORIGINS=http://localhost:3000
   ALLOWED_HOSTS=localhost,127.0.0.1
   
   # Development
   DEBUG=true
   LOG_LEVEL=DEBUG
   ```

4. **Database Initialization**
   ```bash
   # Initialize database
   python -c "from app.utils.init_db import init_db; init_db()"
   
   # Or run migrations (if using Alembic)
   alembic upgrade head
   ```

### Frontend Environment

1. **Install Dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

2. **Environment Variables**
   Create `.env.local` file in fitnesspr directory:
   ```env
   # API Configuration
   NEXT_PUBLIC_API_URL=http://localhost:8000
   NEXT_PUBLIC_API_VERSION=v1
   
   # Authentication
   NEXTAUTH_SECRET=your-nextauth-secret
   NEXTAUTH_URL=http://localhost:3000
   
   # Development
   NODE_ENV=development
   ```

### IDE Configuration

#### VS Code Recommended Extensions

```json
{
  "recommendations": [
    "ms-python.python",
    "ms-python.flake8",
    "ms-python.black-formatter",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

#### VS Code Settings

```json
{
  "python.defaultInterpreterPath": "./backend/venv/bin/python",
  "python.formatting.provider": "black",
  "python.linting.enabled": true,
  "python.linting.flake8Enabled": true,
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

## Coding Standards

### Python (Backend)

#### Code Style

- **PEP 8** compliance enforced by flake8
- **Black** formatter for consistent formatting
- **isort** for import sorting
- **Type hints** required for all functions

```python
# Good
def create_trainer(
    trainer_data: TrainerCreate, 
    user_id: int, 
    db: Session
) -> Trainer:
    """Create a new trainer profile."""
    # Implementation here
    pass

# Bad
def create_trainer(trainer_data, user_id, db):
    # No type hints, no docstring
    pass
```

#### Docstring Convention

Use Google-style docstrings:

```python
def calculate_bmi(weight: float, height: float) -> float:
    """Calculate Body Mass Index.
    
    Args:
        weight: Weight in kilograms
        height: Height in meters
        
    Returns:
        BMI value as float
        
    Raises:
        ValueError: If weight or height is negative
        
    Example:
        >>> bmi = calculate_bmi(70.0, 1.75)
        >>> print(f"BMI: {bmi:.2f}")
        BMI: 22.86
    """
    if weight <= 0 or height <= 0:
        raise ValueError("Weight and height must be positive")
    return weight / (height ** 2)
```

#### Error Handling

```python
# Use specific exceptions
from app.core.exceptions import TrainerNotFound

def get_trainer(trainer_id: int) -> Trainer:
    trainer = db.query(Trainer).filter(Trainer.id == trainer_id).first()
    if not trainer:
        raise TrainerNotFound(f"Trainer with ID {trainer_id} not found")
    return trainer
```

### TypeScript (Frontend)

#### Code Style

- **ESLint** with TypeScript rules
- **Prettier** for formatting
- **Strict TypeScript** configuration
- **Functional components** with hooks

```typescript
// Good
interface TrainerCardProps {
  trainer: Trainer
  onEdit: (id: string) => void
  className?: string
}

export function TrainerCard({ trainer, onEdit, className }: TrainerCardProps) {
  const handleEditClick = useCallback(() => {
    onEdit(trainer.id)
  }, [trainer.id, onEdit])

  return (
    <Card className={className}>
      {/* Component content */}
    </Card>
  )
}

// Bad
export function TrainerCard(props: any) {
  // No type safety, unclear props
  return <div>{props.trainer.name}</div>
}
```

#### Component Documentation

Use JSDoc for component documentation:

```typescript
/**
 * TrainerCard component for displaying trainer information.
 * 
 * @component
 * @example
 * ```tsx
 * <TrainerCard 
 *   trainer={trainerData} 
 *   onEdit={handleEdit}
 *   className="mb-4"
 * />
 * ```
 */
export function TrainerCard({ trainer, onEdit, className }: TrainerCardProps) {
  // Component implementation
}
```

### File Naming Conventions

#### Backend (Python)

- **Snake case** for files: `trainer_service.py`
- **PascalCase** for classes: `TrainerService`
- **Snake case** for functions/variables: `get_trainer_by_id`
- **UPPER_CASE** for constants: `MAX_TRAINERS_PER_PAGE`

#### Frontend (TypeScript)

- **Kebab case** for files: `trainer-card.tsx`
- **PascalCase** for components: `TrainerCard`
- **camelCase** for functions/variables: `handleTrainerEdit`
- **UPPER_CASE** for constants: `API_ENDPOINTS`

## Project Architecture

### Backend Architecture

```
app/
├── api/          # HTTP endpoints
├── core/         # Core functionality (config, database, security)
├── models/       # Database models
├── schemas/      # Pydantic schemas
├── services/     # Business logic
└── utils/        # Utility functions
```

### Frontend Architecture

```
src/
├── app/          # Next.js pages and routes
├── components/   # Reusable UI components
├── lib/          # Utility functions and configurations
├── types/        # TypeScript type definitions
└── hooks/        # Custom React hooks
```

## API Development

### Creating New Endpoints

1. **Define Pydantic Schema**
   ```python
   # schemas/workout.py
   class WorkoutCreate(BaseModel):
       name: str
       description: Optional[str] = None
       duration_minutes: int
       difficulty_level: str = Field(..., regex="^(beginner|intermediate|advanced)$")
   ```

2. **Create Database Model**
   ```python
   # models/workout.py
   class Workout(Base):
       __tablename__ = "workouts"
       
       id = Column(Integer, primary_key=True)
       name = Column(String, nullable=False)
       description = Column(Text)
       duration_minutes = Column(Integer, nullable=False)
       difficulty_level = Column(String, nullable=False)
   ```

3. **Implement Service Layer**
   ```python
   # services/workout_service.py
   class WorkoutService:
       def __init__(self, db: Session):
           self.db = db
           
       def create(self, workout_data: WorkoutCreate) -> Workout:
           """Create a new workout."""
           # Implementation
   ```

4. **Add API Endpoint**
   ```python
   # api/v1/endpoints/workouts.py
   @router.post("/", response_model=WorkoutResponse)
   def create_workout(
       workout_in: WorkoutCreate,
       db: Session = Depends(get_db),
       current_user: User = Depends(get_current_user)
   ):
       """Create a new workout."""
       service = WorkoutService(db)
       return service.create(workout_in)
   ```

### API Documentation

- Use comprehensive docstrings for all endpoints
- Include example requests and responses
- Document all possible error codes
- Provide clear parameter descriptions

## Frontend Development

### Creating New Components

1. **Define Component Interface**
   ```typescript
   // types/workout.ts
   interface Workout {
     id: string
     name: string
     description?: string
     durationMinutes: number
     difficultyLevel: 'beginner' | 'intermediate' | 'advanced'
   }
   
   interface WorkoutCardProps {
     workout: Workout
     onEdit?: (workout: Workout) => void
     onDelete?: (id: string) => void
     className?: string
   }
   ```

2. **Implement Component**
   ```typescript
   // components/workout/workout-card.tsx
   export function WorkoutCard({ workout, onEdit, onDelete, className }: WorkoutCardProps) {
     return (
       <Card className={className}>
         <CardHeader>
           <CardTitle>{workout.name}</CardTitle>
         </CardHeader>
         <CardContent>
           {/* Component content */}
         </CardContent>
       </Card>
     )
   }
   ```

3. **Add to Page**
   ```typescript
   // app/trainer/workouts/page.tsx
   export default function WorkoutsPage() {
     const [workouts, setWorkouts] = useState<Workout[]>([])
     
     return (
       <div className="space-y-4">
         {workouts.map(workout => (
           <WorkoutCard key={workout.id} workout={workout} />
         ))}
       </div>
     )
   }
   ```

### State Management Patterns

#### Local State
```typescript
const [isLoading, setIsLoading] = useState(false)
const [error, setError] = useState<string | null>(null)
```

#### Context for Shared State
```typescript
const ThemeContext = createContext<{
  theme: 'light' | 'dark'
  toggleTheme: () => void
}>()

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  
  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }, [])
  
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
```

## Database Management

### Migrations (Backend)

#### Using Alembic
```bash
# Create migration
alembic revision --autogenerate -m "Add workout table"

# Apply migration
alembic upgrade head

# Rollback migration
alembic downgrade -1
```

#### Manual Database Operations
```python
# utils/init_db.py
def create_tables():
    """Create all database tables."""
    Base.metadata.create_all(bind=engine)

def drop_tables():
    """Drop all database tables."""
    Base.metadata.drop_all(bind=engine)
```

### Database Schema Design

```python
# Example relationship
class Trainer(Base):
    __tablename__ = "trainers"
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # Relationships
    user = relationship("User", back_populates="trainer")
    clients = relationship("Client", back_populates="trainer")
    programs = relationship("Program", back_populates="trainer")
```

## Testing Guidelines

### Backend Testing

#### Unit Tests
```python
# tests/test_trainer_service.py
import pytest
from app.services.trainer_service import TrainerService
from app.schemas.trainer import TrainerCreate

class TestTrainerService:
    def test_create_trainer(self, db_session):
        """Test trainer creation."""
        service = TrainerService(db_session)
        trainer_data = TrainerCreate(
            specialization="Weight Training",
            experience_years=5
        )
        
        trainer = service.create(trainer_data, user_id=1)
        
        assert trainer.id is not None
        assert trainer.specialization == "Weight Training"
```

#### API Tests
```python
# tests/test_api.py
def test_create_trainer_endpoint(client, auth_headers):
    """Test trainer creation endpoint."""
    response = client.post(
        "/api/v1/trainers/",
        json={
            "specialization": "Weight Training",
            "experience_years": 5
        },
        headers=auth_headers
    )
    
    assert response.status_code == 201
    data = response.json()
    assert data["specialization"] == "Weight Training"
```

### Frontend Testing

#### Component Tests
```typescript
// components/__tests__/trainer-card.test.tsx
import { render, screen } from '@testing-library/react'
import { TrainerCard } from '../trainer-card'

describe('TrainerCard', () => {
  it('renders trainer information', () => {
    const trainer = {
      id: '1',
      name: 'John Doe',
      specialization: 'Weight Training'
    }
    
    render(<TrainerCard trainer={trainer} />)
    
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Weight Training')).toBeInTheDocument()
  })
})
```

### Running Tests

```bash
# Backend tests
cd backend
pytest tests/ -v --cov=app

# Frontend tests  
cd fitnesspr
npm test
npm run test:e2e
```

## Deployment Process

### Environment Setup

#### Production Environment Variables
```env
# Backend
DEBUG=false
SECRET_KEY=secure-random-key
DATABASE_URL=postgresql://user:pass@localhost:5432/fitnesspr
ALLOWED_HOSTS=yourdomain.com

# Frontend
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

#### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up -d

# Scale services
docker-compose up -d --scale backend=3
```

### CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run tests
        run: |
          cd backend && pytest
          cd fitnesspr && npm test
  
  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to server
        run: |
          # Deployment commands
```

## Troubleshooting

### Common Issues

#### Backend Issues

**Issue**: Import errors
```bash
# Solution: Ensure PYTHONPATH is set
export PYTHONPATH="${PYTHONPATH}:${PWD}/backend"
```

**Issue**: Database connection errors
```bash
# Check database status
psql -h localhost -U postgres -c "SELECT 1"

# Reset database
python -c "from app.core.database import engine; from app.models import Base; Base.metadata.drop_all(engine); Base.metadata.create_all(engine)"
```

#### Frontend Issues

**Issue**: Module not found errors
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Issue**: TypeScript errors
```bash
# Check TypeScript configuration
npx tsc --noEmit
```

### Development Tools

#### Useful Commands

```bash
# Backend development
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
python -m pytest tests/ -v
black app/ tests/
flake8 app/

# Frontend development
npm run dev
npm run lint
npm run type-check
npm run build
```

#### Debugging

```python
# Backend debugging
import pdb; pdb.set_trace()  # Add breakpoint
import logging; logging.basicConfig(level=logging.DEBUG)
```

```typescript
// Frontend debugging
console.log('Debug:', { variable })
debugger; // Browser breakpoint
```

### Getting Help

1. **Check Documentation**: Review this guide and architecture docs
2. **Search Issues**: Look for similar issues in the repository
3. **Create Issue**: Use the issue template for bug reports
4. **Ask Team**: Reach out to team members for guidance

### Performance Monitoring

#### Backend Monitoring
```python
# Add request timing
import time
start_time = time.time()
# ... request processing
duration = time.time() - start_time
logger.info(f"Request took {duration:.2f}s")
```

#### Frontend Monitoring
```typescript
// Performance monitoring
const start = performance.now()
// ... operation
const duration = performance.now() - start
console.log(`Operation took ${duration}ms`)
```

This developer documentation provides comprehensive guidance for working with the FitnessPr codebase. Keep it updated as the project evolves and new patterns emerge.
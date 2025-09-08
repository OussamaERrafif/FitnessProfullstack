"""
Test utilities and helper functions for FitnessPr backend tests.

This module provides common utility functions, mock objects, and helper methods
used across various test modules to reduce code duplication and improve test
maintainability.
"""

from typing import Any, Dict, Optional
from unittest.mock import Mock, MagicMock

from sqlalchemy.orm import Session

from app.core.security import create_access_token, get_password_hash
from app.models.client import Client
from app.models.exercise import Exercise
from app.models.meal import Meal
from app.models.payment import Payment
from app.models.program import Program
from app.models.progress import Progress
from app.models.trainer import Trainer
from app.models.user import User


def create_test_user(
    db: Session,
    email: str = "test@example.com",
    password: str = "testpassword123",
    full_name: str = "Test User",
    is_trainer: bool = False,
    is_superuser: bool = False,
    **kwargs
) -> User:
    """Create a test user in the database."""
    user_data = {
        "email": email,
        "hashed_password": get_password_hash(password),
        "full_name": full_name,
        "is_active": True,
        "is_trainer": is_trainer,
        "is_superuser": is_superuser,
        **kwargs
    }
    user = User(**user_data)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def create_test_trainer(
    db: Session,
    user: Optional[User] = None,
    **trainer_kwargs
) -> Trainer:
    """Create a test trainer in the database."""
    if not user:
        user = create_test_user(
            db, 
            email="trainer@example.com",
            is_trainer=True
        )
    
    trainer_data = {
        "user_id": user.id,
        "specialization": "Weight Training",
        "certification": "NASM-CPT",
        "experience_years": 5,
        "hourly_rate": 7500,  # Store in cents
        "bio": "Experienced fitness trainer",
        **trainer_kwargs
    }
    trainer = Trainer(**trainer_data)
    db.add(trainer)
    db.commit()
    db.refresh(trainer)
    return trainer


def create_test_client(
    db: Session,
    trainer: Optional[Trainer] = None,
    user: Optional[User] = None,
    **client_kwargs
) -> Client:
    """Create a test client in the database."""
    if not user:
        user = create_test_user(
            db,
            email="client@example.com"
        )
    
    if not trainer:
        trainer = create_test_trainer(db)
    
    client_data = {
        "user_id": user.id,
        "trainer_id": trainer.id,
        "date_of_birth": "1990-01-01",
        "phone_number": "+1234567890",
        "emergency_contact": "Emergency Contact",
        "emergency_phone": "+0987654321",
        "medical_conditions": "None",
        "goals": "Weight loss",
        **client_kwargs
    }
    client = Client(**client_data)
    db.add(client)
    db.commit()
    db.refresh(client)
    return client


def create_test_exercise(
    db: Session,
    **exercise_kwargs
) -> Exercise:
    """Create a test exercise in the database."""
    exercise_data = {
        "name": "Push-ups",
        "description": "Standard push-up exercise",
        "category": "Strength",
        "muscle_groups": ["Chest", "Triceps", "Shoulders"],
        "equipment": ["Body weight"],
        "difficulty_level": "Beginner",
        "instructions": ["Start in plank position", "Lower body", "Push up"],
        "is_active": True,
        **exercise_kwargs
    }
    exercise = Exercise(**exercise_data)
    db.add(exercise)
    db.commit()
    db.refresh(exercise)
    return exercise


def create_test_program(
    db: Session,
    trainer: Optional[Trainer] = None,
    **program_kwargs
) -> Program:
    """Create a test program in the database."""
    if not trainer:
        trainer = create_test_trainer(db)
    
    program_data = {
        "trainer_id": trainer.id,
        "name": "Beginner Strength Program",
        "description": "A comprehensive program for beginners",
        "duration_weeks": 8,
        "sessions_per_week": 3,
        "difficulty_level": "Beginner",
        "goals": ["Strength", "Muscle building"],
        "is_active": True,
        **program_kwargs
    }
    program = Program(**program_data)
    db.add(program)
    db.commit()
    db.refresh(program)
    return program


def create_test_meal(
    db: Session,
    trainer: Optional[Trainer] = None,
    **meal_kwargs
) -> Meal:
    """Create a test meal in the database."""
    if not trainer:
        trainer = create_test_trainer(db)
    
    meal_data = {
        "trainer_id": trainer.id,
        "name": "Grilled Chicken Breast",
        "description": "Lean protein source",
        "meal_type": "Lunch",
        "calories": 165,
        "protein": 31.0,
        "carbohydrates": 0.0,
        "fat": 3.6,
        "ingredients": ["Chicken breast", "Olive oil", "Salt", "Pepper"],
        "preparation_time": 20,
        "cooking_time": 15,
        "instructions": ["Season chicken", "Heat pan", "Cook 6-7 minutes per side"],
        "dietary_restrictions": [],
        "is_template": True,
        **meal_kwargs
    }
    meal = Meal(**meal_data)
    db.add(meal)
    db.commit()
    db.refresh(meal)
    return meal


def create_test_progress(
    db: Session,
    client: Optional[Client] = None,
    trainer: Optional[Trainer] = None,
    **progress_kwargs
) -> Progress:
    """Create a test progress record in the database."""
    if not client:
        client = create_test_client(db, trainer=trainer)
    
    if not trainer and client.trainer:
        trainer = client.trainer
    elif not trainer:
        trainer = create_test_trainer(db)
    
    progress_data = {
        "client_id": client.id,
        "trainer_id": trainer.id,
        "date": "2024-01-15",
        "weight": 70.5,
        "body_fat_percentage": 15.2,
        "muscle_mass": 45.8,
        "notes": "Good progress this week",
        "measurements": {
            "chest": 95.0,
            "waist": 80.0,
            "arms": 35.0,
        },
        **progress_kwargs
    }
    progress = Progress(**progress_data)
    db.add(progress)
    db.commit()
    db.refresh(progress)
    return progress


def create_test_payment(
    db: Session,
    client: Optional[Client] = None,
    trainer: Optional[Trainer] = None,
    **payment_kwargs
) -> Payment:
    """Create a test payment in the database."""
    if not client:
        client = create_test_client(db, trainer=trainer)
    
    if not trainer and client.trainer:
        trainer = client.trainer
    elif not trainer:
        trainer = create_test_trainer(db)
    
    payment_data = {
        "client_id": client.id,
        "trainer_id": trainer.id,
        "amount": 99.99,
        "currency": "usd",
        "description": "Monthly training program",
        "payment_method": "card",
        "status": "pending",
        **payment_kwargs
    }
    payment = Payment(**payment_data)
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return payment


def get_auth_headers(user_id: int, email: str = "test@example.com") -> Dict[str, str]:
    """Generate authentication headers for test requests."""
    token = create_access_token(data={"sub": email, "user_id": user_id})
    return {"Authorization": f"Bearer {token}"}


def mock_stripe_payment_intent():
    """Create a mock Stripe PaymentIntent object."""
    mock_intent = Mock()
    mock_intent.id = "pi_test_123456789"
    mock_intent.status = "succeeded"
    mock_intent.amount = 9999  # $99.99 in cents
    mock_intent.currency = "usd"
    mock_intent.client_secret = "pi_test_123456789_secret_test"
    return mock_intent


def mock_stripe_error(error_type: str = "card_error"):
    """Create a mock Stripe error."""
    mock_error = Mock()
    mock_error.error = Mock()
    mock_error.error.type = error_type
    mock_error.error.code = "card_declined"
    mock_error.error.message = "Your card was declined."
    return mock_error


class MockRedis:
    """Mock Redis client for testing."""
    
    def __init__(self):
        self._data = {}
    
    def get(self, key: str) -> Optional[bytes]:
        """Get value from mock Redis."""
        value = self._data.get(key)
        return value.encode() if value else None
    
    def set(self, key: str, value: str, ex: Optional[int] = None) -> bool:
        """Set value in mock Redis."""
        self._data[key] = value
        return True
    
    def delete(self, key: str) -> int:
        """Delete key from mock Redis."""
        if key in self._data:
            del self._data[key]
            return 1
        return 0
    
    def exists(self, key: str) -> int:
        """Check if key exists in mock Redis."""
        return 1 if key in self._data else 0


def assert_response_structure(response_data: Dict[str, Any], expected_fields: list):
    """Assert that response contains expected fields."""
    for field in expected_fields:
        assert field in response_data, f"Expected field '{field}' not found in response"


def assert_error_response(response_data: Dict[str, Any], expected_detail: Optional[str] = None):
    """Assert that response is a properly formatted error response."""
    assert "detail" in response_data, "Error response should contain 'detail' field"
    if expected_detail:
        assert response_data["detail"] == expected_detail


def create_bulk_test_data(db: Session, count: int = 5) -> Dict[str, list]:
    """Create bulk test data for testing pagination and bulk operations."""
    trainer = create_test_trainer(db)
    
    clients = []
    exercises = []
    programs = []
    meals = []
    
    for i in range(count):
        # Create clients
        user = create_test_user(db, email=f"client{i}@example.com")
        client = create_test_client(
            db,
            trainer=trainer,
            user=user,
            goals=f"Goal {i}"
        )
        clients.append(client)
        
        # Create exercises
        exercise = create_test_exercise(
            db,
            name=f"Exercise {i}",
            category=f"Category {i % 3}",
            difficulty_level=["Beginner", "Intermediate", "Advanced"][i % 3]
        )
        exercises.append(exercise)
        
        # Create programs
        program = create_test_program(
            db,
            trainer=trainer,
            name=f"Program {i}",
            duration_weeks=4 + i
        )
        programs.append(program)
        
        # Create meals
        meal = create_test_meal(
            db,
            trainer=trainer,
            name=f"Meal {i}",
            meal_type=["Breakfast", "Lunch", "Dinner", "Snack"][i % 4]
        )
        meals.append(meal)
    
    return {
        "trainer": trainer,
        "clients": clients,
        "exercises": exercises,
        "programs": programs,
        "meals": meals,
    }
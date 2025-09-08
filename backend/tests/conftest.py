"""
Test configuration and fixtures for FitnessPr backend tests.

This module provides shared fixtures, test database setup, and test utilities
used across all test modules in the FitnessPr backend application.
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import Base, get_db
from app.main import app


# Test database URL - using SQLite in memory for fast testing
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

# Create test engine with special configuration for SQLite
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
    echo=False,  # Set to True for SQL debugging
)

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_test_db():
    """Override database dependency for testing."""
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(scope="function")
def db_session():
    """Create a fresh database session for each test."""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    """Create a test client with database override."""
    app.dependency_overrides[get_db] = lambda: db_session
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def user_data():
    """Sample user data for testing."""
    return {
        "email": "test@example.com",
        "password": "testpassword123",
        "full_name": "Test User",
        "is_active": True,
        "is_trainer": False,
        "is_superuser": False,
    }


@pytest.fixture
def trainer_data():
    """Sample trainer data for testing."""
    return {
        "email": "trainer@example.com",
        "password": "trainerpass123",
        "full_name": "Test Trainer",
        "is_active": True,
        "is_trainer": True,
        "is_superuser": False,
    }


@pytest.fixture
def client_data():
    """Sample client data for testing."""
    return {
        "email": "client@example.com",
        "password": "clientpass123",
        "full_name": "Test Client",
        "date_of_birth": "1990-01-01",
        "phone_number": "+1234567890",
        "emergency_contact": "Emergency Contact",
        "emergency_phone": "+0987654321",
        "medical_conditions": "None",
        "goals": "Weight loss",
        "is_active": True,
    }


@pytest.fixture
def exercise_data():
    """Sample exercise data for testing."""
    return {
        "name": "Push-ups",
        "description": "Standard push-up exercise",
        "category": "Strength",
        "muscle_groups": ["Chest", "Triceps", "Shoulders"],
        "equipment": ["Body weight"],
        "difficulty_level": "Beginner",
        "instructions": ["Start in plank position", "Lower body", "Push up"],
        "is_active": True,
    }


@pytest.fixture
def program_data():
    """Sample program data for testing."""
    return {
        "name": "Beginner Strength Program",
        "description": "A comprehensive program for beginners",
        "duration_weeks": 8,
        "sessions_per_week": 3,
        "difficulty_level": "Beginner",
        "goals": ["Strength", "Muscle building"],
        "is_active": True,
    }


@pytest.fixture
def meal_data():
    """Sample meal data for testing."""
    return {
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
    }


@pytest.fixture
def payment_data():
    """Sample payment data for testing."""
    return {
        "amount": 99.99,
        "currency": "usd",
        "description": "Monthly training program",
        "payment_method": "card",
        "status": "pending",
    }


@pytest.fixture
def progress_data():
    """Sample progress data for testing."""
    return {
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
    }
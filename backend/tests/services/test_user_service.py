"""
Comprehensive unit tests for UserService.

This module tests all aspects of user management including authentication,
CRUD operations, password handling, and user validation.
"""

import pytest
from sqlalchemy.orm import Session

from app.core.security import verify_password
from app.models.user import User
from app.schemas.auth import UserCreate, UserUpdate
from app.services.user_service import UserService
from tests.utils import create_test_user


class TestUserService:
    """Test suite for UserService class."""

    @pytest.fixture
    def user_service(self, db_session: Session):
        """Create UserService instance with test database."""
        return UserService(db_session)

    @pytest.fixture
    def sample_user_create(self):
        """Sample user creation data."""
        return UserCreate(
            email="test@example.com",
            password="testpassword123",
            full_name="Test User"
        )

    def test_create_user_success(self, user_service: UserService, sample_user_create: UserCreate):
        """Test successful user creation."""
        user = user_service.create(sample_user_create)
        
        assert user is not None
        assert user.email == sample_user_create.email
        assert user.full_name == sample_user_create.full_name
        assert user.is_active is True
        assert user.is_trainer is False
        assert user.is_superuser is False
        assert user.hashed_password is not None
        assert user.hashed_password != sample_user_create.password
        assert verify_password(sample_user_create.password, user.hashed_password)

    def test_get_user_by_id_existing(self, user_service: UserService, db_session: Session):
        """Test retrieving existing user by ID."""
        created_user = create_test_user(db_session, email="existing@example.com")
        
        retrieved_user = user_service.get(created_user.id)
        
        assert retrieved_user is not None
        assert retrieved_user.id == created_user.id
        assert retrieved_user.email == created_user.email
        assert retrieved_user.full_name == created_user.full_name

    def test_get_user_by_id_nonexistent(self, user_service: UserService):
        """Test retrieving non-existent user by ID returns None."""
        user = user_service.get(99999)
        assert user is None

    def test_get_user_by_email_existing(self, user_service: UserService, db_session: Session):
        """Test retrieving existing user by email."""
        created_user = create_test_user(db_session, email="test@example.com")
        
        retrieved_user = user_service.get_by_email("test@example.com")
        
        assert retrieved_user is not None
        assert retrieved_user.id == created_user.id
        assert retrieved_user.email == created_user.email

    def test_get_user_by_email_nonexistent(self, user_service: UserService):
        """Test retrieving non-existent user by email returns None."""
        user = user_service.get_by_email("nonexistent@example.com")
        assert user is None

    def test_authenticate_valid_credentials(self, user_service: UserService, sample_user_create: UserCreate):
        """Test authentication with valid credentials."""
        # Create user first
        created_user = user_service.create(sample_user_create)
        
        # Authenticate
        authenticated_user = user_service.authenticate(
            sample_user_create.email,
            sample_user_create.password
        )
        
        assert authenticated_user is not None
        assert authenticated_user.id == created_user.id
        assert authenticated_user.email == created_user.email

    def test_authenticate_invalid_email(self, user_service: UserService):
        """Test authentication with invalid email returns None."""
        user = user_service.authenticate("nonexistent@example.com", "password")
        assert user is None

    def test_authenticate_invalid_password(self, user_service: UserService, sample_user_create: UserCreate):
        """Test authentication with invalid password returns None."""
        # Create user first
        user_service.create(sample_user_create)
        
        # Try to authenticate with wrong password
        user = user_service.authenticate(sample_user_create.email, "wrongpassword")
        assert user is None

    def test_is_active_true(self, user_service: UserService, db_session: Session):
        """Test is_active method returns True for active user."""
        active_user = create_test_user(db_session, is_active=True)
        
        assert user_service.is_active(active_user) is True

    def test_is_active_false(self, user_service: UserService, db_session: Session):
        """Test is_active method returns False for inactive user."""
        inactive_user = create_test_user(db_session, is_active=False)
        
        assert user_service.is_active(inactive_user) is False

    def test_is_superuser_true(self, user_service: UserService, db_session: Session):
        """Test is_superuser method returns True for superuser."""
        superuser = create_test_user(db_session, is_superuser=True)
        
        assert user_service.is_superuser(superuser) is True

    def test_is_superuser_false(self, user_service: UserService, db_session: Session):
        """Test is_superuser method returns False for regular user."""
        regular_user = create_test_user(db_session, is_superuser=False)
        
        assert user_service.is_superuser(regular_user) is False
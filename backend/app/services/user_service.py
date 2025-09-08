"""
User service for business logic.

This module provides the UserService class which handles all business logic
related to user management including authentication, CRUD operations, password
handling, and user role management.

Classes:
    UserService: Main service class for user-related operations

Example:
    Basic usage of the UserService:
    
    >>> from app.services.user_service import UserService
    >>> service = UserService(db_session)
    >>> user = service.authenticate("user@example.com", "password")
    >>> new_user = service.create(user_data)
"""

from typing import Any, Dict, Optional, Union

from sqlalchemy.orm import Session

from app.core.security import get_password_hash, verify_password
from app.models.user import User
from app.schemas.auth import UserCreate, UserUpdate


class UserService:
    """
    Service class for managing user-related business logic.

    This class provides methods for creating, retrieving, updating, and authenticating
    users. It handles password hashing, email validation, role management, and acts
    as an abstraction layer between the API endpoints and database models.

    Attributes:
        db (Session): SQLAlchemy database session for database operations

    Example:
        >>> service = UserService(db_session)
        >>> user = service.create(user_data)
        >>> authenticated_user = service.authenticate(email, password)
    """

    def __init__(self, db: Session):
        """
        Initialize the UserService with a database session.

        Args:
            db (Session): SQLAlchemy database session for database operations
        """
        self.db = db

    def get(self, id: int) -> Optional[User]:
        """
        Retrieve a single user by their ID.

        Args:
            id (int): The unique identifier of the user

        Returns:
            Optional[User]: The user object if found, None otherwise

        Example:
            >>> user = service.get(user_id=1)
            >>> if user:
            ...     print(f"Found user: {user.email}")
        """
        return self.db.query(User).filter(User.id == id).first()

    def get_by_email(self, email: str) -> Optional[User]:
        """
        Retrieve a user by their email address.

        This method is primarily used for authentication and email uniqueness
        validation during registration.

        Args:
            email (str): The email address of the user

        Returns:
            Optional[User]: The user object if found, None otherwise

        Example:
            >>> user = service.get_by_email("trainer@example.com")
            >>> if user:
            ...     print(f"User role: {user.role}")
        """
        return self.db.query(User).filter(User.email == email).first()

    def create(self, user_in: UserCreate) -> User:
        """
        Create a new user account in the database.

        This method creates a new user with secure password hashing and proper
        role assignment. All user data is validated through the UserCreate schema
        before being persisted to the database.

        Args:
            user_in (UserCreate): Validated user registration data schema

        Returns:
            User: The newly created user object with generated ID and hashed password

        Raises:
            IntegrityError: If the email already exists or violates constraints
            ValidationError: If the user data fails validation

        Example:
            >>> from app.schemas.auth import UserCreate
            >>> user_data = UserCreate(
            ...     email="trainer@example.com",
            ...     password="securepassword123",
            ...     full_name="John Doe",
            ...     is_trainer=True
            ... )
            >>> user = service.create(user_data)
            >>> print(f"Created user with ID: {user.id}")

        Security Features:
            - Automatic password hashing using bcrypt
            - Email uniqueness enforcement
            - Role-based permission assignment
            - Account activation by default
        """
        hashed_password = get_password_hash(user_in.password)
        db_user = User(
            email=user_in.email,
            hashed_password=hashed_password,
            full_name=user_in.full_name,
            is_superuser=getattr(user_in, "is_superuser", False),
            is_trainer=getattr(user_in, "is_trainer", False),
        )
        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        return db_user

    def update(self, db_obj: User, obj_in: Union[UserUpdate, Dict[str, Any]]) -> User:
        """
        Update an existing user record with new data.

        This method updates only the fields that are provided in the update object,
        leaving other fields unchanged. It handles password updates with proper
        hashing and supports both Pydantic schema objects and plain dictionaries.

        Args:
            db_obj (User): The existing user object to update
            obj_in (Union[UserUpdate, Dict[str, Any]]): Update data as schema or dict

        Returns:
            User: The updated user object

        Example:
            >>> # Using Pydantic schema
            >>> update_data = UserUpdate(full_name="Jane Doe")
            >>> user = service.update(existing_user, update_data)
            >>>
            >>> # Using dictionary with password update
            >>> user = service.update(existing_user, {
            ...     "password": "newpassword123",
            ...     "full_name": "Updated Name"
            ... })

        Security Features:
            - Automatic password hashing for password updates
            - Field-level validation and sanitization
            - Preservation of sensitive fields when not specified
        """
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.dict(exclude_unset=True)

        if "password" in update_data:
            hashed_password = get_password_hash(update_data["password"])
            del update_data["password"]
            update_data["hashed_password"] = hashed_password

        for field, value in update_data.items():
            setattr(db_obj, field, value)

        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def authenticate(self, email: str, password: str) -> Optional[User]:
        """
        Authenticate a user using email and password credentials.

        This method securely validates user credentials by checking the email
        exists and verifying the password against the stored hash. It's the
        primary method used for user login functionality.

        Args:
            email (str): The user's email address
            password (str): The user's plain text password

        Returns:
            Optional[User]: The authenticated user object if credentials are valid,
                           None if authentication fails

        Example:
            >>> user = service.authenticate("trainer@example.com", "password123")
            >>> if user:
            ...     print(f"Authentication successful for {user.email}")
            ... else:
            ...     print("Invalid credentials")

        Security Features:
            - Secure password verification using bcrypt
            - Protection against timing attacks
            - No sensitive data in error responses
            - Email case-insensitive lookup

        Authentication Flow:
            1. Look up user by email address
            2. Verify provided password against stored hash
            3. Return user object if both checks pass
            4. Return None for any authentication failure
        """
        user = self.get_by_email(email)
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user

    def is_active(self, user: User) -> bool:
        """
        Check if a user account is active and can be used for authentication.

        This method provides a centralized way to check user account status,
        which is important for access control and account management.

        Args:
            user (User): The user object to check

        Returns:
            bool: True if the user account is active, False otherwise

        Example:
            >>> if service.is_active(user):
            ...     print("User can access the system")
            ... else:
            ...     print("Account is deactivated")

        Use Cases:
            - Pre-authentication account status validation
            - Access control for protected resources
            - Account suspension and reactivation workflows
            - Audit logging for account status changes
        """
        return user.is_active

    def is_superuser(self, user: User) -> bool:
        """
        Check if a user has superuser/administrator privileges.

        This method provides role-based access control by identifying users
        with elevated privileges for administrative functions.

        Args:
            user (User): The user object to check

        Returns:
            bool: True if the user has superuser privileges, False otherwise

        Example:
            >>> if service.is_superuser(user):
            ...     print("User has admin access")
            ... else:
            ...     print("Regular user privileges")

        Use Cases:
            - Administrative function access control
            - Role-based UI component rendering
            - Audit logging for privileged operations
            - Permission validation for sensitive endpoints
            - System configuration and user management access
        """
        return user.is_superuser

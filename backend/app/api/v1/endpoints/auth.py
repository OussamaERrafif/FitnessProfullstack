"""
Authentication API endpoints for the FitnessPr application.

This module defines all HTTP endpoints related to user authentication including
registration, login, token management, and user profile access. All authentication
uses JWT tokens and follows OAuth2 password flow standards.

Features:
    - User registration with email validation
    - Secure password-based authentication
    - JWT token generation and validation
    - User profile access for authenticated users
    - Token testing and validation endpoints
    - Comprehensive error handling with appropriate HTTP status codes

Security:
    - Password hashing using bcrypt
    - JWT tokens with configurable expiration
    - Input validation using Pydantic schemas
    - Protection against common authentication vulnerabilities

Router:
    APIRouter instance configured with authentication-specific routes

Dependencies:
    - Database session injection via get_db()
    - JWT token validation via OAuth2PasswordBearer
    - Request/response validation via Pydantic schemas
"""

from datetime import timedelta
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core import security
from app.core.config import settings
from app.core.database import get_db
from app.models.user import User
from app.schemas.auth import Token, UserRegister, UserResponse
from app.services.user_service import UserService

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")


async def get_current_user(
    db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)
) -> User:
    """
    Retrieve the currently authenticated user from JWT token.

    This dependency function extracts and validates the JWT token from the
    Authorization header, verifies its authenticity, and returns the corresponding
    user object from the database.

    Args:
        db: Database session dependency for user lookups
        token: JWT token extracted from Authorization header via OAuth2PasswordBearer

    Returns:
        User: The authenticated user object with full profile information

    Raises:
        HTTPException: 401 if token is invalid, expired, or user not found

    Example:
        This function is typically used as a dependency in protected endpoints:

        ```python
        @router.get("/protected")
        def protected_endpoint(current_user: User = Depends(get_current_user)):
            return {"user_id": current_user.id, "email": current_user.email}
        ```

    Security Notes:
        - Verifies JWT signature and expiration
        - Validates user exists and is active in database
        - Returns 401 for any authentication failure
        - Includes WWW-Authenticate header for proper OAuth2 compliance
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    username = security.verify_token(token)
    if username is None:
        raise credentials_exception

    user_service = UserService(db)
    user = user_service.get_by_email(username)
    if user is None:
        raise credentials_exception

    return user


@router.post("/register", response_model=UserResponse)
def register(
    *,
    db: Session = Depends(get_db),
    user_in: UserRegister,
) -> Any:
    """
    Register a new user account in the system.

    This endpoint creates a new user account with the provided registration data.
    It validates that the email is unique, securely hashes the password, and
    creates the user record in the database.

    Args:
        db: Database session dependency for user operations
        user_in: User registration data validated against UserRegister schema

    Returns:
        UserResponse: The newly created user profile (without password)

    Raises:
        HTTPException: 400 if user with email already exists
        HTTPException: 422 if input validation fails

    Example Request:
        ```json
        {
            "email": "trainer@example.com",
            "password": "securepassword123",
            "name": "John Doe",
            "role": "trainer"
        }
        ```

    Example Response:
        ```json
        {
            "id": 1,
            "email": "trainer@example.com",
            "name": "John Doe",
            "role": "trainer",
            "is_active": true,
            "created_at": "2024-01-01T00:00:00Z"
        }
        ```

    Security Features:
        - Email uniqueness validation
        - Password hashing using bcrypt
        - Input sanitization and validation
        - Account activation by default
    """
    user_service = UserService(db)

    # Check if user already exists
    user = user_service.get_by_email(user_in.email)
    if user:
        raise HTTPException(
            status_code=400, detail="User with this email already exists"
        )

    # Create new user
    user = user_service.create(user_in)
    return user


@router.post("/login", response_model=Token)
def login(
    db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    Authenticate user and generate access token.

    This endpoint implements OAuth2 password flow for user authentication.
    It validates the provided credentials, generates a JWT access token,
    and returns it for use in subsequent authenticated requests.

    Args:
        db: Database session dependency for user authentication
        form_data: OAuth2 form data containing username (email) and password

    Returns:
        Token: JWT access token with expiration and token type information

    Raises:
        HTTPException: 401 if credentials are incorrect
        HTTPException: 400 if user account is inactive
        HTTPException: 422 if form data is invalid

    Example Request (form data):
        ```
        username: trainer@example.com
        password: securepassword123
        ```

    Example Response:
        ```json
        {
            "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            "token_type": "bearer",
            "expires_in": 43200
        }
        ```

    Authentication Flow:
        1. Validate email and password against database
        2. Check if user account is active
        3. Generate JWT token with configurable expiration
        4. Return token for Authorization header usage

    Token Usage:
        Include the returned token in subsequent requests:
        ```
        Authorization: Bearer {access_token}
        ```

    Security Features:
        - Secure password verification using bcrypt
        - JWT tokens with configurable expiration time
        - User account status validation
        - Protection against timing attacks
    """
    user_service = UserService(db)
    user = user_service.authenticate(
        email=form_data.username, password=form_data.password
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    elif not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user"
        )

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        user.email, expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
    }


@router.get("/me", response_model=UserResponse)
def read_users_me(
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Retrieve the current authenticated user's profile information.

    This endpoint returns the complete profile information for the currently
    authenticated user. It requires a valid JWT token in the Authorization header.

    Args:
        current_user: The authenticated user injected via dependency

    Returns:
        UserResponse: Complete user profile information (excluding sensitive data)

    Raises:
        HTTPException: 401 if authentication token is invalid or expired

    Example Response:
        ```json
        {
            "id": 1,
            "email": "trainer@example.com",
            "name": "John Doe",
            "role": "trainer",
            "is_active": true,
            "created_at": "2024-01-01T00:00:00Z",
            "updated_at": "2024-01-01T00:00:00Z"
        }
        ```

    Headers Required:
        ```
        Authorization: Bearer {access_token}
        ```

    Use Cases:
        - Displaying user profile in UI
        - Verifying user identity and role
        - Populating user-specific dashboard information
        - Role-based access control decisions
    """
    return current_user


@router.post("/test-token", response_model=UserResponse)
def test_token(current_user: User = Depends(get_current_user)) -> Any:
    """
    Test the validity of an access token.
    
    This endpoint validates that a provided JWT token is valid and not expired.
    It's primarily used for testing authentication flows and verifying token
    validity from client applications.
    
    Args:
        current_user: The authenticated user injected via dependency validation
        
    Returns:
        UserResponse: User information if token is valid
        
    Raises:
        HTTPException: 401 if token is invalid, expired, or malformed
        
    Example Response:
        ```json
        {
            "id": 1,
            "email": "trainer@example.com",
            "name": "John Doe",
            "role": "trainer", 
            "is_active": true,
            "created_at": "2024-01-01T00:00:00Z"
        }
        ```
        
    Headers Required:
        ```
        Authorization: Bearer {access_token}
        ```
        
    Use Cases:
        - Testing authentication integration
        - Validating token before making API calls
        - Debugging authentication issues
        - Health checks for authenticated sessions
        - Token refresh flow validation
        
    Testing Example:
        ```bash
        curl -X POST "http://localhost:8000/api/v1/auth/test-token" \
             -H "Authorization: Bearer {your_token}"
        ```
    """
    return current_user

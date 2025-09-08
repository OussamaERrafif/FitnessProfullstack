"""
User model for authentication and user management.

This model represents the core user entity in the FitnessPr application,
supporting both regular users and trainers with role-based access control.
Includes comprehensive fields for user management, security, and relationships.

Database Features:
    - Primary key with auto-increment
    - Unique email constraint for authentication
    - Indexed fields for optimized queries
    - Timestamps with automatic creation and update tracking
    - Boolean flags for user states and roles
    - One-to-one relationship with trainer profiles

Security Features:
    - Password hashing (never stores plain text passwords)
    - Email-based authentication
    - Role-based permissions (user, trainer, superuser)
    - Account activation/deactivation support

Relationships:
    - Trainer: One-to-one relationship for trainer profiles
    - Additional relationships defined in related models

Usage Examples:
    Creating a new user:
        user = User(
            email="user@example.com",
            hashed_password=hash_password("secure_password"),
            full_name="John Doe",
            is_active=True
        )
    
    Creating a trainer:
        trainer_user = User(
            email="trainer@example.com", 
            hashed_password=hash_password("password"),
            full_name="Jane Trainer",
            is_trainer=True,
            is_active=True
        )

Database Schema:
    Table: users
    Constraints: 
        - PRIMARY KEY (id)
        - UNIQUE (email)
        - INDEX (email, full_name)
"""

from sqlalchemy import Boolean, Column, DateTime, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class User(Base):
    """
    User model for authentication and profile management.

    Represents a user in the FitnessPr application with support for different
    user types (regular users, trainers, superusers) and comprehensive
    user management features.

    Attributes:
        id (int): Primary key, auto-incrementing unique identifier
        email (str): Unique email address for authentication and communication
        hashed_password (str): Bcrypt hashed password for secure authentication
        full_name (str): User's full display name, indexed for search
        is_active (bool): Account activation status, defaults to True
        is_superuser (bool): Administrative privileges flag, defaults to False
        is_trainer (bool): Trainer role flag for role-based access, defaults to False
        created_at (datetime): Account creation timestamp with timezone
        updated_at (datetime): Last modification timestamp, auto-updated

    Relationships:
        trainer (Trainer): One-to-one relationship to trainer profile
            - Only populated if is_trainer=True
            - Contains trainer-specific information (specialization, rates, etc.)
            - Accessible via user.trainer when user has trainer role

    Indexes:
        - Primary index on id (primary key)
        - Unique index on email (authentication lookup)
        - Standard index on full_name (user search/filtering)

    Constraints:
        - email: UNIQUE, NOT NULL (required for authentication)
        - hashed_password: NOT NULL (security requirement)
        - Other fields: Allow NULL with appropriate defaults

    Security Considerations:
        - Password is always hashed using bcrypt before storage
        - Email uniqueness enforced at database level
        - Role flags control access to different application areas
        - Soft deletion supported via is_active flag
    """

    __tablename__ = "users"

    # Primary identification
    id = Column(
        Integer, primary_key=True, index=True, doc="Unique identifier for the user"
    )

    # Authentication fields
    email = Column(
        String,
        unique=True,
        index=True,
        nullable=False,
        doc="Unique email address for login and communication",
    )
    hashed_password = Column(
        String, nullable=False, doc="Bcrypt hashed password for secure authentication"
    )

    # Profile information
    full_name = Column(String, index=True, doc="User's full display name, searchable")

    # Status and role flags
    is_active = Column(
        Boolean, default=True, doc="Account activation status for soft deletion"
    )
    is_superuser = Column(
        Boolean, default=False, doc="Administrative privileges for system management"
    )
    is_trainer = Column(
        Boolean, default=False, doc="Trainer role flag for accessing trainer features"
    )

    # Timestamps with timezone support
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        doc="Account creation timestamp",
    )
    updated_at = Column(
        DateTime(timezone=True),
        onupdate=func.now(),
        doc="Last profile update timestamp",
    )

    # Relationships with other models
    trainer = relationship(
        "Trainer",
        back_populates="user",
        uselist=False,
        doc="One-to-one trainer profile relationship",
    )

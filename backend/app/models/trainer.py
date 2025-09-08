"""
Trainer model for fitness professional profiles and services.

This model represents detailed trainer profiles in the FitnessPr application,
extending the basic User model with trainer-specific information including
specializations, experience, rates, and professional credentials.

Database Features:
    - One-to-one relationship with User model
    - Foreign key constraint ensuring data integrity
    - Indexed fields for efficient trainer search and filtering
    - Flexible text fields for professional information
    - Rate storage in cents for precise financial calculations

Professional Features:
    - Specialization tracking (strength, cardio, yoga, etc.)
    - Experience quantification in years
    - Certification validation and storage
    - Hourly rate management with precise pricing
    - Professional biography for client matching

Search and Discovery:
    - Specialization indexing for filtered searches
    - Experience-based trainer ranking
    - Rate-based price filtering
    - Bio content for trainer matching algorithms

Usage Examples:
    Creating trainer profile:
        trainer = Trainer(
            user_id=user.id,
            specialization="Strength Training",
            experience_years=5,
            bio="Certified strength coach...",
            certification="NASM-CPT",
            hourly_rate=7500  # $75.00 in cents
        )
    
    Searching trainers by specialization:
        strength_trainers = session.query(Trainer).filter(
            Trainer.specialization.contains("Strength")
        ).all()

Database Schema:
    Table: trainers
    Constraints:
        - PRIMARY KEY (id)
        - FOREIGN KEY (user_id) REFERENCES users(id)
        - UNIQUE (user_id) - one trainer profile per user
        - INDEX (specialization) for search optimization
"""

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class Trainer(Base):
    """
    Trainer profile model for fitness professionals.
    
    Extends User model with trainer-specific professional information,
    rates, specializations, and credentials. Designed to support
    trainer discovery, client matching, and service management.
    
    Attributes:
        id (int): Primary key, auto-incrementing unique identifier
        user_id (int): Foreign key to User model, unique one-to-one relationship
        specialization (str): Primary fitness specialization area, indexed for search
        experience_years (int): Years of professional training experience
        bio (Text): Detailed professional biography and approach description
        certification (str): Professional certifications and credentials
        hourly_rate (int): Hourly rate in cents for precise financial calculations
        created_at (datetime): Profile creation timestamp with timezone
        updated_at (datetime): Last modification timestamp, auto-updated
        
    Relationships:
        user (User): One-to-one relationship back to User model
            - Contains authentication and basic profile information
            - Accessed via trainer.user for full user details
            - Ensures trainer profiles are always linked to valid users
            
    Indexes:
        - Primary index on id (primary key)
        - Unique index on user_id (one-to-one constraint)
        - Standard index on specialization (trainer search/filtering)
        
    Constraints:
        - user_id: UNIQUE, FOREIGN KEY to users.id
        - Ensures each user can have only one trainer profile
        - Maintains referential integrity with User model
        
    Financial Considerations:
        - hourly_rate stored in cents to avoid floating-point precision issues
        - Allows rates from $0.01 to $999,999.99 per hour
        - Easy conversion to display currency: hourly_rate / 100
        - Supports international currency precision requirements
        
    Search Optimization:
        - specialization field indexed for fast filtering
        - Supports partial matching for trainer discovery
        - Experience years enable experience-based sorting
        - Bio content available for full-text search capabilities
    """
    __tablename__ = "trainers"

    # Primary identification
    id = Column(Integer, primary_key=True, index=True,
                doc="Unique identifier for trainer profile")
    
    # User relationship
    user_id = Column(Integer, ForeignKey("users.id"), unique=True,
                     doc="One-to-one foreign key reference to User model")
    
    # Professional information
    specialization = Column(String, index=True,
                           doc="Primary fitness specialization (strength, cardio, yoga, etc.)")
    experience_years = Column(Integer,
                             doc="Years of professional training experience")
    bio = Column(Text,
                doc="Detailed professional biography and training approach")
    certification = Column(String,
                          doc="Professional certifications and credentials")
    
    # Service pricing
    hourly_rate = Column(Integer,
                        doc="Hourly rate in cents for precise financial calculations")
    
    # Timestamps with timezone support
    created_at = Column(DateTime(timezone=True), server_default=func.now(),
                       doc="Trainer profile creation timestamp")
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(),
                       doc="Last profile update timestamp")

    # Relationships with other models
    user = relationship("User", back_populates="trainer",
                       doc="One-to-one relationship back to User model")

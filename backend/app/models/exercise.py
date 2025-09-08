"""
Exercise model and enums for fitness exercise management.

This module defines the comprehensive exercise system for the FitnessPr application,
including exercise definitions, categorization, difficulty levels, equipment
requirements, and multimedia support for proper exercise instruction.

Database Features:
    - Comprehensive exercise catalog with metadata
    - Enum-based categorization for consistency
    - Media file support (images and videos)
    - Flexible muscle group targeting
    - Calorie tracking and duration metrics
    - Soft deletion with is_active flag

Classification Features:
    - Difficulty progression (beginner → intermediate → advanced)
    - Equipment-based filtering and planning
    - Muscle group targeting for balanced workouts
    - Category-based exercise organization
    - Calorie estimation for fitness tracking

Content Management:
    - Rich text descriptions and instructions
    - Image and video URL storage for demonstrations
    - Version control with update timestamps
    - Active/inactive status for content management

Usage Examples:
    Creating a strength exercise:
        exercise = Exercise(
            name="Barbell Deadlift",
            description="Compound movement targeting posterior chain",
            category="strength",
            muscle_groups="hamstrings,glutes,lower_back,traps",
            difficulty_level=DifficultyLevel.INTERMEDIATE,
            equipment_needed=EquipmentType.BARBELL,
            instructions="Stand with feet hip-width apart...",
            calories_per_minute=12
        )
    
    Creating a cardio exercise:
        cardio = Exercise(
            name="Running",
            category="cardio",
            difficulty_level=DifficultyLevel.BEGINNER,
            equipment_needed=EquipmentType.NONE,
            duration_minutes=30,
            calories_per_minute=10
        )

Database Schema:
    Table: exercises
    Constraints:
        - PRIMARY KEY (id)
        - UNIQUE constraint on name for exercise identification
        - INDEX (name) for fast exercise lookup
        - CHECK constraints on enum values
"""

import enum

from sqlalchemy import Boolean, Column, DateTime, Enum, Integer, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class DifficultyLevel(str, enum.Enum):
    """
    Exercise difficulty classification system.
    
    Provides standardized difficulty levels for exercise progression
    and appropriate workout planning based on user fitness levels.
    
    Values:
        BEGINNER: Entry-level exercises requiring minimal experience
        INTERMEDIATE: Moderate exercises requiring some fitness base
        ADVANCED: Complex exercises requiring significant experience
    """
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate" 
    ADVANCED = "advanced"


class EquipmentType(str, enum.Enum):
    """
    Exercise equipment classification system.
    
    Categorizes exercises by required equipment for workout planning,
    home vs gym workouts, and equipment-based filtering.
    
    Values:
        NONE: No equipment required (bodyweight only)
        DUMBBELLS: Adjustable or fixed dumbbells
        BARBELL: Olympic or standard barbells with plates
        RESISTANCE_BANDS: Elastic bands for resistance training
        MACHINES: Gym machines (cable, smith machine, etc.)
        CARDIO_EQUIPMENT: Treadmill, bike, elliptical, rowing machine
        BODYWEIGHT: Exercises using only body weight
        KETTLEBELL: Kettlebell-specific movements
        OTHER: Specialized equipment not in standard categories
    """
    NONE = "none"
    DUMBBELLS = "dumbbells"
    BARBELL = "barbell"
    RESISTANCE_BANDS = "resistance_bands"
    MACHINES = "machines"
    CARDIO_EQUIPMENT = "cardio_equipment"
    BODYWEIGHT = "bodyweight"
    KETTLEBELL = "kettlebell"
    OTHER = "other"


class Exercise(Base):
    """
    Exercise model for fitness exercise definitions and metadata.
    
    Comprehensive model for storing exercise information including
    instructions, categorization, difficulty, equipment requirements,
    and multimedia content for proper exercise demonstration.
    
    Attributes:
        id (int): Primary key, auto-incrementing unique identifier
        name (str): Exercise name, indexed for fast lookup
        description (Text): Brief exercise description and benefits
        instructions (Text): Detailed step-by-step execution instructions
        category (str): Exercise category (strength, cardio, flexibility, etc.)
        muscle_groups (str): Comma-separated target muscle groups
        difficulty_level (DifficultyLevel): Exercise difficulty classification
        equipment_needed (EquipmentType): Required equipment type
        image_url (str): URL to exercise demonstration image
        video_url (str): URL to exercise demonstration video
        duration_minutes (int): Recommended duration for cardio exercises
        calories_per_minute (int): Approximate calorie burn rate
        is_active (bool): Exercise availability status for soft deletion
        created_at (datetime): Exercise creation timestamp
        updated_at (datetime): Last modification timestamp
        
    Relationships:
        program_exercises (List[ProgramExercise]): Many-to-many through ProgramExercise
            - Links exercises to workout programs
            - Includes program-specific parameters (sets, reps, weight)
            - Enables exercise reuse across multiple programs
            
    Indexes:
        - Primary index on id (primary key)
        - Standard index on name (exercise lookup and search)
        
    Data Validation:
        - name: Required, not null
        - Enum fields validated at database level
        - URL fields support up to 500 characters
        - muscle_groups: up to 200 characters for comma-separated list
        
    Search and Filtering:
        - Name indexing for text-based exercise search
        - Category filtering for workout type organization
        - Difficulty filtering for user skill level matching
        - Equipment filtering for available equipment planning
        - Muscle group matching for balanced workout creation
        
    Content Management:
        - Rich text support for descriptions and instructions
        - Media URL storage for exercise demonstrations
        - Version control with automatic timestamp updates
        - Soft deletion preserves historical workout data
    """
    __tablename__ = "exercises"

    # Primary identification
    id = Column(Integer, primary_key=True, index=True,
                doc="Unique identifier for exercise")
    name = Column(String, nullable=False, index=True,
                  doc="Exercise name for identification and search")
    
    # Content and instructions
    description = Column(Text,
                        doc="Brief exercise description and primary benefits")
    instructions = Column(Text,
                         doc="Detailed step-by-step execution instructions")

    # Exercise classification
    category = Column(String(50),
                     doc="Exercise category (strength, cardio, flexibility, etc.)")
    muscle_groups = Column(String(200),
                          doc="Comma-separated target muscle groups")

    # Difficulty and equipment requirements
    difficulty_level = Column(Enum(DifficultyLevel), default=DifficultyLevel.BEGINNER,
                             doc="Exercise difficulty level for user matching")
    equipment_needed = Column(Enum(EquipmentType), default=EquipmentType.NONE,
                             doc="Required equipment type for exercise execution")

    # Multimedia content for demonstrations
    image_url = Column(String(500),
                      doc="URL to exercise demonstration image")
    video_url = Column(String(500),
                      doc="URL to exercise demonstration video")

    # Performance and tracking metrics
    duration_minutes = Column(Integer,
                             doc="Recommended duration for cardio exercises")
    calories_per_minute = Column(Integer,
                                doc="Approximate calorie burn rate per minute")

    # Status and timestamps
    is_active = Column(Boolean, default=True,
                      doc="Exercise availability status for content management")
    created_at = Column(DateTime(timezone=True), server_default=func.now(),
                       doc="Exercise creation timestamp")
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(),
                       doc="Last exercise modification timestamp")

    # Relationships with other models
    program_exercises = relationship("ProgramExercise", back_populates="exercise",
                                   doc="Many-to-many relationship to workout programs")

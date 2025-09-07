"""
Exercise model.
"""

from sqlalchemy import Column, DateTime, Enum, Integer, String, Text, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.core.database import Base


class DifficultyLevel(str, enum.Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"


class EquipmentType(str, enum.Enum):
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
    __tablename__ = "exercises"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    description = Column(Text)
    instructions = Column(Text)
    
    # Categories
    category = Column(String(50))  # strength, cardio, flexibility, etc.
    muscle_groups = Column(String(200))  # comma-separated muscle groups
    
    # Difficulty and equipment
    difficulty_level = Column(Enum(DifficultyLevel), default=DifficultyLevel.BEGINNER)
    equipment_needed = Column(Enum(EquipmentType), default=EquipmentType.NONE)
    
    # Media files
    image_url = Column(String(500))
    video_url = Column(String(500))
    
    # Metrics
    duration_minutes = Column(Integer)  # for cardio exercises
    calories_per_minute = Column(Integer)  # approximate calories burned
    
    # Status
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    program_exercises = relationship("ProgramExercise", back_populates="exercise")
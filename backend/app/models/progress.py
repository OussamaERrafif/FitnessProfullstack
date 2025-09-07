"""
Progress tracking models.
"""

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text, Boolean, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.core.database import Base


class MeasurementType(str, enum.Enum):
    WEIGHT = "weight"
    BODY_FAT = "body_fat"
    MUSCLE_MASS = "muscle_mass"
    CHEST = "chest"
    WAIST = "waist"
    HIPS = "hips"
    BICEPS = "biceps"
    THIGHS = "thighs"
    OTHER = "other"


class Progress(Base):
    __tablename__ = "progress"

    id = Column(Integer, primary_key=True, index=True)
    
    # Relationships
    client_id = Column(Integer, ForeignKey("clients.id"))
    trainer_id = Column(Integer, ForeignKey("trainers.id"))
    
    # Progress details
    date = Column(DateTime(timezone=True), default=func.now())
    weight = Column(Float)  # in kg
    body_fat_percentage = Column(Float)
    muscle_mass = Column(Float)  # in kg
    
    # Body measurements (in cm)
    chest = Column(Float)
    waist = Column(Float)
    hips = Column(Float)
    biceps_left = Column(Float)
    biceps_right = Column(Float)
    thigh_left = Column(Float)
    thigh_right = Column(Float)
    
    # Progress photos
    front_photo_url = Column(String(500))
    side_photo_url = Column(String(500))
    back_photo_url = Column(String(500))
    
    # Notes
    notes = Column(Text)
    trainer_notes = Column(Text)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    client = relationship("Client", back_populates="progress_entries")
    trainer = relationship("Trainer", backref="client_progress")


class WorkoutLog(Base):
    """Log of completed workouts by clients."""
    __tablename__ = "workout_logs"

    id = Column(Integer, primary_key=True, index=True)
    
    # Relationships
    client_id = Column(Integer, ForeignKey("clients.id"))
    program_id = Column(Integer, ForeignKey("programs.id"))
    trainer_id = Column(Integer, ForeignKey("trainers.id"))
    
    # Workout details
    date = Column(DateTime(timezone=True), default=func.now())
    duration_minutes = Column(Integer)
    calories_burned = Column(Integer)
    notes = Column(Text)
    completed = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    client = relationship("Client", backref="workout_logs")
    program = relationship("Program", backref="workout_logs")
    trainer = relationship("Trainer", backref="client_workout_logs")
    exercise_logs = relationship("ExerciseLog", back_populates="workout_log")


class ExerciseLog(Base):
    """Log of individual exercises within a workout."""
    __tablename__ = "exercise_logs"

    id = Column(Integer, primary_key=True, index=True)
    
    # Relationships
    workout_log_id = Column(Integer, ForeignKey("workout_logs.id"))
    exercise_id = Column(Integer, ForeignKey("exercises.id"))
    
    # Exercise performance
    sets_completed = Column(Integer)
    reps_completed = Column(String(50))  # actual reps performed
    weight_used = Column(Float)  # in kg
    duration_seconds = Column(Integer)  # for time-based exercises
    distance_meters = Column(Float)  # for distance-based exercises
    
    # Notes
    notes = Column(Text)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    workout_log = relationship("WorkoutLog", back_populates="exercise_logs")
    exercise = relationship("Exercise", backref="exercise_logs")


class Goal(Base):
    """Client goals and targets."""
    __tablename__ = "goals"

    id = Column(Integer, primary_key=True, index=True)
    
    # Relationships
    client_id = Column(Integer, ForeignKey("clients.id"))
    trainer_id = Column(Integer, ForeignKey("trainers.id"))
    
    # Goal details
    title = Column(String(200), nullable=False)
    description = Column(Text)
    target_value = Column(Float)  # target weight, body fat %, etc.
    current_value = Column(Float)
    unit = Column(String(20))  # kg, %, cm, etc.
    
    # Dates
    target_date = Column(DateTime(timezone=True))
    achieved_date = Column(DateTime(timezone=True), nullable=True)
    
    # Status
    is_achieved = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    client = relationship("Client", backref="client_goals")
    trainer = relationship("Trainer", backref="trainer_goals")
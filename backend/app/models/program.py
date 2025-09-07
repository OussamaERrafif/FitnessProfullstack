"""
Program models for workout programs.
"""

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class Program(Base):
    __tablename__ = "programs"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    description = Column(Text)

    # Relationships
    trainer_id = Column(Integer, ForeignKey("trainers.id"))
    client_id = Column(Integer, ForeignKey("clients.id"))

    # Program details
    duration_weeks = Column(Integer)  # program duration
    sessions_per_week = Column(Integer)
    difficulty_level = Column(String(20))
    goals = Column(Text)  # program goals

    # Status
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    trainer = relationship("Trainer", backref="programs")
    client = relationship("Client", back_populates="programs")
    program_exercises = relationship("ProgramExercise", back_populates="program")


class ProgramExercise(Base):
    """Junction table for Program and Exercise with additional details."""

    __tablename__ = "program_exercises"

    id = Column(Integer, primary_key=True, index=True)
    program_id = Column(Integer, ForeignKey("programs.id"))
    exercise_id = Column(Integer, ForeignKey("exercises.id"))

    # Exercise details in the program
    sets = Column(Integer)
    reps = Column(String(50))  # "8-12" or "10" or "30 seconds"
    weight = Column(Float)  # in kg
    rest_seconds = Column(Integer)
    notes = Column(Text)
    order_in_program = Column(Integer)  # exercise order

    # Week and day specifics
    week_number = Column(Integer)
    day_number = Column(Integer)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    program = relationship("Program", back_populates="program_exercises")
    exercise = relationship("Exercise", back_populates="program_exercises")

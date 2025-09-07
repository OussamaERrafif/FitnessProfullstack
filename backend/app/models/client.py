"""
Client model.
"""

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class Client(Base):
    __tablename__ = "clients"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    trainer_id = Column(Integer, ForeignKey("trainers.id"))
    
    # Personal information
    age = Column(Integer)
    gender = Column(String(10))
    height = Column(Float)  # in cm
    weight = Column(Float)  # in kg
    
    # Fitness information
    fitness_level = Column(String(20))  # beginner, intermediate, advanced
    goals = Column(Text)  # fitness goals
    medical_conditions = Column(Text)  # any medical conditions
    preferences = Column(Text)  # workout preferences
    
    # Contact information
    phone = Column(String(20))
    emergency_contact = Column(String(100))
    emergency_phone = Column(String(20))
    
    # Status
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", backref="client")
    trainer = relationship("Trainer", backref="clients")
    programs = relationship("Program", back_populates="client")
    progress_entries = relationship("Progress", back_populates="client")
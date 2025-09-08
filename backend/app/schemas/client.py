"""
Client schemas.
"""

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, field_validator


class ClientBase(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    height: Optional[float] = None
    weight: Optional[float] = None
    fitness_level: Optional[str] = None
    goals: Optional[str] = None
    medical_conditions: Optional[str] = None
    preferences: Optional[str] = None
    phone: Optional[str] = None
    emergency_contact: Optional[str] = None
    emergency_phone: Optional[str] = None
    is_active: Optional[bool] = True

    @field_validator("fitness_level")
    @classmethod
    def validate_fitness_level(cls, v):
        if v and v.lower() not in ["beginner", "intermediate", "advanced"]:
            raise ValueError(
                "fitness_level must be beginner, intermediate, or advanced"
            )
        return v.lower() if v else v

    @field_validator("gender")
    @classmethod
    def validate_gender(cls, v):
        if v and v.lower() not in ["male", "female", "other"]:
            raise ValueError("gender must be male, female, or other")
        return v.lower() if v else v


class ClientCreate(ClientBase):
    name: str  # Required for client creation
    email: str  # Required for client creation
    trainer_id: Optional[int] = None  # will be set from current user
    user_id: Optional[int] = None  # will be set from current user
    
    class Config:
        json_schema_extra = {
            "example": {
                "name": "John Doe",
                "email": "john.doe@example.com",
                "age": 30,
                "gender": "male",
                "height": 175.5,
                "weight": 80.0,
                "fitness_level": "beginner",
                "goals": "Weight loss and muscle building",
                "medical_conditions": "None",
                "preferences": "Prefers morning workouts",
                "phone": "+1234567890",
                "emergency_contact": "Jane Doe",
                "emergency_phone": "+1234567891"
            }
        }


class ClientUpdate(ClientBase):
    pass


class ClientInDBBase(ClientBase):
    id: Optional[int] = None
    user_id: Optional[int] = None
    trainer_id: Optional[int] = None
    pin: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class Client(ClientInDBBase):
    pass


class ClientResponse(ClientInDBBase):
    # Include trainer info if needed
    trainer: Optional[dict] = None

    class Config:
        from_attributes = True


class ClientListResponse(BaseModel):
    clients: List[ClientResponse]
    total: int
    page: int
    size: int

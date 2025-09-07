"""
Client schemas.
"""

from typing import Optional, List
from datetime import datetime

from pydantic import BaseModel, validator


class ClientBase(BaseModel):
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

    @validator('fitness_level')
    def validate_fitness_level(cls, v):
        if v and v.lower() not in ['beginner', 'intermediate', 'advanced']:
            raise ValueError('fitness_level must be beginner, intermediate, or advanced')
        return v.lower() if v else v

    @validator('gender')
    def validate_gender(cls, v):
        if v and v.lower() not in ['male', 'female', 'other']:
            raise ValueError('gender must be male, female, or other')
        return v.lower() if v else v


class ClientCreate(ClientBase):
    trainer_id: int
    user_id: Optional[int] = None  # will be set from current user


class ClientUpdate(ClientBase):
    pass


class ClientInDBBase(ClientBase):
    id: Optional[int] = None
    user_id: Optional[int] = None
    trainer_id: Optional[int] = None
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
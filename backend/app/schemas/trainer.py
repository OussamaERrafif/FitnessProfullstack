"""
Trainer schemas.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class TrainerBase(BaseModel):
    specialization: Optional[str] = None
    experience_years: Optional[int] = None
    bio: Optional[str] = None
    certification: Optional[str] = None
    hourly_rate: Optional[int] = None


class TrainerCreate(TrainerBase):
    specialization: str
    experience_years: int


class TrainerUpdate(TrainerBase):
    pass


class TrainerInDBBase(TrainerBase):
    id: Optional[int] = None
    user_id: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class Trainer(TrainerInDBBase):
    pass


class TrainerResponse(TrainerInDBBase):
    pass

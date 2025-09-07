"""
Exercise schemas.
"""

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, field_validator

from app.models.exercise import DifficultyLevel, EquipmentType


class ExerciseBase(BaseModel):
    name: str
    description: Optional[str] = None
    instructions: Optional[str] = None
    category: Optional[str] = None
    muscle_groups: Optional[str] = None
    difficulty_level: Optional[DifficultyLevel] = DifficultyLevel.BEGINNER
    equipment_needed: Optional[EquipmentType] = EquipmentType.NONE
    image_url: Optional[str] = None
    video_url: Optional[str] = None
    duration_minutes: Optional[int] = None
    calories_per_minute: Optional[int] = None
    is_active: Optional[bool] = True

    @field_validator("category")
    @classmethod
    def validate_category(cls, v):
        valid_categories = [
            "strength",
            "cardio",
            "flexibility",
            "balance",
            "sports",
            "functional",
        ]
        if v and v.lower() not in valid_categories:
            raise ValueError(f'category must be one of: {", ".join(valid_categories)}')
        return v.lower() if v else v


class ExerciseCreate(ExerciseBase):
    name: str


class ExerciseUpdate(ExerciseBase):
    name: Optional[str] = None


class ExerciseInDBBase(ExerciseBase):
    id: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class Exercise(ExerciseInDBBase):
    pass


class ExerciseResponse(ExerciseInDBBase):
    pass


class ExerciseListResponse(BaseModel):
    exercises: List[ExerciseResponse]
    total: int
    page: int
    size: int


class ExerciseSearchQuery(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    muscle_groups: Optional[str] = None
    difficulty_level: Optional[DifficultyLevel] = None
    equipment_needed: Optional[EquipmentType] = None

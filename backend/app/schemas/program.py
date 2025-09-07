"""
Program schemas.
"""

from typing import Optional, List
from datetime import datetime

from pydantic import BaseModel


class ProgramExerciseBase(BaseModel):
    exercise_id: int
    sets: Optional[int] = None
    reps: Optional[str] = None
    weight: Optional[float] = None
    rest_seconds: Optional[int] = None
    notes: Optional[str] = None
    order_in_program: Optional[int] = None
    week_number: Optional[int] = 1
    day_number: Optional[int] = 1


class ProgramExerciseCreate(ProgramExerciseBase):
    pass


class ProgramExerciseUpdate(ProgramExerciseBase):
    exercise_id: Optional[int] = None


class ProgramExerciseResponse(ProgramExerciseBase):
    id: int
    program_id: int
    exercise: Optional[dict] = None  # Exercise details
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ProgramBase(BaseModel):
    name: str
    description: Optional[str] = None
    duration_weeks: Optional[int] = None
    sessions_per_week: Optional[int] = None
    difficulty_level: Optional[str] = None
    goals: Optional[str] = None
    is_active: Optional[bool] = True


class ProgramCreate(ProgramBase):
    client_id: int
    exercises: Optional[List[ProgramExerciseCreate]] = []


class ProgramUpdate(ProgramBase):
    name: Optional[str] = None
    client_id: Optional[int] = None


class ProgramInDBBase(ProgramBase):
    id: Optional[int] = None
    trainer_id: Optional[int] = None
    client_id: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class Program(ProgramInDBBase):
    pass


class ProgramResponse(ProgramInDBBase):
    exercises: List[ProgramExerciseResponse] = []
    client: Optional[dict] = None
    trainer: Optional[dict] = None

    class Config:
        from_attributes = True


class ProgramListResponse(BaseModel):
    programs: List[ProgramResponse]
    total: int
    page: int
    size: int
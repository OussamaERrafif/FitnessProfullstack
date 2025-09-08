"""
Progress tracking schemas.
"""

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, field_validator


class ProgressBase(BaseModel):
    date: Optional[datetime] = None
    weight: Optional[float] = None
    body_fat_percentage: Optional[float] = None
    muscle_mass: Optional[float] = None
    chest: Optional[float] = None
    waist: Optional[float] = None
    hips: Optional[float] = None
    biceps_left: Optional[float] = None
    biceps_right: Optional[float] = None
    thigh_left: Optional[float] = None
    thigh_right: Optional[float] = None
    front_photo_url: Optional[str] = None
    side_photo_url: Optional[str] = None
    back_photo_url: Optional[str] = None
    notes: Optional[str] = None
    trainer_notes: Optional[str] = None

    @field_validator("body_fat_percentage")
    @classmethod
    def validate_body_fat(cls, v):
        if v is not None and (v < 0 or v > 100):
            raise ValueError("body_fat_percentage must be between 0 and 100")
        return v


class ProgressCreate(ProgressBase):
    client_id: int


class ProgressUpdate(ProgressBase):
    pass


class ProgressInDBBase(ProgressBase):
    id: Optional[int] = None
    client_id: Optional[int] = None
    trainer_id: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class Progress(ProgressInDBBase):
    pass


class ProgressResponse(ProgressInDBBase):
    client: Optional[dict] = None
    trainer: Optional[dict] = None

    class Config:
        from_attributes = True


class ProgressListResponse(BaseModel):
    progress_entries: List[ProgressResponse]
    total: int
    page: int
    size: int


class ExerciseLogBase(BaseModel):
    exercise_id: int
    sets_completed: Optional[int] = None
    reps_completed: Optional[str] = None
    weight_used: Optional[float] = None
    duration_seconds: Optional[int] = None
    distance_meters: Optional[float] = None
    notes: Optional[str] = None


class ExerciseLogCreate(ExerciseLogBase):
    pass


class ExerciseLogResponse(ExerciseLogBase):
    id: int
    workout_log_id: int
    exercise: Optional[dict] = None
    created_at: datetime

    class Config:
        from_attributes = True


class WorkoutLogBase(BaseModel):
    program_id: Optional[int] = None
    date: Optional[datetime] = None
    duration_minutes: Optional[int] = None
    calories_burned: Optional[int] = None
    notes: Optional[str] = None
    completed: Optional[bool] = False


class WorkoutLogCreate(WorkoutLogBase):
    client_id: int
    exercises: Optional[List[ExerciseLogCreate]] = []


class WorkoutLogUpdate(WorkoutLogBase):
    pass


class WorkoutLogInDBBase(WorkoutLogBase):
    id: Optional[int] = None
    client_id: Optional[int] = None
    trainer_id: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class WorkoutLog(WorkoutLogInDBBase):
    pass


class WorkoutLogResponse(WorkoutLogInDBBase):
    exercises: List[ExerciseLogResponse] = []
    client: Optional[dict] = None
    trainer: Optional[dict] = None
    program: Optional[dict] = None

    class Config:
        from_attributes = True


class WorkoutLogListResponse(BaseModel):
    workout_logs: List[WorkoutLogResponse]
    total: int
    page: int
    size: int


class GoalBase(BaseModel):
    title: str
    description: Optional[str] = None
    target_value: Optional[float] = None
    current_value: Optional[float] = None
    unit: Optional[str] = None
    target_date: Optional[datetime] = None
    is_active: Optional[bool] = True


class GoalCreate(GoalBase):
    client_id: int


class GoalUpdate(GoalBase):
    title: Optional[str] = None
    current_value: Optional[float] = None
    is_achieved: Optional[bool] = None
    achieved_date: Optional[datetime] = None


class GoalInDBBase(GoalBase):
    id: Optional[int] = None
    client_id: Optional[int] = None
    trainer_id: Optional[int] = None
    achieved_date: Optional[datetime] = None
    is_achieved: Optional[bool] = False
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class Goal(GoalInDBBase):
    pass


class GoalResponse(GoalInDBBase):
    client: Optional[dict] = None
    trainer: Optional[dict] = None

    class Config:
        from_attributes = True


class GoalListResponse(BaseModel):
    goals: List[GoalResponse]
    total: int
    page: int
    size: int

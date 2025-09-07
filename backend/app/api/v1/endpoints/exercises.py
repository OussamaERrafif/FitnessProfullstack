"""
Exercise endpoints.
"""

from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.v1.endpoints.auth import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.exercise import (
    ExerciseCreate,
    ExerciseListResponse,
    ExerciseResponse,
    ExerciseSearchQuery,
    ExerciseUpdate,
)
from app.services.exercise_service import ExerciseService

router = APIRouter()


@router.get("/", response_model=ExerciseListResponse)
def read_exercises(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Retrieve exercises.
    """
    exercise_service = ExerciseService(db)
    exercises = exercise_service.get_multi(skip=skip, limit=limit)
    total = exercise_service.count()

    return ExerciseListResponse(
        exercises=exercises, total=total, page=skip // limit + 1, size=limit
    )


@router.post("/", response_model=ExerciseResponse)
def create_exercise(
    *,
    db: Session = Depends(get_db),
    exercise_in: ExerciseCreate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Create new exercise.
    """
    if not current_user.is_trainer and not current_user.is_superuser:
        raise HTTPException(
            status_code=403, detail="Only trainers and admins can create exercises"
        )

    exercise_service = ExerciseService(db)
    exercise = exercise_service.create(exercise_in)
    return exercise


@router.get("/{exercise_id}", response_model=ExerciseResponse)
def read_exercise(
    *,
    db: Session = Depends(get_db),
    exercise_id: int,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get exercise by ID.
    """
    exercise_service = ExerciseService(db)
    exercise = exercise_service.get(exercise_id)
    if not exercise:
        raise HTTPException(status_code=404, detail="Exercise not found")
    return exercise


@router.put("/{exercise_id}", response_model=ExerciseResponse)
def update_exercise(
    *,
    db: Session = Depends(get_db),
    exercise_id: int,
    exercise_in: ExerciseUpdate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Update exercise.
    """
    if not current_user.is_trainer and not current_user.is_superuser:
        raise HTTPException(
            status_code=403, detail="Only trainers and admins can update exercises"
        )

    exercise_service = ExerciseService(db)
    exercise = exercise_service.get(exercise_id)
    if not exercise:
        raise HTTPException(status_code=404, detail="Exercise not found")

    exercise = exercise_service.update(exercise, exercise_in)
    return exercise


@router.delete("/{exercise_id}")
def delete_exercise(
    *,
    db: Session = Depends(get_db),
    exercise_id: int,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Delete exercise.
    """
    if not current_user.is_trainer and not current_user.is_superuser:
        raise HTTPException(
            status_code=403, detail="Only trainers and admins can delete exercises"
        )

    exercise_service = ExerciseService(db)
    exercise = exercise_service.get(exercise_id)
    if not exercise:
        raise HTTPException(status_code=404, detail="Exercise not found")

    exercise_service.remove(exercise_id)
    return {"message": "Exercise deleted successfully"}


@router.post("/search/", response_model=ExerciseListResponse)
def search_exercises(
    *,
    db: Session = Depends(get_db),
    search_query: ExerciseSearchQuery,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Search exercises with filters.
    """
    exercise_service = ExerciseService(db)
    exercises = exercise_service.search(search_query, skip=skip, limit=limit)
    total = len(exercises)  # For search results, we'll use the current count

    return ExerciseListResponse(
        exercises=exercises, total=total, page=skip // limit + 1, size=limit
    )


@router.get("/categories/", response_model=List[str])
def get_exercise_categories(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get list of exercise categories.
    """
    exercise_service = ExerciseService(db)
    return exercise_service.get_categories()


@router.get("/muscle-groups/", response_model=List[str])
def get_muscle_groups(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get list of muscle groups.
    """
    exercise_service = ExerciseService(db)
    return exercise_service.get_muscle_groups()


@router.get("/category/{category}", response_model=ExerciseListResponse)
def get_exercises_by_category(
    *,
    db: Session = Depends(get_db),
    category: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get exercises by category.
    """
    exercise_service = ExerciseService(db)
    exercises = exercise_service.get_by_category(category, skip=skip, limit=limit)
    total = len(exercises)

    return ExerciseListResponse(
        exercises=exercises, total=total, page=skip // limit + 1, size=limit
    )

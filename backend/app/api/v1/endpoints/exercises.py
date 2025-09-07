"""
Exercise endpoints.
"""

from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.v1.endpoints.auth import get_current_user
from app.core.database import get_db
from app.models.user import User

router = APIRouter()


@router.get("/")
def read_exercises(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Retrieve exercises.
    """
    return {"message": "Exercises endpoint - coming soon"}


@router.post("/")
def create_exercise(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Create new exercise.
    """
    return {"message": "Create exercise endpoint - coming soon"}

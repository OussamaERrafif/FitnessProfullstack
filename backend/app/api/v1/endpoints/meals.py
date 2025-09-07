"""
Meal endpoints.
"""

from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.v1.endpoints.auth import get_current_user
from app.core.database import get_db
from app.models.user import User

router = APIRouter()


@router.get("/")
def read_meals(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Retrieve meals.
    """
    return {"message": "Meals endpoint - coming soon"}


@router.post("/")
def create_meal(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Create new meal.
    """
    return {"message": "Create meal endpoint - coming soon"}

"""
Meal endpoints.
"""

from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.v1.endpoints.auth import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.meal import (
    MealCreate,
    MealListResponse,
    MealPlanCreate,
    MealPlanListResponse,
    MealPlanResponse,
    MealResponse,
    MealUpdate,
)
from app.services.meal_service import MealPlanService, MealService

router = APIRouter()


@router.get("/", response_model=MealListResponse)
def read_meals(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    client_id: int = Query(None),
    is_template: bool = Query(None),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Retrieve meals.
    """
    meal_service = MealService(db)

    if current_user.is_trainer:
        trainer_id = current_user.trainer.id if current_user.trainer else None
        if not trainer_id:
            raise HTTPException(status_code=404, detail="Trainer profile not found")
        meals = meal_service.get_multi(
            skip=skip,
            limit=limit,
            trainer_id=trainer_id,
            client_id=client_id,
            is_template=is_template,
        )
        total = meal_service.count(
            trainer_id=trainer_id, client_id=client_id, is_template=is_template
        )
    else:
        # Client can only see their own meals
        client = current_user.client if hasattr(current_user, "client") else None
        if not client:
            raise HTTPException(status_code=404, detail="Client profile not found")
        meals = meal_service.get_multi(skip=skip, limit=limit, client_id=client.id)
        total = meal_service.count(client_id=client.id)

    return MealListResponse(
        meals=meals, total=total, page=skip // limit + 1, size=limit
    )


@router.post("/", response_model=MealResponse)
def create_meal(
    *,
    db: Session = Depends(get_db),
    meal_in: MealCreate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Create new meal.
    """
    if not current_user.is_trainer:
        raise HTTPException(status_code=403, detail="Only trainers can create meals")

    trainer_id = current_user.trainer.id if current_user.trainer else None
    if not trainer_id:
        raise HTTPException(status_code=404, detail="Trainer profile not found")

    meal_service = MealService(db)
    meal = meal_service.create(meal_in, trainer_id=trainer_id)
    return meal


@router.get("/{meal_id}", response_model=MealResponse)
def read_meal(
    *,
    db: Session = Depends(get_db),
    meal_id: int,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get meal by ID.
    """
    meal_service = MealService(db)
    meal = meal_service.get(meal_id)
    if not meal:
        raise HTTPException(status_code=404, detail="Meal not found")

    # Check access permissions
    if current_user.is_trainer:
        trainer_id = current_user.trainer.id if current_user.trainer else None
        if meal.trainer_id != trainer_id:
            raise HTTPException(status_code=403, detail="Access denied")
    else:
        # Client can only access their own meals or templates
        client = current_user.client if hasattr(current_user, "client") else None
        if not client or (meal.client_id != client.id and not meal.is_template):
            raise HTTPException(status_code=403, detail="Access denied")

    return meal


@router.put("/{meal_id}", response_model=MealResponse)
def update_meal(
    *,
    db: Session = Depends(get_db),
    meal_id: int,
    meal_in: MealUpdate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Update meal.
    """
    if not current_user.is_trainer:
        raise HTTPException(status_code=403, detail="Only trainers can update meals")

    meal_service = MealService(db)
    meal = meal_service.get(meal_id)
    if not meal:
        raise HTTPException(status_code=404, detail="Meal not found")

    trainer_id = current_user.trainer.id if current_user.trainer else None
    if meal.trainer_id != trainer_id:
        raise HTTPException(status_code=403, detail="Access denied")

    meal = meal_service.update(meal, meal_in)
    return meal


@router.delete("/{meal_id}")
def delete_meal(
    *,
    db: Session = Depends(get_db),
    meal_id: int,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Delete meal.
    """
    if not current_user.is_trainer:
        raise HTTPException(status_code=403, detail="Only trainers can delete meals")

    meal_service = MealService(db)
    meal = meal_service.get(meal_id)
    if not meal:
        raise HTTPException(status_code=404, detail="Meal not found")

    trainer_id = current_user.trainer.id if current_user.trainer else None
    if meal.trainer_id != trainer_id:
        raise HTTPException(status_code=403, detail="Access denied")

    meal_service.remove(meal_id)
    return {"message": "Meal deleted successfully"}


@router.get("/templates/", response_model=MealListResponse)
def get_meal_templates(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get meal templates.
    """
    if not current_user.is_trainer:
        raise HTTPException(
            status_code=403, detail="Only trainers can access meal templates"
        )

    trainer_id = current_user.trainer.id if current_user.trainer else None
    if not trainer_id:
        raise HTTPException(status_code=404, detail="Trainer profile not found")

    meal_service = MealService(db)
    meals = meal_service.get_templates(trainer_id, skip=skip, limit=limit)
    total = meal_service.count(trainer_id=trainer_id, is_template=True)

    return MealListResponse(
        meals=meals, total=total, page=skip // limit + 1, size=limit
    )


# Meal Plan endpoints
@router.get("/plans/", response_model=MealPlanListResponse)
def read_meal_plans(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    client_id: int = Query(None),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Retrieve meal plans.
    """
    meal_plan_service = MealPlanService(db)

    if current_user.is_trainer:
        trainer_id = current_user.trainer.id if current_user.trainer else None
        if not trainer_id:
            raise HTTPException(status_code=404, detail="Trainer profile not found")
        plans = meal_plan_service.get_multi(
            skip=skip, limit=limit, trainer_id=trainer_id, client_id=client_id
        )
    else:
        # Client can only see their own meal plans
        client = current_user.client if hasattr(current_user, "client") else None
        if not client:
            raise HTTPException(status_code=404, detail="Client profile not found")
        plans = meal_plan_service.get_multi(skip=skip, limit=limit, client_id=client.id)

    return MealPlanListResponse(
        meal_plans=plans, total=len(plans), page=skip // limit + 1, size=limit
    )


@router.post("/plans/", response_model=MealPlanResponse)
def create_meal_plan(
    *,
    db: Session = Depends(get_db),
    plan_in: MealPlanCreate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Create new meal plan.
    """
    if not current_user.is_trainer:
        raise HTTPException(
            status_code=403, detail="Only trainers can create meal plans"
        )

    trainer_id = current_user.trainer.id if current_user.trainer else None
    if not trainer_id:
        raise HTTPException(status_code=404, detail="Trainer profile not found")

    meal_plan_service = MealPlanService(db)
    plan = meal_plan_service.create(plan_in, trainer_id=trainer_id)
    return plan


@router.get("/plans/{plan_id}", response_model=MealPlanResponse)
def read_meal_plan(
    *,
    db: Session = Depends(get_db),
    plan_id: int,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get meal plan by ID.
    """
    meal_plan_service = MealPlanService(db)
    plan = meal_plan_service.get(plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Meal plan not found")

    # Check access permissions
    if current_user.is_trainer:
        trainer_id = current_user.trainer.id if current_user.trainer else None
        if plan.trainer_id != trainer_id:
            raise HTTPException(status_code=403, detail="Access denied")
    else:
        # Client can only access their own meal plans
        client = current_user.client if hasattr(current_user, "client") else None
        if not client or plan.client_id != client.id:
            raise HTTPException(status_code=403, detail="Access denied")

    return plan

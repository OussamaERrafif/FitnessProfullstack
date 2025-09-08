"""
Meal schemas.
"""

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, field_validator


class MealBase(BaseModel):
    name: str
    description: Optional[str] = None
    meal_type: Optional[str] = None
    preparation_time: Optional[int] = None
    cooking_time: Optional[int] = None
    servings: Optional[int] = 1
    calories_per_serving: Optional[float] = None
    protein_grams: Optional[float] = None
    carbs_grams: Optional[float] = None
    fat_grams: Optional[float] = None
    fiber_grams: Optional[float] = None
    sugar_grams: Optional[float] = None
    ingredients: Optional[str] = None
    instructions: Optional[str] = None
    image_url: Optional[str] = None
    is_vegetarian: Optional[bool] = False
    is_vegan: Optional[bool] = False
    is_gluten_free: Optional[bool] = False
    is_dairy_free: Optional[bool] = False
    is_template: Optional[bool] = False
    is_active: Optional[bool] = True

    @field_validator("meal_type")
    @classmethod
    def validate_meal_type(cls, v):
        valid_types = [
            "breakfast",
            "lunch",
            "dinner",
            "snack",
            "pre_workout",
            "post_workout",
        ]
        if v and v not in valid_types:
            raise ValueError(f'meal_type must be one of: {", ".join(valid_types)}')
        return v


class MealCreate(MealBase):
    client_id: Optional[int] = None  # null for template meals


class MealUpdate(MealBase):
    name: Optional[str] = None


class MealInDBBase(MealBase):
    id: Optional[int] = None
    trainer_id: Optional[int] = None
    client_id: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class Meal(MealInDBBase):
    pass


class MealResponse(MealInDBBase):
    trainer: Optional[dict] = None
    client: Optional[dict] = None

    class Config:
        from_attributes = True


class MealListResponse(BaseModel):
    meals: List[MealResponse]
    total: int
    page: int
    size: int


class MealPlanMealBase(BaseModel):
    meal_id: int
    day_of_week: int  # 1-7
    meal_time: str


class MealPlanMealCreate(MealPlanMealBase):
    pass


class MealPlanMealResponse(MealPlanMealBase):
    id: int
    meal_plan_id: int
    meal: Optional[MealResponse] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class MealPlanBase(BaseModel):
    name: str
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    target_calories: Optional[float] = None
    target_protein: Optional[float] = None
    target_carbs: Optional[float] = None
    target_fat: Optional[float] = None
    is_active: Optional[bool] = True


class MealPlanCreate(MealPlanBase):
    client_id: int
    meals: Optional[List[MealPlanMealCreate]] = []


class MealPlanUpdate(MealPlanBase):
    name: Optional[str] = None
    client_id: Optional[int] = None


class MealPlanInDBBase(MealPlanBase):
    id: Optional[int] = None
    trainer_id: Optional[int] = None
    client_id: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class MealPlan(MealPlanInDBBase):
    pass


class MealPlanResponse(MealPlanInDBBase):
    meals: List[MealPlanMealResponse] = []
    client: Optional[dict] = None
    trainer: Optional[dict] = None

    class Config:
        from_attributes = True


class MealPlanListResponse(BaseModel):
    meal_plans: List[MealPlanResponse]
    total: int
    page: int
    size: int

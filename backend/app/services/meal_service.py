"""
Meal service for business logic.
"""

from typing import Any, Dict, List, Optional, Union
from datetime import datetime

from sqlalchemy.orm import Session
from sqlalchemy import and_, or_

from app.models.meal import Meal, MealPlan, MealPlanMeal
from app.schemas.meal import MealCreate, MealUpdate, MealPlanCreate, MealPlanUpdate


class MealService:
    def __init__(self, db: Session):
        self.db = db

    def get(self, id: int) -> Optional[Meal]:
        return self.db.query(Meal).filter(Meal.id == id).first()

    def get_multi(
        self, *, skip: int = 0, limit: int = 100, trainer_id: Optional[int] = None, 
        client_id: Optional[int] = None, is_template: Optional[bool] = None
    ) -> List[Meal]:
        query = self.db.query(Meal)
        if trainer_id:
            query = query.filter(Meal.trainer_id == trainer_id)
        if client_id:
            query = query.filter(Meal.client_id == client_id)
        if is_template is not None:
            query = query.filter(Meal.is_template == is_template)
        return query.filter(Meal.is_active == True).offset(skip).limit(limit).all()

    def create(self, obj_in: MealCreate, trainer_id: int) -> Meal:
        obj_in_data = obj_in.dict()
        obj_in_data["trainer_id"] = trainer_id
        
        db_obj = Meal(**obj_in_data)
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def update(
        self, db_obj: Meal, obj_in: Union[MealUpdate, Dict[str, Any]]
    ) -> Meal:
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.dict(exclude_unset=True)
        
        for field, value in update_data.items():
            setattr(db_obj, field, value)
        
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def remove(self, id: int) -> Meal:
        obj = self.db.query(Meal).get(id)
        self.db.delete(obj)
        self.db.commit()
        return obj

    def get_templates(self, trainer_id: int, skip: int = 0, limit: int = 100) -> List[Meal]:
        """Get meal templates created by a trainer."""
        return (
            self.db.query(Meal)
            .filter(and_(
                Meal.trainer_id == trainer_id,
                Meal.is_template == True,
                Meal.is_active == True
            ))
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_client_meals(self, client_id: int, skip: int = 0, limit: int = 100) -> List[Meal]:
        """Get meals assigned to a specific client."""
        return (
            self.db.query(Meal)
            .filter(and_(
                Meal.client_id == client_id,
                Meal.is_active == True
            ))
            .offset(skip)
            .limit(limit)
            .all()
        )

    def search_by_dietary_restrictions(
        self, 
        trainer_id: int,
        is_vegetarian: Optional[bool] = None,
        is_vegan: Optional[bool] = None,
        is_gluten_free: Optional[bool] = None,
        is_dairy_free: Optional[bool] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[Meal]:
        """Search meals by dietary restrictions."""
        query = self.db.query(Meal).filter(and_(
            Meal.trainer_id == trainer_id,
            Meal.is_active == True
        ))
        
        if is_vegetarian is not None:
            query = query.filter(Meal.is_vegetarian == is_vegetarian)
        if is_vegan is not None:
            query = query.filter(Meal.is_vegan == is_vegan)
        if is_gluten_free is not None:
            query = query.filter(Meal.is_gluten_free == is_gluten_free)
        if is_dairy_free is not None:
            query = query.filter(Meal.is_dairy_free == is_dairy_free)
        
        return query.offset(skip).limit(limit).all()

    def count(
        self, trainer_id: Optional[int] = None, client_id: Optional[int] = None, 
        is_template: Optional[bool] = None
    ) -> int:
        query = self.db.query(Meal).filter(Meal.is_active == True)
        if trainer_id:
            query = query.filter(Meal.trainer_id == trainer_id)
        if client_id:
            query = query.filter(Meal.client_id == client_id)
        if is_template is not None:
            query = query.filter(Meal.is_template == is_template)
        return query.count()


class MealPlanService:
    def __init__(self, db: Session):
        self.db = db

    def get(self, id: int) -> Optional[MealPlan]:
        return self.db.query(MealPlan).filter(MealPlan.id == id).first()

    def get_multi(
        self, *, skip: int = 0, limit: int = 100, trainer_id: Optional[int] = None, 
        client_id: Optional[int] = None
    ) -> List[MealPlan]:
        query = self.db.query(MealPlan)
        if trainer_id:
            query = query.filter(MealPlan.trainer_id == trainer_id)
        if client_id:
            query = query.filter(MealPlan.client_id == client_id)
        return query.filter(MealPlan.is_active == True).offset(skip).limit(limit).all()

    def create(self, obj_in: MealPlanCreate, trainer_id: int) -> MealPlan:
        obj_in_data = obj_in.dict(exclude={"meals"})
        obj_in_data["trainer_id"] = trainer_id
        
        db_obj = MealPlan(**obj_in_data)
        self.db.add(db_obj)
        self.db.flush()  # Get the ID without committing
        
        # Add meals to the plan
        if obj_in.meals:
            for meal_data in obj_in.meals:
                meal_plan_meal = MealPlanMeal(
                    meal_plan_id=db_obj.id,
                    **meal_data.dict()
                )
                self.db.add(meal_plan_meal)
        
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def update(
        self, db_obj: MealPlan, obj_in: Union[MealPlanUpdate, Dict[str, Any]]
    ) -> MealPlan:
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.dict(exclude_unset=True)
        
        for field, value in update_data.items():
            setattr(db_obj, field, value)
        
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def remove(self, id: int) -> MealPlan:
        obj = self.db.query(MealPlan).get(id)
        # Remove associated meal plan meals
        self.db.query(MealPlanMeal).filter(MealPlanMeal.meal_plan_id == id).delete()
        self.db.delete(obj)
        self.db.commit()
        return obj

    def add_meal_to_plan(self, meal_plan_id: int, meal_data: dict) -> MealPlanMeal:
        """Add a meal to a meal plan."""
        meal_plan_meal = MealPlanMeal(
            meal_plan_id=meal_plan_id,
            **meal_data
        )
        self.db.add(meal_plan_meal)
        self.db.commit()
        self.db.refresh(meal_plan_meal)
        return meal_plan_meal

    def remove_meal_from_plan(self, meal_plan_id: int, meal_id: int) -> bool:
        """Remove a meal from a meal plan."""
        meal_plan_meal = (
            self.db.query(MealPlanMeal)
            .filter(and_(
                MealPlanMeal.meal_plan_id == meal_plan_id,
                MealPlanMeal.meal_id == meal_id
            ))
            .first()
        )
        if meal_plan_meal:
            self.db.delete(meal_plan_meal)
            self.db.commit()
            return True
        return False

    def get_client_active_plan(self, client_id: int) -> Optional[MealPlan]:
        """Get the currently active meal plan for a client."""
        return (
            self.db.query(MealPlan)
            .filter(and_(
                MealPlan.client_id == client_id,
                MealPlan.is_active == True,
                MealPlan.start_date <= datetime.now(),
                or_(MealPlan.end_date.is_(None), MealPlan.end_date >= datetime.now())
            ))
            .first()
        )
"""
Meal service module for comprehensive nutrition and meal plan management.

This module provides business logic for managing meals, meal plans, and nutrition tracking
within the fitness application. It supports dietary restrictions, template management,
and client-specific meal planning with comprehensive CRUD operations.

Features:
    - Meal creation and management with nutritional information
    - Meal plan creation with multi-meal support
    - Dietary restriction filtering (vegetarian, vegan, gluten-free, dairy-free)
    - Template meal system for trainers
    - Client-specific meal assignment and tracking
    - Nutritional analysis and meal planning tools

Example:
    Basic meal service usage::

        from app.services.meal_service import MealService
        from app.core.database import get_db
        
        # Initialize service
        db = get_db()
        meal_service = MealService(db)
        
        # Create a meal template
        meal_data = MealCreate(
            name="Protein Power Bowl",
            description="High-protein post-workout meal",
            calories=450,
            protein=35,
            carbs=20,
            fat=15,
            is_template=True,
            is_vegetarian=True
        )
        meal = meal_service.create(meal_data, trainer_id=1)
        
        # Search by dietary restrictions
        vegan_meals = meal_service.search_by_dietary_restrictions(
            trainer_id=1,
            is_vegan=True,
            limit=20
        )

Security:
    - All meal operations require trainer authentication
    - Clients can only access their assigned meals
    - Meal templates are trainer-scoped for isolation
    - Input validation ensures data integrity
"""

from datetime import datetime
from typing import Any, Dict, List, Optional, Union

from sqlalchemy import and_, or_
from sqlalchemy.orm import Session

from app.models.meal import Meal, MealPlan, MealPlanMeal
from app.schemas.meal import MealCreate, MealPlanCreate, MealPlanUpdate, MealUpdate


class MealService:
    """
    Service class for managing meals and nutrition data.

    Provides comprehensive meal management including creation, updates, dietary filtering,
    and template management. Supports both individual meals and structured meal plans
    with nutritional tracking and client assignment capabilities.

    Attributes:
        db (Session): SQLAlchemy database session for data operations

    Example:
        Creating and managing meals::

            meal_service = MealService(db)

            # Create a template meal
            meal = meal_service.create(meal_data, trainer_id=1)

            # Find meals for specific dietary needs
            gluten_free_meals = meal_service.search_by_dietary_restrictions(
                trainer_id=1,
                is_gluten_free=True
            )

            # Get client's assigned meals
            client_meals = meal_service.get_client_meals(client_id=123)
    """

    def __init__(self, db: Session):
        """
        Initialize meal service with database session.

        Args:
            db (Session): SQLAlchemy database session for data persistence
        """
        self.db = db

    def get(self, id: int) -> Optional[Meal]:
        """
        Retrieve a single meal by ID.

        Args:
            id (int): Unique identifier of the meal

        Returns:
            Optional[Meal]: Meal object if found, None otherwise

        Example:
            >>> meal = meal_service.get(123)
            >>> if meal:
            ...     print(f"Meal: {meal.name} - {meal.calories} calories")
        """
        return self.db.query(Meal).filter(Meal.id == id).first()

    def get_multi(
        self,
        *,
        skip: int = 0,
        limit: int = 100,
        trainer_id: Optional[int] = None,
        client_id: Optional[int] = None,
        is_template: Optional[bool] = None,
    ) -> List[Meal]:
        """
        Retrieve multiple meals with filtering and pagination.

        Supports comprehensive filtering by trainer, client, and template status
        with built-in pagination for efficient data retrieval.

        Args:
            skip (int, optional): Number of records to skip for pagination. Defaults to 0.
            limit (int, optional): Maximum number of records to return. Defaults to 100.
            trainer_id (Optional[int], optional): Filter by trainer ID for trainer-specific meals
            client_id (Optional[int], optional): Filter by client ID for client-assigned meals
            is_template (Optional[bool], optional): Filter by template status

        Returns:
            List[Meal]: List of meal objects matching the filters

        Example:
            >>> # Get trainer's meal templates
            >>> templates = meal_service.get_multi(
            ...     trainer_id=1,
            ...     is_template=True,
            ...     limit=20
            ... )
            >>>
            >>> # Get client's assigned meals
            >>> client_meals = meal_service.get_multi(
            ...     client_id=123,
            ...     skip=0,
            ...     limit=10
            ... )
        """
        query = self.db.query(Meal)
        if trainer_id:
            query = query.filter(Meal.trainer_id == trainer_id)
        if client_id:
            query = query.filter(Meal.client_id == client_id)
        if is_template is not None:
            query = query.filter(Meal.is_template == is_template)
        return query.filter(Meal.is_active is True).offset(skip).limit(limit).all()

    def create(self, obj_in: MealCreate, trainer_id: int) -> Meal:
        """
        Create a new meal with nutritional information.

        Creates a meal with comprehensive nutritional data, dietary restriction flags,
        and trainer association. Supports both template meals and client-specific meals.

        Args:
            obj_in (MealCreate): Meal creation schema with nutritional data
            trainer_id (int): ID of the trainer creating the meal

        Returns:
            Meal: Created meal object with assigned ID

        Raises:
            ValueError: If nutritional data is invalid or incomplete

        Example:
            >>> meal_data = MealCreate(
            ...     name="Greek Yogurt Parfait",
            ...     description="High-protein breakfast with berries",
            ...     calories=320,
            ...     protein=20,
            ...     carbs=35,
            ...     fat=8,
            ...     is_vegetarian=True,
            ...     is_template=True
            ... )
            >>> meal = meal_service.create(meal_data, trainer_id=1)
            >>> print(f"Created meal: {meal.name} with {meal.calories} calories")
        """
        obj_in_data = obj_in.dict()
        obj_in_data["trainer_id"] = trainer_id

        db_obj = Meal(**obj_in_data)
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def update(self, db_obj: Meal, obj_in: Union[MealUpdate, Dict[str, Any]]) -> Meal:
        """
        Update an existing meal with new information.

        Supports partial updates while maintaining data integrity and nutritional
        consistency. Preserves trainer association and client assignments.

        Args:
            db_obj (Meal): Existing meal object to update
            obj_in (Union[MealUpdate, Dict[str, Any]]): Update data schema or dictionary

        Returns:
            Meal: Updated meal object with refreshed data

        Example:
            >>> # Update meal calories and macros
            >>> update_data = MealUpdate(
            ...     calories=380,
            ...     protein=22,
            ...     description="Updated nutritional information"
            ... )
            >>> updated_meal = meal_service.update(existing_meal, update_data)
        """
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
        """
        Remove a meal from the database.

        Permanently deletes a meal and its associations. Use with caution as this
        operation cannot be undone.

        Args:
            id (int): ID of the meal to remove

        Returns:
            Meal: The deleted meal object

        Warning:
            This operation permanently deletes the meal and cannot be undone.
            Consider using soft delete (is_active=False) for better data integrity.
        """
        obj = self.db.query(Meal).get(id)
        self.db.delete(obj)
        self.db.commit()
        return obj

    def get_templates(
        self, trainer_id: int, skip: int = 0, limit: int = 100
    ) -> List[Meal]:
        """
        Get meal templates created by a specific trainer.

        Retrieves reusable meal templates that can be assigned to multiple clients
        or used as a base for creating client-specific meals.

        Args:
            trainer_id (int): ID of the trainer whose templates to retrieve
            skip (int, optional): Pagination offset. Defaults to 0.
            limit (int, optional): Maximum results to return. Defaults to 100.

        Returns:
            List[Meal]: List of meal template objects

        Example:
            >>> templates = meal_service.get_templates(trainer_id=1, limit=50)
            >>> for template in templates:
            ...     print(f"Template: {template.name} - {template.calories} cal")
        """
        return (
            self.db.query(Meal)
            .filter(
                and_(
                    Meal.trainer_id == trainer_id,
                    Meal.is_template is True,
                    Meal.is_active is True,
                )
            )
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_client_meals(
        self, client_id: int, skip: int = 0, limit: int = 100
    ) -> List[Meal]:
        """
        Get meals assigned to a specific client.

        Retrieves all active meals that have been specifically assigned to a client,
        including both custom meals and meals created from templates.

        Args:
            client_id (int): ID of the client whose meals to retrieve
            skip (int, optional): Pagination offset. Defaults to 0.
            limit (int, optional): Maximum results to return. Defaults to 100.

        Returns:
            List[Meal]: List of client-assigned meal objects

        Example:
            >>> client_meals = meal_service.get_client_meals(client_id=123)
            >>> total_calories = sum(meal.calories for meal in client_meals)
            >>> print(f"Client has {len(client_meals)} meals totaling {total_calories} calories")
        """
        return (
            self.db.query(Meal)
            .filter(and_(Meal.client_id == client_id, Meal.is_active is True))
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
        limit: int = 100,
    ) -> List[Meal]:
        """
        Search meals by dietary restrictions and preferences.

        Advanced filtering system for finding meals that match specific dietary
        requirements. Supports multiple restriction types simultaneously.

        Args:
            trainer_id (int): ID of the trainer whose meals to search
            is_vegetarian (Optional[bool], optional): Filter for vegetarian meals
            is_vegan (Optional[bool], optional): Filter for vegan meals
            is_gluten_free (Optional[bool], optional): Filter for gluten-free meals
            is_dairy_free (Optional[bool], optional): Filter for dairy-free meals
            skip (int, optional): Pagination offset. Defaults to 0.
            limit (int, optional): Maximum results to return. Defaults to 100.

        Returns:
            List[Meal]: List of meals matching the dietary restrictions

        Example:
            >>> # Find vegan and gluten-free meals
            >>> special_diet_meals = meal_service.search_by_dietary_restrictions(
            ...     trainer_id=1,
            ...     is_vegan=True,
            ...     is_gluten_free=True,
            ...     limit=25
            ... )
            >>>
            >>> # Find vegetarian meals only
            >>> veggie_meals = meal_service.search_by_dietary_restrictions(
            ...     trainer_id=1,
            ...     is_vegetarian=True
            ... )
        """
        query = self.db.query(Meal).filter(
            and_(Meal.trainer_id == trainer_id, Meal.is_active is True)
        )

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
        self,
        trainer_id: Optional[int] = None,
        client_id: Optional[int] = None,
        is_template: Optional[bool] = None,
    ) -> int:
        """
        Count meals matching the specified filters.

        Provides efficient counting for pagination and statistics without
        retrieving the full meal objects.

        Args:
            trainer_id (Optional[int], optional): Filter by trainer ID
            client_id (Optional[int], optional): Filter by client ID
            is_template (Optional[bool], optional): Filter by template status

        Returns:
            int: Number of meals matching the filters

        Example:
            >>> template_count = meal_service.count(trainer_id=1, is_template=True)
            >>> client_meal_count = meal_service.count(client_id=123)
            >>> print(f"Trainer has {template_count} templates, client has {client_meal_count} meals")
        """
        query = self.db.query(Meal).filter(Meal.is_active == True)

        if trainer_id:
            query = query.filter(Meal.trainer_id == trainer_id)
        if client_id:
            query = query.filter(Meal.client_id == client_id)
        if is_template is not None:
            query = query.filter(Meal.is_template == is_template)
        return query.count()


class MealPlanService:
    """
    Service class for managing comprehensive meal plans and nutritional scheduling.

    Provides structured meal planning with multi-meal support, duration management,
    and client assignment. Supports complex meal scheduling with nutritional goals
    and dietary preference integration.

    Attributes:
        db (Session): SQLAlchemy database session for data operations

    Example:
        Creating and managing meal plans::

            meal_plan_service = MealPlanService(db)

            # Create a weekly meal plan
            plan_data = MealPlanCreate(
                name="Weight Loss Plan - Week 1",
                description="Balanced nutrition for sustainable weight loss",
                client_id=123,
                start_date=datetime.now(),
                end_date=datetime.now() + timedelta(days=7),
                target_calories=1800,
                meals=[meal1, meal2, meal3]
            )
            plan = meal_plan_service.create(plan_data, trainer_id=1)

            # Get client's active plan
            active_plan = meal_plan_service.get_client_active_plan(client_id=123)
    """

    def __init__(self, db: Session):
        """
        Initialize meal plan service with database session.

        Args:
            db (Session): SQLAlchemy database session for data persistence
        """
        self.db = db

    def get(self, id: int) -> Optional[MealPlan]:
        """
        Retrieve a single meal plan by ID.

        Args:
            id (int): Unique identifier of the meal plan

        Returns:
            Optional[MealPlan]: Meal plan object if found, None otherwise
        """
        return self.db.query(MealPlan).filter(MealPlan.id == id).first()

    def get_multi(
        self,
        *,
        skip: int = 0,
        limit: int = 100,
        trainer_id: Optional[int] = None,
        client_id: Optional[int] = None,
    ) -> List[MealPlan]:
        """
        Retrieve multiple meal plans with filtering and pagination.

        Args:
            skip (int, optional): Number of records to skip. Defaults to 0.
            limit (int, optional): Maximum records to return. Defaults to 100.
            trainer_id (Optional[int], optional): Filter by trainer ID
            client_id (Optional[int], optional): Filter by client ID

        Returns:
            List[MealPlan]: List of meal plan objects matching filters
        """
        query = self.db.query(MealPlan)
        if trainer_id:
            query = query.filter(MealPlan.trainer_id == trainer_id)
        if client_id:
            query = query.filter(MealPlan.client_id == client_id)
        return query.filter(MealPlan.is_active is True).offset(skip).limit(limit).all()

    def create(self, obj_in: MealPlanCreate, trainer_id: int) -> MealPlan:
        """
        Create a comprehensive meal plan with multiple meals.

        Creates a structured meal plan with duration, nutritional goals, and
        associated meals. Supports complex meal scheduling and client assignment.

        Args:
            obj_in (MealPlanCreate): Meal plan creation schema with meal associations
            trainer_id (int): ID of the trainer creating the plan

        Returns:
            MealPlan: Created meal plan with associated meals

        Example:
            >>> plan_data = MealPlanCreate(
            ...     name="Cutting Phase - Week 1",
            ...     description="High protein, moderate carb plan",
            ...     client_id=123,
            ...     target_calories=2000,
            ...     meals=[meal1, meal2, meal3]
            ... )
            >>> plan = meal_plan_service.create(plan_data, trainer_id=1)
        """
        obj_in_data = obj_in.dict(exclude={"meals"})
        obj_in_data["trainer_id"] = trainer_id

        db_obj = MealPlan(**obj_in_data)
        self.db.add(db_obj)
        self.db.flush()  # Get the ID without committing

        # Add meals to the plan
        if obj_in.meals:
            for meal_data in obj_in.meals:
                meal_plan_meal = MealPlanMeal(
                    meal_plan_id=db_obj.id, **meal_data.dict()
                )
                self.db.add(meal_plan_meal)

        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def update(
        self, db_obj: MealPlan, obj_in: Union[MealPlanUpdate, Dict[str, Any]]
    ) -> MealPlan:
        """
        Update an existing meal plan.

        Args:
            db_obj (MealPlan): Existing meal plan to update
            obj_in (Union[MealPlanUpdate, Dict[str, Any]]): Update data

        Returns:
            MealPlan: Updated meal plan object
        """
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
        """
        Remove a meal plan and its associated meals.

        Args:
            id (int): ID of the meal plan to remove

        Returns:
            MealPlan: The deleted meal plan object
        """
        obj = self.db.query(MealPlan).get(id)
        # Remove associated meal plan meals
        self.db.query(MealPlanMeal).filter(MealPlanMeal.meal_plan_id == id).delete()
        self.db.delete(obj)
        self.db.commit()
        return obj

    def add_meal_to_plan(self, meal_plan_id: int, meal_data: dict) -> MealPlanMeal:
        """
        Add a meal to an existing meal plan.

        Dynamically adds meals to meal plans, supporting flexible plan modifications
        and meal scheduling adjustments.

        Args:
            meal_plan_id (int): ID of the meal plan to modify
            meal_data (dict): Meal data including timing and portion information

        Returns:
            MealPlanMeal: Created meal plan association object

        Example:
            >>> # Add a snack to existing plan
            >>> snack_data = {
            ...     "meal_id": 456,
            ...     "meal_time": "15:00",
            ...     "day_of_week": 1,
            ...     "portion_multiplier": 1.0
            ... }
            >>> meal_plan_service.add_meal_to_plan(plan_id, snack_data)
        """
        meal_plan_meal = MealPlanMeal(meal_plan_id=meal_plan_id, **meal_data)
        self.db.add(meal_plan_meal)
        self.db.commit()
        self.db.refresh(meal_plan_meal)
        return meal_plan_meal

    def remove_meal_from_plan(self, meal_plan_id: int, meal_id: int) -> bool:
        """
        Remove a specific meal from a meal plan.

        Args:
            meal_plan_id (int): ID of the meal plan
            meal_id (int): ID of the meal to remove

        Returns:
            bool: True if meal was removed, False if not found
        """
        meal_plan_meal = (
            self.db.query(MealPlanMeal)
            .filter(
                and_(
                    MealPlanMeal.meal_plan_id == meal_plan_id,
                    MealPlanMeal.meal_id == meal_id,
                )
            )
            .first()
        )
        if meal_plan_meal:
            self.db.delete(meal_plan_meal)
            self.db.commit()
            return True
        return False

    def get_client_active_plan(self, client_id: int) -> Optional[MealPlan]:
        """
        Get the currently active meal plan for a client.

        Retrieves the meal plan that is currently in effect based on start/end dates.
        Useful for displaying current nutrition guidance to clients.

        Args:
            client_id (int): ID of the client

        Returns:
            Optional[MealPlan]: Active meal plan if found, None otherwise

        Example:
            >>> active_plan = meal_plan_service.get_client_active_plan(123)
            >>> if active_plan:
            ...     print(f"Current plan: {active_plan.name}")
            ...     print(f"Target calories: {active_plan.target_calories}")
        """
        return (
            self.db.query(MealPlan)
            .filter(
                and_(
                    MealPlan.client_id == client_id,
                    MealPlan.is_active is True,
                    MealPlan.start_date <= datetime.now(),
                    or_(
                        MealPlan.end_date.is_(None), MealPlan.end_date >= datetime.now()
                    ),
                )
            )
            .first()
        )

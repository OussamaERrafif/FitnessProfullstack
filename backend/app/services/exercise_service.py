"""
Exercise service for business logic.

This module provides the ExerciseService class which handles all business logic
related to exercise management including CRUD operations, advanced search functionality,
categorization, and exercise library management.

Classes:
    ExerciseService: Main service class for exercise-related operations

Example:
    Basic usage of the ExerciseService:
    
    >>> from app.services.exercise_service import ExerciseService
    >>> service = ExerciseService(db_session)
    >>> exercise = service.get(exercise_id=1)
    >>> exercises = service.search(search_query, skip=0, limit=10)
"""

from typing import Any, Dict, List, Optional, Union

from sqlalchemy import and_, func, or_
from sqlalchemy.orm import Session

from app.models.exercise import Exercise
from app.schemas.exercise import ExerciseCreate, ExerciseSearchQuery, ExerciseUpdate


class ExerciseService:
    """
    Service class for managing exercise-related business logic.
    
    This class provides methods for creating, retrieving, updating, and searching
    exercises in the library. It handles exercise categorization, muscle group
    classification, equipment requirements, and provides advanced search capabilities.
    
    Attributes:
        db (Session): SQLAlchemy database session for database operations
        
    Example:
        >>> service = ExerciseService(db_session)
        >>> exercise = service.create(exercise_data)
        >>> chest_exercises = service.get_by_muscle_group("chest")
    """
    
    def __init__(self, db: Session):
        """
        Initialize the ExerciseService with a database session.
        
        Args:
            db (Session): SQLAlchemy database session for database operations
        """
        self.db = db

    def get(self, id: int) -> Optional[Exercise]:
        """
        Retrieve a single exercise by its ID.
        
        Args:
            id (int): The unique identifier of the exercise
            
        Returns:
            Optional[Exercise]: The exercise object if found, None otherwise
            
        Example:
            >>> exercise = service.get(exercise_id=1)
            >>> if exercise:
            ...     print(f"Found exercise: {exercise.name}")
        """
        return self.db.query(Exercise).filter(Exercise.id == id).first()

    def get_multi(
        self, *, skip: int = 0, limit: int = 100, is_active: bool = True
    ) -> List[Exercise]:
        """
        Retrieve multiple exercises with pagination and status filtering.
        
        Args:
            skip (int, optional): Number of records to skip for pagination. Defaults to 0.
            limit (int, optional): Maximum number of records to return. Defaults to 100.
            is_active (bool, optional): Filter by active status. Defaults to True.
            
        Returns:
            List[Exercise]: List of exercise objects ordered by name
            
        Example:
            >>> # Get first page of active exercises
            >>> exercises = service.get_multi(skip=0, limit=20, is_active=True)
            >>> # Get all exercises including inactive
            >>> all_exercises = service.get_multi(is_active=None)
        """
        query = self.db.query(Exercise)
        if is_active is not None:
            query = query.filter(Exercise.is_active == is_active)
        return query.order_by(Exercise.name).offset(skip).limit(limit).all()

    def create(self, obj_in: ExerciseCreate) -> Exercise:
        """
        Create a new exercise in the database.
        
        This method creates a new exercise with comprehensive information including
        instructions, muscle groups, equipment requirements, and difficulty level.
        
        Args:
            obj_in (ExerciseCreate): Validated exercise data schema
            
        Returns:
            Exercise: The newly created exercise object with generated ID
            
        Raises:
            IntegrityError: If exercise data violates database constraints
            ValidationError: If the exercise data fails validation
            
        Example:
            >>> from app.schemas.exercise import ExerciseCreate
            >>> exercise_data = ExerciseCreate(
            ...     name="Push-ups",
            ...     description="Classic bodyweight chest exercise",
            ...     category="strength",
            ...     muscle_groups="chest, shoulders, triceps",
            ...     difficulty_level="beginner",
            ...     equipment_needed="none"
            ... )
            >>> exercise = service.create(exercise_data)
            >>> print(f"Created exercise with ID: {exercise.id}")
        """
        obj_in_data = obj_in.dict()
        db_obj = Exercise(**obj_in_data)
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def update(
        self, db_obj: Exercise, obj_in: Union[ExerciseUpdate, Dict[str, Any]]
    ) -> Exercise:
        """
        Update an existing exercise record with new data.
        
        This method updates only the fields that are provided in the update object,
        leaving other fields unchanged. It supports both Pydantic schema objects
        and plain dictionaries for update data.
        
        Args:
            db_obj (Exercise): The existing exercise object to update
            obj_in (Union[ExerciseUpdate, Dict[str, Any]]): Update data as schema or dict
            
        Returns:
            Exercise: The updated exercise object
            
        Example:
            >>> # Using Pydantic schema
            >>> update_data = ExerciseUpdate(difficulty_level="intermediate")
            >>> exercise = service.update(existing_exercise, update_data)
            >>> 
            >>> # Using dictionary
            >>> exercise = service.update(existing_exercise, {
            ...     "description": "Updated exercise description"
            ... })
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

    def remove(self, id: int) -> Exercise:
        """
        Delete an exercise record from the database.
        
        This method permanently removes an exercise record. Note that this
        might affect related records (programs, workouts, etc.) depending
        on the database foreign key constraints.
        
        Args:
            id (int): The unique identifier of the exercise to delete
            
        Returns:
            Exercise: The deleted exercise object
            
        Raises:
            ValueError: If the exercise with the given ID doesn't exist
            IntegrityError: If deletion violates foreign key constraints
            
        Example:
            >>> deleted_exercise = service.remove(exercise_id=1)
            >>> print(f"Deleted exercise: {deleted_exercise.name}")
            
        Warning:
            This operation is irreversible. Consider implementing soft deletes
            by setting is_active=False instead of permanent deletion for
            production use cases where data recovery might be needed.
        """
        obj = self.db.query(Exercise).get(id)
        self.db.delete(obj)
        self.db.commit()
        return obj

    def count(self, is_active: bool = True) -> int:
        """
        Count the total number of exercises, optionally filtered by status.
        
        This method provides efficient counting for pagination and statistics
        without loading all exercise records into memory.
        
        Args:
            is_active (bool, optional): Filter count by active status. Defaults to True.
            
        Returns:
            int: Total number of exercises matching the criteria
            
        Example:
            >>> # Count all active exercises
            >>> active_count = service.count(is_active=True)
            >>> # Count all exercises including inactive
            >>> total_count = service.count(is_active=None)
        """
        query = self.db.query(Exercise)
        if is_active is not None:
            query = query.filter(Exercise.is_active == is_active)
        return query.count()

    def search(
        self, search_query: ExerciseSearchQuery, skip: int = 0, limit: int = 100
    ) -> List[Exercise]:
        """
        Search for exercises using comprehensive filter criteria.
        
        This method provides advanced search capabilities for finding exercises
        based on multiple attributes such as name, category, muscle groups,
        difficulty level, and equipment requirements.
        
        Args:
            search_query (ExerciseSearchQuery): Search criteria and filters
            skip (int, optional): Number of records to skip for pagination. Defaults to 0.
            limit (int, optional): Maximum number of records to return. Defaults to 100.
            
        Returns:
            List[Exercise]: List of exercise objects matching search criteria
            
        Example:
            >>> from app.schemas.exercise import ExerciseSearchQuery
            >>> search = ExerciseSearchQuery(
            ...     name="push",
            ...     category="strength",
            ...     muscle_groups="chest",
            ...     difficulty_level="beginner"
            ... )
            >>> exercises = service.search(search, skip=0, limit=10)
            >>> 
            >>> # Search for bodyweight exercises
            >>> bodyweight_search = ExerciseSearchQuery(equipment_needed="none")
            >>> bodyweight_exercises = service.search(bodyweight_search)
        """
        query = self.db.query(Exercise)

        # Filter by name
        if search_query.name:
            query = query.filter(Exercise.name.ilike(f"%{search_query.name}%"))

        # Filter by category
        if search_query.category:
            query = query.filter(Exercise.category == search_query.category)

        # Filter by muscle groups
        if search_query.muscle_groups:
            query = query.filter(
                Exercise.muscle_groups.ilike(f"%{search_query.muscle_groups}%")
            )

        # Filter by difficulty level
        if search_query.difficulty_level:
            query = query.filter(
                Exercise.difficulty_level == search_query.difficulty_level
            )

        # Filter by equipment needed
        if search_query.equipment_needed:
            query = query.filter(
                Exercise.equipment_needed == search_query.equipment_needed
            )

        # Only active exercises
        query = query.filter(Exercise.is_active == True)

        return query.order_by(Exercise.name).offset(skip).limit(limit).all()

    def get_by_category(
        self, category: str, skip: int = 0, limit: int = 100
    ) -> List[Exercise]:
        """
        Retrieve exercises filtered by category with pagination.
        
        This method provides quick access to exercises within a specific
        category such as "strength", "cardio", "flexibility", etc.
        
        Args:
            category (str): The exercise category to filter by
            skip (int, optional): Number of records to skip for pagination. Defaults to 0.
            limit (int, optional): Maximum number of records to return. Defaults to 100.
            
        Returns:
            List[Exercise]: List of active exercises in the specified category
            
        Example:
            >>> # Get all strength exercises
            >>> strength_exercises = service.get_by_category("strength", skip=0, limit=50)
            >>> # Get cardio exercises for second page
            >>> cardio_page_2 = service.get_by_category("cardio", skip=20, limit=20)
        """
        return (
            self.db.query(Exercise)
            .filter(and_(Exercise.category == category, Exercise.is_active == True))
            .order_by(Exercise.name)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_by_muscle_group(
        self, muscle_group: str, skip: int = 0, limit: int = 100
    ) -> List[Exercise]:
        """
        Retrieve exercises that target a specific muscle group.
        
        This method searches for exercises that include the specified muscle
        group in their muscle_groups field, supporting partial matches.
        
        Args:
            muscle_group (str): The muscle group to search for (e.g., "chest", "legs")
            skip (int, optional): Number of records to skip for pagination. Defaults to 0.
            limit (int, optional): Maximum number of records to return. Defaults to 100.
            
        Returns:
            List[Exercise]: List of active exercises targeting the muscle group
            
        Example:
            >>> # Get all chest exercises
            >>> chest_exercises = service.get_by_muscle_group("chest")
            >>> # Get leg exercises
            >>> leg_exercises = service.get_by_muscle_group("legs", skip=0, limit=30)
        """
        return (
            self.db.query(Exercise)
            .filter(
                and_(
                    Exercise.muscle_groups.ilike(f"%{muscle_group}%"),
                    Exercise.is_active == True,
                )
            )
            .order_by(Exercise.name)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_by_equipment(
        self, equipment: str, skip: int = 0, limit: int = 100
    ) -> List[Exercise]:
        """
        Retrieve exercises that require specific equipment.
        
        This method filters exercises based on equipment requirements,
        useful for creating workouts based on available equipment.
        
        Args:
            equipment (str): The equipment type (e.g., "dumbbells", "none", "barbell")
            skip (int, optional): Number of records to skip for pagination. Defaults to 0.
            limit (int, optional): Maximum number of records to return. Defaults to 100.
            
        Returns:
            List[Exercise]: List of active exercises requiring the specified equipment
            
        Example:
            >>> # Get bodyweight exercises (no equipment)
            >>> bodyweight = service.get_by_equipment("none")
            >>> # Get dumbbell exercises
            >>> dumbbell_exercises = service.get_by_equipment("dumbbells", limit=25)
        """
        return (
            self.db.query(Exercise)
            .filter(
                and_(Exercise.equipment_needed == equipment, Exercise.is_active == True)
            )
            .order_by(Exercise.name)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_categories(self) -> List[str]:
        """
        Get list of unique exercise categories available in the database.
        
        This method returns all distinct categories from active exercises,
        useful for populating category filters and navigation.
        
        Returns:
            List[str]: List of unique category names sorted alphabetically
            
        Example:
            >>> categories = service.get_categories()
            >>> print("Available categories:", categories)
            >>> # Output: ['cardio', 'flexibility', 'strength', 'sports']
            
        Use Cases:
            - Populating category dropdown filters
            - Building navigation menus
            - Exercise categorization statistics
            - Dynamic UI component generation
        """
        result = (
            self.db.query(Exercise.category)
            .filter(and_(Exercise.category.isnot(None), Exercise.is_active == True))
            .distinct()
            .all()
        )
        return [row[0] for row in result if row[0]]

    def get_muscle_groups(self) -> List[str]:
        """
        Get list of unique muscle groups available in the exercise database.
        
        This method parses comma-separated muscle group values from all active
        exercises and returns a deduplicated, sorted list of individual muscle groups.
        
        Returns:
            List[str]: List of unique muscle group names sorted alphabetically
            
        Example:
            >>> muscle_groups = service.get_muscle_groups()
            >>> print("Available muscle groups:", muscle_groups)
            >>> # Output: ['biceps', 'chest', 'core', 'legs', 'shoulders', 'triceps']
            
        Use Cases:
            - Populating muscle group filter dropdowns
            - Building workout targeting specific muscle groups
            - Exercise library organization and browsing
            - Analytics and reporting on muscle group coverage
            
        Note:
            This method handles comma-separated values in the muscle_groups field,
            automatically parsing and deduplicating individual muscle groups.
        """
        result = (
            self.db.query(Exercise.muscle_groups)
            .filter(
                and_(Exercise.muscle_groups.isnot(None), Exercise.is_active == True)
            )
            .distinct()
            .all()
        )

        # Parse comma-separated muscle groups
        muscle_groups = set()
        for row in result:
            if row[0]:
                groups = [group.strip() for group in row[0].split(",")]
                muscle_groups.update(groups)

        return sorted(list(muscle_groups))

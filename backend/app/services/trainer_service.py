"""
Trainer service for business logic.

This module provides the TrainerService class which handles all business logic
related to trainer management including CRUD operations, data validation,
and database interactions.

Classes:
    TrainerService: Main service class for trainer-related operations

Example:
    Basic usage of the TrainerService:
    
    >>> from app.services.trainer_service import TrainerService
    >>> service = TrainerService(db_session)
    >>> trainer = service.get(trainer_id=1)
    >>> trainers = service.get_multi(skip=0, limit=10)
"""

from typing import Any, Dict, List, Optional, Union

from sqlalchemy.orm import Session

from app.models.trainer import Trainer
from app.schemas.trainer import TrainerCreate, TrainerUpdate


class TrainerService:
    """
    Service class for managing trainer-related business logic.

    This class provides methods for creating, retrieving, updating, and deleting
    trainer records. It acts as an abstraction layer between the API endpoints
    and the database models.

    Attributes:
        db (Session): SQLAlchemy database session for database operations

    Example:
        >>> service = TrainerService(db_session)
        >>> trainer = service.create(trainer_data, user_id=123)
        >>> updated_trainer = service.update(trainer, update_data)
    """

    def __init__(self, db: Session):
        """
        Initialize the TrainerService with a database session.

        Args:
            db (Session): SQLAlchemy database session for database operations
        """
        self.db = db

    def get(self, id: int) -> Optional[Trainer]:
        """
        Retrieve a single trainer by their ID.

        Args:
            id (int): The unique identifier of the trainer

        Returns:
            Optional[Trainer]: The trainer object if found, None otherwise

        Example:
            >>> trainer = service.get(trainer_id=1)
            >>> if trainer:
            ...     print(f"Found trainer: {trainer.user.name}")
        """
        return self.db.query(Trainer).filter(Trainer.id == id).first()

    def get_by_user_id(self, user_id: int) -> Optional[Trainer]:
        """
        Retrieve a trainer by their associated user ID.

        This method is useful when you have a user ID and need to find
        the corresponding trainer profile.

        Args:
            user_id (int): The unique identifier of the associated user

        Returns:
            Optional[Trainer]: The trainer object if found, None otherwise

        Example:
            >>> trainer = service.get_by_user_id(user_id=123)
            >>> if trainer:
            ...     print(f"Trainer specialization: {trainer.specialization}")
        """
        return self.db.query(Trainer).filter(Trainer.user_id == user_id).first()

    def get_multi(self, *, skip: int = 0, limit: int = 100) -> List[Trainer]:
        """
        Retrieve multiple trainers with pagination support.

        Args:
            skip (int, optional): Number of records to skip for pagination. Defaults to 0.
            limit (int, optional): Maximum number of records to return. Defaults to 100.

        Returns:
            List[Trainer]: List of trainer objects

        Example:
            >>> # Get first page of trainers
            >>> trainers = service.get_multi(skip=0, limit=10)
            >>> # Get second page
            >>> trainers_page_2 = service.get_multi(skip=10, limit=10)
        """
        return self.db.query(Trainer).offset(skip).limit(limit).all()

    def create(self, trainer_in: TrainerCreate, user_id: int) -> Trainer:
        """
        Create a new trainer record in the database.

        This method creates a new trainer profile associated with a user account.
        All trainer data is validated through the TrainerCreate schema before
        being persisted to the database.

        Args:
            trainer_in (TrainerCreate): Validated trainer data schema
            user_id (int): The unique identifier of the associated user

        Returns:
            Trainer: The newly created trainer object with generated ID

        Raises:
            IntegrityError: If the user_id doesn't exist or violates constraints
            ValidationError: If the trainer data fails validation

        Example:
            >>> from app.schemas.trainer import TrainerCreate
            >>> trainer_data = TrainerCreate(
            ...     specialization="Weight Training",
            ...     experience_years=5,
            ...     hourly_rate=75.00
            ... )
            >>> trainer = service.create(trainer_data, user_id=123)
            >>> print(f"Created trainer with ID: {trainer.id}")
        """
        db_trainer = Trainer(
            user_id=user_id,
            specialization=trainer_in.specialization,
            experience_years=trainer_in.experience_years,
            bio=trainer_in.bio,
            certification=trainer_in.certification,
            hourly_rate=trainer_in.hourly_rate,
        )
        self.db.add(db_trainer)
        self.db.commit()
        self.db.refresh(db_trainer)
        return db_trainer

    def update(
        self, db_obj: Trainer, obj_in: Union[TrainerUpdate, Dict[str, Any]]
    ) -> Trainer:
        """
        Update an existing trainer record with new data.

        This method updates only the fields that are provided in the update object,
        leaving other fields unchanged. It supports both Pydantic schema objects
        and plain dictionaries for update data.

        Args:
            db_obj (Trainer): The existing trainer object to update
            obj_in (Union[TrainerUpdate, Dict[str, Any]]): Update data as schema or dict

        Returns:
            Trainer: The updated trainer object

        Example:
            >>> # Using Pydantic schema
            >>> update_data = TrainerUpdate(hourly_rate=80.00)
            >>> trainer = service.update(existing_trainer, update_data)
            >>>
            >>> # Using dictionary
            >>> trainer = service.update(existing_trainer, {"bio": "Updated bio"})
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

    def remove(self, id: int) -> Trainer:
        """
        Delete a trainer record from the database.

        This method permanently removes a trainer record. Note that this
        might affect related records (clients, programs, etc.) depending
        on the database foreign key constraints.

        Args:
            id (int): The unique identifier of the trainer to delete

        Returns:
            Trainer: The deleted trainer object

        Raises:
            ValueError: If the trainer with the given ID doesn't exist
            IntegrityError: If deletion violates foreign key constraints

        Example:
            >>> deleted_trainer = service.remove(trainer_id=1)
            >>> print(f"Deleted trainer: {deleted_trainer.user.name}")

        Warning:
            This operation is irreversible. Consider implementing soft deletes
            for production use cases where data recovery might be needed.
        """
        obj = self.db.query(Trainer).get(id)
        self.db.delete(obj)
        self.db.commit()
        return obj

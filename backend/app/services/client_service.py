"""
Client service for business logic.

This module provides the ClientService class which handles all business logic
related to client management including CRUD operations, data validation,
client-trainer relationships, and specialized queries.

Classes:
    ClientService: Main service class for client-related operations

Example:
    Basic usage of the ClientService:
    
    >>> from app.services.client_service import ClientService
    >>> service = ClientService(db_session)
    >>> client = service.get(client_id=1)
    >>> clients = service.get_multi_by_trainer(trainer_id=1, skip=0, limit=10)
"""

from typing import Any, Dict, List, Optional, Union

from sqlalchemy.orm import Session

from app.models.client import Client
from app.schemas.client import ClientCreate, ClientUpdate


class ClientService:
    """
    Service class for managing client-related business logic.

    This class provides methods for creating, retrieving, updating, and deleting
    client records. It handles client-trainer relationships, search functionality,
    and acts as an abstraction layer between the API endpoints and database models.

    Attributes:
        db (Session): SQLAlchemy database session for database operations

    Example:
        >>> service = ClientService(db_session)
        >>> client = service.create(client_data, trainer_id=1, user_id=123)
        >>> clients_by_trainer = service.get_multi_by_trainer(trainer_id=1)
    """

    def __init__(self, db: Session):
        """
        Initialize the ClientService with a database session.

        Args:
            db (Session): SQLAlchemy database session for database operations
        """
        self.db = db

    def get(self, id: int) -> Optional[Client]:
        """
        Retrieve a single client by their ID.

        Args:
            id (int): The unique identifier of the client

        Returns:
            Optional[Client]: The client object if found, None otherwise

        Example:
            >>> client = service.get(client_id=1)
            >>> if client:
            ...     print(f"Found client: {client.user.name}")
        """
        return self.db.query(Client).filter(Client.id == id).first()

    def get_by_user_id(self, user_id: int) -> Optional[Client]:
        """
        Retrieve a client by their associated user ID.

        This method is useful when you have a user ID and need to find
        the corresponding client profile.

        Args:
            user_id (int): The unique identifier of the associated user

        Returns:
            Optional[Client]: The client object if found, None otherwise

        Example:
            >>> client = service.get_by_user_id(user_id=123)
            >>> if client:
            ...     print(f"Client fitness level: {client.fitness_level}")
        """
        return self.db.query(Client).filter(Client.user_id == user_id).first()

    def get_multi(
        self, *, skip: int = 0, limit: int = 100, trainer_id: Optional[int] = None
    ) -> List[Client]:
        """
        Retrieve multiple clients with optional trainer filtering and pagination.

        Args:
            skip (int, optional): Number of records to skip for pagination. Defaults to 0.
            limit (int, optional): Maximum number of records to return. Defaults to 100.
            trainer_id (Optional[int], optional): Filter clients by trainer. Defaults to None.

        Returns:
            List[Client]: List of client objects

        Example:
            >>> # Get all clients for a specific trainer
            >>> clients = service.get_multi(trainer_id=1, skip=0, limit=20)
            >>> # Get all clients across the system
            >>> all_clients = service.get_multi(skip=0, limit=50)
        """
        query = self.db.query(Client)
        if trainer_id:
            query = query.filter(Client.trainer_id == trainer_id)
        return query.offset(skip).limit(limit).all()

    def get_multi_by_trainer(
        self, trainer_id: int, *, skip: int = 0, limit: int = 100
    ) -> List[Client]:
        """
        Retrieve clients specifically assigned to a trainer with pagination.

        This method is optimized for trainer-specific client listings and
        ensures only clients belonging to the specified trainer are returned.

        Args:
            trainer_id (int): The unique identifier of the trainer
            skip (int, optional): Number of records to skip for pagination. Defaults to 0.
            limit (int, optional): Maximum number of records to return. Defaults to 100.

        Returns:
            List[Client]: List of client objects belonging to the trainer

        Example:
            >>> # Get first page of clients for trainer
            >>> clients = service.get_multi_by_trainer(trainer_id=1, skip=0, limit=10)
            >>> # Get second page
            >>> clients_page_2 = service.get_multi_by_trainer(trainer_id=1, skip=10, limit=10)
        """
        return (
            self.db.query(Client)
            .filter(Client.trainer_id == trainer_id)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def create(self, obj_in: ClientCreate, trainer_id: int, user_id: int) -> Client:
        """
        Create a new client record in the database.

        This method creates a new client profile associated with a user account
        and trainer. All client data is validated through the ClientCreate schema
        before being persisted to the database.

        Args:
            obj_in (ClientCreate): Validated client data schema
            trainer_id (int): The unique identifier of the assigned trainer
            user_id (int): The unique identifier of the associated user

        Returns:
            Client: The newly created client object with generated ID

        Raises:
            IntegrityError: If user_id or trainer_id doesn't exist or violates constraints
            ValidationError: If the client data fails validation

        Example:
            >>> from app.schemas.client import ClientCreate
            >>> client_data = ClientCreate(
            ...     goals="Weight loss and muscle building",
            ...     fitness_level="beginner",
            ...     medical_conditions="None"
            ... )
            >>> client = service.create(client_data, trainer_id=1, user_id=123)
            >>> print(f"Created client with ID: {client.id}")
        """
        obj_in_data = obj_in.dict()
        obj_in_data["trainer_id"] = trainer_id
        obj_in_data["user_id"] = user_id

        db_obj = Client(**obj_in_data)
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def update(
        self, db_obj: Client, obj_in: Union[ClientUpdate, Dict[str, Any]]
    ) -> Client:
        """
        Update an existing client record with new data.

        This method updates only the fields that are provided in the update object,
        leaving other fields unchanged. It supports both Pydantic schema objects
        and plain dictionaries for update data.

        Args:
            db_obj (Client): The existing client object to update
            obj_in (Union[ClientUpdate, Dict[str, Any]]): Update data as schema or dict

        Returns:
            Client: The updated client object

        Example:
            >>> # Using Pydantic schema
            >>> update_data = ClientUpdate(fitness_level="intermediate")
            >>> client = service.update(existing_client, update_data)
            >>>
            >>> # Using dictionary
            >>> client = service.update(existing_client, {"goals": "Updated goals"})
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

    def remove(self, id: int) -> Client:
        """
        Delete a client record from the database.

        This method permanently removes a client record. Note that this
        might affect related records (programs, progress, etc.) depending
        on the database foreign key constraints.

        Args:
            id (int): The unique identifier of the client to delete

        Returns:
            Client: The deleted client object

        Raises:
            ValueError: If the client with the given ID doesn't exist
            IntegrityError: If deletion violates foreign key constraints

        Example:
            >>> deleted_client = service.remove(client_id=1)
            >>> print(f"Deleted client: {deleted_client.user.name}")

        Warning:
            This operation is irreversible. All associated data including
            programs, progress tracking, and session history will be affected.
            Consider implementing soft deletes for production use cases.
        """
        obj = self.db.query(Client).get(id)
        self.db.delete(obj)
        self.db.commit()
        return obj

    def count(self, trainer_id: Optional[int] = None) -> int:
        """
        Count the total number of clients, optionally filtered by trainer.

        This method provides efficient counting for pagination and statistics
        without loading all client records into memory.

        Args:
            trainer_id (Optional[int], optional): Filter count by trainer. Defaults to None.

        Returns:
            int: Total number of clients matching the criteria

        Example:
            >>> # Count all clients in the system
            >>> total_clients = service.count()
            >>>
            >>> # Count clients for a specific trainer
            >>> trainer_clients = service.count(trainer_id=1)
            >>> print(f"Trainer has {trainer_clients} clients")
        """
        query = self.db.query(Client)
        if trainer_id:
            query = query.filter(Client.trainer_id == trainer_id)
        return query.count()

    def search(
        self,
        *,
        trainer_id: Optional[int] = None,
        fitness_level: Optional[str] = None,
        is_active: Optional[bool] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[Client]:
        """
        Search for clients using multiple filter criteria with pagination.

        This method provides advanced filtering capabilities for finding clients
        based on various attributes such as trainer assignment, fitness level,
        and account status.

        Args:
            trainer_id (Optional[int], optional): Filter by assigned trainer. Defaults to None.
            fitness_level (Optional[str], optional): Filter by fitness level
                ("beginner", "intermediate", "advanced"). Defaults to None.
            is_active (Optional[bool], optional): Filter by account status. Defaults to None.
            skip (int, optional): Number of records to skip for pagination. Defaults to 0.
            limit (int, optional): Maximum number of records to return. Defaults to 100.

        Returns:
            List[Client]: List of client objects matching all specified criteria

        Example:
            >>> # Find all beginner clients for a trainer
            >>> beginners = service.search(
            ...     trainer_id=1,
            ...     fitness_level="beginner",
            ...     is_active=True,
            ...     skip=0,
            ...     limit=20
            ... )
            >>>
            >>> # Find all inactive clients across the system
            >>> inactive_clients = service.search(is_active=False)
            >>>
            >>> # Advanced search with multiple criteria
            >>> advanced_active = service.search(
            ...     fitness_level="advanced",
            ...     is_active=True,
            ...     skip=0,
            ...     limit=50
            ... )
        """
        query = self.db.query(Client)

        if trainer_id:
            query = query.filter(Client.trainer_id == trainer_id)
        if fitness_level:
            query = query.filter(Client.fitness_level == fitness_level)
        if is_active is not None:
            query = query.filter(Client.is_active == is_active)

        return query.offset(skip).limit(limit).all()

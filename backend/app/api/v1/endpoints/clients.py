"""
Client API endpoints for the FitnessPr application.

This module defines all HTTP endpoints related to client management including
CRUD operations, search functionality, and role-based access control. Endpoints
provide secure access for both trainers and clients with appropriate permissions.

Features:
    - Full CRUD operations for client profiles
    - Trainer-client relationship management
    - Advanced search and filtering capabilities
    - Role-based access control (trainer vs client permissions)
    - Pagination support for large datasets
    - Input validation using Pydantic schemas
    - Comprehensive error handling with appropriate HTTP status codes

Security:
    - JWT authentication required for all endpoints
    - Role-based authorization (trainers can manage clients, clients can view/edit own data)
    - Trainer-client relationship validation
    - Access control for sensitive operations

Router:
    APIRouter instance configured with client-specific routes

Dependencies:
    - Database session injection via get_db()
    - User authentication via get_current_user()
    - Request/response validation via Pydantic schemas
"""

from typing import Any

from fastapi import APIRouter, Body, Depends, HTTPException, Path, Query
from sqlalchemy.orm import Session

from app.api.v1.endpoints.auth import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.client import (
    ClientCreate,
    ClientListResponse,
    ClientResponse,
    ClientUpdate,
)
from app.services.client_service import ClientService

router = APIRouter()


@router.get("/", response_model=ClientListResponse)
def read_clients(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0, description="Number of records to skip for pagination"),
    limit: int = Query(
        100, ge=1, le=100, description="Maximum number of records to return"
    ),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Retrieve a paginated list of clients for the current trainer.

    This endpoint returns all clients assigned to the authenticated trainer with
    pagination support. Only trainers can access this endpoint.

    Args:
        db: Database session dependency
        skip: Number of records to skip (for pagination, default: 0)
        limit: Maximum records to return (default: 100, max: 100)
        current_user: Authenticated user from JWT token

    Returns:
        ClientListResponse: Paginated list of client objects with metadata

    Raises:
        HTTPException: 403 if user is not a trainer
        HTTPException: 404 if trainer profile not found
        HTTPException: 401 if authentication fails

    Example Response:
        ```json
        {
            "clients": [
                {
                    "id": 1,
                    "user_id": 123,
                    "trainer_id": 1,
                    "goals": "Weight loss and muscle building",
                    "fitness_level": "beginner",
                    "medical_conditions": "None",
                    "is_active": true,
                    "created_at": "2024-01-01T00:00:00Z"
                }
            ],
            "total": 15,
            "page": 1,
            "size": 10
        }
        ```

    Permission Requirements:
        - User must be authenticated
        - User must have trainer role
        - User must have an active trainer profile
    """
    if not current_user.is_trainer:
        raise HTTPException(
            status_code=403, detail="Only trainers can access this endpoint"
        )

    # Get trainer ID from user
    trainer_id = current_user.trainer.id if current_user.trainer else None
    if not trainer_id:
        raise HTTPException(status_code=404, detail="Trainer profile not found")

    client_service = ClientService(db)
    clients = client_service.get_multi_by_trainer(trainer_id, skip=skip, limit=limit)
    total = client_service.count(trainer_id=trainer_id)

    return ClientListResponse(
        clients=clients, total=total, page=skip // limit + 1, size=limit
    )


@router.post("/", response_model=ClientResponse)
def create_client(
    *,
    db: Session = Depends(get_db),
    client_in: ClientCreate = Body(...),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Create a new client profile assigned to the current trainer.

    This endpoint creates a new client profile and associates it with the
    authenticated trainer. All input data is validated according to the
    ClientCreate schema.

    Args:
        db: Database session dependency
        client_in: Client data validated against ClientCreate schema
        current_user: Authenticated user from JWT token

    Returns:
        ClientResponse: The newly created client profile

    Raises:
        HTTPException: 403 if user is not a trainer
        HTTPException: 404 if trainer profile not found
        HTTPException: 422 if input validation fails
        HTTPException: 401 if authentication fails

    Example Request:
        ```json
        {
            "name": "John Doe",
            "email": "john.doe@example.com",
            "goals": "Weight loss and muscle building",
            "fitness_level": "beginner",
            "medical_conditions": "None",
            "preferences": "Prefers morning workouts"
        }
        ```

    Example Response:
        ```json
        {
            "id": 1,
            "user_id": 123,
            "trainer_id": 1,
            "goals": "Weight loss and muscle building",
            "fitness_level": "beginner",
            "medical_conditions": "None",
            "is_active": true,
            "created_at": "2024-01-01T00:00:00Z",
            "updated_at": "2024-01-01T00:00:00Z"
        }
        ```

    Permission Requirements:
        - User must be authenticated
        - User must have trainer role
        - User must have an active trainer profile

    Business Logic:
        - Client is automatically assigned to the current trainer
        - Account is set to active by default
        - Created timestamp is automatically set
    """
    if not current_user.is_trainer:
        raise HTTPException(status_code=403, detail="Only trainers can create clients")

    # Get trainer ID from user
    trainer_id = current_user.trainer.id if current_user.trainer else None
    if not trainer_id:
        raise HTTPException(status_code=404, detail="Trainer profile not found")

    client_service = ClientService(db)
    client = client_service.create(
        client_in, trainer_id=trainer_id
    )
    return client


@router.get("/{client_id}", response_model=ClientResponse)
def read_client(
    *,
    db: Session = Depends(get_db),
    client_id: int = Path(..., description="Unique identifier of the client"),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Retrieve a specific client profile by ID.

    This endpoint returns detailed information about a single client. Access
    is controlled based on user role: trainers can access their assigned clients,
    while clients can only access their own profile.

    Args:
        db: Database session dependency
        client_id: Unique identifier of the client to retrieve
        current_user: Authenticated user from JWT token

    Returns:
        ClientResponse: Complete client profile information

    Raises:
        HTTPException: 404 if client with given ID doesn't exist
        HTTPException: 403 if user doesn't have access to this client
        HTTPException: 401 if authentication fails

    Example Response:
        ```json
        {
            "id": 1,
            "user_id": 123,
            "trainer_id": 1,
            "goals": "Weight loss and muscle building",
            "fitness_level": "beginner",
            "medical_conditions": "None",
            "notes": "Prefers morning workouts",
            "is_active": true,
            "created_at": "2024-01-01T00:00:00Z",
            "updated_at": "2024-01-01T00:00:00Z"
        }
        ```

    Access Control:
        - **Trainers**: Can access clients assigned to them
        - **Clients**: Can only access their own profile
        - **Admin**: Can access any client (if implemented)

    Use Cases:
        - Displaying client profile in trainer dashboard
        - Client self-service profile viewing
        - Populating edit forms with current data
        - Generating reports and analytics
    """
    client_service = ClientService(db)
    client = client_service.get(client_id)
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    # Check if user has access to this client
    if current_user.is_trainer:
        trainer_id = current_user.trainer.id if current_user.trainer else None
        if client.trainer_id != trainer_id:
            raise HTTPException(status_code=403, detail="Access denied")
    else:
        # Client can only access their own data
        if client.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Access denied")

    return client


@router.put("/{client_id}", response_model=ClientResponse)
def update_client(
    *,
    db: Session = Depends(get_db),
    client_id: int = Path(..., description="Unique identifier of the client"),
    client_in: ClientUpdate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Update an existing client profile.

    This endpoint allows partial or complete updates to a client profile.
    Only provided fields will be updated; omitted fields remain unchanged.
    Access is controlled based on user role and client ownership.

    Args:
        db: Database session dependency
        client_id: Unique identifier of the client to update
        client_in: Update data validated against ClientUpdate schema
        current_user: Authenticated user from JWT token

    Returns:
        ClientResponse: The updated client profile

    Raises:
        HTTPException: 404 if client with given ID doesn't exist
        HTTPException: 403 if user doesn't have permission to update this client
        HTTPException: 422 if input validation fails
        HTTPException: 401 if authentication fails

    Example Request (partial update):
        ```json
        {
            "fitness_level": "intermediate",
            "goals": "Muscle building and strength training"
        }
        ```

    Example Response:
        ```json
        {
            "id": 1,
            "user_id": 123,
            "trainer_id": 1,
            "goals": "Muscle building and strength training",
            "fitness_level": "intermediate",
            "medical_conditions": "None",
            "is_active": true,
            "created_at": "2024-01-01T00:00:00Z",
            "updated_at": "2024-01-02T00:00:00Z"
        }
        ```

    Access Control:
        - **Trainers**: Can update clients assigned to them
        - **Clients**: Can update their own profile (limited fields)
        - Trainer assignment cannot be changed by clients

    Update Capabilities:
        - Goals and objectives
        - Fitness level progression
        - Medical conditions and notes
        - Contact preferences
        - Account status (trainer only)
    """
    client_service = ClientService(db)
    client = client_service.get(client_id)
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    # Check if user has access to update this client
    if current_user.is_trainer:
        trainer_id = current_user.trainer.id if current_user.trainer else None
        if client.trainer_id != trainer_id:
            raise HTTPException(status_code=403, detail="Access denied")
    else:
        # Client can only update their own data
        if client.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Access denied")

    client = client_service.update(client, client_in)
    return client


@router.delete("/{client_id}")
def delete_client(
    *,
    db: Session = Depends(get_db),
    client_id: int = Path(..., description="Unique identifier of the client"),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Delete a client profile permanently.

    This endpoint permanently removes a client profile from the system.
    Only trainers can delete client profiles, and only for clients assigned
    to them. This action is irreversible and will affect related data.

    Args:
        db: Database session dependency
        client_id: Unique identifier of the client to delete
        current_user: Authenticated user from JWT token

    Returns:
        dict: Success message confirming deletion

    Raises:
        HTTPException: 403 if user is not a trainer or doesn't own this client
        HTTPException: 404 if client with given ID doesn't exist
        HTTPException: 409 if deletion would violate database constraints
        HTTPException: 401 if authentication fails

    Example Response:
        ```json
        {
            "message": "Client deleted successfully"
        }
        ```

    Permission Requirements:
        - User must be authenticated
        - User must have trainer role
        - Client must be assigned to the current trainer

    Data Impact:
        This operation affects related records:
        - Client programs and workouts
        - Progress tracking entries
        - Session history and notes
        - Payment and billing records

    Warning:
        This operation is irreversible. All associated data including
        workout programs, progress tracking, and session history will be
        affected. Consider implementing soft deletes for production
        environments where data recovery might be needed.

    Alternative Approaches:
        - Deactivate client instead of deletion
        - Transfer client to another trainer
        - Archive client data for compliance
    """
    if not current_user.is_trainer:
        raise HTTPException(status_code=403, detail="Only trainers can delete clients")

    client_service = ClientService(db)
    client = client_service.get(client_id)
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    # Check if trainer has access to this client
    trainer_id = current_user.trainer.id if current_user.trainer else None
    if client.trainer_id != trainer_id:
        raise HTTPException(status_code=403, detail="Access denied")

    client_service.remove(client_id)
    return {"message": "Client deleted successfully"}


@router.get("/search/", response_model=ClientListResponse)
def search_clients(
    db: Session = Depends(get_db),
    fitness_level: str = Query(
        None, description="Filter by fitness level (beginner, intermediate, advanced)"
    ),
    is_active: bool = Query(
        None,
        description="Filter by account status (true for active, false for inactive)",
    ),
    skip: int = Query(0, ge=0, description="Number of records to skip for pagination"),
    limit: int = Query(
        100, ge=1, le=100, description="Maximum number of records to return"
    ),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Search and filter clients with advanced criteria.

    This endpoint provides advanced search capabilities for finding clients
    based on various attributes such as fitness level and account status.
    Only trainers can access this endpoint and results are filtered to
    their assigned clients.

    Args:
        db: Database session dependency
        fitness_level: Filter by fitness level ("beginner", "intermediate", "advanced")
        is_active: Filter by account status (true/false)
        skip: Number of records to skip (for pagination, default: 0)
        limit: Maximum records to return (default: 100, max: 100)
        current_user: Authenticated user from JWT token

    Returns:
        ClientListResponse: Paginated list of clients matching search criteria

    Raises:
        HTTPException: 403 if user is not a trainer
        HTTPException: 404 if trainer profile not found
        HTTPException: 422 if search parameters are invalid
        HTTPException: 401 if authentication fails

    Example Request:
        ```
        GET /api/v1/clients/search/?fitness_level=beginner&is_active=true&skip=0&limit=20
        ```

    Example Response:
        ```json
        {
            "clients": [
                {
                    "id": 1,
                    "user_id": 123,
                    "trainer_id": 1,
                    "goals": "Weight loss",
                    "fitness_level": "beginner",
                    "is_active": true,
                    "created_at": "2024-01-01T00:00:00Z"
                }
            ],
            "total": 5,
            "page": 1,
            "size": 20
        }
        ```

    Search Capabilities:
        - **Fitness Level**: Filter by client experience level
        - **Active Status**: Find active or inactive clients
        - **Combination**: Use multiple filters together
        - **Pagination**: Handle large result sets efficiently

    Use Cases:
        - Find all beginner clients for group sessions
        - Identify inactive clients for re-engagement
        - Filter clients for specific program assignments
        - Generate targeted reports and analytics
        - Client portfolio management and organization

    Permission Requirements:
        - User must be authenticated
        - User must have trainer role
        - Results filtered to trainer's assigned clients only
    """
    if not current_user.is_trainer:
        raise HTTPException(status_code=403, detail="Only trainers can search clients")

    trainer_id = current_user.trainer.id if current_user.trainer else None
    if not trainer_id:
        raise HTTPException(status_code=404, detail="Trainer profile not found")

    client_service = ClientService(db)
    clients = client_service.search(
        trainer_id=trainer_id,
        fitness_level=fitness_level,
        is_active=is_active,
        skip=skip,
        limit=limit,
    )
    total = client_service.count(trainer_id=trainer_id)

    return ClientListResponse(
        clients=clients, total=total, page=skip // limit + 1, size=limit
    )

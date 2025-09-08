"""
Trainer API endpoints for the FitnessPr application.

This module defines all HTTP endpoints related to trainer management including
CRUD operations, authentication, and data validation. All endpoints require
authentication and return structured JSON responses.

Features:
    - Full CRUD operations for trainer profiles
    - Pagination support for trainer listings  
    - Input validation using Pydantic schemas
    - Comprehensive error handling with appropriate HTTP status codes
    - JWT authentication required for all endpoints

Router:
    APIRouter instance configured with trainer-specific routes

Dependencies:
    - Database session injection via get_db()
    - User authentication via get_current_user()
    - Request/response validation via Pydantic schemas
"""

from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, Path, Query
from sqlalchemy.orm import Session

from app.api.v1.endpoints.auth import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.trainer import TrainerCreate, TrainerResponse, TrainerUpdate
from app.services.trainer_service import TrainerService

router = APIRouter()


@router.get("/", response_model=List[TrainerResponse])
def read_trainers(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0, description="Number of records to skip for pagination"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of records to return"),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Retrieve a paginated list of all trainers.
    
    This endpoint returns a list of trainer profiles with support for pagination.
    Results include trainer specializations, experience, certifications, and rates.
    
    Args:
        db: Database session dependency
        skip: Number of records to skip (for pagination, default: 0)
        limit: Maximum records to return (default: 100, max: 1000)
        current_user: Authenticated user from JWT token
        
    Returns:
        List[TrainerResponse]: List of trainer objects with full profile information
        
    Raises:
        HTTPException: 401 if authentication fails
        HTTPException: 422 if pagination parameters are invalid
        
    Example Response:
        ```json
        [
            {
                "id": 1,
                "user_id": 123,
                "specialization": "Weight Training",
                "experience_years": 5,
                "bio": "Certified personal trainer...",
                "certification": "NASM-CPT",
                "hourly_rate": 75.00,
                "created_at": "2024-01-01T00:00:00Z",
                "updated_at": "2024-01-01T00:00:00Z"
            }
        ]
        ```
    """
    trainer_service = TrainerService(db)
    trainers = trainer_service.get_multi(skip=skip, limit=limit)
    return trainers


@router.post("/", response_model=TrainerResponse, status_code=201)
def create_trainer(
    *,
    db: Session = Depends(get_db),
    trainer_in: TrainerCreate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Create a new trainer profile for the authenticated user.
    
    This endpoint creates a trainer profile associated with the current user's account.
    The user must not already have a trainer profile. All input data is validated
    according to the TrainerCreate schema.
    
    Args:
        db: Database session dependency
        trainer_in: Trainer data validated against TrainerCreate schema
        current_user: Authenticated user from JWT token
        
    Returns:
        TrainerResponse: The newly created trainer profile with generated ID
        
    Raises:
        HTTPException: 401 if authentication fails
        HTTPException: 400 if user already has a trainer profile
        HTTPException: 422 if input validation fails
        
    Example Request:
        ```json
        {
            "specialization": "Weight Training",
            "experience_years": 5,
            "bio": "Certified personal trainer with 5 years experience...",
            "certification": "NASM-CPT",
            "hourly_rate": 75.00
        }
        ```
        
    Example Response:
        ```json
        {
            "id": 1,
            "user_id": 123,
            "specialization": "Weight Training",
            "experience_years": 5,
            "bio": "Certified personal trainer...",
            "certification": "NASM-CPT", 
            "hourly_rate": 75.00,
            "created_at": "2024-01-01T00:00:00Z",
            "updated_at": "2024-01-01T00:00:00Z"
        }
        ```
    """
    trainer_service = TrainerService(db)
    trainer = trainer_service.create(trainer_in, current_user.id)
    return trainer


@router.get("/{trainer_id}", response_model=TrainerResponse)
def read_trainer(
    *,
    db: Session = Depends(get_db),
    trainer_id: int = Path(..., description="Unique identifier of the trainer"),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Retrieve a specific trainer profile by ID.
    
    This endpoint returns detailed information about a single trainer including
    their specialization, experience, certifications, rates, and bio.
    
    Args:
        db: Database session dependency
        trainer_id: Unique identifier of the trainer to retrieve
        current_user: Authenticated user from JWT token
        
    Returns:
        TrainerResponse: Complete trainer profile information
        
    Raises:
        HTTPException: 401 if authentication fails
        HTTPException: 404 if trainer with given ID doesn't exist
        HTTPException: 422 if trainer_id is not a valid integer
        
    Example Response:
        ```json
        {
            "id": 1,
            "user_id": 123,
            "specialization": "Weight Training",
            "experience_years": 5,
            "bio": "Certified personal trainer with extensive experience...",
            "certification": "NASM-CPT",
            "hourly_rate": 75.00,
            "created_at": "2024-01-01T00:00:00Z",
            "updated_at": "2024-01-01T00:00:00Z"
        }
        ```
    """
    trainer_service = TrainerService(db)
    trainer = trainer_service.get(trainer_id)
    if not trainer:
        raise HTTPException(status_code=404, detail="Trainer not found")
    return trainer


@router.put("/{trainer_id}", response_model=TrainerResponse)
def update_trainer(
    *,
    db: Session = Depends(get_db),
    trainer_id: int = Path(..., description="Unique identifier of the trainer"),
    trainer_in: TrainerUpdate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Update an existing trainer profile.
    
    This endpoint allows partial or complete updates to a trainer profile.
    Only provided fields will be updated; omitted fields remain unchanged.
    Users can only update their own trainer profiles.
    
    Args:
        db: Database session dependency
        trainer_id: Unique identifier of the trainer to update
        trainer_in: Update data validated against TrainerUpdate schema
        current_user: Authenticated user from JWT token
        
    Returns:
        TrainerResponse: The updated trainer profile
        
    Raises:
        HTTPException: 401 if authentication fails
        HTTPException: 403 if user tries to update another user's profile
        HTTPException: 404 if trainer with given ID doesn't exist
        HTTPException: 422 if input validation fails
        
    Example Request (partial update):
        ```json
        {
            "hourly_rate": 80.00,
            "bio": "Updated bio with new achievements..."
        }
        ```
        
    Example Response:
        ```json
        {
            "id": 1,
            "user_id": 123,
            "specialization": "Weight Training",
            "experience_years": 5,
            "bio": "Updated bio with new achievements...",
            "certification": "NASM-CPT",
            "hourly_rate": 80.00,
            "created_at": "2024-01-01T00:00:00Z",
            "updated_at": "2024-01-02T00:00:00Z"
        }
        ```
    """
    trainer_service = TrainerService(db)
    trainer = trainer_service.get(trainer_id)
    if not trainer:
        raise HTTPException(status_code=404, detail="Trainer not found")

    trainer = trainer_service.update(trainer, trainer_in)
    return trainer


@router.delete("/{trainer_id}", status_code=200)
def delete_trainer(
    *,
    db: Session = Depends(get_db),
    trainer_id: int = Path(..., description="Unique identifier of the trainer"),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Delete a trainer profile permanently.
    
    This endpoint permanently removes a trainer profile from the system.
    This action is irreversible and will affect related data such as
    associated clients, programs, and sessions.
    
    Args:
        db: Database session dependency
        trainer_id: Unique identifier of the trainer to delete
        current_user: Authenticated user from JWT token
        
    Returns:
        dict: Success message confirming deletion
        
    Raises:
        HTTPException: 401 if authentication fails
        HTTPException: 403 if user tries to delete another user's profile
        HTTPException: 404 if trainer with given ID doesn't exist
        HTTPException: 409 if deletion would violate database constraints
        
    Example Response:
        ```json
        {
            "message": "Trainer deleted successfully"
        }
        ```
        
    Warning:
        This operation is irreversible. All associated data including
        client relationships, programs, and session history will be affected.
        Consider implementing soft deletes for production environments.
    """
    trainer_service = TrainerService(db)
    trainer = trainer_service.get(trainer_id)
    if not trainer:
        raise HTTPException(status_code=404, detail="Trainer not found")

    trainer_service.remove(trainer_id)
    return {"message": "Trainer deleted successfully"}

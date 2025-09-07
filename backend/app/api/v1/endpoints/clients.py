"""
Client endpoints.
"""

from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.v1.endpoints.auth import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.client import ClientCreate, ClientResponse, ClientUpdate, ClientListResponse
from app.services.client_service import ClientService

router = APIRouter()


@router.get("/", response_model=ClientListResponse)
def read_clients(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Retrieve clients for the current trainer.
    """
    if not current_user.is_trainer:
        raise HTTPException(status_code=403, detail="Only trainers can access this endpoint")
    
    # Get trainer ID from user
    trainer_id = current_user.trainer.id if current_user.trainer else None
    if not trainer_id:
        raise HTTPException(status_code=404, detail="Trainer profile not found")
    
    client_service = ClientService(db)
    clients = client_service.get_multi_by_trainer(trainer_id, skip=skip, limit=limit)
    total = client_service.count(trainer_id=trainer_id)
    
    return ClientListResponse(
        clients=clients,
        total=total,
        page=skip // limit + 1,
        size=limit
    )


@router.post("/", response_model=ClientResponse)
def create_client(
    *,
    db: Session = Depends(get_db),
    client_in: ClientCreate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Create new client for the current trainer.
    """
    if not current_user.is_trainer:
        raise HTTPException(status_code=403, detail="Only trainers can create clients")
    
    # Get trainer ID from user
    trainer_id = current_user.trainer.id if current_user.trainer else None
    if not trainer_id:
        raise HTTPException(status_code=404, detail="Trainer profile not found")
    
    client_service = ClientService(db)
    client = client_service.create(client_in, trainer_id=trainer_id, user_id=current_user.id)
    return client


@router.get("/{client_id}", response_model=ClientResponse)
def read_client(
    *,
    db: Session = Depends(get_db),
    client_id: int,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get client by ID.
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
    client_id: int,
    client_in: ClientUpdate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Update client.
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
    client_id: int,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Delete client.
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
    fitness_level: str = Query(None),
    is_active: bool = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Search clients with filters.
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
        limit=limit
    )
    total = client_service.count(trainer_id=trainer_id)
    
    return ClientListResponse(
        clients=clients,
        total=total,
        page=skip // limit + 1,
        size=limit
    )

"""
Client endpoints.
"""

from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.v1.endpoints.auth import get_current_user
from app.core.database import get_db
from app.models.user import User

router = APIRouter()


@router.get("/")
def read_clients(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Retrieve clients.
    """
    return {"message": "Clients endpoint - coming soon"}


@router.post("/")
def create_client(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Create new client.
    """
    return {"message": "Create client endpoint - coming soon"}


@router.get("/{client_id}")
def read_client(
    *,
    db: Session = Depends(get_db),
    client_id: int,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get client by ID.
    """
    return {"message": f"Client {client_id} endpoint - coming soon"}

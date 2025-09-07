"""
Trainer endpoints.
"""

from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException
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
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Retrieve trainers.
    """
    trainer_service = TrainerService(db)
    trainers = trainer_service.get_multi(skip=skip, limit=limit)
    return trainers


@router.post("/", response_model=TrainerResponse)
def create_trainer(
    *,
    db: Session = Depends(get_db),
    trainer_in: TrainerCreate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Create new trainer.
    """
    trainer_service = TrainerService(db)
    trainer = trainer_service.create(trainer_in, current_user.id)
    return trainer


@router.get("/{trainer_id}", response_model=TrainerResponse)
def read_trainer(
    *,
    db: Session = Depends(get_db),
    trainer_id: int,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get trainer by ID.
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
    trainer_id: int,
    trainer_in: TrainerUpdate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Update trainer.
    """
    trainer_service = TrainerService(db)
    trainer = trainer_service.get(trainer_id)
    if not trainer:
        raise HTTPException(status_code=404, detail="Trainer not found")
    
    trainer = trainer_service.update(trainer, trainer_in)
    return trainer


@router.delete("/{trainer_id}")
def delete_trainer(
    *,
    db: Session = Depends(get_db),
    trainer_id: int,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Delete trainer.
    """
    trainer_service = TrainerService(db)
    trainer = trainer_service.get(trainer_id)
    if not trainer:
        raise HTTPException(status_code=404, detail="Trainer not found")
    
    trainer_service.remove(trainer_id)
    return {"message": "Trainer deleted successfully"}

"""
Session endpoints for workout log management.
"""
from datetime import date, datetime
from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.v1.endpoints.auth import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.progress import (
    WorkoutLogCreate,
    WorkoutLogListResponse,
    WorkoutLogResponse,
    WorkoutLogUpdate,
)
from app.services.progress_service import WorkoutLogService

router = APIRouter()


@router.get("/", response_model=WorkoutLogListResponse)
def read_sessions(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    date: Optional[date] = Query(None, description="Filter sessions by date"),
    client_id: Optional[int] = Query(None, description="Filter by client ID"),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Retrieve workout sessions (workout logs).
    """
    workout_service = WorkoutLogService(db)
    
    if current_user.is_trainer:
        # Trainers can see all their clients' sessions
        workout_logs = workout_service.get_multi_with_filters(
            skip=skip,
            limit=limit,
            trainer_id=current_user.id,
            date_filter=date,
            client_id=client_id,
        )
        total = workout_service.count_with_filters(
            trainer_id=current_user.id,
            date_filter=date,
            client_id=client_id,
        )
    else:
        # Clients can only see their own sessions
        workout_logs = workout_service.get_multi_with_filters(
            skip=skip,
            limit=limit,
            client_id=current_user.id,
            date_filter=date,
        )
        total = workout_service.count_with_filters(
            client_id=current_user.id,
            date_filter=date,
        )
    
    return WorkoutLogListResponse(
        workout_logs=workout_logs,
        total=total,
        page=skip // limit + 1,
        size=limit,
    )


@router.post("/", response_model=WorkoutLogResponse, status_code=201)
def create_session(
    *,
    db: Session = Depends(get_db),
    session_in: WorkoutLogCreate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Create new workout session.
    """
    workout_service = WorkoutLogService(db)
    
    if current_user.is_trainer:
        # Trainers can create sessions for their clients
        workout_log = workout_service.create(obj_in=session_in)
    else:
        # Clients can only create sessions for themselves
        session_data = session_in.dict()
        session_data["client_id"] = current_user.id
        workout_log = workout_service.create(obj_in=WorkoutLogCreate(**session_data))
    
    return workout_log


@router.get("/{session_id}", response_model=WorkoutLogResponse)
def read_session(
    *,
    db: Session = Depends(get_db),
    session_id: int,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get specific workout session.
    """
    workout_service = WorkoutLogService(db)
    workout_log = workout_service.get(id=session_id)
    
    if not workout_log:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Check permissions
    if current_user.is_trainer:
        # Trainers can see sessions they're associated with
        if workout_log.trainer_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not enough permissions")
    else:
        # Clients can only see their own sessions
        if workout_log.client_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not enough permissions")
    
    return workout_log


@router.put("/{session_id}", response_model=WorkoutLogResponse)
def update_session(
    *,
    db: Session = Depends(get_db),
    session_id: int,
    session_in: WorkoutLogUpdate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Update workout session.
    """
    workout_service = WorkoutLogService(db)
    workout_log = workout_service.get(id=session_id)
    
    if not workout_log:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Check permissions
    if current_user.is_trainer:
        # Trainers can update sessions they're associated with
        if workout_log.trainer_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not enough permissions")
    else:
        # Clients can only update their own sessions
        if workout_log.client_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not enough permissions")
    
    workout_log = workout_service.update(db_obj=workout_log, obj_in=session_in)
    return workout_log


@router.delete("/{session_id}")
def delete_session(
    *,
    db: Session = Depends(get_db),
    session_id: int,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Delete workout session.
    """
    workout_service = WorkoutLogService(db)
    workout_log = workout_service.get(id=session_id)
    
    if not workout_log:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Check permissions (only trainers can delete sessions)
    if not current_user.is_trainer or workout_log.trainer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    workout_service.remove(id=session_id)
    return {"detail": "Session deleted successfully"}

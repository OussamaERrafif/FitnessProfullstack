"""
Program endpoints.
"""

from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.v1.endpoints.auth import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.program import (
    ProgramCreate, ProgramResponse, ProgramUpdate, 
    ProgramListResponse, ProgramExerciseCreate
)
from app.services.program_service import ProgramService

router = APIRouter()


@router.get("/", response_model=ProgramListResponse)
def read_programs(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    client_id: int = Query(None),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Retrieve programs.
    """
    program_service = ProgramService(db)
    
    if current_user.is_trainer:
        trainer_id = current_user.trainer.id if current_user.trainer else None
        if not trainer_id:
            raise HTTPException(status_code=404, detail="Trainer profile not found")
        programs = program_service.get_multi(skip=skip, limit=limit, trainer_id=trainer_id, client_id=client_id)
        total = program_service.count(trainer_id=trainer_id, client_id=client_id)
    else:
        # Client can only see their own programs
        client = current_user.client if hasattr(current_user, 'client') else None
        if not client:
            raise HTTPException(status_code=404, detail="Client profile not found")
        programs = program_service.get_multi(skip=skip, limit=limit, client_id=client.id)
        total = program_service.count(client_id=client.id)
    
    return ProgramListResponse(
        programs=programs,
        total=total,
        page=skip // limit + 1,
        size=limit
    )


@router.post("/", response_model=ProgramResponse)
def create_program(
    *,
    db: Session = Depends(get_db),
    program_in: ProgramCreate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Create new program.
    """
    if not current_user.is_trainer:
        raise HTTPException(status_code=403, detail="Only trainers can create programs")
    
    trainer_id = current_user.trainer.id if current_user.trainer else None
    if not trainer_id:
        raise HTTPException(status_code=404, detail="Trainer profile not found")
    
    program_service = ProgramService(db)
    program = program_service.create(program_in, trainer_id=trainer_id)
    return program


@router.get("/{program_id}", response_model=ProgramResponse)
def read_program(
    *,
    db: Session = Depends(get_db),
    program_id: int,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get program by ID.
    """
    program_service = ProgramService(db)
    program = program_service.get_with_exercises(program_id)
    if not program:
        raise HTTPException(status_code=404, detail="Program not found")
    
    # Check access permissions
    if current_user.is_trainer:
        trainer_id = current_user.trainer.id if current_user.trainer else None
        if program.trainer_id != trainer_id:
            raise HTTPException(status_code=403, detail="Access denied")
    else:
        # Client can only access their own programs
        client = current_user.client if hasattr(current_user, 'client') else None
        if not client or program.client_id != client.id:
            raise HTTPException(status_code=403, detail="Access denied")
    
    return program


@router.put("/{program_id}", response_model=ProgramResponse)
def update_program(
    *,
    db: Session = Depends(get_db),
    program_id: int,
    program_in: ProgramUpdate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Update program.
    """
    if not current_user.is_trainer:
        raise HTTPException(status_code=403, detail="Only trainers can update programs")
    
    program_service = ProgramService(db)
    program = program_service.get(program_id)
    if not program:
        raise HTTPException(status_code=404, detail="Program not found")
    
    trainer_id = current_user.trainer.id if current_user.trainer else None
    if program.trainer_id != trainer_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    program = program_service.update(program, program_in)
    return program


@router.delete("/{program_id}")
def delete_program(
    *,
    db: Session = Depends(get_db),
    program_id: int,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Delete program.
    """
    if not current_user.is_trainer:
        raise HTTPException(status_code=403, detail="Only trainers can delete programs")
    
    program_service = ProgramService(db)
    program = program_service.get(program_id)
    if not program:
        raise HTTPException(status_code=404, detail="Program not found")
    
    trainer_id = current_user.trainer.id if current_user.trainer else None
    if program.trainer_id != trainer_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    program_service.remove(program_id)
    return {"message": "Program deleted successfully"}


@router.post("/{program_id}/exercises")
def add_exercise_to_program(
    *,
    db: Session = Depends(get_db),
    program_id: int,
    exercise_data: ProgramExerciseCreate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Add exercise to program.
    """
    if not current_user.is_trainer:
        raise HTTPException(status_code=403, detail="Only trainers can modify programs")
    
    program_service = ProgramService(db)
    program = program_service.get(program_id)
    if not program:
        raise HTTPException(status_code=404, detail="Program not found")
    
    trainer_id = current_user.trainer.id if current_user.trainer else None
    if program.trainer_id != trainer_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    program_exercise = program_service.add_exercise(program_id, exercise_data.dict())
    return program_exercise


@router.delete("/{program_id}/exercises/{exercise_id}")
def remove_exercise_from_program(
    *,
    db: Session = Depends(get_db),
    program_id: int,
    exercise_id: int,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Remove exercise from program.
    """
    if not current_user.is_trainer:
        raise HTTPException(status_code=403, detail="Only trainers can modify programs")
    
    program_service = ProgramService(db)
    program = program_service.get(program_id)
    if not program:
        raise HTTPException(status_code=404, detail="Program not found")
    
    trainer_id = current_user.trainer.id if current_user.trainer else None
    if program.trainer_id != trainer_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    success = program_service.remove_exercise(program_id, exercise_id)
    if not success:
        raise HTTPException(status_code=404, detail="Exercise not found in program")
    
    return {"message": "Exercise removed from program successfully"}


@router.get("/client/{client_id}", response_model=ProgramListResponse)
def get_client_programs(
    *,
    db: Session = Depends(get_db),
    client_id: int,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get all programs for a specific client.
    """
    if not current_user.is_trainer:
        raise HTTPException(status_code=403, detail="Only trainers can access client programs")
    
    program_service = ProgramService(db)
    programs = program_service.get_client_programs(client_id)
    
    return ProgramListResponse(
        programs=programs,
        total=len(programs),
        page=1,
        size=len(programs)
    )

"""
Progress tracking endpoints.
"""

from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.v1.endpoints.auth import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.progress import (
    GoalCreate,
    GoalListResponse,
    GoalResponse,
    ProgressCreate,
    ProgressListResponse,
    ProgressResponse,
    ProgressUpdate,
    WorkoutLogCreate,
    WorkoutLogListResponse,
    WorkoutLogResponse,
)
from app.services.progress_service import (
    GoalService,
    ProgressService,
    WorkoutLogService,
)

router = APIRouter()


# Progress endpoints
@router.get("/", response_model=ProgressListResponse)
def read_progress(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    client_id: int = Query(None),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Retrieve progress entries.
    """
    progress_service = ProgressService(db)

    if current_user.is_trainer:
        trainer_id = current_user.trainer.id if current_user.trainer else None
        if not trainer_id:
            raise HTTPException(status_code=404, detail="Trainer profile not found")
        progress_entries = progress_service.get_multi(
            skip=skip, limit=limit, trainer_id=trainer_id, client_id=client_id
        )
        total = progress_service.count(trainer_id=trainer_id, client_id=client_id)
    else:
        # Client can only see their own progress
        client = current_user.client if hasattr(current_user, "client") else None
        if not client:
            raise HTTPException(status_code=404, detail="Client profile not found")
        progress_entries = progress_service.get_client_progress(
            client.id, skip=skip, limit=limit
        )
        total = progress_service.count(client_id=client.id)

    return ProgressListResponse(
        progress_entries=progress_entries,
        total=total,
        page=skip // limit + 1,
        size=limit,
    )


@router.post("/", response_model=ProgressResponse)
def create_progress(
    *,
    db: Session = Depends(get_db),
    progress_in: ProgressCreate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Create new progress entry.
    """
    if not current_user.is_trainer:
        raise HTTPException(
            status_code=403, detail="Only trainers can create progress entries"
        )

    trainer_id = current_user.trainer.id if current_user.trainer else None
    if not trainer_id:
        raise HTTPException(status_code=404, detail="Trainer profile not found")

    progress_service = ProgressService(db)
    progress = progress_service.create(progress_in, trainer_id=trainer_id)
    return progress


@router.get("/{progress_id}", response_model=ProgressResponse)
def read_progress_entry(
    *,
    db: Session = Depends(get_db),
    progress_id: int,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get progress entry by ID.
    """
    progress_service = ProgressService(db)
    progress = progress_service.get(progress_id)
    if not progress:
        raise HTTPException(status_code=404, detail="Progress entry not found")

    # Check access permissions
    if current_user.is_trainer:
        trainer_id = current_user.trainer.id if current_user.trainer else None
        if progress.trainer_id != trainer_id:
            raise HTTPException(status_code=403, detail="Access denied")
    else:
        # Client can only access their own progress
        client = current_user.client if hasattr(current_user, "client") else None
        if not client or progress.client_id != client.id:
            raise HTTPException(status_code=403, detail="Access denied")

    return progress


@router.put("/{progress_id}", response_model=ProgressResponse)
def update_progress(
    *,
    db: Session = Depends(get_db),
    progress_id: int,
    progress_in: ProgressUpdate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Update progress entry.
    """
    if not current_user.is_trainer:
        raise HTTPException(
            status_code=403, detail="Only trainers can update progress entries"
        )

    progress_service = ProgressService(db)
    progress = progress_service.get(progress_id)
    if not progress:
        raise HTTPException(status_code=404, detail="Progress entry not found")

    trainer_id = current_user.trainer.id if current_user.trainer else None
    if progress.trainer_id != trainer_id:
        raise HTTPException(status_code=403, detail="Access denied")

    progress = progress_service.update(progress, progress_in)
    return progress


@router.delete("/{progress_id}")
def delete_progress(
    *,
    db: Session = Depends(get_db),
    progress_id: int,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Delete progress entry.
    """
    if not current_user.is_trainer:
        raise HTTPException(
            status_code=403, detail="Only trainers can delete progress entries"
        )

    progress_service = ProgressService(db)
    progress = progress_service.get(progress_id)
    if not progress:
        raise HTTPException(status_code=404, detail="Progress entry not found")

    trainer_id = current_user.trainer.id if current_user.trainer else None
    if progress.trainer_id != trainer_id:
        raise HTTPException(status_code=403, detail="Access denied")

    progress_service.remove(progress_id)
    return {"message": "Progress entry deleted successfully"}


# Workout Log endpoints
@router.get("/workouts/", response_model=WorkoutLogListResponse)
def read_workout_logs(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    client_id: int = Query(None),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Retrieve workout logs.
    """
    workout_service = WorkoutLogService(db)

    if current_user.is_trainer:
        trainer_id = current_user.trainer.id if current_user.trainer else None
        if not trainer_id:
            raise HTTPException(status_code=404, detail="Trainer profile not found")
        workouts = workout_service.get_multi(
            skip=skip, limit=limit, trainer_id=trainer_id, client_id=client_id
        )
    else:
        # Client can only see their own workout logs
        client = current_user.client if hasattr(current_user, "client") else None
        if not client:
            raise HTTPException(status_code=404, detail="Client profile not found")
        workouts = workout_service.get_client_workout_logs(
            client.id, skip=skip, limit=limit
        )

    return WorkoutLogListResponse(
        workout_logs=workouts, total=len(workouts), page=skip // limit + 1, size=limit
    )


@router.post("/workouts/", response_model=WorkoutLogResponse)
def create_workout_log(
    *,
    db: Session = Depends(get_db),
    workout_in: WorkoutLogCreate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Create new workout log.
    """
    # Both trainers and clients can create workout logs
    if current_user.is_trainer:
        trainer_id = current_user.trainer.id if current_user.trainer else None
        if not trainer_id:
            raise HTTPException(status_code=404, detail="Trainer profile not found")
    else:
        # For clients, we need to find their trainer
        client = current_user.client if hasattr(current_user, "client") else None
        if not client:
            raise HTTPException(status_code=404, detail="Client profile not found")
        trainer_id = client.trainer_id
        # Set client_id for the workout
        workout_in.client_id = client.id

    workout_service = WorkoutLogService(db)
    workout = workout_service.create(workout_in, trainer_id=trainer_id)
    return workout


@router.get("/workouts/stats/{client_id}")
def get_workout_stats(
    *,
    db: Session = Depends(get_db),
    client_id: int,
    days: int = Query(30, ge=1, le=365),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get workout statistics for a client.
    """
    # Check access permissions
    if current_user.is_trainer:
        # Trainer should only access their own clients' stats
        # This would need additional validation in a real implementation
        pass
    else:
        # Client can only access their own stats
        client = current_user.client if hasattr(current_user, "client") else None
        if not client or client.id != client_id:
            raise HTTPException(status_code=403, detail="Access denied")

    workout_service = WorkoutLogService(db)
    stats = workout_service.get_workout_stats(client_id, days)
    return stats


# Goal endpoints
@router.get("/goals/", response_model=GoalListResponse)
def read_goals(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    client_id: int = Query(None),
    is_active: bool = Query(None),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Retrieve goals.
    """
    goal_service = GoalService(db)

    if current_user.is_trainer:
        trainer_id = current_user.trainer.id if current_user.trainer else None
        if not trainer_id:
            raise HTTPException(status_code=404, detail="Trainer profile not found")
        goals = goal_service.get_multi(
            skip=skip,
            limit=limit,
            trainer_id=trainer_id,
            client_id=client_id,
            is_active=is_active,
        )
    else:
        # Client can only see their own goals
        client = current_user.client if hasattr(current_user, "client") else None
        if not client:
            raise HTTPException(status_code=404, detail="Client profile not found")
        goals = goal_service.get_client_goals(client.id, is_active=is_active)

    return GoalListResponse(
        goals=goals, total=len(goals), page=skip // limit + 1, size=limit
    )


@router.post("/goals/", response_model=GoalResponse)
def create_goal(
    *,
    db: Session = Depends(get_db),
    goal_in: GoalCreate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Create new goal.
    """
    if not current_user.is_trainer:
        raise HTTPException(status_code=403, detail="Only trainers can create goals")

    trainer_id = current_user.trainer.id if current_user.trainer else None
    if not trainer_id:
        raise HTTPException(status_code=404, detail="Trainer profile not found")

    goal_service = GoalService(db)
    goal = goal_service.create(goal_in, trainer_id=trainer_id)
    return goal


@router.put("/goals/{goal_id}/achieve")
def mark_goal_achieved(
    *,
    db: Session = Depends(get_db),
    goal_id: int,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Mark goal as achieved.
    """
    goal_service = GoalService(db)
    goal = goal_service.get(goal_id)
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    # Check access permissions
    if current_user.is_trainer:
        trainer_id = current_user.trainer.id if current_user.trainer else None
        if goal.trainer_id != trainer_id:
            raise HTTPException(status_code=403, detail="Access denied")
    else:
        # Client can mark their own goals as achieved
        client = current_user.client if hasattr(current_user, "client") else None
        if not client or goal.client_id != client.id:
            raise HTTPException(status_code=403, detail="Access denied")

    goal = goal_service.mark_goal_achieved(goal_id)
    return {"message": "Goal marked as achieved", "achieved_date": goal.achieved_date}

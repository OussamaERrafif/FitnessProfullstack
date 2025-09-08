"""
Progress tracking service for business logic.
"""

from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional, Union

from sqlalchemy import and_, desc
from sqlalchemy.orm import Session

from app.models.progress import ExerciseLog, Goal, Progress, WorkoutLog
from app.schemas.progress import (
    GoalCreate,
    GoalUpdate,
    ProgressCreate,
    ProgressUpdate,
    WorkoutLogCreate,
    WorkoutLogUpdate,
)


class ProgressService:
    def __init__(self, db: Session):
        self.db = db

    def get(self, id: int) -> Optional[Progress]:
        return self.db.query(Progress).filter(Progress.id == id).first()

    def get_multi(
        self,
        *,
        skip: int = 0,
        limit: int = 100,
        client_id: Optional[int] = None,
        trainer_id: Optional[int] = None,
    ) -> List[Progress]:
        query = self.db.query(Progress)
        if client_id:
            query = query.filter(Progress.client_id == client_id)
        if trainer_id:
            query = query.filter(Progress.trainer_id == trainer_id)
        return query.order_by(desc(Progress.date)).offset(skip).limit(limit).all()

    def create(self, obj_in: ProgressCreate, trainer_id: int) -> Progress:
        obj_in_data = obj_in.dict()
        obj_in_data["trainer_id"] = trainer_id

        db_obj = Progress(**obj_in_data)
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def update(
        self, db_obj: Progress, obj_in: Union[ProgressUpdate, Dict[str, Any]]
    ) -> Progress:
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

    def remove(self, id: int) -> Progress:
        obj = self.db.query(Progress).get(id)
        self.db.delete(obj)
        self.db.commit()
        return obj

    def get_client_progress(
        self, client_id: int, skip: int = 0, limit: int = 100
    ) -> List[Progress]:
        """Get progress entries for a specific client."""
        return (
            self.db.query(Progress)
            .filter(Progress.client_id == client_id)
            .order_by(desc(Progress.date))
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_latest_progress(self, client_id: int) -> Optional[Progress]:
        """Get the most recent progress entry for a client."""
        return (
            self.db.query(Progress)
            .filter(Progress.client_id == client_id)
            .order_by(desc(Progress.date))
            .first()
        )

    def get_progress_by_date_range(
        self, client_id: int, start_date: datetime, end_date: datetime
    ) -> List[Progress]:
        """Get progress entries within a date range."""
        return (
            self.db.query(Progress)
            .filter(
                and_(
                    Progress.client_id == client_id,
                    Progress.date >= start_date,
                    Progress.date <= end_date,
                )
            )
            .order_by(Progress.date)
            .all()
        )

    def count(
        self, client_id: Optional[int] = None, trainer_id: Optional[int] = None
    ) -> int:
        query = self.db.query(Progress)
        if client_id:
            query = query.filter(Progress.client_id == client_id)
        if trainer_id:
            query = query.filter(Progress.trainer_id == trainer_id)
        return query.count()


class WorkoutLogService:
    def __init__(self, db: Session):
        self.db = db

    def get(self, id: int) -> Optional[WorkoutLog]:
        return self.db.query(WorkoutLog).filter(WorkoutLog.id == id).first()

    def get_multi(
        self,
        *,
        skip: int = 0,
        limit: int = 100,
        client_id: Optional[int] = None,
        trainer_id: Optional[int] = None,
    ) -> List[WorkoutLog]:
        query = self.db.query(WorkoutLog)
        if client_id:
            query = query.filter(WorkoutLog.client_id == client_id)
        if trainer_id:
            query = query.filter(WorkoutLog.trainer_id == trainer_id)
        return query.order_by(desc(WorkoutLog.date)).offset(skip).limit(limit).all()

    def create(self, obj_in: WorkoutLogCreate, trainer_id: int) -> WorkoutLog:
        obj_in_data = obj_in.dict(exclude={"exercises"})
        obj_in_data["trainer_id"] = trainer_id

        db_obj = WorkoutLog(**obj_in_data)
        self.db.add(db_obj)
        self.db.flush()  # Get the ID without committing

        # Add exercise logs
        if obj_in.exercises:
            for exercise_data in obj_in.exercises:
                exercise_log = ExerciseLog(
                    workout_log_id=db_obj.id, **exercise_data.dict()
                )
                self.db.add(exercise_log)

        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def update(
        self, db_obj: WorkoutLog, obj_in: Union[WorkoutLogUpdate, Dict[str, Any]]
    ) -> WorkoutLog:
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

    def remove(self, id: int) -> WorkoutLog:
        obj = self.db.query(WorkoutLog).get(id)
        # Remove associated exercise logs
        self.db.query(ExerciseLog).filter(ExerciseLog.workout_log_id == id).delete()
        self.db.delete(obj)
        self.db.commit()
        return obj

    def get_client_workout_logs(
        self, client_id: int, skip: int = 0, limit: int = 100
    ) -> List[WorkoutLog]:
        """Get workout logs for a specific client."""
        return (
            self.db.query(WorkoutLog)
            .filter(WorkoutLog.client_id == client_id)
            .order_by(desc(WorkoutLog.date))
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_workout_stats(self, client_id: int, days: int = 30) -> Dict[str, Any]:
        """Get workout statistics for a client over the last N days."""
        start_date = datetime.now() - timedelta(days=days)

        workouts = (
            self.db.query(WorkoutLog)
            .filter(
                and_(
                    WorkoutLog.client_id == client_id,
                    WorkoutLog.date >= start_date,
                    WorkoutLog.completed is True,
                )
            )
            .all()
        )

        total_workouts = len(workouts)
        total_duration = sum(w.duration_minutes or 0 for w in workouts)
        total_calories = sum(w.calories_burned or 0 for w in workouts)

        return {
            "total_workouts": total_workouts,
            "total_duration_minutes": total_duration,
            "total_calories_burned": total_calories,
            "average_duration": (
                total_duration / total_workouts if total_workouts > 0 else 0
            ),
            "workouts_per_week": (total_workouts / days) * 7 if days > 0 else 0,
        }


class GoalService:
    def __init__(self, db: Session):
        self.db = db

    def get(self, id: int) -> Optional[Goal]:
        return self.db.query(Goal).filter(Goal.id == id).first()

    def get_multi(
        self,
        *,
        skip: int = 0,
        limit: int = 100,
        client_id: Optional[int] = None,
        trainer_id: Optional[int] = None,
        is_active: Optional[bool] = None,
    ) -> List[Goal]:
        query = self.db.query(Goal)
        if client_id:
            query = query.filter(Goal.client_id == client_id)
        if trainer_id:
            query = query.filter(Goal.trainer_id == trainer_id)
        if is_active is not None:
            query = query.filter(Goal.is_active == is_active)
        return query.order_by(Goal.target_date).offset(skip).limit(limit).all()

    def create(self, obj_in: GoalCreate, trainer_id: int) -> Goal:
        obj_in_data = obj_in.dict()
        obj_in_data["trainer_id"] = trainer_id

        db_obj = Goal(**obj_in_data)
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def update(self, db_obj: Goal, obj_in: Union[GoalUpdate, Dict[str, Any]]) -> Goal:
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

    def remove(self, id: int) -> Goal:
        obj = self.db.query(Goal).get(id)
        self.db.delete(obj)
        self.db.commit()
        return obj

    def get_client_goals(
        self, client_id: int, is_active: Optional[bool] = None
    ) -> List[Goal]:
        """Get goals for a specific client."""
        query = self.db.query(Goal).filter(Goal.client_id == client_id)
        if is_active is not None:
            query = query.filter(Goal.is_active == is_active)
        return query.order_by(Goal.target_date).all()

    def mark_goal_achieved(self, goal_id: int) -> Goal:
        """Mark a goal as achieved."""
        goal = self.get(goal_id)
        if goal:
            goal.is_achieved = True
            goal.achieved_date = datetime.utcnow()
            self.db.commit()
            self.db.refresh(goal)
        return goal

    def get_overdue_goals(self, client_id: int) -> List[Goal]:
        """Get goals that are overdue and not achieved."""
        return (
            self.db.query(Goal)
            .filter(
                and_(
                    Goal.client_id == client_id,
                    Goal.target_date < datetime.now(),
                    Goal.is_achieved is False,
                    Goal.is_active is True,
                )
            )
            .all()
        )

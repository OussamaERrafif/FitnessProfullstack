"""
Progress tracking service module for comprehensive fitness monitoring and goal management.

This module provides business logic for tracking client progress, logging workouts, and
managing fitness goals within the fitness application. It supports comprehensive data
collection, statistical analysis, and progress visualization with detailed workout logs
and measurable goal tracking.

Features:
    - Progress entry creation and tracking with body measurements
    - Comprehensive workout logging with exercise details
    - Goal setting and achievement tracking with deadlines
    - Statistical analysis and progress visualization
    - Date range filtering and progress trend analysis
    - Integration with programs and exercise libraries

Example:
    Basic progress service usage::

        from app.services.progress_service import ProgressService, WorkoutLogService, GoalService
        from app.core.database import get_db
        
        # Initialize services
        db = get_db()
        progress_service = ProgressService(db)
        workout_service = WorkoutLogService(db)
        goal_service = GoalService(db)
        
        # Log client progress
        progress_data = ProgressCreate(
            client_id=123,
            weight=180.5,
            body_fat_percentage=15.2,
            muscle_mass=145.3,
            notes="Feeling stronger, increased energy"
        )
        progress = progress_service.create(progress_data, trainer_id=1)
        
        # Set a fitness goal
        goal_data = GoalCreate(
            client_id=123,
            title="Lose 10 pounds",
            description="Target weight loss for summer",
            target_value=170.0,
            target_date=datetime.now() + timedelta(days=90)
        )
        goal = goal_service.create(goal_data, trainer_id=1)

Security:
    - All progress operations require trainer authentication
    - Clients can only access their own progress data
    - Progress modifications are trainer-restricted
    - Goal management maintains trainer oversight
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
    """
    Service class for managing client progress tracking and body measurements.

    Provides comprehensive progress monitoring including body composition tracking,
    measurements logging, and progress trend analysis. Supports both trainer-logged
    and client self-reported progress data with detailed historical tracking.

    Attributes:
        db (Session): SQLAlchemy database session for data operations

    Example:
        Creating and tracking progress::

            progress_service = ProgressService(db)

            # Log progress entry
            progress_data = ProgressCreate(
                client_id=123,
                weight=175.2,
                body_fat_percentage=12.8,
                muscle_mass=148.5,
                waist_circumference=32.0,
                chest_circumference=42.5
            )
            progress = progress_service.create(progress_data, trainer_id=1)

            # Get progress trend
            recent_progress = progress_service.get_client_progress(client_id=123, limit=10)
    """

    def __init__(self, db: Session):
        """
        Initialize progress service with database session.

        Args:
            db (Session): SQLAlchemy database session for data persistence
        """
        self.db = db

    def get(self, id: int) -> Optional[Progress]:
        """
        Retrieve a single progress entry by ID.

        Args:
            id (int): Unique identifier of the progress entry

        Returns:
            Optional[Progress]: Progress object if found, None otherwise
        """
        return self.db.query(Progress).filter(Progress.id == id).first()

    def get_multi(
        self,
        *,
        skip: int = 0,
        limit: int = 100,
        client_id: Optional[int] = None,
        trainer_id: Optional[int] = None,
    ) -> List[Progress]:
        """
        Retrieve multiple progress entries with filtering and pagination.

        Returns progress entries ordered by date (most recent first) with
        comprehensive filtering options for trainers and clients.

        Args:
            skip (int, optional): Number of records to skip for pagination. Defaults to 0.
            limit (int, optional): Maximum number of records to return. Defaults to 100.
            client_id (Optional[int], optional): Filter by client ID for client-specific progress
            trainer_id (Optional[int], optional): Filter by trainer ID for trainer's clients

        Returns:
            List[Progress]: List of progress objects ordered by date (newest first)

        Example:
            >>> # Get recent progress for client
            >>> recent_progress = progress_service.get_multi(
            ...     client_id=123,
            ...     limit=20
            ... )
            >>>
            >>> # Get all progress logged by trainer
            >>> trainer_logged = progress_service.get_multi(
            ...     trainer_id=1,
            ...     limit=100
            ... )
        """
        query = self.db.query(Progress)
        if client_id:
            query = query.filter(Progress.client_id == client_id)
        if trainer_id:
            query = query.filter(Progress.trainer_id == trainer_id)
        return query.order_by(desc(Progress.date)).offset(skip).limit(limit).all()

    def create(self, obj_in: ProgressCreate, trainer_id: int) -> Progress:
        """
        Create a new progress entry with body measurements and notes.

        Logs comprehensive progress data including body composition, measurements,
        and qualitative observations. Automatically timestamps the entry.

        Args:
            obj_in (ProgressCreate): Progress creation schema with measurement data
            trainer_id (int): ID of the trainer logging the progress

        Returns:
            Progress: Created progress object with assigned ID and timestamp

        Example:
            >>> progress_data = ProgressCreate(
            ...     client_id=123,
            ...     weight=182.7,
            ...     body_fat_percentage=14.5,
            ...     muscle_mass=150.2,
            ...     waist_circumference=33.5,
            ...     chest_circumference=43.0,
            ...     arm_circumference=15.5,
            ...     thigh_circumference=24.0,
            ...     notes="Client reports increased energy and strength"
            ... )
            >>> progress = progress_service.create(progress_data, trainer_id=1)
            >>> print(f"Logged progress: {progress.weight} lbs on {progress.date}")
        """
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
        """
        Update an existing progress entry.

        Supports partial updates while maintaining data integrity and historical
        accuracy. Preserves trainer association and timestamp information.

        Args:
            db_obj (Progress): Existing progress object to update
            obj_in (Union[ProgressUpdate, Dict[str, Any]]): Update data schema or dictionary

        Returns:
            Progress: Updated progress object with refreshed data
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

    def remove(self, id: int) -> Progress:
        """
        Remove a progress entry from the database.

        Args:
            id (int): ID of the progress entry to remove

        Returns:
            Progress: The deleted progress object
        """
        obj = self.db.query(Progress).get(id)
        self.db.delete(obj)
        self.db.commit()
        return obj

    def get_client_progress(
        self, client_id: int, skip: int = 0, limit: int = 100
    ) -> List[Progress]:
        """
        Get progress entries for a specific client.

        Retrieves all progress data for a client ordered chronologically
        for trend analysis and progress visualization.

        Args:
            client_id (int): ID of the client
            skip (int, optional): Pagination offset. Defaults to 0.
            limit (int, optional): Maximum results to return. Defaults to 100.

        Returns:
            List[Progress]: List of client progress entries ordered by date

        Example:
            >>> client_progress = progress_service.get_client_progress(client_id=123)
            >>> weight_trend = [p.weight for p in client_progress if p.weight]
            >>> print(f"Weight trend: {weight_trend}")
        """
        return (
            self.db.query(Progress)
            .filter(Progress.client_id == client_id)
            .order_by(desc(Progress.date))
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_latest_progress(self, client_id: int) -> Optional[Progress]:
        """
        Get the most recent progress entry for a client.

        Useful for displaying current measurements and tracking recent changes.

        Args:
            client_id (int): ID of the client

        Returns:
            Optional[Progress]: Most recent progress entry if found

        Example:
            >>> latest = progress_service.get_latest_progress(client_id=123)
            >>> if latest:
            ...     print(f"Current weight: {latest.weight} lbs")
            ...     print(f"Body fat: {latest.body_fat_percentage}%")
        """
        return (
            self.db.query(Progress)
            .filter(Progress.client_id == client_id)
            .order_by(desc(Progress.date))
            .first()
        )

    def get_progress_by_date_range(
        self, client_id: int, start_date: datetime, end_date: datetime
    ) -> List[Progress]:
        """
        Get progress entries within a specific date range.

        Enables targeted progress analysis for specific time periods,
        useful for monthly reports and progress comparisons.

        Args:
            client_id (int): ID of the client
            start_date (datetime): Start of the date range
            end_date (datetime): End of the date range

        Returns:
            List[Progress]: Progress entries within the date range

        Example:
            >>> # Get last 30 days of progress
            >>> end_date = datetime.now()
            >>> start_date = end_date - timedelta(days=30)
            >>> monthly_progress = progress_service.get_progress_by_date_range(
            ...     client_id=123,
            ...     start_date=start_date,
            ...     end_date=end_date
            ... )
        """
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
        """
        Count progress entries matching the specified filters.

        Args:
            client_id (Optional[int], optional): Filter by client ID
            trainer_id (Optional[int], optional): Filter by trainer ID

        Returns:
            int: Number of progress entries matching the filters
        """
        query = self.db.query(Progress)
        if client_id:
            query = query.filter(Progress.client_id == client_id)
        if trainer_id:
            query = query.filter(Progress.trainer_id == trainer_id)
        return query.count()


class WorkoutLogService:
    """
    Service class for managing detailed workout logging and exercise tracking.

    Provides comprehensive workout session recording including exercise performance,
    duration tracking, and completion status. Supports detailed exercise logs with
    sets, reps, weights, and performance metrics.

    Attributes:
        db (Session): SQLAlchemy database session for data operations

    Example:
        Logging workouts and exercises::

            workout_service = WorkoutLogService(db)

            # Log a complete workout
            workout_data = WorkoutLogCreate(
                client_id=123,
                program_id=456,
                duration_minutes=75,
                calories_burned=420,
                exercises=[
                    {"exercise_id": 1, "sets": 3, "reps": 10, "weight": 185},
                    {"exercise_id": 2, "sets": 3, "reps": 12, "weight": 135}
                ]
            )
            workout = workout_service.create(workout_data, trainer_id=1)

            # Get workout statistics
            stats = workout_service.get_workout_stats(client_id=123, days=30)
    """

    def __init__(self, db: Session):
        """
        Initialize workout log service with database session.

        Args:
            db (Session): SQLAlchemy database session for data persistence
        """
        self.db = db

    def get(self, id: int) -> Optional[WorkoutLog]:
        """
        Retrieve a single workout log by ID.

        Args:
            id (int): Unique identifier of the workout log

        Returns:
            Optional[WorkoutLog]: Workout log object if found, None otherwise
        """
        return self.db.query(WorkoutLog).filter(WorkoutLog.id == id).first()

    def get_multi(
        self,
        *,
        skip: int = 0,
        limit: int = 100,
        client_id: Optional[int] = None,
        trainer_id: Optional[int] = None,
    ) -> List[WorkoutLog]:
        """
        Retrieve multiple workout logs with filtering and pagination.

        Args:
            skip (int, optional): Number of records to skip. Defaults to 0.
            limit (int, optional): Maximum records to return. Defaults to 100.
            client_id (Optional[int], optional): Filter by client ID
            trainer_id (Optional[int], optional): Filter by trainer ID

        Returns:
            List[WorkoutLog]: List of workout logs ordered by date (newest first)
        """
        query = self.db.query(WorkoutLog)
        if client_id:
            query = query.filter(WorkoutLog.client_id == client_id)
        if trainer_id:
            query = query.filter(WorkoutLog.trainer_id == trainer_id)
        return query.order_by(desc(WorkoutLog.date)).offset(skip).limit(limit).all()

    def create(self, obj_in: WorkoutLogCreate, trainer_id: int) -> WorkoutLog:
        """
        Create a comprehensive workout log with exercise details.

        Creates a detailed workout session record including duration, calories,
        and individual exercise performance data with sets, reps, and weights.

        Args:
            obj_in (WorkoutLogCreate): Workout creation schema with exercise logs
            trainer_id (int): ID of the trainer logging the workout

        Returns:
            WorkoutLog: Created workout log with associated exercise logs

        Example:
            >>> workout_data = WorkoutLogCreate(
            ...     client_id=123,
            ...     program_id=456,
            ...     duration_minutes=60,
            ...     calories_burned=380,
            ...     notes="Great energy, form improved",
            ...     exercises=[
            ...         {"exercise_id": 1, "sets": 3, "reps": 8, "weight": 195, "rest_seconds": 90},
            ...         {"exercise_id": 2, "sets": 3, "reps": 12, "weight": 145, "rest_seconds": 60}
            ...     ]
            ... )
            >>> workout = workout_service.create(workout_data, trainer_id=1)
        """
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
        """
        Update an existing workout log.

        Args:
            db_obj (WorkoutLog): Existing workout log to update
            obj_in (Union[WorkoutLogUpdate, Dict[str, Any]]): Update data

        Returns:
            WorkoutLog: Updated workout log object
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

    def remove(self, id: int) -> WorkoutLog:
        """
        Remove a workout log and its associated exercise logs.

        Args:
            id (int): ID of the workout log to remove

        Returns:
            WorkoutLog: The deleted workout log object
        """
        obj = self.db.query(WorkoutLog).get(id)
        # Remove associated exercise logs
        self.db.query(ExerciseLog).filter(ExerciseLog.workout_log_id == id).delete()
        self.db.delete(obj)
        self.db.commit()
        return obj

    def get_client_workout_logs(
        self, client_id: int, skip: int = 0, limit: int = 100
    ) -> List[WorkoutLog]:
        """
        Get workout logs for a specific client.

        Retrieves all workout sessions for a client ordered chronologically
        for progress tracking and workout frequency analysis.

        Args:
            client_id (int): ID of the client
            skip (int, optional): Pagination offset. Defaults to 0.
            limit (int, optional): Maximum results to return. Defaults to 100.

        Returns:
            List[WorkoutLog]: List of client workout logs ordered by date
        """
        return (
            self.db.query(WorkoutLog)
            .filter(WorkoutLog.client_id == client_id)
            .order_by(desc(WorkoutLog.date))
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_workout_stats(self, client_id: int, days: int = 30) -> Dict[str, Any]:
        """
        Get comprehensive workout statistics for a client over a specified period.

        Calculates detailed workout metrics including frequency, duration,
        calories burned, and performance trends for progress assessment.

        Args:
            client_id (int): ID of the client
            days (int, optional): Number of days to analyze. Defaults to 30.

        Returns:
            Dict[str, Any]: Comprehensive workout statistics including:
                - total_workouts: Number of completed workouts
                - total_duration_minutes: Total workout time
                - total_calories_burned: Total calories burned
                - average_duration: Average workout duration
                - workouts_per_week: Weekly workout frequency

        Example:
            >>> stats = workout_service.get_workout_stats(client_id=123, days=30)
            >>> print(f"Workouts: {stats['total_workouts']}")
            >>> print(f"Avg duration: {stats['average_duration']:.1f} minutes")
            >>> print(f"Weekly frequency: {stats['workouts_per_week']:.1f}")
        """
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
    """
    Service class for managing fitness goals and achievement tracking.

    Provides comprehensive goal management including creation, progress tracking,
    achievement monitoring, and deadline management. Supports both quantitative
    and qualitative goals with flexible target setting and progress measurement.

    Attributes:
        db (Session): SQLAlchemy database session for data operations

    Example:
        Creating and managing goals::

            goal_service = GoalService(db)

            # Create a weight loss goal
            goal_data = GoalCreate(
                client_id=123,
                title="Weight Loss Goal",
                description="Lose 15 pounds for summer",
                goal_type="weight_loss",
                target_value=165.0,
                current_value=180.0,
                target_date=datetime.now() + timedelta(days=90)
            )
            goal = goal_service.create(goal_data, trainer_id=1)

            # Mark goal as achieved
            goal_service.mark_goal_achieved(goal.id)
    """

    def __init__(self, db: Session):
        """
        Initialize goal service with database session.

        Args:
            db (Session): SQLAlchemy database session for data persistence
        """
        self.db = db

    def get(self, id: int) -> Optional[Goal]:
        """
        Retrieve a single goal by ID.

        Args:
            id (int): Unique identifier of the goal

        Returns:
            Optional[Goal]: Goal object if found, None otherwise
        """
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
        """
        Retrieve multiple goals with filtering and pagination.

        Args:
            skip (int, optional): Number of records to skip. Defaults to 0.
            limit (int, optional): Maximum records to return. Defaults to 100.
            client_id (Optional[int], optional): Filter by client ID
            trainer_id (Optional[int], optional): Filter by trainer ID
            is_active (Optional[bool], optional): Filter by active status

        Returns:
            List[Goal]: List of goals ordered by target date
        """
        query = self.db.query(Goal)
        if client_id:
            query = query.filter(Goal.client_id == client_id)
        if trainer_id:
            query = query.filter(Goal.trainer_id == trainer_id)
        if is_active is not None:
            query = query.filter(Goal.is_active == is_active)
        return query.order_by(Goal.target_date).offset(skip).limit(limit).all()

    def create(self, obj_in: GoalCreate, trainer_id: int) -> Goal:
        """
        Create a new fitness goal with target metrics and deadlines.

        Creates a comprehensive goal with measurable targets, deadlines,
        and progress tracking capabilities for client motivation and accountability.

        Args:
            obj_in (GoalCreate): Goal creation schema with target specifications
            trainer_id (int): ID of the trainer setting the goal

        Returns:
            Goal: Created goal object with assigned ID and tracking setup

        Example:
            >>> goal_data = GoalCreate(
            ...     client_id=123,
            ...     title="Strength Goal - Bench Press",
            ...     description="Increase bench press to 225 lbs",
            ...     goal_type="strength",
            ...     target_value=225.0,
            ...     current_value=185.0,
            ...     target_date=datetime.now() + timedelta(days=120),
            ...     measurement_unit="lbs"
            ... )
            >>> goal = goal_service.create(goal_data, trainer_id=1)
        """
        obj_in_data = obj_in.dict()
        obj_in_data["trainer_id"] = trainer_id

        db_obj = Goal(**obj_in_data)
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def update(self, db_obj: Goal, obj_in: Union[GoalUpdate, Dict[str, Any]]) -> Goal:
        """
        Update an existing goal with new targets or status.

        Args:
            db_obj (Goal): Existing goal object to update
            obj_in (Union[GoalUpdate, Dict[str, Any]]): Update data

        Returns:
            Goal: Updated goal object
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

    def remove(self, id: int) -> Goal:
        """
        Remove a goal from the database.

        Args:
            id (int): ID of the goal to remove

        Returns:
            Goal: The deleted goal object
        """
        obj = self.db.query(Goal).get(id)
        self.db.delete(obj)
        self.db.commit()
        return obj

    def get_client_goals(
        self, client_id: int, is_active: Optional[bool] = None
    ) -> List[Goal]:
        """
        Get goals for a specific client.

        Retrieves all goals assigned to a client, optionally filtered
        by active status for current goal management.

        Args:
            client_id (int): ID of the client
            is_active (Optional[bool], optional): Filter by active status

        Returns:
            List[Goal]: List of client goals ordered by target date

        Example:
            >>> # Get all active goals
            >>> active_goals = goal_service.get_client_goals(client_id=123, is_active=True)
            >>> for goal in active_goals:
            ...     progress_pct = ((goal.target_value - goal.current_value) /
            ...                    (goal.target_value - goal.initial_value)) * 100
            ...     print(f"Goal: {goal.title} - {progress_pct:.1f}% complete")
        """
        query = self.db.query(Goal).filter(Goal.client_id == client_id)
        if is_active is not None:
            query = query.filter(Goal.is_active == is_active)
        return query.order_by(Goal.target_date).all()

    def mark_goal_achieved(self, goal_id: int) -> Goal:
        """
        Mark a goal as achieved and record the achievement date.

        Updates goal status to achieved and timestamps the accomplishment
        for progress tracking and client motivation.

        Args:
            goal_id (int): ID of the achieved goal

        Returns:
            Goal: Updated goal object with achievement status

        Example:
            >>> achieved_goal = goal_service.mark_goal_achieved(goal_id=456)
            >>> if achieved_goal.is_achieved:
            ...     print(f"Congratulations! Goal '{achieved_goal.title}' achieved on {achieved_goal.achieved_date}")
        """
        goal = self.get(goal_id)
        if goal:
            goal.is_achieved = True
            goal.achieved_date = datetime.utcnow()
            self.db.commit()
            self.db.refresh(goal)
        return goal

    def get_overdue_goals(self, client_id: int) -> List[Goal]:
        """
        Get goals that are overdue and not yet achieved.

        Identifies goals that have passed their target date without
        being achieved, useful for goal reassessment and coaching.

        Args:
            client_id (int): ID of the client

        Returns:
            List[Goal]: List of overdue, unachieved goals

        Example:
            >>> overdue = goal_service.get_overdue_goals(client_id=123)
            >>> if overdue:
            ...     print(f"Client has {len(overdue)} overdue goals requiring attention")
            ...     for goal in overdue:
            ...         days_overdue = (datetime.now() - goal.target_date).days
            ...         print(f"- {goal.title}: {days_overdue} days overdue")
        """
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

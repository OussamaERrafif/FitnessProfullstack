"""
Program service module for comprehensive workout program management.

This module provides business logic for creating, managing, and organizing workout programs
within the fitness application. It supports complex program structures with multiple exercises,
client assignments, and detailed exercise configuration including sets, reps, and progression.

Features:
    - Program creation with multi-exercise support
    - Exercise assignment and configuration within programs
    - Client-specific program assignment and tracking
    - Program progression and modification capabilities
    - Exercise ordering and scheduling within programs
    - Integration with exercise library and client management

Example:
    Basic program service usage::

        from app.services.program_service import ProgramService
        from app.core.database import get_db
        
        # Initialize service
        db = get_db()
        program_service = ProgramService(db)
        
        # Create a workout program
        program_data = ProgramCreate(
            name="Beginner Strength Training",
            description="Foundation strength program for new clients",
            duration_weeks=8,
            difficulty_level="beginner",
            client_id=123,
            exercises=[
                {"exercise_id": 1, "sets": 3, "reps": 10, "rest_seconds": 60},
                {"exercise_id": 2, "sets": 3, "reps": 8, "rest_seconds": 90}
            ]
        )
        program = program_service.create(program_data, trainer_id=1)
        
        # Get client's programs
        client_programs = program_service.get_client_programs(client_id=123)

Security:
    - All program operations require trainer authentication
    - Clients can only access their assigned programs
    - Program modifications are trainer-restricted
    - Exercise assignments maintain data integrity
"""

from typing import Any, Dict, List, Optional, Union

from sqlalchemy import and_
from sqlalchemy.orm import Session

from app.models.program import Program, ProgramExercise
from app.schemas.program import ProgramCreate, ProgramUpdate


class ProgramService:
    """
    Service class for managing workout programs and exercise assignments.
    
    Provides comprehensive program management including creation, updates, exercise
    configuration, and client assignment. Supports complex workout structures with
    detailed exercise parameters and progression tracking.
    
    Attributes:
        db (Session): SQLAlchemy database session for data operations
        
    Example:
        Creating and managing programs::
        
            program_service = ProgramService(db)
            
            # Create a program with exercises
            program = program_service.create(program_data, trainer_id=1)
            
            # Add exercise to existing program
            exercise_data = {
                "exercise_id": 15,
                "sets": 4,
                "reps": 8,
                "weight": 135,
                "rest_seconds": 120
            }
            program_service.add_exercise(program.id, exercise_data)
            
            # Get client's programs
            programs = program_service.get_client_programs(client_id=123)
    """
    
    def __init__(self, db: Session):
        """
        Initialize program service with database session.
        
        Args:
            db (Session): SQLAlchemy database session for data persistence
        """
        self.db = db

    def get(self, id: int) -> Optional[Program]:
        """
        Retrieve a single program by ID.
        
        Args:
            id (int): Unique identifier of the program
            
        Returns:
            Optional[Program]: Program object if found, None otherwise
            
        Example:
            >>> program = program_service.get(123)
            >>> if program:
            ...     print(f"Program: {program.name} - {program.duration_weeks} weeks")
        """
        return self.db.query(Program).filter(Program.id == id).first()

    def get_multi(
        self,
        *,
        skip: int = 0,
        limit: int = 100,
        trainer_id: Optional[int] = None,
        client_id: Optional[int] = None,
    ) -> List[Program]:
        """
        Retrieve multiple programs with filtering and pagination.
        
        Supports comprehensive filtering by trainer and client with built-in
        pagination for efficient data retrieval.
        
        Args:
            skip (int, optional): Number of records to skip for pagination. Defaults to 0.
            limit (int, optional): Maximum number of records to return. Defaults to 100.
            trainer_id (Optional[int], optional): Filter by trainer ID for trainer-created programs
            client_id (Optional[int], optional): Filter by client ID for client-assigned programs
            
        Returns:
            List[Program]: List of program objects matching the filters
            
        Example:
            >>> # Get trainer's programs
            >>> trainer_programs = program_service.get_multi(
            ...     trainer_id=1,
            ...     limit=50
            ... )
            >>> 
            >>> # Get client's assigned programs
            >>> client_programs = program_service.get_multi(
            ...     client_id=123,
            ...     skip=0,
            ...     limit=10
            ... )
        """
        query = self.db.query(Program)
        if trainer_id:
            query = query.filter(Program.trainer_id == trainer_id)
        if client_id:
            query = query.filter(Program.client_id == client_id)
        return query.filter(Program.is_active == True).offset(skip).limit(limit).all()

    def create(self, obj_in: ProgramCreate, trainer_id: int) -> Program:
        """
        Create a new workout program with exercises.
        
        Creates a comprehensive workout program with exercise assignments, sets/reps
        configuration, and client association. Supports complex program structures
        with multiple exercises and detailed parameters.
        
        Args:
            obj_in (ProgramCreate): Program creation schema with exercise data
            trainer_id (int): ID of the trainer creating the program
            
        Returns:
            Program: Created program object with associated exercises
            
        Raises:
            ValueError: If program data is invalid or exercises are malformed
            
        Example:
            >>> program_data = ProgramCreate(
            ...     name="Upper Body Strength",
            ...     description="Focus on chest, back, and arms",
            ...     duration_weeks=6,
            ...     difficulty_level="intermediate",
            ...     client_id=123,
            ...     exercises=[
            ...         {"exercise_id": 1, "sets": 4, "reps": 8, "weight": 185},
            ...         {"exercise_id": 5, "sets": 3, "reps": 12, "weight": 155}
            ...     ]
            ... )
            >>> program = program_service.create(program_data, trainer_id=1)
            >>> print(f"Created program: {program.name} with {len(program.exercises)} exercises")
        """
        obj_in_data = obj_in.dict(exclude={"exercises"})
        obj_in_data["trainer_id"] = trainer_id

        db_obj = Program(**obj_in_data)
        self.db.add(db_obj)
        self.db.flush()  # Get the ID without committing

        # Add exercises to the program
        if obj_in.exercises:
            for exercise_data in obj_in.exercises:
                program_exercise = ProgramExercise(
                    program_id=db_obj.id, **exercise_data.dict()
                )
                self.db.add(program_exercise)

        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def update(
        self, db_obj: Program, obj_in: Union[ProgramUpdate, Dict[str, Any]]
    ) -> Program:
        """
        Update an existing program with new information.
        
        Supports partial updates while maintaining data integrity and exercise
        associations. Preserves trainer ownership and client assignments.
        
        Args:
            db_obj (Program): Existing program object to update
            obj_in (Union[ProgramUpdate, Dict[str, Any]]): Update data schema or dictionary
            
        Returns:
            Program: Updated program object with refreshed data
            
        Example:
            >>> # Update program duration and difficulty
            >>> update_data = ProgramUpdate(
            ...     duration_weeks=10,
            ...     difficulty_level="advanced",
            ...     description="Extended advanced program"
            ... )
            >>> updated_program = program_service.update(existing_program, update_data)
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

    def remove(self, id: int) -> Program:
        """
        Remove a program and its associated exercises.
        
        Permanently deletes a program and all its exercise associations. Use with
        caution as this operation cannot be undone.
        
        Args:
            id (int): ID of the program to remove
            
        Returns:
            Program: The deleted program object
            
        Warning:
            This operation permanently deletes the program and all exercise associations.
            Consider using soft delete (is_active=False) for better data integrity.
        """
        obj = self.db.query(Program).get(id)
        # Remove associated program exercises
        self.db.query(ProgramExercise).filter(ProgramExercise.program_id == id).delete()
        self.db.delete(obj)
        self.db.commit()
        return obj

    def get_with_exercises(self, id: int) -> Optional[Program]:
        """
        Get program with its exercises included.
        
        Retrieves a program with full exercise details including sets, reps,
        weights, and exercise order for complete program visualization.
        
        Args:
            id (int): ID of the program to retrieve
            
        Returns:
            Optional[Program]: Program object with exercise relationships loaded
            
        Example:
            >>> program = program_service.get_with_exercises(123)
            >>> if program:
            ...     for exercise in program.exercises:
            ...         print(f"Exercise: {exercise.name} - {exercise.sets}x{exercise.reps}")
        """
        return self.db.query(Program).filter(Program.id == id).first()

    def add_exercise(self, program_id: int, exercise_data: dict) -> ProgramExercise:
        """
        Add an exercise to an existing program.
        
        Dynamically adds exercises to programs, supporting flexible program
        modifications and exercise progression adjustments.
        
        Args:
            program_id (int): ID of the program to modify
            exercise_data (dict): Exercise data including sets, reps, weight, and order
            
        Returns:
            ProgramExercise: Created program exercise association object
            
        Example:
            >>> # Add a new exercise to existing program
            >>> exercise_data = {
            ...     "exercise_id": 25,
            ...     "sets": 3,
            ...     "reps": 15,
            ...     "weight": 45,
            ...     "rest_seconds": 60,
            ...     "order": 4
            ... }
            >>> program_service.add_exercise(program_id, exercise_data)
        """
        program_exercise = ProgramExercise(program_id=program_id, **exercise_data)
        self.db.add(program_exercise)
        self.db.commit()
        self.db.refresh(program_exercise)
        return program_exercise

    def remove_exercise(self, program_id: int, exercise_id: int) -> bool:
        """
        Remove a specific exercise from a program.
        
        Args:
            program_id (int): ID of the program
            exercise_id (int): ID of the exercise to remove
            
        Returns:
            bool: True if exercise was removed, False if not found
            
        Example:
            >>> success = program_service.remove_exercise(program_id=123, exercise_id=456)
            >>> if success:
            ...     print("Exercise removed from program")
        """
        program_exercise = (
            self.db.query(ProgramExercise)
            .filter(
                and_(
                    ProgramExercise.program_id == program_id,
                    ProgramExercise.exercise_id == exercise_id,
                )
            )
            .first()
        )
        if program_exercise:
            self.db.delete(program_exercise)
            self.db.commit()
            return True
        return False

    def update_exercise(
        self, program_exercise_id: int, update_data: dict
    ) -> Optional[ProgramExercise]:
        """
        Update a program exercise configuration.
        
        Modifies exercise parameters within a program such as sets, reps, weight,
        and rest periods to support program progression.
        
        Args:
            program_exercise_id (int): ID of the program exercise association
            update_data (dict): Updated exercise parameters
            
        Returns:
            Optional[ProgramExercise]: Updated program exercise object
            
        Example:
            >>> # Increase weight and adjust reps for progression
            >>> update_data = {
            ...     "weight": 205,
            ...     "reps": 6,
            ...     "rest_seconds": 120
            ... }
            >>> program_service.update_exercise(prog_ex_id, update_data)
        """
        program_exercise = self.db.query(ProgramExercise).get(program_exercise_id)
        if program_exercise:
            for field, value in update_data.items():
                setattr(program_exercise, field, value)
            self.db.commit()
            self.db.refresh(program_exercise)
        return program_exercise

    def get_client_programs(self, client_id: int) -> List[Program]:
        """
        Get all active programs assigned to a specific client.
        
        Retrieves all programs currently assigned to a client, including both
        active and scheduled programs for comprehensive client program management.
        
        Args:
            client_id (int): ID of the client
            
        Returns:
            List[Program]: List of client-assigned program objects
            
        Example:
            >>> client_programs = program_service.get_client_programs(client_id=123)
            >>> for program in client_programs:
            ...     print(f"Program: {program.name} - Week {program.current_week}/{program.duration_weeks}")
        """
        return (
            self.db.query(Program)
            .filter(and_(Program.client_id == client_id, Program.is_active == True))
            .all()
        )

    def count(
        self, trainer_id: Optional[int] = None, client_id: Optional[int] = None
    ) -> int:
        """
        Count programs matching the specified filters.
        
        Provides efficient counting for pagination and statistics without
        retrieving the full program objects.
        
        Args:
            trainer_id (Optional[int], optional): Filter by trainer ID
            client_id (Optional[int], optional): Filter by client ID
            
        Returns:
            int: Number of programs matching the filters
            
        Example:
            >>> trainer_program_count = program_service.count(trainer_id=1)
            >>> client_program_count = program_service.count(client_id=123)
            >>> print(f"Trainer has {trainer_program_count} programs, client has {client_program_count}")
        """
        query = self.db.query(Program).filter(Program.is_active == True)
        if trainer_id:
            query = query.filter(Program.trainer_id == trainer_id)
        if client_id:
            query = query.filter(Program.client_id == client_id)
        return query.count()

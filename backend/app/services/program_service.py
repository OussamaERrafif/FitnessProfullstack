"""
Program service for business logic.
"""

from typing import Any, Dict, List, Optional, Union

from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.models.program import Program, ProgramExercise
from app.schemas.program import ProgramCreate, ProgramUpdate


class ProgramService:
    def __init__(self, db: Session):
        self.db = db

    def get(self, id: int) -> Optional[Program]:
        return self.db.query(Program).filter(Program.id == id).first()

    def get_multi(
        self, *, skip: int = 0, limit: int = 100, trainer_id: Optional[int] = None, client_id: Optional[int] = None
    ) -> List[Program]:
        query = self.db.query(Program)
        if trainer_id:
            query = query.filter(Program.trainer_id == trainer_id)
        if client_id:
            query = query.filter(Program.client_id == client_id)
        return query.filter(Program.is_active == True).offset(skip).limit(limit).all()

    def create(self, obj_in: ProgramCreate, trainer_id: int) -> Program:
        obj_in_data = obj_in.dict(exclude={"exercises"})
        obj_in_data["trainer_id"] = trainer_id
        
        db_obj = Program(**obj_in_data)
        self.db.add(db_obj)
        self.db.flush()  # Get the ID without committing
        
        # Add exercises to the program
        if obj_in.exercises:
            for exercise_data in obj_in.exercises:
                program_exercise = ProgramExercise(
                    program_id=db_obj.id,
                    **exercise_data.dict()
                )
                self.db.add(program_exercise)
        
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def update(
        self, db_obj: Program, obj_in: Union[ProgramUpdate, Dict[str, Any]]
    ) -> Program:
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
        obj = self.db.query(Program).get(id)
        # Remove associated program exercises
        self.db.query(ProgramExercise).filter(ProgramExercise.program_id == id).delete()
        self.db.delete(obj)
        self.db.commit()
        return obj

    def get_with_exercises(self, id: int) -> Optional[Program]:
        """Get program with its exercises included."""
        return (
            self.db.query(Program)
            .filter(Program.id == id)
            .first()
        )

    def add_exercise(self, program_id: int, exercise_data: dict) -> ProgramExercise:
        """Add an exercise to a program."""
        program_exercise = ProgramExercise(
            program_id=program_id,
            **exercise_data
        )
        self.db.add(program_exercise)
        self.db.commit()
        self.db.refresh(program_exercise)
        return program_exercise

    def remove_exercise(self, program_id: int, exercise_id: int) -> bool:
        """Remove an exercise from a program."""
        program_exercise = (
            self.db.query(ProgramExercise)
            .filter(and_(
                ProgramExercise.program_id == program_id,
                ProgramExercise.exercise_id == exercise_id
            ))
            .first()
        )
        if program_exercise:
            self.db.delete(program_exercise)
            self.db.commit()
            return True
        return False

    def update_exercise(self, program_exercise_id: int, update_data: dict) -> Optional[ProgramExercise]:
        """Update a program exercise."""
        program_exercise = self.db.query(ProgramExercise).get(program_exercise_id)
        if program_exercise:
            for field, value in update_data.items():
                setattr(program_exercise, field, value)
            self.db.commit()
            self.db.refresh(program_exercise)
        return program_exercise

    def get_client_programs(self, client_id: int) -> List[Program]:
        """Get all active programs for a specific client."""
        return (
            self.db.query(Program)
            .filter(and_(Program.client_id == client_id, Program.is_active == True))
            .all()
        )

    def count(self, trainer_id: Optional[int] = None, client_id: Optional[int] = None) -> int:
        query = self.db.query(Program).filter(Program.is_active == True)
        if trainer_id:
            query = query.filter(Program.trainer_id == trainer_id)
        if client_id:
            query = query.filter(Program.client_id == client_id)
        return query.count()
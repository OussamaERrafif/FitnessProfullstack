"""
Exercise service for business logic.
"""

from typing import Any, Dict, List, Optional, Union

from sqlalchemy import and_
from sqlalchemy.orm import Session

from app.models.exercise import Exercise
from app.schemas.exercise import ExerciseCreate, ExerciseSearchQuery, ExerciseUpdate


class ExerciseService:
    def __init__(self, db: Session):
        self.db = db

    def get(self, id: int) -> Optional[Exercise]:
        return self.db.query(Exercise).filter(Exercise.id == id).first()

    def get_multi(
        self, *, skip: int = 0, limit: int = 100, is_active: bool = True
    ) -> List[Exercise]:
        query = self.db.query(Exercise)
        if is_active is not None:
            query = query.filter(Exercise.is_active == is_active)
        return query.order_by(Exercise.name).offset(skip).limit(limit).all()

    def create(self, obj_in: ExerciseCreate) -> Exercise:
        obj_in_data = obj_in.dict()
        db_obj = Exercise(**obj_in_data)
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def update(
        self, db_obj: Exercise, obj_in: Union[ExerciseUpdate, Dict[str, Any]]
    ) -> Exercise:
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

    def remove(self, id: int) -> Exercise:
        obj = self.db.query(Exercise).get(id)
        self.db.delete(obj)
        self.db.commit()
        return obj

    def count(self, is_active: bool = True) -> int:
        query = self.db.query(Exercise)
        if is_active is not None:
            query = query.filter(Exercise.is_active == is_active)
        return query.count()

    def search(
        self, search_query: ExerciseSearchQuery, skip: int = 0, limit: int = 100
    ) -> List[Exercise]:
        query = self.db.query(Exercise)

        # Filter by name
        if search_query.name:
            query = query.filter(Exercise.name.ilike(f"%{search_query.name}%"))

        # Filter by category
        if search_query.category:
            query = query.filter(Exercise.category == search_query.category)

        # Filter by muscle groups
        if search_query.muscle_groups:
            query = query.filter(
                Exercise.muscle_groups.ilike(f"%{search_query.muscle_groups}%")
            )

        # Filter by difficulty level
        if search_query.difficulty_level:
            query = query.filter(
                Exercise.difficulty_level == search_query.difficulty_level
            )

        # Filter by equipment needed
        if search_query.equipment_needed:
            query = query.filter(
                Exercise.equipment_needed == search_query.equipment_needed
            )

        # Only active exercises
        query = query.filter(Exercise.is_active is True)

        return query.order_by(Exercise.name).offset(skip).limit(limit).all()

    def get_by_category(
        self, category: str, skip: int = 0, limit: int = 100
    ) -> List[Exercise]:
        return (
            self.db.query(Exercise)
            .filter(and_(Exercise.category == category, Exercise.is_active is True))
            .order_by(Exercise.name)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_by_muscle_group(
        self, muscle_group: str, skip: int = 0, limit: int = 100
    ) -> List[Exercise]:
        return (
            self.db.query(Exercise)
            .filter(
                and_(
                    Exercise.muscle_groups.ilike(f"%{muscle_group}%"),
                    Exercise.is_active is True,
                )
            )
            .order_by(Exercise.name)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_by_equipment(
        self, equipment: str, skip: int = 0, limit: int = 100
    ) -> List[Exercise]:
        return (
            self.db.query(Exercise)
            .filter(
                and_(Exercise.equipment_needed == equipment, Exercise.is_active is True)
            )
            .order_by(Exercise.name)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_categories(self) -> List[str]:
        """Get list of unique exercise categories."""
        result = (
            self.db.query(Exercise.category)
            .filter(and_(Exercise.category.isnot(None), Exercise.is_active is True))
            .distinct()
            .all()
        )
        return [row[0] for row in result if row[0]]

    def get_muscle_groups(self) -> List[str]:
        """Get list of unique muscle groups."""
        result = (
            self.db.query(Exercise.muscle_groups)
            .filter(
                and_(Exercise.muscle_groups.isnot(None), Exercise.is_active is True)
            )
            .distinct()
            .all()
        )

        # Parse comma-separated muscle groups
        muscle_groups = set()
        for row in result:
            if row[0]:
                groups = [group.strip() for group in row[0].split(",")]
                muscle_groups.update(groups)

        return sorted(list(muscle_groups))

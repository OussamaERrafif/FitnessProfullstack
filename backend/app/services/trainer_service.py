"""
Trainer service for business logic.
"""

from typing import Any, Dict, List, Optional, Union

from sqlalchemy.orm import Session

from app.models.trainer import Trainer
from app.schemas.trainer import TrainerCreate, TrainerUpdate


class TrainerService:
    def __init__(self, db: Session):
        self.db = db

    def get(self, id: int) -> Optional[Trainer]:
        return self.db.query(Trainer).filter(Trainer.id == id).first()

    def get_by_user_id(self, user_id: int) -> Optional[Trainer]:
        return self.db.query(Trainer).filter(Trainer.user_id == user_id).first()

    def get_multi(
        self, *, skip: int = 0, limit: int = 100
    ) -> List[Trainer]:
        return (
            self.db.query(Trainer)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def create(self, trainer_in: TrainerCreate, user_id: int) -> Trainer:
        db_trainer = Trainer(
            user_id=user_id,
            specialization=trainer_in.specialization,
            experience_years=trainer_in.experience_years,
            bio=trainer_in.bio,
            certification=trainer_in.certification,
            hourly_rate=trainer_in.hourly_rate,
        )
        self.db.add(db_trainer)
        self.db.commit()
        self.db.refresh(db_trainer)
        return db_trainer

    def update(
        self, db_obj: Trainer, obj_in: Union[TrainerUpdate, Dict[str, Any]]
    ) -> Trainer:
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

    def remove(self, id: int) -> Trainer:
        obj = self.db.query(Trainer).get(id)
        self.db.delete(obj)
        self.db.commit()
        return obj

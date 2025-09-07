"""
Client service for business logic.
"""

from typing import Any, Dict, List, Optional, Union

from sqlalchemy import and_
from sqlalchemy.orm import Session

from app.models.client import Client
from app.schemas.client import ClientCreate, ClientUpdate


class ClientService:
    def __init__(self, db: Session):
        self.db = db

    def get(self, id: int) -> Optional[Client]:
        return self.db.query(Client).filter(Client.id == id).first()

    def get_by_user_id(self, user_id: int) -> Optional[Client]:
        return self.db.query(Client).filter(Client.user_id == user_id).first()

    def get_multi(
        self, *, skip: int = 0, limit: int = 100, trainer_id: Optional[int] = None
    ) -> List[Client]:
        query = self.db.query(Client)
        if trainer_id:
            query = query.filter(Client.trainer_id == trainer_id)
        return query.offset(skip).limit(limit).all()

    def get_multi_by_trainer(
        self, trainer_id: int, *, skip: int = 0, limit: int = 100
    ) -> List[Client]:
        return (
            self.db.query(Client)
            .filter(Client.trainer_id == trainer_id)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def create(self, obj_in: ClientCreate, trainer_id: int, user_id: int) -> Client:
        obj_in_data = obj_in.dict()
        obj_in_data["trainer_id"] = trainer_id
        obj_in_data["user_id"] = user_id

        db_obj = Client(**obj_in_data)
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def update(
        self, db_obj: Client, obj_in: Union[ClientUpdate, Dict[str, Any]]
    ) -> Client:
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

    def remove(self, id: int) -> Client:
        obj = self.db.query(Client).get(id)
        self.db.delete(obj)
        self.db.commit()
        return obj

    def count(self, trainer_id: Optional[int] = None) -> int:
        query = self.db.query(Client)
        if trainer_id:
            query = query.filter(Client.trainer_id == trainer_id)
        return query.count()

    def search(
        self,
        *,
        trainer_id: Optional[int] = None,
        fitness_level: Optional[str] = None,
        is_active: Optional[bool] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[Client]:
        query = self.db.query(Client)

        if trainer_id:
            query = query.filter(Client.trainer_id == trainer_id)
        if fitness_level:
            query = query.filter(Client.fitness_level == fitness_level)
        if is_active is not None:
            query = query.filter(Client.is_active == is_active)

        return query.offset(skip).limit(limit).all()

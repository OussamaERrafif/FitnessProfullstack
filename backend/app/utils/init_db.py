"""
Database initialization script.
"""

from sqlalchemy import create_engine

from app.core.config import settings
from app.core.database import Base

# Import all models to register them
from app.models.client import Client  # noqa: F401
from app.models.exercise import Exercise  # noqa: F401
from app.models.meal import Meal, MealPlan  # noqa: F401
from app.models.payment import Payment, PaymentMethod, Subscription  # noqa: F401
from app.models.program import Program  # noqa: F401
from app.models.progress import Goal, Progress, WorkoutLog  # noqa: F401
from app.models.trainer import Trainer  # noqa: F401
from app.models.user import User  # noqa: F401


def init_db():
    """
    Initialize the database with tables.
    """
    if settings.USE_SQLITE:
        engine = create_engine(
            settings.SQLITE_URL, connect_args={"check_same_thread": False}
        )
    else:
        engine = create_engine(str(settings.DATABASE_URL))

    # Create all tables
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")


if __name__ == "__main__":
    init_db()

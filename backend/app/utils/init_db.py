"""
Database initialization script.
"""

from sqlalchemy import create_engine

from app.core.config import settings
from app.core.database import Base
from app.models import *  # Import all models to register them


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

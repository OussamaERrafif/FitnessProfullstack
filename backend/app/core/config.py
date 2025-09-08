"""
Core application configuration settings.
"""

import secrets
from typing import Any, List, Optional, Union, Annotated

from pydantic import EmailStr, field_validator, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Basic app settings
    PROJECT_NAME: str = "FitnessPr Backend"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = secrets.token_urlsafe(32)
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    DEBUG: bool = False

    # CORS origins
    BACKEND_CORS_ORIGINS: str = "http://localhost:3000"
    ALLOWED_HOSTS_STR: str = Field(default="localhost,127.0.0.1,testserver", alias="ALLOWED_HOSTS")

    @property
    def ALLOWED_HOSTS(self) -> List[str]:
        """Get allowed hosts as a list."""
        if isinstance(self.ALLOWED_HOSTS_STR, str):
            if not self.ALLOWED_HOSTS_STR.strip():
                return ["localhost", "127.0.0.1", "testserver"]
            return [i.strip() for i in self.ALLOWED_HOSTS_STR.split(",")]
        return ["localhost", "127.0.0.1", "testserver"]

    def get_cors_origins(self) -> List[str]:
        """Get CORS origins as a list."""
        if isinstance(self.BACKEND_CORS_ORIGINS, str):
            return [i.strip() for i in self.BACKEND_CORS_ORIGINS.split(",")]
        return self.BACKEND_CORS_ORIGINS

    # Database settings
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = ""
    POSTGRES_DB: str = "fitnesspr"
    POSTGRES_PORT: str = "5432"
    DATABASE_URL: Optional[str] = None

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def assemble_db_connection(cls, v: Optional[str], info) -> Any:
        if isinstance(v, str):
            return v
        # For now, just return None to use SQLite
        return None

    # SQLite fallback for development
    SQLITE_URL: str = "sqlite:///./fitnesspr.db"
    USE_SQLITE: bool = True  # Set to False when PostgreSQL is available

    # Redis settings
    REDIS_URL: str = "redis://localhost:6379"

    # Email settings
    SMTP_TLS: bool = True
    SMTP_PORT: Optional[int] = None
    SMTP_HOST: Optional[str] = None
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    EMAILS_FROM_EMAIL: Optional[EmailStr] = None
    EMAILS_FROM_NAME: Optional[str] = None

    # Stripe settings
    STRIPE_PUBLISHABLE_KEY: Optional[str] = None
    STRIPE_SECRET_KEY: Optional[str] = None
    STRIPE_WEBHOOK_SECRET: Optional[str] = None

    # PIN settings for client access
    PIN_LENGTH: int = 6
    PIN_EXPIRY_HOURS: int = 24 * 7  # 1 week

    # File upload settings
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    UPLOAD_DIRECTORY: str = "uploads"
    ALLOWED_FILE_EXTENSIONS_STR: str = Field(
        default=".jpg,.jpeg,.png,.gif,.pdf,.mp4,.avi", 
        alias="ALLOWED_FILE_EXTENSIONS"
    )

    @property
    def ALLOWED_FILE_EXTENSIONS(self) -> List[str]:
        """Get allowed file extensions as a list."""
        if isinstance(self.ALLOWED_FILE_EXTENSIONS_STR, str):
            if not self.ALLOWED_FILE_EXTENSIONS_STR.strip():
                return [".jpg", ".jpeg", ".png", ".gif", ".pdf", ".mp4", ".avi"]
            return [i.strip() for i in self.ALLOWED_FILE_EXTENSIONS_STR.split(",")]
        return [".jpg", ".jpeg", ".png", ".gif", ".pdf", ".mp4", ".avi"]

    # Security settings
    ALGORITHM: str = "HS256"

    # Celery settings
    CELERY_BROKER_URL: str = "redis://localhost:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/0"

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        env_parse_none_str=True,
        env_ignore_empty=True
    )


settings = Settings()

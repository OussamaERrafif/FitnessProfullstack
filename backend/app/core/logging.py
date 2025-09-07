"""
Logging configuration for FitnessPr backend.
"""

import logging.config
import sys
from pathlib import Path

from app.core.config import settings

# Ensure logs directory exists
logs_dir = Path("logs")
logs_dir.mkdir(exist_ok=True)

LOGGING_CONFIG = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "default": {
            "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        },
        "detailed": {
            "format": "%(asctime)s - %(name)s - %(levelname)s - %(module)s - %(funcName)s - %(message)s",
        },
        "json": {
            "format": '{"timestamp": "%(asctime)s", "name": "%(name)s", "level": "%(levelname)s", "module": "%(module)s", "function": "%(funcName)s", "message": "%(message)s"}',
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "level": "INFO",
            "formatter": "default",
            "stream": sys.stdout,
        },
        "file": {
            "class": "logging.FileHandler",
            "level": "INFO",
            "formatter": "detailed",
            "filename": "logs/app.log",
            "mode": "a",
        },
        "error_file": {
            "class": "logging.FileHandler",
            "level": "ERROR",
            "formatter": "json",
            "filename": "logs/error.log",
            "mode": "a",
        },
    },
    "loggers": {
        "": {  # root logger
            "level": "INFO",
            "handlers": ["console", "file", "error_file"],
        },
        "app": {
            "level": "DEBUG" if settings.DEBUG else "INFO",
            "handlers": ["console", "file", "error_file"],
            "propagate": False,
        },
        "uvicorn": {
            "level": "INFO",
            "handlers": ["console"],
            "propagate": False,
        },
        "sqlalchemy.engine": {
            "level": "WARN",
            "handlers": ["console"],
            "propagate": False,
        },
    },
}


def setup_logging():
    """Setup logging configuration."""
    logging.config.dictConfig(LOGGING_CONFIG)
    
    # Create custom logger for the app
    logger = logging.getLogger("app")
    logger.info("Logging configured successfully")
    
    return logger


# Create logger instance
logger = setup_logging()
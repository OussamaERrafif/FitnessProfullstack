"""
Global exception handlers for the FastAPI application.
"""

import traceback

from fastapi import HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

from app.core.logging import logger


async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    """Handle HTTP exceptions."""
    logger.warning(
        f"HTTP Exception: {exc.status_code} - {exc.detail}",
        extra={
            "status_code": exc.status_code,
            "detail": exc.detail,
            "url": str(request.url),
            "method": request.method,
            "request_id": getattr(request.state, "request_id", None),
        },
    )

    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": True,
            "message": exc.detail,
            "status_code": exc.status_code,
            "request_id": getattr(request.state, "request_id", None),
        },
    )


async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    """Handle validation errors."""
    errors = []
    for error in exc.errors():
        errors.append(
            {
                "field": " -> ".join(str(x) for x in error["loc"]),
                "message": error["msg"],
                "type": error["type"],
            }
        )

    logger.warning(
        f"Validation Error: {errors}",
        extra={
            "errors": errors,
            "url": str(request.url),
            "method": request.method,
            "request_id": getattr(request.state, "request_id", None),
        },
    )

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": True,
            "message": "Validation failed",
            "details": errors,
            "status_code": 422,
            "request_id": getattr(request.state, "request_id", None),
        },
    )


async def rate_limit_exception_handler(
    request: Request, exc: RateLimitExceeded
) -> JSONResponse:
    """Handle rate limiting errors."""
    logger.warning(
        f"Rate limit exceeded: {exc.detail}",
        extra={
            "detail": exc.detail,
            "url": str(request.url),
            "method": request.method,
            "client_ip": request.client.host if request.client else None,
            "request_id": getattr(request.state, "request_id", None),
        },
    )

    return JSONResponse(
        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        content={
            "error": True,
            "message": "Rate limit exceeded",
            "detail": exc.detail,
            "status_code": 429,
            "request_id": getattr(request.state, "request_id", None),
        },
    )


async def sqlalchemy_exception_handler(
    request: Request, exc: SQLAlchemyError
) -> JSONResponse:
    """Handle SQLAlchemy errors."""
    if isinstance(exc, IntegrityError):
        # Handle database constraint violations
        logger.warning(
            f"Database integrity error: {str(exc)}",
            extra={
                "error": str(exc),
                "url": str(request.url),
                "method": request.method,
                "request_id": getattr(request.state, "request_id", None),
            },
        )

        return JSONResponse(
            status_code=status.HTTP_409_CONFLICT,
            content={
                "error": True,
                "message": "Database constraint violation",
                "status_code": 409,
                "request_id": getattr(request.state, "request_id", None),
            },
        )

    # Other SQLAlchemy errors
    logger.error(
        f"Database error: {str(exc)}",
        extra={
            "error": str(exc),
            "url": str(request.url),
            "method": request.method,
            "request_id": getattr(request.state, "request_id", None),
        },
        exc_info=True,
    )

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": True,
            "message": "Database error occurred",
            "status_code": 500,
            "request_id": getattr(request.state, "request_id", None),
        },
    )


async def general_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Handle general exceptions."""
    logger.error(
        f"Unhandled exception: {str(exc)}",
        extra={
            "error": str(exc),
            "traceback": traceback.format_exc(),
            "url": str(request.url),
            "method": request.method,
            "request_id": getattr(request.state, "request_id", None),
        },
        exc_info=True,
    )

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": True,
            "message": "Internal server error",
            "status_code": 500,
            "request_id": getattr(request.state, "request_id", None),
        },
    )


def setup_exception_handlers(app) -> None:
    """Setup all exception handlers for the app."""
    app.add_exception_handler(HTTPException, http_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(RateLimitExceeded, rate_limit_exception_handler)
    app.add_exception_handler(SQLAlchemyError, sqlalchemy_exception_handler)
    app.add_exception_handler(Exception, general_exception_handler)

"""
API v1 router configuration.
"""

from fastapi import APIRouter

from app.api.v1.endpoints import auth, trainers, clients, exercises, programs, meals, payments, progress

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(trainers.router, prefix="/trainers", tags=["trainers"])
api_router.include_router(clients.router, prefix="/clients", tags=["clients"])
api_router.include_router(exercises.router, prefix="/exercises", tags=["exercises"])
api_router.include_router(programs.router, prefix="/programs", tags=["programs"])
api_router.include_router(meals.router, prefix="/meals", tags=["meals"])
api_router.include_router(payments.router, prefix="/payments", tags=["payments"])
api_router.include_router(progress.router, prefix="/progress", tags=["progress"])

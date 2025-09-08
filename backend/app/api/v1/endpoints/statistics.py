"""
Statistics endpoints for dashboard analytics.
"""
from datetime import date, datetime, timedelta
from typing import Any, Dict, List

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import and_, func
from sqlalchemy.orm import Session

from app.api.v1.endpoints.auth import get_current_user
from app.core.database import get_db
from app.models.client import Client
from app.models.payment import Payment
from app.models.progress import WorkoutLog
from app.models.trainer import Trainer
from app.models.user import User

router = APIRouter()


@router.get("/trainer")
def get_trainer_statistics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get trainer dashboard statistics.
    """
    if not current_user.is_trainer:
        raise HTTPException(status_code=403, detail="Access forbidden: Trainer access required")
    
    # Get trainer record
    trainer = db.query(Trainer).filter(Trainer.user_id == current_user.id).first()
    if not trainer:
        raise HTTPException(status_code=404, detail="Trainer profile not found")
    
    # Total clients
    total_clients = db.query(Client).filter(Client.trainer_id == trainer.id).count()
    
    # Active clients (clients with workout logs in the last 30 days)
    thirty_days_ago = datetime.now() - timedelta(days=30)
    active_clients = (
        db.query(Client.id)
        .join(WorkoutLog)
        .filter(
            and_(
                Client.trainer_id == trainer.id,
                WorkoutLog.date >= thirty_days_ago
            )
        )
        .distinct()
        .count()
    )
    
    # Today's sessions
    today = date.today()
    todays_sessions = (
        db.query(WorkoutLog)
        .filter(
            and_(
                WorkoutLog.trainer_id == trainer.id,
                func.date(WorkoutLog.date) == today
            )
        )
        .count()
    )
    
    # Monthly revenue (last 30 days)
    monthly_revenue = (
        db.query(func.sum(Payment.amount))
        .filter(
            and_(
                Payment.trainer_id == trainer.id,
                Payment.created_at >= thirty_days_ago,
                Payment.status == "completed"
            )
        )
        .scalar() or 0
    )
    
    # Progress completion rate (percentage of completed workout logs)
    total_workouts = db.query(WorkoutLog).filter(WorkoutLog.trainer_id == trainer.id).count()
    completed_workouts = (
        db.query(WorkoutLog)
        .filter(
            and_(
                WorkoutLog.trainer_id == trainer.id,
                WorkoutLog.completed == True
            )
        )
        .count()
    )
    progress_completion = (completed_workouts / total_workouts * 100) if total_workouts > 0 else 0
    
    # Client growth (new clients in last 30 days vs previous 30 days)
    sixty_days_ago = datetime.now() - timedelta(days=60)
    current_period_clients = (
        db.query(Client)
        .filter(
            and_(
                Client.trainer_id == trainer.id,
                Client.created_at >= thirty_days_ago
            )
        )
        .count()
    )
    previous_period_clients = (
        db.query(Client)
        .filter(
            and_(
                Client.trainer_id == trainer.id,
                Client.created_at >= sixty_days_ago,
                Client.created_at < thirty_days_ago
            )
        )
        .count()
    )
    client_growth = (
        ((current_period_clients - previous_period_clients) / previous_period_clients * 100)
        if previous_period_clients > 0 
        else 100 if current_period_clients > 0 
        else 0
    )
    
    # Engagement rate (clients with workouts this week / total clients)
    week_ago = datetime.now() - timedelta(days=7)
    engaged_clients = (
        db.query(Client.id)
        .join(WorkoutLog)
        .filter(
            and_(
                Client.trainer_id == trainer.id,
                WorkoutLog.date >= week_ago
            )
        )
        .distinct()
        .count()
    )
    engagement_rate = (engaged_clients / total_clients * 100) if total_clients > 0 else 0
    
    return {
        "total_clients": total_clients,
        "active_clients": active_clients,
        "todays_sessions": todays_sessions,
        "monthly_revenue": float(monthly_revenue),
        "progress_completion": round(progress_completion, 2),
        "client_growth": round(client_growth, 2),
        "engagement_rate": round(engagement_rate, 2),
    }


@router.get("/client-progress")
def get_client_progress_statistics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    limit: int = Query(5, ge=1, le=20, description="Number of clients to return"),
) -> Any:
    """
    Get client progress statistics.
    """
    if not current_user.is_trainer:
        raise HTTPException(status_code=403, detail="Access forbidden: Trainer access required")
    
    # Get trainer record
    trainer = db.query(Trainer).filter(Trainer.user_id == current_user.id).first()
    if not trainer:
        raise HTTPException(status_code=404, detail="Trainer profile not found")
    
    # Get clients with their progress data
    clients = (
        db.query(Client)
        .filter(Client.trainer_id == trainer.id)
        .limit(limit)
        .all()
    )
    
    client_progress = []
    for client in clients:
        # Get last session
        last_workout = (
            db.query(WorkoutLog)
            .filter(WorkoutLog.client_id == client.id)
            .order_by(WorkoutLog.date.desc())
            .first()
        )
        
        # Calculate progress percentage (completed workouts / total workouts)
        total_workouts = db.query(WorkoutLog).filter(WorkoutLog.client_id == client.id).count()
        completed_workouts = (
            db.query(WorkoutLog)
            .filter(
                and_(
                    WorkoutLog.client_id == client.id,
                    WorkoutLog.completed == True
                )
            )
            .count()
        )
        progress_percentage = (completed_workouts / total_workouts * 100) if total_workouts > 0 else 0
        
        # For now, simulate goals (this would come from a goals table in a real implementation)
        goals_completed = completed_workouts
        total_goals = max(total_workouts, 1)  # Ensure at least 1 to avoid division by zero
        
        client_progress.append({
            "client_id": str(client.id),
            "client_name": f"{client.first_name} {client.last_name}",
            "last_session": last_workout.date.isoformat() if last_workout else None,
            "progress_percentage": round(progress_percentage, 2),
            "goals_completed": goals_completed,
            "total_goals": total_goals,
        })
    
    return client_progress


@router.get("/revenue")
def get_revenue_statistics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get revenue statistics.
    """
    if not current_user.is_trainer:
        raise HTTPException(status_code=403, detail="Access forbidden: Trainer access required")
    
    # Get trainer record
    trainer = db.query(Trainer).filter(Trainer.user_id == current_user.id).first()
    if not trainer:
        raise HTTPException(status_code=404, detail="Trainer profile not found")
    
    # Monthly revenue (last 30 days)
    thirty_days_ago = datetime.now() - timedelta(days=30)
    monthly_revenue = (
        db.query(func.sum(Payment.amount))
        .filter(
            and_(
                Payment.trainer_id == trainer.id,
                Payment.created_at >= thirty_days_ago,
                Payment.status == "completed"
            )
        )
        .scalar() or 0
    )
    
    # Yearly revenue (last 365 days)
    one_year_ago = datetime.now() - timedelta(days=365)
    yearly_revenue = (
        db.query(func.sum(Payment.amount))
        .filter(
            and_(
                Payment.trainer_id == trainer.id,
                Payment.created_at >= one_year_ago,
                Payment.status == "completed"
            )
        )
        .scalar() or 0
    )
    
    # Revenue growth (this month vs last month)
    sixty_days_ago = datetime.now() - timedelta(days=60)
    last_month_revenue = (
        db.query(func.sum(Payment.amount))
        .filter(
            and_(
                Payment.trainer_id == trainer.id,
                Payment.created_at >= sixty_days_ago,
                Payment.created_at < thirty_days_ago,
                Payment.status == "completed"
            )
        )
        .scalar() or 0
    )
    
    revenue_growth = (
        ((monthly_revenue - last_month_revenue) / last_month_revenue * 100)
        if last_month_revenue > 0
        else 100 if monthly_revenue > 0
        else 0
    )
    
    # Average session value
    total_sessions = db.query(WorkoutLog).filter(WorkoutLog.trainer_id == trainer.id).count()
    average_session_value = (yearly_revenue / total_sessions) if total_sessions > 0 else 0
    
    # Payment trends (last 12 months)
    payment_trends = []
    for i in range(12):
        start_date = datetime.now() - timedelta(days=30 * (i + 1))
        end_date = datetime.now() - timedelta(days=30 * i)
        
        month_revenue = (
            db.query(func.sum(Payment.amount))
            .filter(
                and_(
                    Payment.trainer_id == trainer.id,
                    Payment.created_at >= start_date,
                    Payment.created_at < end_date,
                    Payment.status == "completed"
                )
            )
            .scalar() or 0
        )
        
        payment_trends.append({
            "month": start_date.strftime("%Y-%m"),
            "amount": float(month_revenue),
        })
    
    # Reverse to get chronological order
    payment_trends.reverse()
    
    return {
        "monthly_revenue": float(monthly_revenue),
        "yearly_revenue": float(yearly_revenue),
        "revenue_growth": round(revenue_growth, 2),
        "average_session_value": round(float(average_session_value), 2),
        "payment_trends": payment_trends,
    }

"""
Payment endpoints.
"""

from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.v1.endpoints.auth import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.payment import (
    PaymentCreate, PaymentResponse, PaymentListResponse,
    SubscriptionCreate, SubscriptionResponse, SubscriptionUpdate,
    PaymentMethodCreate, PaymentMethodResponse,
    StripeWebhookPayload
)
from app.services.payment_service import PaymentService, SubscriptionService, PaymentMethodService

router = APIRouter()


@router.get("/", response_model=PaymentListResponse)
def read_payments(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Retrieve payments.
    """
    payment_service = PaymentService(db)
    
    if current_user.is_trainer:
        trainer_id = current_user.trainer.id if current_user.trainer else None
        if not trainer_id:
            raise HTTPException(status_code=404, detail="Trainer profile not found")
        payments = payment_service.get_trainer_payments(trainer_id, skip=skip, limit=limit)
        total = payment_service.count(trainer_id=trainer_id)
    else:
        # Client can only see their own payments
        client = current_user.client if hasattr(current_user, 'client') else None
        if not client:
            raise HTTPException(status_code=404, detail="Client profile not found")
        payments = payment_service.get_client_payments(client.id, skip=skip, limit=limit)
        total = payment_service.count(client_id=client.id)
    
    return PaymentListResponse(
        payments=payments,
        total=total,
        page=skip // limit + 1,
        size=limit
    )


@router.post("/", response_model=PaymentResponse)
def create_payment(
    *,
    db: Session = Depends(get_db),
    payment_in: PaymentCreate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Create new payment.
    """
    # Only clients can create payments, or trainers can create payments for their clients
    if not current_user.is_trainer and not hasattr(current_user, 'client'):
        raise HTTPException(status_code=403, detail="Access denied")
    
    payment_service = PaymentService(db)
    payment = payment_service.create(payment_in)
    
    # Create Stripe payment intent
    stripe_intent = payment_service.create_stripe_payment_intent(payment)
    payment.stripe_payment_intent_id = stripe_intent["id"]
    payment_service.update(payment, {"stripe_payment_intent_id": stripe_intent["id"]})
    
    return payment


@router.get("/{payment_id}", response_model=PaymentResponse)
def read_payment(
    *,
    db: Session = Depends(get_db),
    payment_id: int,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get payment by ID.
    """
    payment_service = PaymentService(db)
    payment = payment_service.get(payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    # Check access permissions
    if current_user.is_trainer:
        trainer_id = current_user.trainer.id if current_user.trainer else None
        if payment.trainer_id != trainer_id:
            raise HTTPException(status_code=403, detail="Access denied")
    else:
        # Client can only access their own payments
        client = current_user.client if hasattr(current_user, 'client') else None
        if not client or payment.client_id != client.id:
            raise HTTPException(status_code=403, detail="Access denied")
    
    return payment


# Subscription endpoints
@router.get("/subscriptions/", response_model=List[SubscriptionResponse])
def read_subscriptions(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Retrieve subscriptions.
    """
    subscription_service = SubscriptionService(db)
    
    if current_user.is_trainer:
        trainer_id = current_user.trainer.id if current_user.trainer else None
        if not trainer_id:
            raise HTTPException(status_code=404, detail="Trainer profile not found")
        subscriptions = subscription_service.get_multi(skip=skip, limit=limit, trainer_id=trainer_id)
    else:
        # Client can only see their own subscriptions
        client = current_user.client if hasattr(current_user, 'client') else None
        if not client:
            raise HTTPException(status_code=404, detail="Client profile not found")
        subscriptions = subscription_service.get_multi(skip=skip, limit=limit, client_id=client.id)
    
    return subscriptions


@router.post("/subscriptions/", response_model=SubscriptionResponse)
def create_subscription(
    *,
    db: Session = Depends(get_db),
    subscription_in: SubscriptionCreate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Create new subscription.
    """
    if not current_user.is_trainer:
        raise HTTPException(status_code=403, detail="Only trainers can create subscriptions")
    
    subscription_service = SubscriptionService(db)
    subscription = subscription_service.create(subscription_in)
    return subscription


@router.put("/subscriptions/{subscription_id}/cancel")
def cancel_subscription(
    *,
    db: Session = Depends(get_db),
    subscription_id: int,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Cancel subscription.
    """
    subscription_service = SubscriptionService(db)
    subscription = subscription_service.get(subscription_id)
    if not subscription:
        raise HTTPException(status_code=404, detail="Subscription not found")
    
    # Check access permissions
    if current_user.is_trainer:
        trainer_id = current_user.trainer.id if current_user.trainer else None
        if subscription.trainer_id != trainer_id:
            raise HTTPException(status_code=403, detail="Access denied")
    else:
        # Client can cancel their own subscription
        client = current_user.client if hasattr(current_user, 'client') else None
        if not client or subscription.client_id != client.id:
            raise HTTPException(status_code=403, detail="Access denied")
    
    subscription = subscription_service.cancel_subscription(subscription_id)
    return {"message": "Subscription cancelled successfully"}


# Payment Methods endpoints
@router.get("/payment-methods/", response_model=List[PaymentMethodResponse])
def read_payment_methods(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get client's payment methods.
    """
    if current_user.is_trainer:
        raise HTTPException(status_code=403, detail="Only clients can access payment methods")
    
    client = current_user.client if hasattr(current_user, 'client') else None
    if not client:
        raise HTTPException(status_code=404, detail="Client profile not found")
    
    payment_method_service = PaymentMethodService(db)
    payment_methods = payment_method_service.get_client_payment_methods(client.id)
    return payment_methods


@router.post("/payment-methods/", response_model=PaymentMethodResponse)
def create_payment_method(
    *,
    db: Session = Depends(get_db),
    payment_method_in: PaymentMethodCreate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Add new payment method.
    """
    if current_user.is_trainer:
        raise HTTPException(status_code=403, detail="Only clients can add payment methods")
    
    client = current_user.client if hasattr(current_user, 'client') else None
    if not client:
        raise HTTPException(status_code=404, detail="Client profile not found")
    
    # This is a placeholder - in a real implementation, you would integrate with Stripe
    # to create and attach the payment method
    return {"message": "Payment method endpoint - integration with Stripe needed"}


@router.put("/payment-methods/{payment_method_id}/default")
def set_default_payment_method(
    *,
    db: Session = Depends(get_db),
    payment_method_id: int,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Set payment method as default.
    """
    if current_user.is_trainer:
        raise HTTPException(status_code=403, detail="Only clients can manage payment methods")
    
    client = current_user.client if hasattr(current_user, 'client') else None
    if not client:
        raise HTTPException(status_code=404, detail="Client profile not found")
    
    payment_method_service = PaymentMethodService(db)
    payment_method = payment_method_service.set_default_payment_method(payment_method_id, client.id)
    
    if not payment_method:
        raise HTTPException(status_code=404, detail="Payment method not found")
    
    return {"message": "Default payment method updated"}


@router.post("/webhooks/stripe")
def stripe_webhook(
    *,
    db: Session = Depends(get_db),
    payload: StripeWebhookPayload,
) -> Any:
    """
    Handle Stripe webhooks.
    """
    # This is a placeholder for Stripe webhook handling
    # In a real implementation, you would verify the webhook signature
    # and handle different event types
    
    event_type = payload.type
    
    if event_type == "payment_intent.succeeded":
        # Handle successful payment
        payment_intent_id = payload.data.get("object", {}).get("id")
        if payment_intent_id:
            payment_service = PaymentService(db)
            payment = payment_service.get_by_stripe_intent(payment_intent_id)
            if payment:
                payment_service.update(payment, {"status": "completed", "paid_at": "now"})
    
    elif event_type == "subscription.created":
        # Handle subscription creation
        pass
    
    elif event_type == "subscription.cancelled":
        # Handle subscription cancellation
        pass
    
    return {"message": "Webhook processed successfully"}

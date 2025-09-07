"""
Payment service for business logic and Stripe integration.
"""

from datetime import datetime
from typing import Any, Dict, List, Optional, Union

from sqlalchemy import and_, or_
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.payment import Payment, PaymentMethod, Subscription
from app.schemas.payment import (
    PaymentCreate,
    PaymentUpdate,
    SubscriptionCreate,
    SubscriptionUpdate,
)


class PaymentService:
    def __init__(self, db: Session):
        self.db = db

    def get(self, id: int) -> Optional[Payment]:
        return self.db.query(Payment).filter(Payment.id == id).first()

    def get_by_stripe_intent(self, stripe_payment_intent_id: str) -> Optional[Payment]:
        return (
            self.db.query(Payment)
            .filter(Payment.stripe_payment_intent_id == stripe_payment_intent_id)
            .first()
        )

    def get_multi(
        self,
        *,
        skip: int = 0,
        limit: int = 100,
        client_id: Optional[int] = None,
        trainer_id: Optional[int] = None,
    ) -> List[Payment]:
        query = self.db.query(Payment)
        if client_id:
            query = query.filter(Payment.client_id == client_id)
        if trainer_id:
            query = query.filter(Payment.trainer_id == trainer_id)
        return query.order_by(Payment.created_at.desc()).offset(skip).limit(limit).all()

    def create(self, obj_in: PaymentCreate) -> Payment:
        obj_in_data = obj_in.dict()
        db_obj = Payment(**obj_in_data)
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def update(
        self, db_obj: Payment, obj_in: Union[PaymentUpdate, Dict[str, Any]]
    ) -> Payment:
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

    def remove(self, id: int) -> Payment:
        obj = self.db.query(Payment).get(id)
        self.db.delete(obj)
        self.db.commit()
        return obj

    def count(
        self, client_id: Optional[int] = None, trainer_id: Optional[int] = None
    ) -> int:
        query = self.db.query(Payment)
        if client_id:
            query = query.filter(Payment.client_id == client_id)
        if trainer_id:
            query = query.filter(Payment.trainer_id == trainer_id)
        return query.count()

    def get_client_payments(
        self, client_id: int, skip: int = 0, limit: int = 100
    ) -> List[Payment]:
        """Get all payments for a specific client."""
        return (
            self.db.query(Payment)
            .filter(Payment.client_id == client_id)
            .order_by(Payment.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_trainer_payments(
        self, trainer_id: int, skip: int = 0, limit: int = 100
    ) -> List[Payment]:
        """Get all payments received by a trainer."""
        return (
            self.db.query(Payment)
            .filter(Payment.trainer_id == trainer_id)
            .order_by(Payment.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def create_stripe_payment_intent(self, payment: Payment) -> dict:
        """Create a Stripe payment intent. This would integrate with actual Stripe API."""
        # This is a placeholder for Stripe integration
        # In a real implementation, you would use the Stripe SDK
        return {
            "id": f"pi_test_{payment.id}",
            "client_secret": f"pi_test_{payment.id}_secret_test",
            "status": "requires_payment_method",
        }


class SubscriptionService:
    def __init__(self, db: Session):
        self.db = db

    def get(self, id: int) -> Optional[Subscription]:
        return self.db.query(Subscription).filter(Subscription.id == id).first()

    def get_by_stripe_id(self, stripe_subscription_id: str) -> Optional[Subscription]:
        return (
            self.db.query(Subscription)
            .filter(Subscription.stripe_subscription_id == stripe_subscription_id)
            .first()
        )

    def get_multi(
        self,
        *,
        skip: int = 0,
        limit: int = 100,
        client_id: Optional[int] = None,
        trainer_id: Optional[int] = None,
    ) -> List[Subscription]:
        query = self.db.query(Subscription)
        if client_id:
            query = query.filter(Subscription.client_id == client_id)
        if trainer_id:
            query = query.filter(Subscription.trainer_id == trainer_id)
        return (
            query.order_by(Subscription.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def create(self, obj_in: SubscriptionCreate) -> Subscription:
        obj_in_data = obj_in.dict()
        db_obj = Subscription(**obj_in_data)
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def update(
        self, db_obj: Subscription, obj_in: Union[SubscriptionUpdate, Dict[str, Any]]
    ) -> Subscription:
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

    def cancel_subscription(self, subscription_id: int) -> Subscription:
        """Cancel a subscription."""
        subscription = self.get(subscription_id)
        if subscription:
            subscription.status = "cancelled"
            subscription.cancelled_at = datetime.utcnow()
            self.db.commit()
            self.db.refresh(subscription)
        return subscription

    def get_active_subscriptions(self, client_id: int) -> List[Subscription]:
        """Get active subscriptions for a client."""
        return (
            self.db.query(Subscription)
            .filter(
                and_(
                    Subscription.client_id == client_id, Subscription.status == "active"
                )
            )
            .all()
        )


class PaymentMethodService:
    def __init__(self, db: Session):
        self.db = db

    def get(self, id: int) -> Optional[PaymentMethod]:
        return self.db.query(PaymentMethod).filter(PaymentMethod.id == id).first()

    def get_client_payment_methods(self, client_id: int) -> List[PaymentMethod]:
        """Get all payment methods for a client."""
        return (
            self.db.query(PaymentMethod)
            .filter(
                and_(
                    PaymentMethod.client_id == client_id,
                    PaymentMethod.is_active == True,
                )
            )
            .all()
        )

    def get_default_payment_method(self, client_id: int) -> Optional[PaymentMethod]:
        """Get the default payment method for a client."""
        return (
            self.db.query(PaymentMethod)
            .filter(
                and_(
                    PaymentMethod.client_id == client_id,
                    PaymentMethod.is_default == True,
                    PaymentMethod.is_active == True,
                )
            )
            .first()
        )

    def set_default_payment_method(
        self, payment_method_id: int, client_id: int
    ) -> PaymentMethod:
        """Set a payment method as default for a client."""
        # First, unset all other payment methods as default
        self.db.query(PaymentMethod).filter(
            and_(
                PaymentMethod.client_id == client_id,
                PaymentMethod.id != payment_method_id,
            )
        ).update({"is_default": False})

        # Set the new default
        payment_method = self.get(payment_method_id)
        if payment_method:
            payment_method.is_default = True
            self.db.commit()
            self.db.refresh(payment_method)

        return payment_method

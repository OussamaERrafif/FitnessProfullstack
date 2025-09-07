"""
Payment models for Stripe integration.
"""

import enum

from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class PaymentStatus(str, enum.Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"
    CANCELLED = "cancelled"


class SubscriptionStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    PAUSED = "paused"
    CANCELLED = "cancelled"


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)

    # Relationships
    client_id = Column(Integer, ForeignKey("clients.id"))
    trainer_id = Column(Integer, ForeignKey("trainers.id"))

    # Payment details
    amount = Column(Float, nullable=False)  # in currency unit (e.g., dollars)
    currency = Column(String(3), default="USD")
    description = Column(String(500))

    # Stripe integration
    stripe_payment_intent_id = Column(String(255), unique=True)
    stripe_charge_id = Column(String(255))
    stripe_customer_id = Column(String(255))

    # Status and metadata
    status = Column(String(20), default=PaymentStatus.PENDING)
    payment_method = Column(String(50))  # card, bank_transfer, etc.

    # Timestamps
    paid_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    client = relationship("Client", backref="payments")
    trainer = relationship("Trainer", backref="payments_received")


class Subscription(Base):
    """Subscription model for recurring payments."""

    __tablename__ = "subscriptions"

    id = Column(Integer, primary_key=True, index=True)

    # Relationships
    client_id = Column(Integer, ForeignKey("clients.id"))
    trainer_id = Column(Integer, ForeignKey("trainers.id"))

    # Subscription details
    plan_name = Column(String(100))
    amount = Column(Float, nullable=False)
    currency = Column(String(3), default="USD")
    billing_cycle = Column(String(20))  # monthly, weekly, yearly

    # Stripe integration
    stripe_subscription_id = Column(String(255), unique=True)
    stripe_customer_id = Column(String(255))
    stripe_price_id = Column(String(255))

    # Status and dates
    status = Column(String(20), default=SubscriptionStatus.ACTIVE)
    current_period_start = Column(DateTime(timezone=True))
    current_period_end = Column(DateTime(timezone=True))
    trial_end = Column(DateTime(timezone=True), nullable=True)
    cancelled_at = Column(DateTime(timezone=True), nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    client = relationship("Client", backref="subscriptions")
    trainer = relationship("Trainer", backref="client_subscriptions")


class PaymentMethod(Base):
    """Stored payment methods for clients."""

    __tablename__ = "payment_methods"

    id = Column(Integer, primary_key=True, index=True)

    # Relationships
    client_id = Column(Integer, ForeignKey("clients.id"))

    # Payment method details
    stripe_payment_method_id = Column(String(255), unique=True)
    type = Column(String(20))  # card, bank_account

    # Card details (if applicable)
    card_brand = Column(String(20))  # visa, mastercard, etc.
    card_last_four = Column(String(4))
    card_exp_month = Column(Integer)
    card_exp_year = Column(Integer)

    # Status
    is_default = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    client = relationship("Client", backref="payment_methods")

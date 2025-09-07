"""
Payment schemas.
"""

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, field_validator

from app.models.payment import PaymentStatus, SubscriptionStatus


class PaymentBase(BaseModel):
    amount: float
    currency: Optional[str] = "USD"
    description: Optional[str] = None
    payment_method: Optional[str] = None

    @field_validator("amount")
    @classmethod
    def validate_amount(cls, v):
        if v <= 0:
            raise ValueError("amount must be positive")
        return v

    @field_validator("currency")
    @classmethod
    def validate_currency(cls, v):
        valid_currencies = ["USD", "EUR", "GBP", "CAD"]
        if v and v.upper() not in valid_currencies:
            raise ValueError(f'currency must be one of: {", ".join(valid_currencies)}')
        return v.upper() if v else v


class PaymentCreate(PaymentBase):
    client_id: int
    trainer_id: int


class PaymentUpdate(BaseModel):
    status: Optional[PaymentStatus] = None
    stripe_payment_intent_id: Optional[str] = None
    stripe_charge_id: Optional[str] = None
    paid_at: Optional[datetime] = None


class PaymentInDBBase(PaymentBase):
    id: Optional[int] = None
    client_id: Optional[int] = None
    trainer_id: Optional[int] = None
    stripe_payment_intent_id: Optional[str] = None
    stripe_charge_id: Optional[str] = None
    stripe_customer_id: Optional[str] = None
    status: Optional[str] = None
    paid_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class Payment(PaymentInDBBase):
    pass


class PaymentResponse(PaymentInDBBase):
    client: Optional[dict] = None
    trainer: Optional[dict] = None

    class Config:
        from_attributes = True


class PaymentListResponse(BaseModel):
    payments: List[PaymentResponse]
    total: int
    page: int
    size: int


class SubscriptionBase(BaseModel):
    plan_name: str
    amount: float
    currency: Optional[str] = "USD"
    billing_cycle: str

    @field_validator("billing_cycle")
    @classmethod
    def validate_billing_cycle(cls, v):
        valid_cycles = ["weekly", "monthly", "yearly"]
        if v.lower() not in valid_cycles:
            raise ValueError(f'billing_cycle must be one of: {", ".join(valid_cycles)}')
        return v.lower()


class SubscriptionCreate(SubscriptionBase):
    client_id: int
    trainer_id: int
    trial_days: Optional[int] = None


class SubscriptionUpdate(BaseModel):
    status: Optional[SubscriptionStatus] = None
    current_period_start: Optional[datetime] = None
    current_period_end: Optional[datetime] = None
    trial_end: Optional[datetime] = None
    cancelled_at: Optional[datetime] = None


class SubscriptionInDBBase(SubscriptionBase):
    id: Optional[int] = None
    client_id: Optional[int] = None
    trainer_id: Optional[int] = None
    stripe_subscription_id: Optional[str] = None
    stripe_customer_id: Optional[str] = None
    stripe_price_id: Optional[str] = None
    status: Optional[str] = None
    current_period_start: Optional[datetime] = None
    current_period_end: Optional[datetime] = None
    trial_end: Optional[datetime] = None
    cancelled_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class Subscription(SubscriptionInDBBase):
    pass


class SubscriptionResponse(SubscriptionInDBBase):
    client: Optional[dict] = None
    trainer: Optional[dict] = None

    class Config:
        from_attributes = True


class PaymentMethodBase(BaseModel):
    type: str
    is_default: Optional[bool] = False

    @field_validator("type")
    @classmethod
    def validate_type(cls, v):
        valid_types = ["card", "bank_account", "paypal"]
        if v.lower() not in valid_types:
            raise ValueError(f'type must be one of: {", ".join(valid_types)}')
        return v.lower()


class PaymentMethodCreate(PaymentMethodBase):
    stripe_payment_method_id: str


class PaymentMethodResponse(PaymentMethodBase):
    id: int
    client_id: int
    stripe_payment_method_id: str
    card_brand: Optional[str] = None
    card_last_four: Optional[str] = None
    card_exp_month: Optional[int] = None
    card_exp_year: Optional[int] = None
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Stripe webhook schemas
class StripeWebhookPayload(BaseModel):
    type: str
    data: dict

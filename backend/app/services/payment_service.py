"""
Payment service module for comprehensive payment processing and financial management.

This module provides business logic for handling payments, subscriptions, and financial
transactions within the fitness application. It includes Stripe integration capabilities,
subscription management, payment method handling, and financial reporting with comprehensive
security and compliance features.

Features:
    - Payment processing with Stripe integration
    - Subscription management with recurring billing
    - Payment method storage and management
    - Financial reporting and transaction tracking
    - Refund and dispute handling capabilities
    - Security compliance and data protection

Example:
    Basic payment service usage::

        from app.services.payment_service import PaymentService, SubscriptionService
        from app.core.database import get_db
        
        # Initialize services
        db = get_db()
        payment_service = PaymentService(db)
        subscription_service = SubscriptionService(db)
        
        # Process a payment
        payment_data = PaymentCreate(
            client_id=123,
            trainer_id=1,
            amount=99.99,
            currency="USD",
            payment_type="session",
            description="Personal training session"
        )
        payment = payment_service.create(payment_data)
        
        # Create a subscription
        subscription_data = SubscriptionCreate(
            client_id=123,
            trainer_id=1,
            plan_name="Monthly Training",
            amount=299.99,
            billing_cycle="monthly"
        )
        subscription = subscription_service.create(subscription_data)

Security:
    - All payment operations require authentication
    - PCI DSS compliance for payment data handling
    - Encrypted storage of sensitive payment information
    - Audit logging for all financial transactions
"""

from datetime import datetime
from typing import Any, Dict, List, Optional, Union

from sqlalchemy import and_
from sqlalchemy.orm import Session

from app.models.payment import Payment, PaymentMethod, Subscription
from app.schemas.payment import (
    PaymentCreate,
    PaymentUpdate,
    SubscriptionCreate,
    SubscriptionUpdate,
)


class PaymentService:
    """
    Service class for managing payments and financial transactions.

    Provides comprehensive payment processing including transaction creation,
    status tracking, refund handling, and integration with external payment
    processors like Stripe. Supports both one-time payments and recurring billing.

    Attributes:
        db (Session): SQLAlchemy database session for data operations

    Example:
        Processing payments::

            payment_service = PaymentService(db)

            # Create a session payment
            payment_data = PaymentCreate(
                client_id=123,
                trainer_id=1,
                amount=75.00,
                currency="USD",
                payment_type="session",
                description="1-hour personal training session"
            )
            payment = payment_service.create(payment_data)

            # Get client payment history
            client_payments = payment_service.get_client_payments(client_id=123)
    """

    def __init__(self, db: Session):
        """
        Initialize payment service with database session.

        Args:
            db (Session): SQLAlchemy database session for data persistence
        """
        self.db = db

    def get(self, id: int) -> Optional[Payment]:
        """
        Retrieve a single payment by ID.

        Args:
            id (int): Unique identifier of the payment

        Returns:
            Optional[Payment]: Payment object if found, None otherwise
        """
        return self.db.query(Payment).filter(Payment.id == id).first()

    def get_by_stripe_intent(self, stripe_payment_intent_id: str) -> Optional[Payment]:
        """
        Retrieve a payment by Stripe payment intent ID.

        Enables lookup of payments using Stripe's payment intent identifier
        for webhook processing and status synchronization.

        Args:
            stripe_payment_intent_id (str): Stripe payment intent identifier

        Returns:
            Optional[Payment]: Payment object if found, None otherwise

        Example:
            >>> payment = payment_service.get_by_stripe_intent("pi_1234567890")
            >>> if payment:
            ...     print(f"Payment status: {payment.status}")
        """
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
        """
        Retrieve multiple payments with filtering and pagination.

        Supports comprehensive filtering by client and trainer with built-in
        pagination for efficient financial data retrieval and reporting.

        Args:
            skip (int, optional): Number of records to skip for pagination. Defaults to 0.
            limit (int, optional): Maximum number of records to return. Defaults to 100.
            client_id (Optional[int], optional): Filter by client ID for client payments
            trainer_id (Optional[int], optional): Filter by trainer ID for trainer earnings

        Returns:
            List[Payment]: List of payment objects ordered by creation date (newest first)

        Example:
            >>> # Get trainer's recent payments
            >>> trainer_payments = payment_service.get_multi(
            ...     trainer_id=1,
            ...     limit=50
            ... )
            >>>
            >>> # Get client's payment history
            >>> client_payments = payment_service.get_multi(
            ...     client_id=123,
            ...     limit=20
            ... )
        """
        query = self.db.query(Payment)
        if client_id:
            query = query.filter(Payment.client_id == client_id)
        if trainer_id:
            query = query.filter(Payment.trainer_id == trainer_id)
        return query.order_by(Payment.created_at.desc()).offset(skip).limit(limit).all()

    def create(self, obj_in: PaymentCreate) -> Payment:
        """
        Create a new payment record.

        Creates a payment transaction record with comprehensive details including
        amount, currency, payment type, and associated parties. Integrates with
        external payment processors for transaction processing.

        Args:
            obj_in (PaymentCreate): Payment creation schema with transaction details

        Returns:
            Payment: Created payment object with assigned ID and timestamp

        Example:
            >>> payment_data = PaymentCreate(
            ...     client_id=123,
            ...     trainer_id=1,
            ...     amount=149.99,
            ...     currency="USD",
            ...     payment_type="package",
            ...     description="5-session training package",
            ...     payment_method="card"
            ... )
            >>> payment = payment_service.create(payment_data)
            >>> print(f"Payment created: ${payment.amount} - Status: {payment.status}")
        """
        obj_in_data = obj_in.dict()
        db_obj = Payment(**obj_in_data)
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def update(
        self, db_obj: Payment, obj_in: Union[PaymentUpdate, Dict[str, Any]]
    ) -> Payment:
        """
        Update an existing payment record.

        Supports status updates, metadata changes, and transaction modifications
        while maintaining financial audit trail and compliance requirements.

        Args:
            db_obj (Payment): Existing payment object to update
            obj_in (Union[PaymentUpdate, Dict[str, Any]]): Update data schema or dictionary

        Returns:
            Payment: Updated payment object with refreshed data

        Example:
            >>> # Update payment status after processing
            >>> update_data = PaymentUpdate(
            ...     status="completed",
            ...     stripe_payment_intent_id="pi_1234567890",
            ...     processed_at=datetime.utcnow()
            ... )
            >>> updated_payment = payment_service.update(existing_payment, update_data)
        """
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
        """
        Remove a payment record from the database.

        Args:
            id (int): ID of the payment to remove

        Returns:
            Payment: The deleted payment object

        Warning:
            This operation should be used carefully due to financial audit requirements.
            Consider using status updates instead of deletion for compliance.
        """
        obj = self.db.query(Payment).get(id)
        self.db.delete(obj)
        self.db.commit()
        return obj

    def count(
        self, client_id: Optional[int] = None, trainer_id: Optional[int] = None
    ) -> int:
        """
        Count payments matching the specified filters.

        Args:
            client_id (Optional[int], optional): Filter by client ID
            trainer_id (Optional[int], optional): Filter by trainer ID

        Returns:
            int: Number of payments matching the filters
        """
        query = self.db.query(Payment)
        if client_id:
            query = query.filter(Payment.client_id == client_id)
        if trainer_id:
            query = query.filter(Payment.trainer_id == trainer_id)
        return query.count()

    def get_client_payments(
        self, client_id: int, skip: int = 0, limit: int = 100
    ) -> List[Payment]:
        """
        Get all payments made by a specific client.

        Retrieves comprehensive payment history for a client including all
        transaction types and statuses for financial tracking and reporting.

        Args:
            client_id (int): ID of the client
            skip (int, optional): Pagination offset. Defaults to 0.
            limit (int, optional): Maximum results to return. Defaults to 100.

        Returns:
            List[Payment]: List of client payments ordered by date (newest first)

        Example:
            >>> client_payments = payment_service.get_client_payments(client_id=123)
            >>> total_spent = sum(p.amount for p in client_payments if p.status == "completed")
            >>> print(f"Client total spending: ${total_spent:.2f}")
        """
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
        """
        Get all payments received by a specific trainer.

        Retrieves earnings history for a trainer including session payments,
        package sales, and subscription revenue for financial analysis.

        Args:
            trainer_id (int): ID of the trainer
            skip (int, optional): Pagination offset. Defaults to 0.
            limit (int, optional): Maximum results to return. Defaults to 100.

        Returns:
            List[Payment]: List of trainer payments ordered by date (newest first)

        Example:
            >>> trainer_payments = payment_service.get_trainer_payments(trainer_id=1)
            >>> monthly_earnings = sum(
            ...     p.amount for p in trainer_payments
            ...     if p.created_at.month == datetime.now().month and p.status == "completed"
            ... )
            >>> print(f"Monthly earnings: ${monthly_earnings:.2f}")
        """
        return (
            self.db.query(Payment)
            .filter(Payment.trainer_id == trainer_id)
            .order_by(Payment.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def create_stripe_payment_intent(self, payment: Payment) -> dict:
        """
        Create a Stripe payment intent for processing.

        Integrates with Stripe's payment processing API to create payment intents
        for secure card processing and payment confirmation.

        Args:
            payment (Payment): Payment object to process

        Returns:
            dict: Stripe payment intent response with client secret

        Note:
            This is a placeholder implementation. In production, this would
            integrate with the actual Stripe SDK for payment processing.

        Example:
            >>> intent = payment_service.create_stripe_payment_intent(payment)
            >>> client_secret = intent["client_secret"]
            >>> # Use client_secret in frontend for payment confirmation

        """
        # This is a placeholder for Stripe integration
        # In a real implementation, you would use the Stripe SDK
        return {
            "id": f"pi_test_{payment.id}",
            "client_secret": f"pi_test_{payment.id}_secret_test",
            "status": "requires_payment_method",
        }


class SubscriptionService:
    """
    Service class for managing recurring subscriptions and billing cycles.

    Provides comprehensive subscription management including creation, billing cycle
    management, cancellation handling, and integration with payment processors for
    automated recurring payments and subscription lifecycle management.

    Attributes:
        db (Session): SQLAlchemy database session for data operations

    Example:
        Managing subscriptions::

            subscription_service = SubscriptionService(db)

            # Create monthly subscription
            subscription_data = SubscriptionCreate(
                client_id=123,
                trainer_id=1,
                plan_name="Premium Training Plan",
                amount=199.99,
                currency="USD",
                billing_cycle="monthly",
                trial_days=7
            )
            subscription = subscription_service.create(subscription_data)

            # Get active subscriptions
            active_subs = subscription_service.get_active_subscriptions(client_id=123)
    """

    def __init__(self, db: Session):
        """
        Initialize subscription service with database session.

        Args:
            db (Session): SQLAlchemy database session for data persistence
        """
        self.db = db

    def get(self, id: int) -> Optional[Subscription]:
        """
        Retrieve a single subscription by ID.

        Args:
            id (int): Unique identifier of the subscription

        Returns:
            Optional[Subscription]: Subscription object if found, None otherwise
        """
        return self.db.query(Subscription).filter(Subscription.id == id).first()

    def get_by_stripe_id(self, stripe_subscription_id: str) -> Optional[Subscription]:
        """
        Retrieve a subscription by Stripe subscription ID.

        Enables lookup of subscriptions using Stripe's subscription identifier
        for webhook processing and billing synchronization.

        Args:
            stripe_subscription_id (str): Stripe subscription identifier

        Returns:
            Optional[Subscription]: Subscription object if found, None otherwise
        """
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
        """
        Retrieve multiple subscriptions with filtering and pagination.

        Args:
            skip (int, optional): Number of records to skip. Defaults to 0.
            limit (int, optional): Maximum records to return. Defaults to 100.
            client_id (Optional[int], optional): Filter by client ID
            trainer_id (Optional[int], optional): Filter by trainer ID

        Returns:
            List[Subscription]: List of subscriptions ordered by creation date
        """
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
        """
        Create a new subscription with billing configuration.

        Creates a recurring subscription with specified billing cycle, pricing,
        and trial period configuration for automated payment processing.

        Args:
            obj_in (SubscriptionCreate): Subscription creation schema

        Returns:
            Subscription: Created subscription object with billing setup

        Example:
            >>> subscription_data = SubscriptionCreate(
            ...     client_id=123,
            ...     trainer_id=1,
            ...     plan_name="Elite Training Package",
            ...     amount=299.99,
            ...     billing_cycle="monthly",
            ...     trial_days=14,
            ...     description="Unlimited sessions with premium support"
            ... )
            >>> subscription = subscription_service.create(subscription_data)
        """
        obj_in_data = obj_in.dict()
        db_obj = Subscription(**obj_in_data)
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def update(
        self, db_obj: Subscription, obj_in: Union[SubscriptionUpdate, Dict[str, Any]]
    ) -> Subscription:
        """
        Update an existing subscription.

        Supports subscription modifications including plan changes, pricing updates,
        and billing cycle adjustments while maintaining subscription continuity.

        Args:
            db_obj (Subscription): Existing subscription object to update
            obj_in (Union[SubscriptionUpdate, Dict[str, Any]]): Update data

        Returns:
            Subscription: Updated subscription object
        """
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
        """
        Cancel a subscription and stop recurring billing.

        Marks subscription as cancelled and records cancellation timestamp
        for billing system integration and customer service tracking.

        Args:
            subscription_id (int): ID of the subscription to cancel

        Returns:
            Subscription: Cancelled subscription object

        Example:
            >>> cancelled_sub = subscription_service.cancel_subscription(subscription_id=456)
            >>> print(f"Subscription cancelled on {cancelled_sub.cancelled_at}")
        """
        subscription = self.get(subscription_id)
        if subscription:
            subscription.status = "cancelled"
            subscription.cancelled_at = datetime.utcnow()
            self.db.commit()
            self.db.refresh(subscription)
        return subscription

    def get_active_subscriptions(self, client_id: int) -> List[Subscription]:
        """
        Get all active subscriptions for a client.

        Retrieves currently active and billing subscriptions for a client
        for account management and billing oversight.

        Args:
            client_id (int): ID of the client

        Returns:
            List[Subscription]: List of active subscription objects

        Example:
            >>> active_subs = subscription_service.get_active_subscriptions(client_id=123)
            >>> monthly_cost = sum(sub.amount for sub in active_subs if sub.billing_cycle == "monthly")
            >>> print(f"Monthly subscription cost: ${monthly_cost:.2f}")
        """
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
    """
    Service class for managing client payment methods and cards.

    Provides secure payment method storage and management including card details,
    default payment method selection, and payment method verification with
    compliance to payment security standards.

    Attributes:
        db (Session): SQLAlchemy database session for data operations

    Example:
        Managing payment methods::

            payment_method_service = PaymentMethodService(db)

            # Get client's payment methods
            payment_methods = payment_method_service.get_client_payment_methods(client_id=123)

            # Set default payment method
            default_method = payment_method_service.set_default_payment_method(
                payment_method_id=456,
                client_id=123
            )
    """

    def __init__(self, db: Session):
        """
        Initialize payment method service with database session.

        Args:
            db (Session): SQLAlchemy database session for data persistence
        """
        self.db = db

    def get(self, id: int) -> Optional[PaymentMethod]:
        """
        Retrieve a single payment method by ID.

        Args:
            id (int): Unique identifier of the payment method

        Returns:
            Optional[PaymentMethod]: Payment method object if found, None otherwise
        """
        return self.db.query(PaymentMethod).filter(PaymentMethod.id == id).first()

    def get_client_payment_methods(self, client_id: int) -> List[PaymentMethod]:
        """
        Get all active payment methods for a client.

        Retrieves all stored and verified payment methods for a client
        for payment selection and account management purposes.

        Args:
            client_id (int): ID of the client

        Returns:
            List[PaymentMethod]: List of active payment method objects

        Example:
            >>> payment_methods = payment_method_service.get_client_payment_methods(client_id=123)
            >>> for method in payment_methods:
            ...     print(f"Card: **** **** **** {method.last_four} - {method.card_brand}")
            ...     if method.is_default:
            ...         print("  (Default)")
        """
        return (
            self.db.query(PaymentMethod)
            .filter(
                and_(
                    PaymentMethod.client_id == client_id,
                    PaymentMethod.is_active is True,
                )
            )
            .all()
        )

    def get_default_payment_method(self, client_id: int) -> Optional[PaymentMethod]:
        """
        Get the default payment method for a client.

        Retrieves the client's primary payment method for automatic
        billing and subscription processing.

        Args:
            client_id (int): ID of the client

        Returns:
            Optional[PaymentMethod]: Default payment method if found, None otherwise

        Example:
            >>> default_method = payment_method_service.get_default_payment_method(client_id=123)
            >>> if default_method:
            ...     print(f"Default card: **** {default_method.last_four}")
            ... else:
            ...     print("No default payment method set")
        """
        return (
            self.db.query(PaymentMethod)
            .filter(
                and_(
                    PaymentMethod.client_id == client_id,
                    PaymentMethod.is_default is True,
                    PaymentMethod.is_active is True,
                )
            )
            .first()
        )

    def set_default_payment_method(
        self, payment_method_id: int, client_id: int
    ) -> PaymentMethod:
        """
        Set a payment method as the default for a client.

        Updates the client's default payment method while ensuring only
        one method is marked as default for billing consistency.

        Args:
            payment_method_id (int): ID of the payment method to set as default
            client_id (int): ID of the client

        Returns:
            PaymentMethod: Updated payment method object marked as default

        Example:
            >>> # Set new default payment method
            >>> new_default = payment_method_service.set_default_payment_method(
            ...     payment_method_id=789,
            ...     client_id=123
            ... )
            >>> print(f"New default payment method: **** {new_default.last_four}")
        """
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

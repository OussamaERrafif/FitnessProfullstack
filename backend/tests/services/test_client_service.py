"""
Comprehensive unit tests for ClientService.

This module tests all aspects of client management including CRUD operations,
trainer relationships, search functionality, and data validation.
"""

import pytest
from sqlalchemy.orm import Session

from app.models.client import Client
from app.schemas.client import ClientCreate, ClientUpdate
from app.services.client_service import ClientService
from tests.utils import create_test_client, create_test_trainer, create_test_user, create_bulk_test_data


class TestClientService:
    """Test suite for ClientService class."""

    @pytest.fixture
    def client_service(self, db_session: Session):
        """Create ClientService instance with test database."""
        return ClientService(db_session)

    @pytest.fixture
    def sample_trainer(self, db_session: Session):
        """Create a sample trainer for testing."""
        return create_test_trainer(db_session)

    @pytest.fixture
    def sample_client_create(self):
        """Sample client creation data."""
        return ClientCreate(
            date_of_birth="1990-01-01",
            phone_number="+1234567890",
            emergency_contact="Emergency Contact",
            emergency_phone="+0987654321",
            medical_conditions="None",
            goals="Weight loss"
        )

    def test_create_client_success(self, client_service: ClientService, sample_client_create: ClientCreate, sample_trainer, db_session: Session):
        """Test successful client creation."""
        user = create_test_user(db_session, email="client@example.com")
        
        client = client_service.create(sample_client_create, sample_trainer.id, user.id)
        
        assert client is not None
        assert client.user_id == user.id
        assert client.trainer_id == sample_trainer.id
        assert client.date_of_birth == sample_client_create.date_of_birth
        assert client.phone_number == sample_client_create.phone_number
        assert client.goals == sample_client_create.goals

    def test_get_client_by_id_existing(self, client_service: ClientService, db_session: Session, sample_trainer):
        """Test retrieving existing client by ID."""
        created_client = create_test_client(db_session, trainer=sample_trainer)
        
        retrieved_client = client_service.get(created_client.id)
        
        assert retrieved_client is not None
        assert retrieved_client.id == created_client.id
        assert retrieved_client.trainer_id == created_client.trainer_id

    def test_get_client_by_id_nonexistent(self, client_service: ClientService):
        """Test retrieving non-existent client by ID returns None."""
        client = client_service.get(99999)
        assert client is None

    def test_get_client_by_user_id(self, client_service: ClientService, db_session: Session, sample_trainer):
        """Test retrieving client by user ID."""
        created_client = create_test_client(db_session, trainer=sample_trainer)
        
        retrieved_client = client_service.get_by_user_id(created_client.user_id)
        
        assert retrieved_client is not None
        assert retrieved_client.user_id == created_client.user_id
        assert retrieved_client.id == created_client.id

    def test_get_multi_clients(self, client_service: ClientService, db_session: Session):
        """Test retrieving multiple clients with pagination."""
        # Create multiple clients
        bulk_data = create_bulk_test_data(db_session, count=5)
        
        clients = client_service.get_multi(skip=0, limit=3)
        
        assert len(clients) == 3
        assert all(isinstance(client, Client) for client in clients)

    def test_get_multi_by_trainer(self, client_service: ClientService, db_session: Session):
        """Test retrieving clients by trainer ID."""
        bulk_data = create_bulk_test_data(db_session, count=3)
        trainer = bulk_data["trainer"]
        
        clients = client_service.get_multi_by_trainer(trainer_id=trainer.id, skip=0, limit=10)
        
        assert len(clients) == 3
        assert all(client.trainer_id == trainer.id for client in clients)

    def test_update_client_success(self, client_service: ClientService, db_session: Session, sample_trainer):
        """Test successful client update."""
        created_client = create_test_client(db_session, trainer=sample_trainer, goals="Original goal")
        
        update_data = ClientUpdate(
            goals="Updated goal",
            medical_conditions="Updated conditions"
        )
        
        updated_client = client_service.update(created_client, update_data)
        
        assert updated_client.goals == "Updated goal"
        assert updated_client.medical_conditions == "Updated conditions"
        assert updated_client.phone_number == created_client.phone_number  # Should not change

    def test_update_client_partial(self, client_service: ClientService, db_session: Session, sample_trainer):
        """Test partial client update."""
        created_client = create_test_client(
            db_session,
            trainer=sample_trainer,
            goals="Original goal",
            phone_number="+1111111111"
        )
        
        update_data = {"goals": "Partially updated goal"}
        
        updated_client = client_service.update(created_client, update_data)
        
        assert updated_client.goals == "Partially updated goal"
        assert updated_client.phone_number == "+1111111111"  # Should remain unchanged

    def test_remove_client(self, client_service: ClientService, db_session: Session, sample_trainer):
        """Test client removal."""
        created_client = create_test_client(db_session, trainer=sample_trainer)
        client_id = created_client.id
        
        removed_client = client_service.remove(client_id)
        
        assert removed_client is not None
        assert removed_client.id == client_id
        
        # Verify client is actually removed
        retrieved_client = client_service.get(client_id)
        assert retrieved_client is None

    def test_count_clients(self, client_service: ClientService, db_session: Session):
        """Test counting total clients."""
        initial_count = client_service.count()
        
        # Create some clients
        bulk_data = create_bulk_test_data(db_session, count=3)
        
        final_count = client_service.count()
        
        assert final_count == initial_count + 3

    def test_count_clients_by_trainer(self, client_service: ClientService, db_session: Session):
        """Test counting clients by trainer."""
        trainer1 = create_test_trainer(db_session)
        trainer2 = create_test_trainer(db_session)
        
        # Create clients for trainer1
        for i in range(3):
            user = create_test_user(db_session, email=f"client{i}@example.com")
            create_test_client(db_session, trainer=trainer1, user=user)
        
        # Create clients for trainer2
        for i in range(2):
            user = create_test_user(db_session, email=f"client_t2_{i}@example.com")
            create_test_client(db_session, trainer=trainer2, user=user)
        
        count_trainer1 = client_service.count(trainer_id=trainer1.id)
        count_trainer2 = client_service.count(trainer_id=trainer2.id)
        
        assert count_trainer1 == 3
        assert count_trainer2 == 2

    def test_search_clients_by_name(self, client_service: ClientService, db_session: Session, sample_trainer):
        """Test searching clients by name."""
        # Create clients with specific names
        user1 = create_test_user(db_session, email="john@example.com", full_name="John Doe")
        user2 = create_test_user(db_session, email="jane@example.com", full_name="Jane Smith")
        user3 = create_test_user(db_session, email="bob@example.com", full_name="Bob Johnson")
        
        create_test_client(db_session, trainer=sample_trainer, user=user1)
        create_test_client(db_session, trainer=sample_trainer, user=user2)
        create_test_client(db_session, trainer=sample_trainer, user=user3)
        
        # Search for "John"
        results = client_service.search(query="John", trainer_id=sample_trainer.id)
        
        assert len(results) >= 1
        assert any("John" in client.user.full_name for client in results)

    def test_search_clients_by_email(self, client_service: ClientService, db_session: Session, sample_trainer):
        """Test searching clients by email."""
        user = create_test_user(db_session, email="searchable@example.com")
        create_test_client(db_session, trainer=sample_trainer, user=user)
        
        results = client_service.search(query="searchable", trainer_id=sample_trainer.id)
        
        assert len(results) >= 1
        assert any("searchable" in client.user.email for client in results)

    def test_search_clients_empty_query(self, client_service: ClientService, db_session: Session):
        """Test searching clients with empty query returns all clients."""
        bulk_data = create_bulk_test_data(db_session, count=3)
        trainer = bulk_data["trainer"]
        
        results = client_service.search(query="", trainer_id=trainer.id)
        
        assert len(results) == 3

    def test_search_clients_no_results(self, client_service: ClientService, db_session: Session, sample_trainer):
        """Test searching clients with query that returns no results."""
        create_test_client(db_session, trainer=sample_trainer)
        
        results = client_service.search(query="nonexistent", trainer_id=sample_trainer.id)
        
        assert len(results) == 0

    def test_client_trainer_relationship(self, client_service: ClientService, db_session: Session):
        """Test client-trainer relationship integrity."""
        trainer1 = create_test_trainer(db_session)
        trainer2 = create_test_trainer(db_session)
        
        user = create_test_user(db_session, email="relationship@example.com")
        client = create_test_client(db_session, trainer=trainer1, user=user)
        
        # Verify initial relationship
        assert client.trainer_id == trainer1.id
        
        # Update trainer relationship
        update_data = {"trainer_id": trainer2.id}
        updated_client = client_service.update(client, update_data)
        
        assert updated_client.trainer_id == trainer2.id

    def test_client_pagination(self, client_service: ClientService, db_session: Session):
        """Test client pagination functionality."""
        bulk_data = create_bulk_test_data(db_session, count=10)
        trainer = bulk_data["trainer"]
        
        # Test first page
        page1 = client_service.get_multi_by_trainer(trainer_id=trainer.id, skip=0, limit=5)
        assert len(page1) == 5
        
        # Test second page
        page2 = client_service.get_multi_by_trainer(trainer_id=trainer.id, skip=5, limit=5)
        assert len(page2) == 5
        
        # Verify no overlap
        page1_ids = {client.id for client in page1}
        page2_ids = {client.id for client in page2}
        assert len(page1_ids.intersection(page2_ids)) == 0

    def test_client_data_validation(self, client_service: ClientService, sample_trainer, db_session: Session):
        """Test client data validation during creation."""
        user = create_test_user(db_session, email="validation@example.com")
        
        valid_data = ClientCreate(
            date_of_birth="1990-01-01",
            phone_number="+1234567890",
            emergency_contact="Emergency Contact",
            emergency_phone="+0987654321",
            medical_conditions="None",
            goals="Weight loss"
        )
        
        client = client_service.create(valid_data, sample_trainer.id, user.id)
        
        assert client is not None
        assert client.date_of_birth == valid_data.date_of_birth
        assert client.phone_number == valid_data.phone_number

    def test_get_multi_empty_database(self, client_service: ClientService):
        """Test get_multi with empty database."""
        clients = client_service.get_multi(skip=0, limit=10)
        assert clients == []

    def test_remove_nonexistent_client(self, client_service: ClientService):
        """Test removing non-existent client."""
        with pytest.raises(Exception):  # Should raise an error
            client_service.remove(99999)
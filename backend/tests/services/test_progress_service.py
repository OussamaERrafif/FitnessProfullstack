"""
Comprehensive unit tests for ProgressService.

This module tests all aspects of progress tracking including CRUD operations,
measurements, analytics, and progress history management.
"""

import pytest
from datetime import date, datetime, timedelta
from sqlalchemy.orm import Session

from app.models.progress import Progress
from app.schemas.progress import ProgressCreate, ProgressUpdate
from app.services.progress_service import ProgressService
from tests.utils import create_test_progress, create_test_trainer, create_test_client


class TestProgressService:
    """Test suite for ProgressService class."""

    @pytest.fixture
    def progress_service(self, db_session: Session):
        """Create ProgressService instance with test database."""
        return ProgressService(db_session)

    @pytest.fixture
    def sample_trainer(self, db_session: Session):
        """Create a sample trainer for testing."""
        return create_test_trainer(db_session)

    @pytest.fixture
    def sample_client(self, db_session: Session, sample_trainer):
        """Create a sample client for testing."""
        return create_test_client(db_session, trainer=sample_trainer)

    @pytest.fixture
    def sample_progress_create(self):
        """Sample progress creation data."""
        return ProgressCreate(
            date=date.today(),
            weight=70.5,
            body_fat_percentage=15.2,
            muscle_mass=45.8,
            notes="Good progress this week",
            measurements={
                "chest": 95.0,
                "waist": 80.0,
                "arms": 35.0,
            }
        )

    def test_create_progress_success(self, progress_service: ProgressService, sample_progress_create: ProgressCreate, sample_trainer, sample_client):
        """Test successful progress creation."""
        progress = progress_service.create(sample_progress_create, sample_trainer.id)
        
        assert progress is not None
        assert progress.trainer_id == sample_trainer.id
        assert progress.date == sample_progress_create.date
        assert progress.weight == sample_progress_create.weight
        assert progress.body_fat_percentage == sample_progress_create.body_fat_percentage
        assert progress.muscle_mass == sample_progress_create.muscle_mass
        assert progress.notes == sample_progress_create.notes
        assert progress.measurements == sample_progress_create.measurements

    def test_get_progress_by_id_existing(self, progress_service: ProgressService, db_session: Session, sample_trainer, sample_client):
        """Test retrieving existing progress by ID."""
        created_progress = create_test_progress(db_session, trainer=sample_trainer, client=sample_client)
        
        retrieved_progress = progress_service.get(created_progress.id)
        
        assert retrieved_progress is not None
        assert retrieved_progress.id == created_progress.id
        assert retrieved_progress.client_id == created_progress.client_id
        assert retrieved_progress.trainer_id == created_progress.trainer_id

    def test_get_progress_by_id_nonexistent(self, progress_service: ProgressService):
        """Test retrieving non-existent progress by ID returns None."""
        progress = progress_service.get(99999)
        assert progress is None

    def test_get_multi_progress(self, progress_service: ProgressService, db_session: Session, sample_trainer, sample_client):
        """Test retrieving multiple progress records with pagination."""
        # Create multiple progress records
        for i in range(5):
            create_test_progress(
                db_session,
                trainer=sample_trainer,
                client=sample_client,
                notes=f"Progress {i}"
            )
        
        progress_records = progress_service.get_multi(skip=0, limit=3)
        
        assert len(progress_records) == 3
        assert all(isinstance(progress, Progress) for progress in progress_records)

    def test_get_client_progress(self, progress_service: ProgressService, db_session: Session, sample_trainer, sample_client):
        """Test retrieving progress records for specific client."""
        # Create progress records for the client
        for i in range(3):
            create_test_progress(
                db_session,
                trainer=sample_trainer,
                client=sample_client,
                notes=f"Client Progress {i}"
            )
        
        client_progress = progress_service.get_client_progress(client_id=sample_client.id)
        
        assert len(client_progress) >= 3
        assert all(progress.client_id == sample_client.id for progress in client_progress)

    def test_get_latest_progress(self, progress_service: ProgressService, db_session: Session, sample_trainer, sample_client):
        """Test retrieving latest progress record for client."""
        # Create progress records with different dates
        today = date.today()
        yesterday = today - timedelta(days=1)
        
        older_progress = create_test_progress(
            db_session,
            trainer=sample_trainer,
            client=sample_client,
            date=yesterday,
            notes="Older progress"
        )
        
        latest_progress = create_test_progress(
            db_session,
            trainer=sample_trainer,
            client=sample_client,
            date=today,
            notes="Latest progress"
        )
        
        retrieved_latest = progress_service.get_latest_progress(client_id=sample_client.id)
        
        assert retrieved_latest is not None
        assert retrieved_latest.id == latest_progress.id
        assert retrieved_latest.notes == "Latest progress"

    def test_get_progress_by_date_range(self, progress_service: ProgressService, db_session: Session, sample_trainer, sample_client):
        """Test retrieving progress records by date range."""
        # Create progress records for different dates
        base_date = date.today()
        dates = [
            base_date - timedelta(days=10),
            base_date - timedelta(days=5),
            base_date,
            base_date + timedelta(days=5)
        ]
        
        for i, progress_date in enumerate(dates):
            create_test_progress(
                db_session,
                trainer=sample_trainer,
                client=sample_client,
                date=progress_date,
                notes=f"Progress {i}"
            )
        
        # Test date range query
        start_date = base_date - timedelta(days=7)
        end_date = base_date + timedelta(days=2)
        
        range_progress = progress_service.get_progress_by_date_range(
            client_id=sample_client.id,
            start_date=start_date,
            end_date=end_date
        )
        
        assert len(range_progress) >= 2
        assert all(start_date <= progress.date <= end_date for progress in range_progress)

    def test_update_progress_success(self, progress_service: ProgressService, db_session: Session, sample_trainer, sample_client):
        """Test successful progress update."""
        created_progress = create_test_progress(
            db_session,
            trainer=sample_trainer,
            client=sample_client,
            weight=70.0,
            notes="Original notes"
        )
        
        update_data = ProgressUpdate(
            weight=72.5,
            notes="Updated notes",
            body_fat_percentage=14.8
        )
        
        updated_progress = progress_service.update(created_progress, update_data)
        
        assert updated_progress.weight == 72.5
        assert updated_progress.notes == "Updated notes"
        assert updated_progress.body_fat_percentage == 14.8
        assert updated_progress.muscle_mass == created_progress.muscle_mass  # Should not change

    def test_update_progress_partial(self, progress_service: ProgressService, db_session: Session, sample_trainer, sample_client):
        """Test partial progress update."""
        created_progress = create_test_progress(
            db_session,
            trainer=sample_trainer,
            client=sample_client,
            weight=70.0,
            notes="Original notes"
        )
        
        update_data = {"weight": 71.2}
        
        updated_progress = progress_service.update(created_progress, update_data)
        
        assert updated_progress.weight == 71.2
        assert updated_progress.notes == "Original notes"  # Should remain unchanged

    def test_remove_progress(self, progress_service: ProgressService, db_session: Session, sample_trainer, sample_client):
        """Test progress removal."""
        created_progress = create_test_progress(db_session, trainer=sample_trainer, client=sample_client)
        progress_id = created_progress.id
        
        removed_progress = progress_service.remove(progress_id)
        
        assert removed_progress is not None
        assert removed_progress.id == progress_id
        
        # Verify progress is actually removed
        retrieved_progress = progress_service.get(progress_id)
        assert retrieved_progress is None

    def test_progress_measurements_handling(self, progress_service: ProgressService, sample_progress_create: ProgressCreate, sample_trainer):
        """Test progress measurements dictionary handling."""
        progress = progress_service.create(sample_progress_create, sample_trainer.id)
        
        assert progress.measurements == sample_progress_create.measurements
        assert "chest" in progress.measurements
        assert "waist" in progress.measurements
        assert "arms" in progress.measurements
        
        # Update measurements
        new_measurements = {
            "chest": 96.0,
            "waist": 79.5,
            "arms": 35.5,
            "legs": 60.0
        }
        
        updated_progress = progress_service.update(progress, {"measurements": new_measurements})
        
        assert updated_progress.measurements == new_measurements
        assert "legs" in updated_progress.measurements

    def test_progress_weight_tracking(self, progress_service: ProgressService, db_session: Session, sample_trainer, sample_client):
        """Test weight progression tracking."""
        # Create a series of weight measurements
        weights = [70.0, 69.5, 69.8, 70.2, 70.5]
        base_date = date.today()
        
        for i, weight in enumerate(weights):
            create_test_progress(
                db_session,
                trainer=sample_trainer,
                client=sample_client,
                date=base_date - timedelta(days=len(weights)-i-1),
                weight=weight,
                notes=f"Weight {weight}kg"
            )
        
        # Get client progress ordered by date
        client_progress = progress_service.get_client_progress(client_id=sample_client.id)
        
        # Should have all weight records
        assert len(client_progress) >= len(weights)
        
        # Verify weights are recorded correctly
        recorded_weights = [p.weight for p in client_progress if p.weight is not None]
        for weight in weights:
            assert weight in recorded_weights

    def test_progress_body_composition_tracking(self, progress_service: ProgressService, db_session: Session, sample_trainer, sample_client):
        """Test body composition tracking."""
        progress = create_test_progress(
            db_session,
            trainer=sample_trainer,
            client=sample_client,
            body_fat_percentage=15.5,
            muscle_mass=45.0
        )
        
        assert progress.body_fat_percentage == 15.5
        assert progress.muscle_mass == 45.0
        
        # Update body composition
        updated_progress = progress_service.update(progress, {
            "body_fat_percentage": 14.2,
            "muscle_mass": 46.5
        })
        
        assert updated_progress.body_fat_percentage == 14.2
        assert updated_progress.muscle_mass == 46.5

    def test_progress_notes_handling(self, progress_service: ProgressService, db_session: Session, sample_trainer, sample_client):
        """Test progress notes handling."""
        progress = create_test_progress(
            db_session,
            trainer=sample_trainer,
            client=sample_client,
            notes="Initial progress notes"
        )
        
        assert progress.notes == "Initial progress notes"
        
        # Update notes
        new_notes = "Updated progress notes with detailed observations"
        updated_progress = progress_service.update(progress, {"notes": new_notes})
        
        assert updated_progress.notes == new_notes

    def test_progress_date_validation(self, progress_service: ProgressService, db_session: Session, sample_trainer, sample_client):
        """Test progress date validation."""
        # Test various dates
        today = date.today()
        yesterday = today - timedelta(days=1)
        future_date = today + timedelta(days=1)
        
        # Past date should work
        past_progress = create_test_progress(
            db_session,
            trainer=sample_trainer,
            client=sample_client,
            date=yesterday
        )
        assert past_progress.date == yesterday
        
        # Today should work
        today_progress = create_test_progress(
            db_session,
            trainer=sample_trainer,
            client=sample_client,
            date=today
        )
        assert today_progress.date == today

    def test_progress_count(self, progress_service: ProgressService, db_session: Session, sample_trainer, sample_client):
        """Test progress counting functionality."""
        initial_count = progress_service.count(trainer_id=sample_trainer.id)
        
        # Create some progress records
        for i in range(3):
            create_test_progress(
                db_session,
                trainer=sample_trainer,
                client=sample_client,
                notes=f"Count Progress {i}"
            )
        
        final_count = progress_service.count(trainer_id=sample_trainer.id)
        
        assert final_count == initial_count + 3

    def test_multiple_clients_progress(self, progress_service: ProgressService, db_session: Session, sample_trainer):
        """Test progress tracking for multiple clients."""
        # Create multiple clients
        client1 = create_test_client(db_session, trainer=sample_trainer)
        client2 = create_test_client(db_session, trainer=sample_trainer)
        
        # Create progress for each client
        progress1 = create_test_progress(
            db_session,
            trainer=sample_trainer,
            client=client1,
            notes="Client 1 progress"
        )
        progress2 = create_test_progress(
            db_session,
            trainer=sample_trainer,
            client=client2,
            notes="Client 2 progress"
        )
        
        # Verify separation
        client1_progress = progress_service.get_client_progress(client_id=client1.id)
        client2_progress = progress_service.get_client_progress(client_id=client2.id)
        
        assert len(client1_progress) >= 1
        assert len(client2_progress) >= 1
        assert all(p.client_id == client1.id for p in client1_progress)
        assert all(p.client_id == client2.id for p in client2_progress)

    def test_progress_pagination(self, progress_service: ProgressService, db_session: Session, sample_trainer, sample_client):
        """Test progress pagination functionality."""
        # Create multiple progress records
        for i in range(10):
            create_test_progress(
                db_session,
                trainer=sample_trainer,
                client=sample_client,
                notes=f"Pagination Progress {i}"
            )
        
        # Test first page
        page1 = progress_service.get_multi(skip=0, limit=5)
        assert len(page1) == 5
        
        # Test second page
        page2 = progress_service.get_multi(skip=5, limit=5)
        assert len(page2) == 5
        
        # Verify no overlap
        page1_ids = {progress.id for progress in page1}
        page2_ids = {progress.id for progress in page2}
        assert len(page1_ids.intersection(page2_ids)) == 0

    def test_get_multi_empty_database(self, progress_service: ProgressService):
        """Test get_multi with empty database."""
        progress_records = progress_service.get_multi(skip=0, limit=10)
        assert progress_records == []

    def test_remove_nonexistent_progress(self, progress_service: ProgressService):
        """Test removing non-existent progress."""
        with pytest.raises(Exception):  # Should raise an error
            progress_service.remove(99999)

    def test_get_latest_progress_no_records(self, progress_service: ProgressService, sample_client):
        """Test get_latest_progress when client has no progress records."""
        latest = progress_service.get_latest_progress(client_id=sample_client.id)
        assert latest is None
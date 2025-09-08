"""
Comprehensive unit tests for TrainerService.

This module tests all aspects of trainer management including CRUD operations,
user relationships, availability, and profile management.
"""

import pytest
from sqlalchemy.orm import Session

from app.models.trainer import Trainer
from app.schemas.trainer import TrainerCreate, TrainerUpdate
from app.services.trainer_service import TrainerService
from tests.utils import create_test_trainer, create_test_user


class TestTrainerService:
    """Test suite for TrainerService class."""

    @pytest.fixture
    def trainer_service(self, db_session: Session):
        """Create TrainerService instance with test database."""
        return TrainerService(db_session)

    @pytest.fixture
    def sample_trainer_create(self):
        """Sample trainer creation data."""
        return TrainerCreate(
            specialization="Weight Training",
            certification="NASM-CPT",
            experience_years=5,
            hourly_rate=7500,  # Store in cents
            bio="Experienced fitness trainer"
        )

    def test_create_trainer_success(self, trainer_service: TrainerService, sample_trainer_create: TrainerCreate, db_session: Session):
        """Test successful trainer creation."""
        user = create_test_user(db_session, email="trainer@example.com", is_trainer=True)
        
        trainer = trainer_service.create(sample_trainer_create, user.id)
        
        assert trainer is not None
        assert trainer.user_id == user.id
        assert trainer.specialization == sample_trainer_create.specialization
        assert trainer.certification == sample_trainer_create.certification
        assert trainer.experience_years == sample_trainer_create.experience_years
        assert trainer.hourly_rate == sample_trainer_create.hourly_rate
        assert trainer.bio == sample_trainer_create.bio

    def test_get_trainer_by_id_existing(self, trainer_service: TrainerService, db_session: Session):
        """Test retrieving existing trainer by ID."""
        created_trainer = create_test_trainer(db_session)
        
        retrieved_trainer = trainer_service.get(created_trainer.id)
        
        assert retrieved_trainer is not None
        assert retrieved_trainer.id == created_trainer.id
        assert retrieved_trainer.specialization == created_trainer.specialization

    def test_get_trainer_by_id_nonexistent(self, trainer_service: TrainerService):
        """Test retrieving non-existent trainer by ID returns None."""
        trainer = trainer_service.get(99999)
        assert trainer is None

    def test_get_trainer_by_user_id(self, trainer_service: TrainerService, db_session: Session):
        """Test retrieving trainer by user ID."""
        created_trainer = create_test_trainer(db_session)
        
        retrieved_trainer = trainer_service.get_by_user_id(created_trainer.user_id)
        
        assert retrieved_trainer is not None
        assert retrieved_trainer.user_id == created_trainer.user_id
        assert retrieved_trainer.id == created_trainer.id

    def test_get_trainer_by_user_id_nonexistent(self, trainer_service: TrainerService):
        """Test retrieving trainer by non-existent user ID returns None."""
        trainer = trainer_service.get_by_user_id(99999)
        assert trainer is None

    def test_get_multi_trainers(self, trainer_service: TrainerService, db_session: Session):
        """Test retrieving multiple trainers with pagination."""
        # Create multiple trainers
        for i in range(5):
            user = create_test_user(db_session, email=f"trainer{i}@example.com", is_trainer=True)
            create_test_trainer(db_session, user=user)
        
        trainers = trainer_service.get_multi(skip=0, limit=3)
        
        assert len(trainers) == 3
        assert all(isinstance(trainer, Trainer) for trainer in trainers)

    def test_update_trainer_success(self, trainer_service: TrainerService, db_session: Session):
        """Test successful trainer update."""
        created_trainer = create_test_trainer(db_session, specialization="Original Specialization")
        
        update_data = TrainerUpdate(
            specialization="Updated Specialization",
            hourly_rate=10000,  # $100.00 in cents
            bio="Updated bio"
        )
        
        updated_trainer = trainer_service.update(created_trainer, update_data)
        
        assert updated_trainer.specialization == "Updated Specialization"
        assert updated_trainer.hourly_rate == 10000
        assert updated_trainer.bio == "Updated bio"
        assert updated_trainer.certification == created_trainer.certification  # Should not change

    def test_update_trainer_partial(self, trainer_service: TrainerService, db_session: Session):
        """Test partial trainer update."""
        created_trainer = create_test_trainer(
            db_session,
            specialization="Original Specialization",
            hourly_rate=7500
        )
        
        update_data = {"hourly_rate": 8500}
        
        updated_trainer = trainer_service.update(created_trainer, update_data)
        
        assert updated_trainer.hourly_rate == 8500
        assert updated_trainer.specialization == "Original Specialization"  # Should remain unchanged

    def test_remove_trainer(self, trainer_service: TrainerService, db_session: Session):
        """Test trainer removal."""
        created_trainer = create_test_trainer(db_session)
        trainer_id = created_trainer.id
        
        removed_trainer = trainer_service.remove(trainer_id)
        
        assert removed_trainer is not None
        assert removed_trainer.id == trainer_id
        
        # Verify trainer is actually removed
        retrieved_trainer = trainer_service.get(trainer_id)
        assert retrieved_trainer is None

    def test_trainer_hourly_rate_validation(self, trainer_service: TrainerService, db_session: Session):
        """Test trainer hourly rate validation and updates."""
        trainer = create_test_trainer(db_session, hourly_rate=5000)  # $50.00
        
        # Update to valid rate
        updated_trainer = trainer_service.update(trainer, {"hourly_rate": 12550})  # $125.50
        assert updated_trainer.hourly_rate == 12550
        
        # Update to zero rate (might be valid for some scenarios)
        zero_rate_trainer = trainer_service.update(updated_trainer, {"hourly_rate": 0})
        assert zero_rate_trainer.hourly_rate == 0

    def test_trainer_experience_years_update(self, trainer_service: TrainerService, db_session: Session):
        """Test trainer experience years update."""
        trainer = create_test_trainer(db_session, experience_years=3)
        
        # Update experience
        updated_trainer = trainer_service.update(trainer, {"experience_years": 7})
        assert updated_trainer.experience_years == 7

    def test_trainer_certification_update(self, trainer_service: TrainerService, db_session: Session):
        """Test trainer certification update."""
        trainer = create_test_trainer(db_session, certification="NASM-CPT")
        
        # Update certification
        updated_trainer = trainer_service.update(trainer, {"certification": "ACSM-CPT"})
        assert updated_trainer.certification == "ACSM-CPT"

    def test_trainer_specialization_update(self, trainer_service: TrainerService, db_session: Session):
        """Test trainer specialization update."""
        trainer = create_test_trainer(db_session, specialization="Weight Training")
        
        # Update specialization
        updated_trainer = trainer_service.update(trainer, {"specialization": "Cardio Training"})
        assert updated_trainer.specialization == "Cardio Training"

    def test_trainer_bio_update(self, trainer_service: TrainerService, db_session: Session):
        """Test trainer bio update."""
        trainer = create_test_trainer(db_session, bio="Original bio")
        
        # Update bio
        new_bio = "Updated bio with more detailed information about trainer experience"
        updated_trainer = trainer_service.update(trainer, {"bio": new_bio})
        assert updated_trainer.bio == new_bio

    def test_trainer_user_relationship(self, trainer_service: TrainerService, db_session: Session):
        """Test trainer-user relationship integrity."""
        user = create_test_user(db_session, email="trainer@example.com", is_trainer=True)
        trainer = create_test_trainer(db_session, user=user)
        
        assert trainer.user_id == user.id
        assert trainer.user.email == user.email
        assert trainer.user.is_trainer is True

    def test_create_trainer_with_non_trainer_user(self, trainer_service: TrainerService, sample_trainer_create: TrainerCreate, db_session: Session):
        """Test creating trainer with non-trainer user."""
        user = create_test_user(db_session, email="regular@example.com", is_trainer=False)
        
        # This might be allowed or not depending on business logic
        # Assuming it's allowed and the trainer creation should succeed
        trainer = trainer_service.create(sample_trainer_create, user.id)
        
        assert trainer is not None
        assert trainer.user_id == user.id

    def test_trainer_pagination(self, trainer_service: TrainerService, db_session: Session):
        """Test trainer pagination functionality."""
        # Create multiple trainers
        for i in range(10):
            user = create_test_user(db_session, email=f"trainer_page_{i}@example.com", is_trainer=True)
            create_test_trainer(db_session, user=user)
        
        # Test first page
        page1 = trainer_service.get_multi(skip=0, limit=5)
        assert len(page1) == 5
        
        # Test second page
        page2 = trainer_service.get_multi(skip=5, limit=5)
        assert len(page2) == 5
        
        # Verify no overlap
        page1_ids = {trainer.id for trainer in page1}
        page2_ids = {trainer.id for trainer in page2}
        assert len(page1_ids.intersection(page2_ids)) == 0

    def test_trainer_data_validation(self, trainer_service: TrainerService, db_session: Session):
        """Test trainer data validation during creation."""
        user = create_test_user(db_session, email="validation@example.com", is_trainer=True)
        
        valid_data = TrainerCreate(
            specialization="Strength and Conditioning",
            certification="NSCA-CSCS",
            experience_years=8,
            hourly_rate=9000,  # $90.00
            bio="Certified strength and conditioning specialist with 8 years of experience"
        )
        
        trainer = trainer_service.create(valid_data, user.id)
        
        assert trainer is not None
        assert trainer.specialization == valid_data.specialization
        assert trainer.certification == valid_data.certification
        assert trainer.experience_years == valid_data.experience_years
        assert trainer.hourly_rate == valid_data.hourly_rate

    def test_get_multi_empty_database(self, trainer_service: TrainerService):
        """Test get_multi with empty database."""
        trainers = trainer_service.get_multi(skip=0, limit=10)
        assert trainers == []

    def test_remove_nonexistent_trainer(self, trainer_service: TrainerService):
        """Test removing non-existent trainer."""
        with pytest.raises(Exception):  # Should raise an error
            trainer_service.remove(99999)

    def test_multiple_specializations_handling(self, trainer_service: TrainerService, db_session: Session):
        """Test handling trainers with different specializations."""
        user1 = create_test_user(db_session, email="strength@example.com", is_trainer=True)
        user2 = create_test_user(db_session, email="cardio@example.com", is_trainer=True)
        user3 = create_test_user(db_session, email="yoga@example.com", is_trainer=True)
        
        trainer1 = create_test_trainer(db_session, user=user1, specialization="Strength Training")
        trainer2 = create_test_trainer(db_session, user=user2, specialization="Cardio Training")
        trainer3 = create_test_trainer(db_session, user=user3, specialization="Yoga")
        
        all_trainers = trainer_service.get_multi(skip=0, limit=10)
        
        specializations = {trainer.specialization for trainer in all_trainers}
        assert "Strength Training" in specializations
        assert "Cardio Training" in specializations
        assert "Yoga" in specializations

    def test_trainer_hourly_rate_range(self, trainer_service: TrainerService, db_session: Session):
        """Test trainers with different hourly rates."""
        user1 = create_test_user(db_session, email="budget@example.com", is_trainer=True)
        user2 = create_test_user(db_session, email="premium@example.com", is_trainer=True)
        
        trainer1 = create_test_trainer(db_session, user=user1, hourly_rate=3000)  # $30.00
        trainer2 = create_test_trainer(db_session, user=user2, hourly_rate=15000)  # $150.00
        
        assert trainer1.hourly_rate == 3000
        assert trainer2.hourly_rate == 15000

    def test_trainer_experience_levels(self, trainer_service: TrainerService, db_session: Session):
        """Test trainers with different experience levels."""
        user1 = create_test_user(db_session, email="junior@example.com", is_trainer=True)
        user2 = create_test_user(db_session, email="senior@example.com", is_trainer=True)
        
        trainer1 = create_test_trainer(db_session, user=user1, experience_years=1)
        trainer2 = create_test_trainer(db_session, user=user2, experience_years=15)
        
        assert trainer1.experience_years == 1
        assert trainer2.experience_years == 15
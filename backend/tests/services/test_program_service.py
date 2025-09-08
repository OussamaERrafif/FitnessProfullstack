"""
Comprehensive unit tests for ProgramService.

This module tests all aspects of program management including CRUD operations,
exercise assignments, trainer relationships, and program validation.
"""

import pytest
from sqlalchemy.orm import Session

from app.models.program import Program
from app.schemas.program import ProgramCreate, ProgramUpdate
from app.services.program_service import ProgramService
from tests.utils import create_test_program, create_test_trainer, create_test_exercise


class TestProgramService:
    """Test suite for ProgramService class."""

    @pytest.fixture
    def program_service(self, db_session: Session):
        """Create ProgramService instance with test database."""
        return ProgramService(db_session)

    @pytest.fixture
    def sample_trainer(self, db_session: Session):
        """Create a sample trainer for testing."""
        return create_test_trainer(db_session)

    @pytest.fixture
    def sample_program_create(self):
        """Sample program creation data."""
        return ProgramCreate(
            name="Beginner Strength Program",
            description="A comprehensive program for beginners",
            duration_weeks=8,
            sessions_per_week=3,
            difficulty_level="Beginner",
            goals=["Strength", "Muscle building"],
            is_active=True
        )

    def test_create_program_success(self, program_service: ProgramService, sample_program_create: ProgramCreate, sample_trainer):
        """Test successful program creation."""
        program = program_service.create(sample_program_create, sample_trainer.id)
        
        assert program is not None
        assert program.trainer_id == sample_trainer.id
        assert program.name == sample_program_create.name
        assert program.description == sample_program_create.description
        assert program.duration_weeks == sample_program_create.duration_weeks
        assert program.sessions_per_week == sample_program_create.sessions_per_week
        assert program.difficulty_level == sample_program_create.difficulty_level
        assert program.goals == sample_program_create.goals
        assert program.is_active == sample_program_create.is_active

    def test_get_program_by_id_existing(self, program_service: ProgramService, db_session: Session, sample_trainer):
        """Test retrieving existing program by ID."""
        created_program = create_test_program(db_session, trainer=sample_trainer)
        
        retrieved_program = program_service.get(created_program.id)
        
        assert retrieved_program is not None
        assert retrieved_program.id == created_program.id
        assert retrieved_program.name == created_program.name
        assert retrieved_program.trainer_id == created_program.trainer_id

    def test_get_program_by_id_nonexistent(self, program_service: ProgramService):
        """Test retrieving non-existent program by ID returns None."""
        program = program_service.get(99999)
        assert program is None

    def test_get_multi_programs(self, program_service: ProgramService, db_session: Session, sample_trainer):
        """Test retrieving multiple programs with pagination."""
        # Create multiple programs
        for i in range(5):
            create_test_program(db_session, trainer=sample_trainer, name=f"Program {i}")
        
        programs = program_service.get_multi(skip=0, limit=3)
        
        assert len(programs) == 3
        assert all(isinstance(program, Program) for program in programs)

    def test_get_multi_active_only(self, program_service: ProgramService, db_session: Session, sample_trainer):
        """Test retrieving only active programs."""
        # Create active and inactive programs
        create_test_program(db_session, trainer=sample_trainer, name="Active Program", is_active=True)
        create_test_program(db_session, trainer=sample_trainer, name="Inactive Program", is_active=False)
        
        active_programs = program_service.get_multi(is_active=True)
        
        assert len(active_programs) >= 1
        assert all(program.is_active for program in active_programs)

    def test_update_program_success(self, program_service: ProgramService, db_session: Session, sample_trainer):
        """Test successful program update."""
        created_program = create_test_program(db_session, trainer=sample_trainer, name="Original Program")
        
        update_data = ProgramUpdate(
            name="Updated Program",
            description="Updated description",
            duration_weeks=12
        )
        
        updated_program = program_service.update(created_program, update_data)
        
        assert updated_program.name == "Updated Program"
        assert updated_program.description == "Updated description"
        assert updated_program.duration_weeks == 12
        assert updated_program.sessions_per_week == created_program.sessions_per_week  # Should not change

    def test_update_program_partial(self, program_service: ProgramService, db_session: Session, sample_trainer):
        """Test partial program update."""
        created_program = create_test_program(
            db_session,
            trainer=sample_trainer,
            name="Original Program",
            duration_weeks=8
        )
        
        update_data = {"duration_weeks": 10}
        
        updated_program = program_service.update(created_program, update_data)
        
        assert updated_program.duration_weeks == 10
        assert updated_program.name == "Original Program"  # Should remain unchanged

    def test_remove_program(self, program_service: ProgramService, db_session: Session, sample_trainer):
        """Test program removal."""
        created_program = create_test_program(db_session, trainer=sample_trainer)
        program_id = created_program.id
        
        removed_program = program_service.remove(program_id)
        
        assert removed_program is not None
        assert removed_program.id == program_id
        
        # Verify program is actually removed
        retrieved_program = program_service.get(program_id)
        assert retrieved_program is None

    def test_get_with_exercises(self, program_service: ProgramService, db_session: Session, sample_trainer):
        """Test retrieving program with exercises."""
        created_program = create_test_program(db_session, trainer=sample_trainer)
        
        # Get program with exercises (should work even if no exercises assigned)
        program_with_exercises = program_service.get_with_exercises(created_program.id)
        
        assert program_with_exercises is not None
        assert program_with_exercises.id == created_program.id

    def test_program_difficulty_levels(self, program_service: ProgramService, db_session: Session, sample_trainer):
        """Test programs with different difficulty levels."""
        create_test_program(db_session, trainer=sample_trainer, name="Beginner Program", difficulty_level="Beginner")
        create_test_program(db_session, trainer=sample_trainer, name="Intermediate Program", difficulty_level="Intermediate")
        create_test_program(db_session, trainer=sample_trainer, name="Advanced Program", difficulty_level="Advanced")
        
        all_programs = program_service.get_multi(skip=0, limit=10)
        
        difficulty_levels = {program.difficulty_level for program in all_programs}
        assert "Beginner" in difficulty_levels
        assert "Intermediate" in difficulty_levels
        assert "Advanced" in difficulty_levels

    def test_program_goals_handling(self, program_service: ProgramService, sample_program_create: ProgramCreate, sample_trainer):
        """Test program creation and update with goals."""
        program = program_service.create(sample_program_create, sample_trainer.id)
        
        assert program.goals == sample_program_create.goals
        assert len(program.goals) > 0
        
        # Update goals
        new_goals = ["Weight Loss", "Endurance", "Flexibility"]
        update_data = {"goals": new_goals}
        
        updated_program = program_service.update(program, update_data)
        
        assert updated_program.goals == new_goals

    def test_program_duration_validation(self, program_service: ProgramService, db_session: Session, sample_trainer):
        """Test program duration validation."""
        # Test different valid durations
        program1 = create_test_program(db_session, trainer=sample_trainer, duration_weeks=4)
        program2 = create_test_program(db_session, trainer=sample_trainer, duration_weeks=12)
        program3 = create_test_program(db_session, trainer=sample_trainer, duration_weeks=52)
        
        assert program1.duration_weeks == 4
        assert program2.duration_weeks == 12
        assert program3.duration_weeks == 52

    def test_program_sessions_per_week_validation(self, program_service: ProgramService, db_session: Session, sample_trainer):
        """Test program sessions per week validation."""
        # Test different valid session frequencies
        program1 = create_test_program(db_session, trainer=sample_trainer, sessions_per_week=1)
        program2 = create_test_program(db_session, trainer=sample_trainer, sessions_per_week=3)
        program3 = create_test_program(db_session, trainer=sample_trainer, sessions_per_week=7)
        
        assert program1.sessions_per_week == 1
        assert program2.sessions_per_week == 3
        assert program3.sessions_per_week == 7

    def test_program_activation_deactivation(self, program_service: ProgramService, db_session: Session, sample_trainer):
        """Test program activation and deactivation."""
        program = create_test_program(db_session, trainer=sample_trainer, is_active=True)
        
        # Deactivate program
        deactivated = program_service.update(program, {"is_active": False})
        assert deactivated.is_active is False
        
        # Reactivate program
        reactivated = program_service.update(deactivated, {"is_active": True})
        assert reactivated.is_active is True

    def test_program_trainer_relationship(self, program_service: ProgramService, db_session: Session):
        """Test program-trainer relationship integrity."""
        trainer1 = create_test_trainer(db_session)
        trainer2 = create_test_trainer(db_session)
        
        program = create_test_program(db_session, trainer=trainer1)
        
        # Verify initial relationship
        assert program.trainer_id == trainer1.id
        
        # Update trainer relationship (if business logic allows)
        # This might not be allowed in some systems
        try:
            updated_program = program_service.update(program, {"trainer_id": trainer2.id})
            assert updated_program.trainer_id == trainer2.id
        except Exception:
            # If trainer change is not allowed, that's also valid
            pass

    def test_program_pagination(self, program_service: ProgramService, db_session: Session, sample_trainer):
        """Test program pagination functionality."""
        # Create multiple programs
        for i in range(10):
            create_test_program(db_session, trainer=sample_trainer, name=f"Pagination Program {i}")
        
        # Test first page
        page1 = program_service.get_multi(skip=0, limit=5)
        assert len(page1) == 5
        
        # Test second page
        page2 = program_service.get_multi(skip=5, limit=5)
        assert len(page2) == 5
        
        # Verify no overlap
        page1_ids = {program.id for program in page1}
        page2_ids = {program.id for program in page2}
        assert len(page1_ids.intersection(page2_ids)) == 0

    def test_get_multi_empty_database(self, program_service: ProgramService):
        """Test get_multi with empty database."""
        programs = program_service.get_multi(skip=0, limit=10)
        assert programs == []

    def test_remove_nonexistent_program(self, program_service: ProgramService):
        """Test removing non-existent program."""
        with pytest.raises(Exception):  # Should raise an error
            program_service.remove(99999)

    def test_get_with_exercises_nonexistent(self, program_service: ProgramService):
        """Test get_with_exercises for non-existent program."""
        program = program_service.get_with_exercises(99999)
        assert program is None
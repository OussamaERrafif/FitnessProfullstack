"""
Comprehensive unit tests for ExerciseService.

This module tests all aspects of exercise management including CRUD operations,
categorization, search functionality, and muscle group filtering.
"""

import pytest
from sqlalchemy.orm import Session

from app.models.exercise import Exercise
from app.schemas.exercise import ExerciseCreate, ExerciseUpdate
from app.services.exercise_service import ExerciseService
from tests.utils import create_test_exercise, create_bulk_test_data


class TestExerciseService:
    """Test suite for ExerciseService class."""

    @pytest.fixture
    def exercise_service(self, db_session: Session):
        """Create ExerciseService instance with test database."""
        return ExerciseService(db_session)

    @pytest.fixture
    def sample_exercise_create(self):
        """Sample exercise creation data."""
        return ExerciseCreate(
            name="Push-ups",
            description="Standard push-up exercise",
            category="Strength",
            muscle_groups=["Chest", "Triceps", "Shoulders"],
            equipment=["Body weight"],
            difficulty_level="Beginner",
            instructions=["Start in plank position", "Lower body", "Push up"],
            is_active=True
        )

    def test_create_exercise_success(self, exercise_service: ExerciseService, sample_exercise_create: ExerciseCreate):
        """Test successful exercise creation."""
        exercise = exercise_service.create(sample_exercise_create)
        
        assert exercise is not None
        assert exercise.name == sample_exercise_create.name
        assert exercise.description == sample_exercise_create.description
        assert exercise.category == sample_exercise_create.category
        assert exercise.muscle_groups == sample_exercise_create.muscle_groups
        assert exercise.equipment == sample_exercise_create.equipment
        assert exercise.difficulty_level == sample_exercise_create.difficulty_level
        assert exercise.instructions == sample_exercise_create.instructions
        assert exercise.is_active is True

    def test_get_exercise_by_id_existing(self, exercise_service: ExerciseService, db_session: Session):
        """Test retrieving existing exercise by ID."""
        created_exercise = create_test_exercise(db_session, name="Test Exercise")
        
        retrieved_exercise = exercise_service.get(created_exercise.id)
        
        assert retrieved_exercise is not None
        assert retrieved_exercise.id == created_exercise.id
        assert retrieved_exercise.name == created_exercise.name

    def test_get_exercise_by_id_nonexistent(self, exercise_service: ExerciseService):
        """Test retrieving non-existent exercise by ID returns None."""
        exercise = exercise_service.get(99999)
        assert exercise is None

    def test_get_multi_exercises(self, exercise_service: ExerciseService, db_session: Session):
        """Test retrieving multiple exercises with pagination."""
        # Create multiple exercises
        for i in range(5):
            create_test_exercise(db_session, name=f"Exercise {i}")
        
        exercises = exercise_service.get_multi(skip=0, limit=3)
        
        assert len(exercises) == 3
        assert all(isinstance(exercise, Exercise) for exercise in exercises)

    def test_get_multi_active_only(self, exercise_service: ExerciseService, db_session: Session):
        """Test retrieving only active exercises."""
        # Create active and inactive exercises
        create_test_exercise(db_session, name="Active Exercise", is_active=True)
        create_test_exercise(db_session, name="Inactive Exercise", is_active=False)
        
        active_exercises = exercise_service.get_multi(is_active=True)
        
        assert len(active_exercises) >= 1
        assert all(exercise.is_active for exercise in active_exercises)

    def test_update_exercise_success(self, exercise_service: ExerciseService, db_session: Session):
        """Test successful exercise update."""
        created_exercise = create_test_exercise(db_session, name="Original Exercise")
        
        update_data = ExerciseUpdate(
            name="Updated Exercise",
            description="Updated description",
            difficulty_level="Advanced"
        )
        
        updated_exercise = exercise_service.update(created_exercise, update_data)
        
        assert updated_exercise.name == "Updated Exercise"
        assert updated_exercise.description == "Updated description"
        assert updated_exercise.difficulty_level == "Advanced"
        assert updated_exercise.category == created_exercise.category  # Should not change

    def test_update_exercise_partial(self, exercise_service: ExerciseService, db_session: Session):
        """Test partial exercise update."""
        created_exercise = create_test_exercise(
            db_session,
            name="Original Exercise",
            description="Original description"
        )
        
        update_data = {"description": "Partially updated description"}
        
        updated_exercise = exercise_service.update(created_exercise, update_data)
        
        assert updated_exercise.description == "Partially updated description"
        assert updated_exercise.name == "Original Exercise"  # Should remain unchanged

    def test_remove_exercise(self, exercise_service: ExerciseService, db_session: Session):
        """Test exercise removal."""
        created_exercise = create_test_exercise(db_session)
        exercise_id = created_exercise.id
        
        removed_exercise = exercise_service.remove(exercise_id)
        
        assert removed_exercise is not None
        assert removed_exercise.id == exercise_id
        
        # Verify exercise is actually removed
        retrieved_exercise = exercise_service.get(exercise_id)
        assert retrieved_exercise is None

    def test_count_exercises(self, exercise_service: ExerciseService, db_session: Session):
        """Test counting exercises."""
        initial_count = exercise_service.count()
        
        # Create some exercises
        for i in range(3):
            create_test_exercise(db_session, name=f"Count Exercise {i}")
        
        final_count = exercise_service.count()
        
        assert final_count == initial_count + 3

    def test_count_active_exercises(self, exercise_service: ExerciseService, db_session: Session):
        """Test counting only active exercises."""
        # Create active and inactive exercises
        create_test_exercise(db_session, name="Active 1", is_active=True)
        create_test_exercise(db_session, name="Active 2", is_active=True)
        create_test_exercise(db_session, name="Inactive 1", is_active=False)
        
        active_count = exercise_service.count(is_active=True)
        total_count = exercise_service.count(is_active=False)
        
        assert active_count >= 2
        assert total_count >= 3

    def test_search_exercises_by_name(self, exercise_service: ExerciseService, db_session: Session):
        """Test searching exercises by name."""
        create_test_exercise(db_session, name="Push-ups")
        create_test_exercise(db_session, name="Pull-ups")
        create_test_exercise(db_session, name="Squats")
        
        results = exercise_service.search(query="Push")
        
        assert len(results) >= 1
        assert any("Push" in exercise.name for exercise in results)

    def test_search_exercises_by_description(self, exercise_service: ExerciseService, db_session: Session):
        """Test searching exercises by description."""
        create_test_exercise(
            db_session,
            name="Test Exercise",
            description="This is a cardio exercise for endurance"
        )
        
        results = exercise_service.search(query="cardio")
        
        assert len(results) >= 1
        assert any("cardio" in exercise.description for exercise in results)

    def test_search_exercises_empty_query(self, exercise_service: ExerciseService, db_session: Session):
        """Test searching exercises with empty query returns all exercises."""
        for i in range(3):
            create_test_exercise(db_session, name=f"Search Exercise {i}")
        
        results = exercise_service.search(query="")
        
        assert len(results) >= 3

    def test_get_by_category(self, exercise_service: ExerciseService, db_session: Session):
        """Test retrieving exercises by category."""
        create_test_exercise(db_session, name="Exercise 1", category="Strength")
        create_test_exercise(db_session, name="Exercise 2", category="Strength")
        create_test_exercise(db_session, name="Exercise 3", category="Cardio")
        
        strength_exercises = exercise_service.get_by_category("Strength")
        
        assert len(strength_exercises) >= 2
        assert all(exercise.category == "Strength" for exercise in strength_exercises)

    def test_get_by_muscle_group(self, exercise_service: ExerciseService, db_session: Session):
        """Test retrieving exercises by muscle group."""
        create_test_exercise(
            db_session,
            name="Push-ups",
            muscle_groups=["Chest", "Triceps"]
        )
        create_test_exercise(
            db_session,
            name="Bench Press",
            muscle_groups=["Chest", "Shoulders"]
        )
        create_test_exercise(
            db_session,
            name="Squats",
            muscle_groups=["Quadriceps", "Glutes"]
        )
        
        chest_exercises = exercise_service.get_by_muscle_group("Chest")
        
        assert len(chest_exercises) >= 2
        assert all("Chest" in exercise.muscle_groups for exercise in chest_exercises)

    def test_exercise_difficulty_levels(self, exercise_service: ExerciseService, db_session: Session):
        """Test exercises with different difficulty levels."""
        create_test_exercise(db_session, name="Beginner Exercise", difficulty_level="Beginner")
        create_test_exercise(db_session, name="Intermediate Exercise", difficulty_level="Intermediate")
        create_test_exercise(db_session, name="Advanced Exercise", difficulty_level="Advanced")
        
        # Search should work regardless of difficulty
        results = exercise_service.search(query="Exercise")
        
        assert len(results) >= 3
        difficulty_levels = {exercise.difficulty_level for exercise in results}
        assert "Beginner" in difficulty_levels
        assert "Intermediate" in difficulty_levels
        assert "Advanced" in difficulty_levels

    def test_exercise_equipment_filtering(self, exercise_service: ExerciseService, db_session: Session):
        """Test exercises with different equipment requirements."""
        create_test_exercise(
            db_session,
            name="Bodyweight Exercise",
            equipment=["Body weight"]
        )
        create_test_exercise(
            db_session,
            name="Dumbbell Exercise",
            equipment=["Dumbbells"]
        )
        create_test_exercise(
            db_session,
            name="Barbell Exercise",
            equipment=["Barbell", "Weight plates"]
        )
        
        # Search by equipment in description or other fields
        results = exercise_service.search(query="Dumbbell")
        
        assert len(results) >= 1

    def test_exercise_instructions_handling(self, exercise_service: ExerciseService, sample_exercise_create: ExerciseCreate):
        """Test exercise creation and update with instructions."""
        exercise = exercise_service.create(sample_exercise_create)
        
        assert exercise.instructions == sample_exercise_create.instructions
        assert len(exercise.instructions) > 0
        
        # Update instructions
        new_instructions = ["Updated step 1", "Updated step 2", "Updated step 3"]
        update_data = {"instructions": new_instructions}
        
        updated_exercise = exercise_service.update(exercise, update_data)
        
        assert updated_exercise.instructions == new_instructions

    def test_exercise_muscle_groups_handling(self, exercise_service: ExerciseService, sample_exercise_create: ExerciseCreate):
        """Test exercise creation and update with muscle groups."""
        exercise = exercise_service.create(sample_exercise_create)
        
        assert exercise.muscle_groups == sample_exercise_create.muscle_groups
        assert len(exercise.muscle_groups) > 0
        
        # Update muscle groups
        new_muscle_groups = ["Chest", "Shoulders", "Core"]
        update_data = {"muscle_groups": new_muscle_groups}
        
        updated_exercise = exercise_service.update(exercise, update_data)
        
        assert updated_exercise.muscle_groups == new_muscle_groups

    def test_exercise_activation_deactivation(self, exercise_service: ExerciseService, db_session: Session):
        """Test exercise activation and deactivation."""
        exercise = create_test_exercise(db_session, is_active=True)
        
        # Deactivate exercise
        deactivated = exercise_service.update(exercise, {"is_active": False})
        assert deactivated.is_active is False
        
        # Reactivate exercise
        reactivated = exercise_service.update(deactivated, {"is_active": True})
        assert reactivated.is_active is True

    def test_exercise_pagination(self, exercise_service: ExerciseService, db_session: Session):
        """Test exercise pagination functionality."""
        # Create multiple exercises
        for i in range(10):
            create_test_exercise(db_session, name=f"Pagination Exercise {i}")
        
        # Test first page
        page1 = exercise_service.get_multi(skip=0, limit=5)
        assert len(page1) == 5
        
        # Test second page
        page2 = exercise_service.get_multi(skip=5, limit=5)
        assert len(page2) == 5
        
        # Verify no overlap
        page1_ids = {exercise.id for exercise in page1}
        page2_ids = {exercise.id for exercise in page2}
        assert len(page1_ids.intersection(page2_ids)) == 0

    def test_get_multi_empty_database(self, exercise_service: ExerciseService):
        """Test get_multi with empty database."""
        exercises = exercise_service.get_multi(skip=0, limit=10)
        assert exercises == []

    def test_search_no_results(self, exercise_service: ExerciseService, db_session: Session):
        """Test searching exercises with query that returns no results."""
        create_test_exercise(db_session, name="Push-ups")
        
        results = exercise_service.search(query="nonexistent")
        
        assert len(results) == 0

    def test_remove_nonexistent_exercise(self, exercise_service: ExerciseService):
        """Test removing non-existent exercise."""
        with pytest.raises(Exception):  # Should raise an error
            exercise_service.remove(99999)
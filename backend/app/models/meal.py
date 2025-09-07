"""
Meal and nutrition models.
"""

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text, Boolean, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.core.database import Base


class MealType(str, enum.Enum):
    BREAKFAST = "breakfast"
    LUNCH = "lunch"
    DINNER = "dinner"
    SNACK = "snack"
    PRE_WORKOUT = "pre_workout"
    POST_WORKOUT = "post_workout"


class Meal(Base):
    __tablename__ = "meals"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    description = Column(Text)
    
    # Relationships
    trainer_id = Column(Integer, ForeignKey("trainers.id"))
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=True)  # null for templates
    
    # Meal details
    meal_type = Column(String(20))  # breakfast, lunch, dinner, snack
    preparation_time = Column(Integer)  # in minutes
    cooking_time = Column(Integer)  # in minutes
    servings = Column(Integer, default=1)
    
    # Nutritional information
    calories_per_serving = Column(Float)
    protein_grams = Column(Float)
    carbs_grams = Column(Float)
    fat_grams = Column(Float)
    fiber_grams = Column(Float)
    sugar_grams = Column(Float)
    
    # Additional info
    ingredients = Column(Text)  # JSON or comma-separated
    instructions = Column(Text)
    image_url = Column(String(500))
    
    # Dietary tags
    is_vegetarian = Column(Boolean, default=False)
    is_vegan = Column(Boolean, default=False)
    is_gluten_free = Column(Boolean, default=False)
    is_dairy_free = Column(Boolean, default=False)
    
    # Status
    is_template = Column(Boolean, default=False)  # template meals vs assigned meals
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    trainer = relationship("Trainer", backref="meals")
    client = relationship("Client", backref="meals")


class MealPlan(Base):
    """Weekly meal plans for clients."""
    __tablename__ = "meal_plans"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    
    # Relationships
    trainer_id = Column(Integer, ForeignKey("trainers.id"))
    client_id = Column(Integer, ForeignKey("clients.id"))
    
    # Plan details
    start_date = Column(DateTime(timezone=True))
    end_date = Column(DateTime(timezone=True))
    target_calories = Column(Float)
    target_protein = Column(Float)
    target_carbs = Column(Float)
    target_fat = Column(Float)
    
    # Status
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    trainer = relationship("Trainer", backref="meal_plans")
    client = relationship("Client", backref="meal_plans")
    meal_plan_meals = relationship("MealPlanMeal", back_populates="meal_plan")


class MealPlanMeal(Base):
    """Junction table for MealPlan and Meal."""
    __tablename__ = "meal_plan_meals"

    id = Column(Integer, primary_key=True, index=True)
    meal_plan_id = Column(Integer, ForeignKey("meal_plans.id"))
    meal_id = Column(Integer, ForeignKey("meals.id"))
    
    # Scheduling
    day_of_week = Column(Integer)  # 1-7 (Monday-Sunday)
    meal_time = Column(String(20))  # breakfast, lunch, dinner, snack
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    meal_plan = relationship("MealPlan", back_populates="meal_plan_meals")
    meal = relationship("Meal", backref="meal_plan_meals")
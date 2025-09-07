"""
Schemas package initialization.
"""

# Import all schemas for easy access
from app.schemas.auth import (
    Token, TokenPayload, UserBase, UserCreate, UserRegister, 
    UserUpdate, UserInDBBase, User, UserInDB, UserResponse, UserLogin
)
from app.schemas.trainer import (
    TrainerBase, TrainerCreate, TrainerUpdate, TrainerInDBBase, 
    Trainer, TrainerResponse
)
from app.schemas.client import (
    ClientBase, ClientCreate, ClientUpdate, ClientInDBBase,
    Client, ClientResponse, ClientListResponse
)
from app.schemas.exercise import (
    ExerciseBase, ExerciseCreate, ExerciseUpdate, ExerciseInDBBase,
    Exercise, ExerciseResponse, ExerciseListResponse, ExerciseSearchQuery
)
from app.schemas.program import (
    ProgramExerciseBase, ProgramExerciseCreate, ProgramExerciseUpdate, ProgramExerciseResponse,
    ProgramBase, ProgramCreate, ProgramUpdate, ProgramInDBBase,
    Program, ProgramResponse, ProgramListResponse
)
from app.schemas.meal import (
    MealBase, MealCreate, MealUpdate, MealInDBBase, Meal, MealResponse, MealListResponse,
    MealPlanMealBase, MealPlanMealCreate, MealPlanMealResponse,
    MealPlanBase, MealPlanCreate, MealPlanUpdate, MealPlanInDBBase,
    MealPlan, MealPlanResponse, MealPlanListResponse
)
from app.schemas.payment import (
    PaymentBase, PaymentCreate, PaymentUpdate, PaymentInDBBase, Payment, PaymentResponse, PaymentListResponse,
    SubscriptionBase, SubscriptionCreate, SubscriptionUpdate, SubscriptionInDBBase, 
    Subscription, SubscriptionResponse,
    PaymentMethodBase, PaymentMethodCreate, PaymentMethodResponse,
    StripeWebhookPayload
)
from app.schemas.progress import (
    ProgressBase, ProgressCreate, ProgressUpdate, ProgressInDBBase, Progress, ProgressResponse, ProgressListResponse,
    ExerciseLogBase, ExerciseLogCreate, ExerciseLogResponse,
    WorkoutLogBase, WorkoutLogCreate, WorkoutLogUpdate, WorkoutLogInDBBase, WorkoutLog, WorkoutLogResponse, WorkoutLogListResponse,
    GoalBase, GoalCreate, GoalUpdate, GoalInDBBase, Goal, GoalResponse, GoalListResponse
)

from app.schemas.auth import *
from app.schemas.trainer import *

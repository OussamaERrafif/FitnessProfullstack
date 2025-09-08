/**
 * @fileoverview Core TypeScript type definitions for the FitnessPr application
 * 
 * This module contains all the fundamental type definitions used throughout
 * the application. These types provide type safety, enable autocomplete,
 * and serve as documentation for the data structures used in the system.
 * 
 * The types are organized into logical groups:
 * - User Management: Trainer, Client, User roles
 * - Training: TrainingPlan, Exercise, SessionBooking
 * - Nutrition: MealPlan, Recipe, Ingredient, NutritionInfo
 * - Progress Tracking: ProgressLog, DashboardStats
 * - Business: Payment, Schedule types
 * - Status Management: Enums for various states
 * 
 * @example
 * ```typescript
 * // Import types for component props
 * import { Client, TrainingPlan } from '@/types'
 * 
 * interface ClientCardProps {
 *   client: Client
 *   trainingPlan?: TrainingPlan
 * }
 * 
 * // Type-safe function parameters
 * function createWorkout(exercises: Exercise[]): TrainingPlan {
 *   // TypeScript will validate the structure
 * }
 * ```
 * 
 * @version 1.0.0
 * @author FitnessPr Development Team
 */

// ============================================================================
// USER MANAGEMENT TYPES
// ============================================================================

/**
 * Trainer interface representing fitness professionals in the system
 * 
 * Trainers are the primary users who manage clients, create training programs,
 * track progress, and handle business operations within the platform.
 * 
 * @interface Trainer
 * @example
 * ```typescript
 * const trainer: Trainer = {
 *   id: 'trainer_123',
 *   name: 'John Doe',
 *   email: 'john@fitnesspro.com',
 *   subscription: 'premium',
 *   clients: [],
 *   createdAt: new Date(),
 *   updatedAt: new Date()
 * }
 * ```
 */
export interface Trainer {
  /** Unique identifier for the trainer */
  id: string
  /** Full name of the trainer */
  name: string
  /** Email address for authentication and communication */
  email: string
  /** Subscription tier (basic, premium, enterprise) */
  subscription: string
  /** Array of clients assigned to this trainer */
  clients: Client[]
  /** Account creation timestamp */
  createdAt: Date
  /** Last account update timestamp */
  updatedAt: Date
}

/**
 * Client interface representing individuals receiving fitness training
 * 
 * Clients are end-users who receive training programs, meal plans, and
 * progress tracking from their assigned trainers. Contains comprehensive
 * profile information for personalized fitness planning.
 * 
 * @interface Client
 * @example
 * ```typescript
 * const client: Client = {
 *   id: 'client_456',
 *   name: 'Jane Smith',
 *   email: 'jane@example.com',
 *   pin: '1234',
 *   age: 28,
 *   weight: 140,
 *   height: 165,
 *   goals: 'Weight loss and muscle toning',
 *   trainerId: 'trainer_123',
 *   trainer: trainer,
 *   trainingPlans: [],
 *   mealPlans: [],
 *   progressLogs: [],
 *   sessions: [],
 *   createdAt: new Date(),
 *   updatedAt: new Date()
 * }
 * ```
 */
export interface Client {
  /** Unique identifier for the client */
  id: string
  /** Full name of the client */
  name: string
  /** Optional email address for communication */
  email?: string
  /** 4-digit PIN for quick client identification */
  pin: string
  /** Client's age in years for program customization */
  age?: number
  /** Current weight in pounds or kilograms */
  weight?: number
  /** Height in centimeters for BMI calculations */
  height?: number
  /** Fitness goals and objectives description */
  goals?: string
  /** Additional health data and medical considerations */
  healthData?: any
  /** ID of the assigned trainer */
  trainerId: string
  /** Reference to the assigned trainer object */
  trainer: Trainer
  /** Array of training programs assigned to client */
  trainingPlans: TrainingPlan[]
  /** Array of meal plans assigned to client */
  mealPlans: MealPlan[]
  /** Historical progress tracking entries */
  progressLogs: ProgressLog[]
  /** Scheduled and completed training sessions */
  sessions: SessionBooking[]
  /** Client registration timestamp */
  createdAt: Date
  /** Last profile update timestamp */
  updatedAt: Date
}

// ============================================================================
// TRAINING & EXERCISE TYPES
// ============================================================================

/**
 * TrainingPlan interface for structured workout programs
 * 
 * Represents a complete training program assigned to a client, containing
 * exercises, scheduling information, and tracking capabilities for
 * progressive fitness development.
 * 
 * @interface TrainingPlan
 * @example
 * ```typescript
 * const trainingPlan: TrainingPlan = {
 *   id: 'plan_789',
 *   title: 'Beginner Strength Training',
 *   description: '8-week progressive strength building program',
 *   exercises: [pushUps, squats, planks],
 *   schedule: {
 *     days: ['Monday', 'Wednesday', 'Friday'],
 *     frequency: 'weekly',
 *     time: '09:00'
 *   },
 *   clientId: 'client_456',
 *   client: client,
 *   createdAt: new Date(),
 *   updatedAt: new Date()
 * }
 * ```
 */
export interface TrainingPlan {
  /** Unique identifier for the training plan */
  id: string
  /** Human-readable title of the training program */
  title: string
  /** Detailed description of the program goals and structure */
  description?: string
  /** Array of exercises included in this training plan */
  exercises: Exercise[]
  /** Schedule configuration for when exercises should be performed */
  schedule: Schedule
  /** ID of the client this plan is assigned to */
  clientId: string
  /** Reference to the client object */
  client: Client
  /** Plan creation timestamp */
  createdAt: Date
  /** Last plan modification timestamp */
  updatedAt: Date
}

/**
 * Exercise interface for individual workout movements
 * 
 * Represents a single exercise with complete information including
 * instructions, media, and performance parameters. Supports both
 * strength training and cardio exercises with flexible configurations.
 * 
 * @interface Exercise
 * @example
 * ```typescript
 * const exercise: Exercise = {
 *   id: 'ex_001',
 *   name: 'Push-ups',
 *   description: 'Classic upper body exercise',
 *   category: 'strength',
 *   muscleGroups: ['chest', 'triceps', 'shoulders'],
 *   instructions: 'Start in plank position, lower chest to ground...',
 *   sets: 3,
 *   reps: 12,
 *   restTime: 60
 * }
 * ```
 */
export interface Exercise {
  /** Unique identifier for the exercise */
  id: string
  /** Name of the exercise */
  name: string
  /** Brief description of the exercise and its benefits */
  description?: string
  /** Exercise category (strength, cardio, flexibility, etc.) */
  category: string
  /** Array of primary muscle groups targeted */
  muscleGroups: string[]
  /** Detailed step-by-step execution instructions */
  instructions: string
  /** Optional URL to demonstration image */
  imageUrl?: string
  /** Optional URL to demonstration video */
  videoUrl?: string
  /** Number of sets to perform (strength exercises) */
  sets?: number
  /** Number of repetitions per set (strength exercises) */
  reps?: number
  /** Duration in seconds (cardio or timed exercises) */
  duration?: number
  /** Weight amount in pounds or kilograms */
  weight?: number
  /** Rest time in seconds between sets */
  restTime?: number
}

// ============================================================================
// NUTRITION & MEAL PLANNING TYPES
// ============================================================================

/**
 * MealPlan interface for structured nutrition programs
 * 
 * Represents a complete meal planning system with recipes organized
 * by meal types and scheduled across multiple days for consistent
 * nutrition management.
 * 
 * @interface MealPlan
 * @example
 * ```typescript
 * const mealPlan: MealPlan = {
 *   id: 'meal_001',
 *   title: 'High Protein Meal Plan',
 *   description: 'Optimized for muscle building',
 *   recipes: [proteinSmoothie, chickenBowl],
 *   schedule: {
 *     breakfast: [proteinSmoothie],
 *     lunch: [chickenBowl],
 *     dinner: [salmonDinner],
 *     days: ['Monday', 'Tuesday', 'Wednesday']
 *   },
 *   clientId: 'client_456',
 *   client: client,
 *   createdAt: new Date(),
 *   updatedAt: new Date()
 * }
 * ```
 */
export interface MealPlan {
  /** Unique identifier for the meal plan */
  id: string
  /** Human-readable title of the nutrition program */
  title: string
  /** Detailed description of the meal plan goals and approach */
  description?: string
  /** Array of all recipes included in this meal plan */
  recipes: Recipe[]
  /** Schedule configuration organizing meals by type and day */
  schedule: MealSchedule
  /** ID of the client this meal plan is assigned to */
  clientId: string
  /** Reference to the client object */
  client: Client
  /** Meal plan creation timestamp */
  createdAt: Date
  /** Last meal plan modification timestamp */
  updatedAt: Date
}

/**
 * Recipe interface for individual meal preparations
 * 
 * Contains complete information for preparing a meal including
 * ingredients, instructions, nutritional information, and metadata
 * for dietary considerations and meal planning.
 * 
 * @interface Recipe
 * @example
 * ```typescript
 * const recipe: Recipe = {
 *   id: 'recipe_001',
 *   name: 'Grilled Chicken Breast',
 *   description: 'Lean protein with herbs',
 *   ingredients: [
 *     { id: 'ing_001', name: 'Chicken Breast', amount: 6, unit: 'oz' },
 *     { id: 'ing_002', name: 'Olive Oil', amount: 1, unit: 'tbsp' }
 *   ],
 *   instructions: 'Season chicken, grill for 6-8 minutes per side...',
 *   nutrition: {
 *     calories: 220,
 *     protein: 40,
 *     carbs: 0,
 *     fat: 6
 *   },
 *   category: 'main',
 *   dietTags: ['high-protein', 'low-carb'],
 *   prepTime: 10,
 *   cookTime: 15,
 *   servings: 1
 * }
 * ```
 */
export interface Recipe {
  /** Unique identifier for the recipe */
  id: string
  /** Name of the recipe/dish */
  name: string
  /** Brief description of the dish and its characteristics */
  description?: string
  /** Array of ingredients with quantities required */
  ingredients: Ingredient[]
  /** Detailed cooking instructions */
  instructions: string
  /** Comprehensive nutritional information */
  nutrition: NutritionInfo
  /** Optional URL to food image */
  imageUrl?: string
  /** Recipe category (breakfast, lunch, dinner, snack, etc.) */
  category?: string
  /** Array of dietary tags (vegan, gluten-free, high-protein, etc.) */
  dietTags?: string[]
  /** Preparation time in minutes */
  prepTime?: number
  /** Cooking time in minutes */
  cookTime?: number
  /** Number of servings this recipe produces */
  servings?: number
}

/**
 * Ingredient interface for recipe components
 * 
 * Represents individual ingredients with specific quantities
 * and units for accurate recipe preparation and nutritional
 * calculations.
 * 
 * @interface Ingredient
 * @example
 * ```typescript
 * const ingredient: Ingredient = {
 *   id: 'ing_001',
 *   name: 'Chicken Breast',
 *   amount: 6,
 *   unit: 'oz'
 * }
 * ```
 */
export interface Ingredient {
  /** Unique identifier for the ingredient */
  id: string
  /** Name of the ingredient */
  name: string
  /** Quantity amount as a number */
  amount: number
  /** Unit of measurement (oz, cups, tbsp, grams, etc.) */
  unit: string
}

/**
 * NutritionInfo interface for nutritional data
 * 
 * Comprehensive nutritional information for recipes and meals,
 * supporting macronutrient tracking and dietary goal monitoring.
 * All values are per serving unless otherwise specified.
 * 
 * @interface NutritionInfo
 * @example
 * ```typescript
 * const nutrition: NutritionInfo = {
 *   calories: 350,
 *   protein: 25,  // grams
 *   carbs: 20,    // grams
 *   fat: 15,      // grams
 *   fiber: 5,     // grams
 *   sugar: 3,     // grams
 *   sodium: 450   // milligrams
 * }
 * ```
 */
export interface NutritionInfo {
  /** Total calories per serving */
  calories: number
  /** Protein content in grams */
  protein: number
  /** Carbohydrate content in grams */
  carbs: number
  /** Fat content in grams */
  fat: number
  /** Optional fiber content in grams */
  fiber?: number
  /** Optional sugar content in grams */
  sugar?: number
  /** Optional sodium content in milligrams */
  sodium?: number
}

// ============================================================================
// SESSION & BOOKING TYPES
// ============================================================================

/**
 * SessionBooking interface for training session management
 * 
 * Represents scheduled training sessions between trainers and clients
 * with comprehensive tracking of session details, status, and outcomes.
 * Supports various session types and business workflows.
 * 
 * @interface SessionBooking
 * @example
 * ```typescript
 * const session: SessionBooking = {
 *   id: 'session_001',
 *   date: new Date('2024-01-15T09:00:00'),
 *   duration: 60,
 *   type: SessionType.PERSONAL_TRAINING,
 *   status: SessionStatus.SCHEDULED,
 *   notes: 'Focus on upper body strength',
 *   trainerId: 'trainer_123',
 *   trainer: trainer,
 *   clientId: 'client_456',
 *   client: client,
 *   createdAt: new Date(),
 *   updatedAt: new Date()
 * }
 * ```
 */
export interface SessionBooking {
  /** Unique identifier for the session booking */
  id: string
  /** Scheduled date and time for the session */
  date: Date
  /** Session duration in minutes */
  duration: number
  /** Type of training session being conducted */
  type: SessionType
  /** Current status of the session booking */
  status: SessionStatus
  /** Optional notes about the session content or special instructions */
  notes?: string
  /** ID of the trainer conducting the session */
  trainerId: string
  /** Reference to the trainer object */
  trainer: Trainer
  /** Optional ID of the client (for group sessions, may be null) */
  clientId?: string
  /** Optional reference to the client object */
  client?: Client
  /** Session booking creation timestamp */
  createdAt: Date
  /** Last session booking update timestamp */
  updatedAt: Date
}

// ============================================================================
// PROGRESS TRACKING TYPES
// ============================================================================

/**
 * ProgressLog interface for client progress tracking
 * 
 * Comprehensive progress tracking system supporting body measurements,
 * weight tracking, progress photos, and custom measurements for
 * detailed fitness journey documentation.
 * 
 * @interface ProgressLog
 * @example
 * ```typescript
 * const progressLog: ProgressLog = {
 *   id: 'progress_001',
 *   date: new Date('2024-01-15'),
 *   weight: 145,
 *   bodyFat: 18.5,
 *   muscleMass: 115,
 *   notes: 'Feeling stronger, improved endurance',
 *   measurements: {
 *     chest: 38,
 *     waist: 32,
 *     bicep: 13.5
 *   },
 *   photos: ['progress_photo_001.jpg'],
 *   clientId: 'client_456',
 *   client: client,
 *   createdAt: new Date(),
 *   updatedAt: new Date()
 * }
 * ```
 */
export interface ProgressLog {
  /** Unique identifier for the progress entry */
  id: string
  /** Date when progress measurements were taken */
  date: Date
  /** Body weight measurement in pounds or kilograms */
  weight?: number
  /** Body fat percentage */
  bodyFat?: number
  /** Muscle mass in pounds or kilograms */
  muscleMass?: number
  /** Optional notes about progress, feelings, or observations */
  notes?: string
  /** Custom body measurements (chest, waist, arms, etc.) in inches/cm */
  measurements?: Record<string, number>
  /** Array of progress photo URLs */
  photos?: string[]
  /** ID of the client this progress belongs to */
  clientId: string
  /** Reference to the client object */
  client: Client
  /** Progress entry creation timestamp */
  createdAt: Date
  /** Last progress entry update timestamp */
  updatedAt: Date
}

// ============================================================================
// BUSINESS & PAYMENT TYPES
// ============================================================================

/**
 * Payment interface for financial transaction management
 * 
 * Handles payment processing, subscription management, and financial
 * tracking for trainer services. Integrates with payment processors
 * like Stripe for secure transaction handling.
 * 
 * @interface Payment
 * @example
 * ```typescript
 * const payment: Payment = {
 *   id: 'pay_001',
 *   amount: 7500, // $75.00 in cents
 *   currency: 'USD',
 *   status: PaymentStatus.COMPLETED,
 *   stripePaymentIntentId: 'pi_1234567890',
 *   description: 'Personal training session - 1 hour',
 *   trainerId: 'trainer_123',
 *   trainer: trainer,
 *   createdAt: new Date(),
 *   updatedAt: new Date()
 * }
 * ```
 */
export interface Payment {
  /** Unique identifier for the payment transaction */
  id: string
  /** Payment amount in smallest currency unit (cents for USD) */
  amount: number
  /** Currency code (USD, EUR, etc.) */
  currency: string
  /** Current status of the payment transaction */
  status: PaymentStatus
  /** Optional Stripe payment intent ID for tracking */
  stripePaymentIntentId?: string
  /** Optional description of what the payment is for */
  description?: string
  /** ID of the trainer receiving the payment */
  trainerId: string
  /** Reference to the trainer object */
  trainer: Trainer
  /** Payment creation timestamp */
  createdAt: Date
  /** Last payment update timestamp */
  updatedAt: Date
}

// ============================================================================
// ENUMS FOR STATUS MANAGEMENT
// ============================================================================

/**
 * UserRole enum for role-based access control
 * 
 * Defines the different user types in the system with specific
 * permissions and capabilities for secure application access.
 */
export enum UserRole {
  /** Fitness trainer with client management capabilities */
  TRAINER = 'TRAINER',
  /** Individual receiving training services */
  CLIENT = 'CLIENT',
  /** System administrator with full access */
  ADMIN = 'ADMIN'
}

/**
 * SessionType enum for categorizing training sessions
 * 
 * Different types of training sessions that can be booked
 * and managed within the platform.
 */
export enum SessionType {
  /** One-on-one personal training session */
  PERSONAL_TRAINING = 'PERSONAL_TRAINING',
  /** Group fitness class */
  GROUP_CLASS = 'GROUP_CLASS',
  /** Initial consultation or assessment */
  CONSULTATION = 'CONSULTATION',
  /** Virtual/online training session */
  VIRTUAL = 'VIRTUAL'
}

/**
 * SessionStatus enum for session lifecycle management
 * 
 * Tracks the current state of training sessions from
 * scheduling through completion.
 */
export enum SessionStatus {
  /** Session is booked and confirmed */
  SCHEDULED = 'SCHEDULED',
  /** Session has been successfully completed */
  COMPLETED = 'COMPLETED',
  /** Session was cancelled by trainer or client */
  CANCELLED = 'CANCELLED',
  /** Client did not show up for scheduled session */
  NO_SHOW = 'NO_SHOW'
}

/**
 * PaymentStatus enum for financial transaction tracking
 * 
 * Represents the various states of payment transactions
 * throughout the payment processing lifecycle.
 */
export enum PaymentStatus {
  /** Payment is being processed */
  PENDING = 'PENDING',
  /** Payment has been successfully processed */
  COMPLETED = 'COMPLETED',
  /** Payment processing failed */
  FAILED = 'FAILED',
  /** Payment was reversed/refunded */
  REFUNDED = 'REFUNDED'
}

// ============================================================================
// SCHEDULING & CONFIGURATION TYPES
// ============================================================================

/**
 * Schedule interface for time-based planning
 * 
 * Flexible scheduling system supporting various frequencies
 * and patterns for training programs and activities.
 * 
 * @interface Schedule
 * @example
 * ```typescript
 * const schedule: Schedule = {
 *   days: ['Monday', 'Wednesday', 'Friday'],
 *   time: '09:00',
 *   frequency: 'weekly',
 *   duration: 60
 * }
 * ```
 */
export interface Schedule {
  /** Array of days when activity is scheduled */
  days: string[]
  /** Optional specific time for the activity (HH:MM format) */
  time?: string
  /** How often the schedule repeats */
  frequency: 'daily' | 'weekly' | 'monthly'
  /** Optional duration in minutes */
  duration?: number
}

/**
 * MealSchedule interface for nutrition planning
 * 
 * Organizes meals by type and day for comprehensive
 * meal planning and nutrition management.
 * 
 * @interface MealSchedule
 * @example
 * ```typescript
 * const mealSchedule: MealSchedule = {
 *   breakfast: [oatmealRecipe, fruitSmoothie],
 *   lunch: [chickenSalad],
 *   dinner: [salmonDinner],
 *   snacks: [proteinBar, nuts],
 *   days: ['Monday', 'Tuesday', 'Wednesday']
 * }
 * ```
 */
export interface MealSchedule {
  /** Optional array of breakfast recipes */
  breakfast?: Recipe[]
  /** Optional array of lunch recipes */
  lunch?: Recipe[]
  /** Optional array of dinner recipes */
  dinner?: Recipe[]
  /** Optional array of snack recipes */
  snacks?: Recipe[]
  /** Days this meal schedule applies to */
  days: string[]
}

// ============================================================================
// DASHBOARD & ANALYTICS TYPES
// ============================================================================

/**
 * DashboardStats interface for trainer analytics
 * 
 * Key performance indicators and metrics for trainer
 * dashboard displays and business analytics.
 * 
 * @interface DashboardStats
 * @example
 * ```typescript
 * const stats: DashboardStats = {
 *   totalClients: 25,
 *   activeClients: 20,
 *   todaySessions: 6,
 *   monthlyRevenue: 4500.00,
 *   progressCompletion: 85.5
 * }
 * ```
 */
export interface DashboardStats {
  /** Total number of clients ever registered */
  totalClients: number
  /** Number of currently active clients */
  activeClients: number
  /** Number of sessions scheduled for today */
  todaySessions: number
  /** Revenue generated this month in currency units */
  monthlyRevenue: number
  /** Average client progress completion percentage */
  progressCompletion: number
}

/**
 * ClientDashboardData interface for client-specific dashboard information
 * 
 * Aggregated data structure for displaying comprehensive client
 * information on dashboard views with current plans and recent activity.
 * 
 * @interface ClientDashboardData
 * @example
 * ```typescript
 * const clientData: ClientDashboardData = {
 *   client: client,
 *   currentTrainingPlan: activeTrainingPlan,
 *   currentMealPlan: activeMealPlan,
 *   recentProgress: [latestProgressLog],
 *   upcomingSessions: [nextSession, followingSession]
 * }
 * ```
 */
export interface ClientDashboardData {
  /** The client object with complete profile information */
  client: Client
  /** Currently active training plan, if any */
  currentTrainingPlan?: TrainingPlan
  /** Currently active meal plan, if any */
  currentMealPlan?: MealPlan
  /** Array of recent progress log entries */
  recentProgress: ProgressLog[]
  /** Array of upcoming scheduled sessions */
  upcomingSessions: SessionBooking[]
}

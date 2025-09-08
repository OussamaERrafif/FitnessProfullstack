export interface Trainer {
  id: string
  name: string
  email: string
  subscription: string
  clients: Client[]
  createdAt: Date
  updatedAt: Date
}

export interface Client {
  id: string
  name: string
  email?: string
  pin: string
  age?: number
  weight?: number
  height?: number
  goals?: string
  healthData?: Record<string, unknown>
  trainerId: string
  trainer: Trainer
  trainingPlans: TrainingPlan[]
  mealPlans: MealPlan[]
  progressLogs: ProgressLog[]
  sessions: SessionBooking[]
  createdAt: Date
  updatedAt: Date
}

export interface TrainingPlan {
  id: string
  title: string
  description?: string
  exercises: Exercise[]
  schedule: Schedule
  clientId: string
  client: Client
  createdAt: Date
  updatedAt: Date
}

export interface MealPlan {
  id: string
  title: string
  description?: string
  recipes: Recipe[]
  schedule: MealSchedule
  clientId: string
  client: Client
  createdAt: Date
  updatedAt: Date
}

export interface Exercise {
  id: string
  name: string
  description?: string
  category: string
  muscleGroups: string[]
  instructions: string
  imageUrl?: string
  videoUrl?: string
  sets?: number
  reps?: number
  duration?: number
  weight?: number
  restTime?: number
}

export interface Recipe {
  id: string
  name: string
  description?: string
  ingredients: Ingredient[]
  instructions: string
  nutrition: NutritionInfo
  imageUrl?: string
  category?: string
  dietTags?: string[]
  prepTime?: number
  cookTime?: number
  servings?: number
}

export interface Ingredient {
  id: string
  name: string
  amount: number
  unit: string
}

export interface NutritionInfo {
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber?: number
  sugar?: number
  sodium?: number
}

export interface SessionBooking {
  id: string
  date: Date
  duration: number
  type: SessionType
  status: SessionStatus
  notes?: string
  trainerId: string
  trainer: Trainer
  clientId?: string
  client?: Client
  createdAt: Date
  updatedAt: Date
}

export interface ProgressLog {
  id: string
  date: Date
  weight?: number
  bodyFat?: number
  muscleMass?: number
  notes?: string
  measurements?: Record<string, number>
  photos?: string[]
  clientId: string
  client: Client
  createdAt: Date
  updatedAt: Date
}

export interface Payment {
  id: string
  amount: number
  currency: string
  status: PaymentStatus
  stripePaymentIntentId?: string
  description?: string
  trainerId: string
  trainer: Trainer
  createdAt: Date
  updatedAt: Date
}

export enum UserRole {
  TRAINER = 'TRAINER',
  CLIENT = 'CLIENT',
  ADMIN = 'ADMIN'
}

export enum SessionType {
  PERSONAL_TRAINING = 'PERSONAL_TRAINING',
  GROUP_CLASS = 'GROUP_CLASS',
  CONSULTATION = 'CONSULTATION',
  VIRTUAL = 'VIRTUAL'
}

export enum SessionStatus {
  SCHEDULED = 'SCHEDULED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

export interface Schedule {
  days: string[]
  time?: string
  frequency: 'daily' | 'weekly' | 'monthly'
  duration?: number
}

export interface MealSchedule {
  breakfast?: Recipe[]
  lunch?: Recipe[]
  dinner?: Recipe[]
  snacks?: Recipe[]
  days: string[]
}

export interface DashboardStats {
  totalClients: number
  activeClients: number
  todaySessions: number
  monthlyRevenue: number
  progressCompletion: number
}

export interface ClientDashboardData {
  client: Client
  currentTrainingPlan?: TrainingPlan
  currentMealPlan?: MealPlan
  recentProgress: ProgressLog[]
  upcomingSessions: SessionBooking[]
}

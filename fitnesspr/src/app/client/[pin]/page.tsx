"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { 
  Dumbbell, 
  Apple, 
  TrendingUp, 
  LogOut,
  MessageSquare,
  Plus,
  Target,
  Clock,
  RefreshCw,
  CheckCircle
} from "lucide-react"
import { clientsService } from "@/lib/clients-service"
import { programsService, type ProgramExercise } from "@/lib/programs-service"
import { mealsService, type MealPlanMeal } from "@/lib/meals-service"
import { type ProgressEntry, type Goal } from "@/lib/progress-service"

interface ClientDashboardData {
  client: any
  trainer?: {
    id: string
    name: string
    email: string
    specialization?: string
  }
  currentProgram?: any
  currentMealPlan?: any
  recentProgress: ProgressEntry[]
  goals: Goal[]
  workoutStats: any
  nutritionSummary: any
}

interface TodayData {
  exercises: ProgramExercise[]
  meals: MealPlanMeal[]
}

interface ClientDashboardProps {
  params: Promise<{ pin: string }>
}

export default function ClientDashboard({ params }: ClientDashboardProps) {
  const [dashboardData, setDashboardData] = useState<ClientDashboardData | null>(null)
  const [todayData, setTodayData] = useState<TodayData>({ exercises: [], meals: [] })
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const fetchDashboardData = async (pin: string) => {
    try {
      // First verify PIN and get basic client info
      const client = await clientsService.verifyClientPin(pin)
      
      // Get comprehensive dashboard data
      const dashboardData = await clientsService.getClientDashboardData(client.id)
      
      // Get today's specific data
      const [todayExercises, todayMeals] = await Promise.all([
        programsService.getTodayWorkout(client.id),
        mealsService.getTodayMeals(client.id)
      ])

      setDashboardData(dashboardData)
      setTodayData({
        exercises: todayExercises,
        meals: todayMeals
      })
      setError("")
    } catch (err) {
      setError("Unable to load your dashboard. Please try again.")
      console.error('Error fetching client data:', err)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        const resolvedParams = await params
        await fetchDashboardData(resolvedParams.pin)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [params])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      const resolvedParams = await params
      await fetchDashboardData(resolvedParams.pin)
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleExerciseComplete = async (programId: string, exerciseId: string) => {
    try {
      await programsService.markExerciseCompleted(programId, exerciseId)
      // Update local state
      setTodayData(prev => ({
        ...prev,
        exercises: prev.exercises.map(ex => 
          ex.id === exerciseId ? { ...ex, completed: true } : ex
        )
      }))
    } catch (error) {
      console.error('Failed to mark exercise as completed:', error)
    }
  }

  const handleMealComplete = async (mealPlanId: string, mealPlanMealId: string) => {
    try {
      await mealsService.markMealCompleted(mealPlanId, mealPlanMealId)
      // Update local state
      setTodayData(prev => ({
        ...prev,
        meals: prev.meals.map(meal => 
          meal.id === mealPlanMealId ? { ...meal, is_completed: true } : meal
        )
      }))
    } catch (error) {
      console.error('Failed to mark meal as completed:', error)
    }
  }

  const handleSignOut = () => {
    router.push('/client/pin-login')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (error || !dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => router.push('/client/pin-login')} className="w-full">
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { client, trainer, workoutStats, nutritionSummary, recentProgress, goals } = dashboardData
  const { exercises: todayExercises, meals: todayMeals } = todayData
  
  // Calculate progress metrics
  const completedExercises = todayExercises.filter(ex => ex.completed).length
  const exerciseProgress = todayExercises.length > 0 ? (completedExercises / todayExercises.length) * 100 : 0
  
  const completedMeals = todayMeals.filter(meal => meal.is_completed).length
  const mealProgress = todayMeals.length > 0 ? (completedMeals / todayMeals.length) * 100 : 0
  
  const currentWeight = recentProgress.length > 0 && recentProgress[0].measurement_type === 'weight' 
    ? recentProgress[0].value : 0
  const prevWeight = recentProgress.length > 1 && recentProgress[1].measurement_type === 'weight' 
    ? recentProgress[1].value : currentWeight
  const weightChange = currentWeight - prevWeight

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Welcome back, {client.name}</h1>
              <p className="text-sm text-gray-600">
                Trainer: {trainer?.name || 'Not assigned'}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Workouts</CardTitle>
              <Dumbbell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-2">
                <div className="text-2xl font-bold">{completedExercises}/{todayExercises.length}</div>
                <Target className="h-4 w-4 text-blue-600" />
              </div>
              <Progress value={exerciseProgress} className="mb-2" />
              <p className="text-xs text-muted-foreground">exercises completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Nutrition</CardTitle>
              <Apple className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-2">
                <div className="text-2xl font-bold">{completedMeals}/{todayMeals.length}</div>
                <Clock className="h-4 w-4 text-green-600" />
              </div>
              <Progress value={mealProgress} className="mb-2" />
              <p className="text-xs text-muted-foreground">meals logged</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Weight Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-2">
                <div className="text-2xl font-bold">{currentWeight || '--'} kg</div>
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </div>
              <p className="text-xs text-muted-foreground">
                {currentWeight > 0 ? `${weightChange >= 0 ? '+' : ''}${weightChange.toFixed(1)} kg since last log` : 'No data'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Weekly Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-2">
                <div className="text-2xl font-bold">{workoutStats?.total_workouts || 0}</div>
                <Target className="h-4 w-4 text-orange-600" />
              </div>
              <p className="text-xs text-muted-foreground">workouts this week</p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Tabs */}
        <Tabs defaultValue="training" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="training">Training</TabsTrigger>
            <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
          </TabsList>

          {/* Training Tab */}
          <TabsContent value="training" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Today's Workout</CardTitle>
                <CardDescription>
                  {dashboardData.currentProgram ? dashboardData.currentProgram.name : "No active program"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {todayExercises.length > 0 ? (
                  <div className="space-y-4">
                    {todayExercises.map((exercise) => (
                      <div key={exercise.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Dumbbell className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">{exercise.exercise.name}</p>
                            <p className="text-sm text-gray-600">
                              {exercise.sets} sets • {exercise.reps} reps
                              {exercise.weight && ` • ${exercise.weight}kg`}
                            </p>
                            {exercise.notes && (
                              <p className="text-xs text-gray-500 mt-1">{exercise.notes}</p>
                            )}
                          </div>
                        </div>
                        {exercise.completed ? (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Completed
                          </Badge>
                        ) : (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleExerciseComplete(dashboardData.currentProgram?.id, exercise.id)}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Mark Complete
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Dumbbell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No exercises scheduled for today</p>
                    <p className="text-sm">Check back tomorrow or contact your trainer</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Nutrition Tab */}
          <TabsContent value="nutrition" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Today's Meals</CardTitle>
                <CardDescription>
                  {nutritionSummary ? 
                    `${nutritionSummary.total_calories || 0} calories • ${nutritionSummary.total_protein || 0}g protein` :
                    "Track your daily nutrition"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {todayMeals.length > 0 ? (
                  <div className="space-y-4">
                    {todayMeals.map((mealPlanMeal) => (
                      <div key={mealPlanMeal.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <Apple className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium">{mealPlanMeal.meal.name}</p>
                            <p className="text-sm text-gray-600">
                              {mealPlanMeal.meal.meal_type} • {mealPlanMeal.meal.calories_per_serving || 0} calories
                              {mealPlanMeal.portions > 1 && ` • ${mealPlanMeal.portions} portions`}
                            </p>
                            {mealPlanMeal.meal.description && (
                              <p className="text-xs text-gray-500 mt-1">{mealPlanMeal.meal.description}</p>
                            )}
                          </div>
                        </div>
                        {mealPlanMeal.is_completed ? (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Logged
                          </Badge>
                        ) : (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleMealComplete(dashboardData.currentMealPlan?.id, mealPlanMeal.id)}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Log Meal
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Apple className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No meals planned for today</p>
                    <p className="text-sm">Contact your trainer to set up a meal plan</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Weight Tracking</CardTitle>
                  <CardDescription>Your recent weight measurements</CardDescription>
                </CardHeader>
                <CardContent>
                  {recentProgress.length > 0 ? (
                    <div className="space-y-4">
                      {recentProgress.slice(0, 5).map((entry) => (
                        <div key={entry.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-semibold">{entry.value} {entry.unit}</p>
                            <p className="text-sm text-gray-600">
                              {new Date(entry.date).toLocaleDateString()}
                            </p>
                          </div>
                          {entry.notes && (
                            <p className="text-sm italic text-gray-600">"{entry.notes}"</p>
                          )}
                        </div>
                      ))}
                      <Button className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Log New Weight
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No progress data yet</p>
                      <Button className="mt-4">
                        <Plus className="h-4 w-4 mr-2" />
                        Log Your First Entry
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Workout Statistics</CardTitle>
                  <CardDescription>Your fitness achievements</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm font-medium">Total Workouts</span>
                      <span className="text-lg font-bold text-blue-600">
                        {workoutStats?.total_workouts || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="text-sm font-medium">Average Duration</span>
                      <span className="text-lg font-bold text-green-600">
                        {workoutStats?.average_duration || 0} min
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                      <span className="text-sm font-medium">Weekly Frequency</span>
                      <span className="text-lg font-bold text-purple-600">
                        {workoutStats?.workout_frequency || 0}/week
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Goals Tab */}
          <TabsContent value="goals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Your Fitness Goals</CardTitle>
                <CardDescription>Track your objectives and achievements</CardDescription>
              </CardHeader>
              <CardContent>
                {goals.length > 0 ? (
                  <div className="space-y-4">
                    {goals.map((goal) => (
                      <div key={goal.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium">{goal.title}</h3>
                          <Badge 
                            variant={goal.status === 'achieved' ? 'default' : 'secondary'}
                            className={goal.status === 'achieved' ? 'bg-green-100 text-green-800' : ''}
                          >
                            {goal.status}
                          </Badge>
                        </div>
                        {goal.description && (
                          <p className="text-sm text-gray-600 mb-2">{goal.description}</p>
                        )}
                        {goal.target_value && (
                          <div className="text-sm text-gray-500">
                            Target: {goal.target_value} {goal.target_unit}
                            {goal.current_value && ` • Current: ${goal.current_value} ${goal.target_unit}`}
                          </div>
                        )}
                        {goal.target_date && (
                          <div className="text-sm text-gray-500">
                            Target Date: {new Date(goal.target_date).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No goals set yet</p>
                    <p className="text-sm mb-4">Work with your trainer to set some fitness goals</p>
                    <Button variant="outline">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Contact Trainer
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
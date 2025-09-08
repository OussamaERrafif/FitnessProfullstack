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
  Calendar,
  LogOut,
  MessageSquare,
  Plus
} from "lucide-react"
import { clientsService } from "@/lib/clients-service"

interface ClientData {
  id: string
  name: string
  email: string
  pin: string
  trainer: string
  currentTrainingPlan: {
    title: string
    description: string
    exercises: Array<{
      id: number
      name: string
      sets: string
      completed: boolean
    }>
  }
  currentMealPlan: {
    title: string
    todaysMeals: Array<{
      id: number
      name: string
      type: string
      calories: number
      completed: boolean
    }>
  }
  recentProgress: Array<{
    date: string
    weight: number
    notes: string
  }>
  currentGoal: string
}

interface ClientDashboardProps {
  params: Promise<{
    pin: string
  }>
}

export default function ClientDashboard({ params }: ClientDashboardProps) {
  const [clientData, setClientData] = useState<ClientData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    const fetchClientData = async () => {
      try {
        const resolvedParams = await params
        
        // Use clientsService to verify PIN and get client data
        const client = await clientsService.verifyClientPin(resolvedParams.pin)
        
        // Transform the client data to match the expected ClientData interface
        const transformedData: ClientData = {
          id: client.id,
          name: client.name,
          email: client.email,
          pin: client.pin || resolvedParams.pin,
          trainer: "Your Trainer", // This would come from the trainer relationship
          currentTrainingPlan: {
            title: "Current Training Program",
            description: "Your personalized training program",
            exercises: [] // This would be fetched from programs/exercises API
          },
          currentMealPlan: {
            title: "Nutrition Plan",
            todaysMeals: [] // This would be fetched from meals API
          },
          recentProgress: [], // This would be fetched from progress API
          currentGoal: client.goals || "No goals set"
        }
        
        setClientData(transformedData)
      } catch (err) {
        setError("Unable to load your dashboard. Please try again.")
        console.error('Error fetching client data:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchClientData()
  }, [params])

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

  if (error || !clientData) {
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

  const { currentTrainingPlan, currentMealPlan, recentProgress, currentGoal } = clientData
  
  const completedExercises = currentTrainingPlan.exercises.filter(ex => ex.completed).length
  const exerciseProgress = (completedExercises / currentTrainingPlan.exercises.length) * 100
  
  const completedMeals = currentMealPlan.todaysMeals.filter(meal => meal.completed).length
  const mealProgress = (completedMeals / currentMealPlan.todaysMeals.length) * 100

  const currentWeight = recentProgress[0]?.weight || 0
  const previousWeight = recentProgress[1]?.weight || currentWeight
  const weightChange = currentWeight - previousWeight

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {clientData.name}!
              </h1>
              <p className="text-sm text-gray-600">Trainer: {clientData.trainer}</p>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Workout</CardTitle>
              <Dumbbell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-2">
                <div className="text-2xl font-bold">{completedExercises}/{currentTrainingPlan.exercises.length}</div>
                <Dumbbell className="h-4 w-4 text-blue-600" />
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
                <div className="text-2xl font-bold">{completedMeals}/{currentMealPlan.todaysMeals.length}</div>
                <Apple className="h-4 w-4 text-green-600" />
              </div>
              <Progress value={mealProgress} className="mb-2" />
              <p className="text-xs text-muted-foreground">meals completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Weight Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-2">
                <div className="text-2xl font-bold">{currentWeight} kg</div>
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </div>
              <p className="text-xs text-muted-foreground">
                {weightChange >= 0 ? '+' : ''}{weightChange.toFixed(1)} kg since last log
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Tabs */}
        <Tabs defaultValue="training" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="training">Training</TabsTrigger>
            <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
          </TabsList>

          {/* Training Tab */}
          <TabsContent value="training" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">{currentTrainingPlan.title}</CardTitle>
                <CardDescription>{currentTrainingPlan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {currentTrainingPlan.exercises.map((exercise) => (
                    <div key={exercise.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Dumbbell className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{exercise.name}</p>
                          <p className="text-sm text-gray-600">{exercise.sets}</p>
                        </div>
                      </div>
                      {exercise.completed ? (
                        <Badge className="bg-green-100 text-green-800">Completed</Badge>
                      ) : (
                        <Button size="sm" variant="outline">
                          <Plus className="h-4 w-4 mr-1" />
                          Mark Complete
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Nutrition Tab */}
          <TabsContent value="nutrition" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">{currentMealPlan.title}</CardTitle>
                <CardDescription>Today's meals and nutrition targets</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {currentMealPlan.todaysMeals.map((meal) => (
                    <div key={meal.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Apple className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">{meal.name}</p>
                          <p className="text-sm text-gray-600">{meal.type} • {meal.calories} calories</p>
                        </div>
                      </div>
                      {meal.completed ? (
                        <Badge className="bg-green-100 text-green-800">Logged</Badge>
                      ) : (
                        <Button size="sm" variant="outline">
                          <Plus className="h-4 w-4 mr-1" />
                          Log Meal
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
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
                  <div className="space-y-4">
                    {recentProgress.map((entry, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-semibold">{entry.weight} kg</p>
                          <p className="text-sm text-gray-600">{entry.date}</p>
                        </div>
                        <p className="text-sm italic text-gray-600">"{entry.notes}"</p>
                      </div>
                    ))}
                    <Button className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Log New Weight
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Goals</CardTitle>
                  <CardDescription>Your fitness objectives</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-blue-900">Current Goal</p>
                      <p className="text-blue-800">{currentGoal}</p>
                    </div>
                    <Button className="w-full" variant="outline">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Send Feedback to Trainer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Sessions Tab */}
          <TabsContent value="sessions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Upcoming Sessions</CardTitle>
                <CardDescription>Your scheduled training sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No upcoming sessions scheduled</p>
                  <p className="text-sm">Contact your trainer to book a session</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
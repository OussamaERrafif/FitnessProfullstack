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
  Clock,
  Target,
  LogOut,
  MessageSquare 
} from "lucide-react"

// Mock client data
const mockClientData = {
  client: {
    id: "1",
    name: "Sarah Johnson",
    pin: "123456",
    goals: "Weight loss and strength building",
    trainer: "Alex Thompson"
  },
  currentTrainingPlan: {
    id: "1",
    title: "Full Body Strength & Cardio",
    description: "4-week program focused on building strength and improving cardiovascular health",
    exercises: [
      { name: "Push-ups", sets: 3, reps: 12, completed: true },
      { name: "Squats", sets: 3, reps: 15, completed: true },
      { name: "Plank", sets: 3, duration: "30s", completed: false },
      { name: "Jumping Jacks", sets: 2, reps: 20, completed: false },
    ]
  },
  currentMealPlan: {
    id: "1",
    title: "Balanced Nutrition Plan",
    todaysMeals: [
      { name: "Greek Yogurt with Berries", type: "Breakfast", calories: 250, completed: true },
      { name: "Grilled Chicken Salad", type: "Lunch", calories: 400, completed: true },
      { name: "Apple with Almond Butter", type: "Snack", calories: 180, completed: false },
      { name: "Salmon with Vegetables", type: "Dinner", calories: 450, completed: false },
    ]
  },
  recentProgress: [
    { date: "2025-09-06", weight: 68.2, notes: "Feeling stronger!" },
    { date: "2025-09-04", weight: 68.5, notes: "Great workout today" },
    { date: "2025-09-02", weight: 68.8, notes: "Starting to see progress" },
  ],
  upcomingSessions: [
    { date: "2025-09-08", time: "10:00", type: "Personal Training" },
    { date: "2025-09-10", time: "14:30", type: "Consultation" },
  ]
}

interface ClientDashboardProps {
  params: {
    pin: string
  }
}

export default function ClientDashboard({ params }: ClientDashboardProps) {
  const { client, currentTrainingPlan, currentMealPlan, recentProgress, upcomingSessions } = mockClientData
  
  const completedExercises = currentTrainingPlan.exercises.filter(ex => ex.completed).length
  const exerciseProgress = (completedExercises / currentTrainingPlan.exercises.length) * 100
  
  const completedMeals = currentMealPlan.todaysMeals.filter(meal => meal.completed).length
  const mealProgress = (completedMeals / currentMealPlan.todaysMeals.length) * 100

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Welcome back, {client.name}!</h1>
              <p className="text-gray-600">Trainer: {client.trainer}</p>
            </div>
            <Button variant="outline" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Progress Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Today's Workout</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-bold">{completedExercises}/{currentTrainingPlan.exercises.length}</span>
                <Dumbbell className="h-5 w-5 text-blue-600" />
              </div>
              <Progress value={exerciseProgress} className="mb-2" />
              <p className="text-sm text-gray-600">exercises completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Today's Nutrition</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-bold">{completedMeals}/{currentMealPlan.todaysMeals.length}</span>
                <Apple className="h-5 w-5 text-green-600" />
              </div>
              <Progress value={mealProgress} className="mb-2" />
              <p className="text-sm text-gray-600">meals completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Weight Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-bold">{recentProgress[0]?.weight} kg</span>
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <p className="text-sm text-gray-600">
                {recentProgress.length > 1 && 
                  `${(recentProgress[0].weight - recentProgress[1].weight).toFixed(1)} kg since last log`
                }
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="training" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="training">Training</TabsTrigger>
            <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
          </TabsList>

          <TabsContent value="training">
            <Card>
              <CardHeader>
                <CardTitle>{currentTrainingPlan.title}</CardTitle>
                <CardDescription>{currentTrainingPlan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {currentTrainingPlan.exercises.map((exercise, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          exercise.completed ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-400'
                        }`}>
                          <Dumbbell className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium">{exercise.name}</p>
                          <p className="text-sm text-gray-600">
                            {exercise.sets} sets × {exercise.reps || exercise.duration}
                          </p>
                        </div>
                      </div>
                      {exercise.completed && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Completed
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="nutrition">
            <Card>
              <CardHeader>
                <CardTitle>{currentMealPlan.title}</CardTitle>
                <CardDescription>Today's meals and nutrition targets</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {currentMealPlan.todaysMeals.map((meal, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          meal.completed ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-400'
                        }`}>
                          <Apple className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium">{meal.name}</p>
                          <p className="text-sm text-gray-600">
                            {meal.type} • {meal.calories} calories
                          </p>
                        </div>
                      </div>
                      {meal.completed && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Logged
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="progress">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Weight Tracking</CardTitle>
                  <CardDescription>Your recent weight measurements</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentProgress.map((entry, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{entry.weight} kg</p>
                          <p className="text-sm text-gray-600">{entry.date}</p>
                        </div>
                        {entry.notes && (
                          <p className="text-sm text-gray-600 italic">"{entry.notes}"</p>
                        )}
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    <Target className="h-4 w-4 mr-2" />
                    Log New Weight
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Goals</CardTitle>
                  <CardDescription>Your fitness objectives</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="font-medium text-blue-900">Current Goal</p>
                      <p className="text-blue-700">{client.goals}</p>
                    </div>
                    <Button variant="outline" className="w-full">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Send Feedback to Trainer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sessions">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Sessions</CardTitle>
                <CardDescription>Your scheduled training sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingSessions.map((session, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Calendar className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{session.type}</p>
                          <p className="text-sm text-gray-600">
                            {session.date} at {session.time}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">Scheduled</Badge>
                    </div>
                  ))}
                </div>
                {upcomingSessions.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No upcoming sessions scheduled</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

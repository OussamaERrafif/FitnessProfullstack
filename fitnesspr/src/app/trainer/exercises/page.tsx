import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Plus, Search, Filter, Dumbbell, Users } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: 'Exercise Library | Trainer Dashboard',
  description: 'Browse and manage your exercise database',
}

// Mock exercises data
const mockExercises = [
  {
    id: "1",
    name: "Barbell Back Squat",
    category: "Compound",
    muscleGroups: ["Quadriceps", "Glutes", "Core"],
    equipment: "Barbell",
    difficulty: "Intermediate",
    instructions: "Stand with feet hip-width apart, barbell on upper back...",
    videoUrl: "/videos/squat.mp4",
    tags: ["strength", "lower-body", "compound"],
    usageCount: 45,
    isFavorite: true
  },
  {
    id: "2",
    name: "Push-ups",
    category: "Bodyweight",
    muscleGroups: ["Chest", "Shoulders", "Triceps"],
    equipment: "None",
    difficulty: "Beginner",
    instructions: "Start in plank position, lower chest to ground...",
    videoUrl: "/videos/pushup.mp4",
    tags: ["bodyweight", "upper-body", "compound"],
    usageCount: 67,
    isFavorite: true
  },
  {
    id: "3",
    name: "Deadlift",
    category: "Compound", 
    muscleGroups: ["Hamstrings", "Glutes", "Back"],
    equipment: "Barbell",
    difficulty: "Advanced",
    instructions: "Stand with feet hip-width apart, grip barbell...",
    videoUrl: "/videos/deadlift.mp4",
    tags: ["strength", "compound", "posterior"],
    usageCount: 38,
    isFavorite: false
  },
  {
    id: "4",
    name: "Plank",
    category: "Core",
    muscleGroups: ["Core", "Shoulders"],
    equipment: "None", 
    difficulty: "Beginner",
    instructions: "Hold a straight line from head to heels...",
    videoUrl: "/videos/plank.mp4",
    tags: ["core", "bodyweight", "isometric"],
    usageCount: 52,
    isFavorite: true
  },
  {
    id: "5",
    name: "Dumbbell Bicep Curls",
    category: "Isolation",
    muscleGroups: ["Biceps"],
    equipment: "Dumbbells",
    difficulty: "Beginner",
    instructions: "Stand with dumbbells at sides, curl up...",
    videoUrl: "/videos/bicep-curls.mp4",
    tags: ["isolation", "upper-body", "arms"],
    usageCount: 29,
    isFavorite: false
  }
]

const exerciseCategories = [
  { name: "Compound", count: 42, description: "Multi-joint movements" },
  { name: "Isolation", count: 38, description: "Single muscle focus" },
  { name: "Bodyweight", count: 35, description: "No equipment needed" },
  { name: "Core", count: 28, description: "Core strengthening" },
  { name: "Cardio", count: 24, description: "Cardiovascular exercises" },
  { name: "Flexibility", count: 18, description: "Stretching & mobility" }
]

const muscleGroups = [
  "Chest", "Back", "Shoulders", "Arms", "Core", "Legs", "Glutes", "Calves"
]

export default function ExerciseLibrary() {
  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Exercise Library</h1>
            <p className="text-gray-600 mt-1">Browse and manage your comprehensive exercise database</p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" asChild>
              <Link href="/trainer/exercises/favorites">
                <BookOpen className="h-4 w-4 mr-2" />
                Favorites
              </Link>
            </Button>
            <Button asChild>
              <Link href="/trainer/exercises/new">
                <Plus className="h-4 w-4 mr-2" />
                Add Exercise
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Exercises</CardTitle>
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">185</div>
            <p className="text-xs text-muted-foreground">
              Across all categories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Used</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Push-ups</div>
            <p className="text-xs text-muted-foreground">
              67 times this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Favorites</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">
              Your saved exercises
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{exerciseCategories.length}</div>
            <p className="text-xs text-muted-foreground">
              Exercise types
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
              <CardDescription>Filter by exercise type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {exerciseCategories.map((category) => (
                  <div key={category.name} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <div>
                      <p className="font-medium text-sm">{category.name}</p>
                      <p className="text-xs text-gray-500">{category.description}</p>
                    </div>
                    <Badge variant="outline">{category.count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Muscle Groups</CardTitle>
              <CardDescription>Target specific muscles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-2">
                {muscleGroups.map((muscle) => (
                  <Button key={muscle} variant="outline" size="sm" className="justify-start">
                    {muscle}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Exercise List */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Exercise Database</CardTitle>
                  <CardDescription>Browse and select exercises for your programs</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockExercises.map((exercise) => (
                  <div
                    key={exercise.id}
                    className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-semibold text-lg">{exercise.name}</h4>
                          {exercise.isFavorite && (
                            <Badge variant="secondary">★ Favorite</Badge>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{exercise.instructions}</p>
                        
                        <div className="flex flex-wrap gap-2 mb-2">
                          {exercise.muscleGroups.map((muscle) => (
                            <Badge key={muscle} variant="outline" className="text-xs">
                              {muscle}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="text-right ml-4">
                        <Badge variant={
                          exercise.difficulty === 'Beginner' ? 'secondary' :
                          exercise.difficulty === 'Intermediate' ? 'default' : 'destructive'
                        }>
                          {exercise.difficulty}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                      <div>
                        <span className="text-gray-500">Category:</span>
                        <p className="font-medium">{exercise.category}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Equipment:</span>
                        <p className="font-medium">{exercise.equipment}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Used:</span>
                        <p className="font-medium">{exercise.usageCount} times</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Tags:</span>
                        <p className="font-medium">{exercise.tags.join(", ")}</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-3 border-t">
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                        <Button size="sm" variant="outline">
                          Add to Program
                        </Button>
                        <Button size="sm" variant="outline">
                          {exercise.isFavorite ? "Remove Favorite" : "Add Favorite"}
                        </Button>
                      </div>
                      <Button size="sm">
                        Use Exercise
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 flex justify-center">
                <Button variant="outline">
                  Load More Exercises
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

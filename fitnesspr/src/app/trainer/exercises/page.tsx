"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { BookOpen, Plus, Search, Filter, Dumbbell, Users, Loader2 } from "lucide-react"
import Link from "next/link"
import { exercisesService, Exercise, ExerciseSearchQuery } from "@/lib/exercises-service"
import { authService } from "@/lib/auth-service"

export default function ExerciseLibrary() {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [muscleGroups, setMuscleGroups] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string | null>(null)

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Check if user is authenticated
      if (!authService.isAuthenticated()) {
        setError('Please log in to view exercises')
        return
      }

      // Load exercises, categories, and muscle groups in parallel
      const [exercisesResponse, categoriesResponse, muscleGroupsResponse] = await Promise.all([
        exercisesService.getExercises(0, 100),
        exercisesService.getCategories(),
        exercisesService.getMuscleGroups()
      ])

      setExercises(exercisesResponse.exercises)
      setCategories(categoriesResponse)
      setMuscleGroups(muscleGroupsResponse)
    } catch (err: any) {
      console.error('Failed to load exercise data:', err)
      setError('Failed to load exercises. Using demo data for now.')
      
      // Fallback to mock data for demo purposes
      setExercises([
        {
          id: "1",
          name: "Barbell Back Squat",
          category: "Compound",
          muscle_groups: "Quadriceps, Glutes, Core",
          equipment_needed: "Barbell",
          difficulty_level: "intermediate",
          instructions: "Stand with feet hip-width apart, barbell on upper back...",
          created_at: "2025-01-01T00:00:00Z",
          updated_at: "2025-01-01T00:00:00Z",
        },
        {
          id: "2",
          name: "Push-ups",
          category: "Bodyweight",
          muscle_groups: "Chest, Shoulders, Triceps",
          equipment_needed: "None",
          difficulty_level: "beginner",
          instructions: "Start in plank position, lower chest to ground...",
          created_at: "2025-01-01T00:00:00Z",
          updated_at: "2025-01-01T00:00:00Z",
        },
        {
          id: "3",
          name: "Deadlift",
          category: "Compound", 
          muscle_groups: "Hamstrings, Glutes, Back",
          equipment_needed: "Barbell",
          difficulty_level: "advanced",
          instructions: "Stand with feet hip-width apart, grip barbell...",
          created_at: "2025-01-01T00:00:00Z",
          updated_at: "2025-01-01T00:00:00Z",
        },
        {
          id: "4",
          name: "Plank",
          category: "Core",
          muscle_groups: "Core, Shoulders",
          equipment_needed: "None", 
          difficulty_level: "beginner",
          instructions: "Hold a straight line from head to heels...",
          created_at: "2025-01-01T00:00:00Z",
          updated_at: "2025-01-01T00:00:00Z",
        },
        {
          id: "5",
          name: "Dumbbell Bicep Curls",
          category: "Isolation",
          muscle_groups: "Biceps",
          equipment_needed: "Dumbbells",
          difficulty_level: "beginner",
          instructions: "Stand with dumbbells at sides, curl up...",
          created_at: "2025-01-01T00:00:00Z",
          updated_at: "2025-01-01T00:00:00Z",
        }
      ])
      
      setCategories(["Compound", "Isolation", "Bodyweight", "Core", "Cardio", "Flexibility"])
      setMuscleGroups(["Chest", "Back", "Shoulders", "Arms", "Core", "Legs", "Glutes", "Calves"])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchTerm && !selectedCategory && !selectedMuscleGroup) {
      loadInitialData()
      return
    }

    try {
      setLoading(true)
      const searchQuery: ExerciseSearchQuery = {}
      
      if (selectedCategory) searchQuery.category = selectedCategory
      if (selectedMuscleGroup) searchQuery.muscle_groups = selectedMuscleGroup
      if (searchTerm) searchQuery.name = searchTerm

      const response = await exercisesService.searchExercises(searchQuery)
      setExercises(response.exercises)
    } catch (err: any) {
      console.error('Failed to search exercises:', err)
      setError('Search failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const filteredExercises = exercises.filter(exercise =>
    exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exercise.muscle_groups.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exercise.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getDifficultyBadgeVariant = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'secondary'
      case 'intermediate': return 'default'
      case 'advanced': return 'destructive'
      default: return 'outline'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading exercises...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Exercise Library</h1>
            <p className="text-gray-600 mt-1">Browse and manage your comprehensive exercise database</p>
            {error && (
              <div className="mt-2 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
                {error}
              </div>
            )}
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={() => window.location.reload()}>
              <BookOpen className="h-4 w-4 mr-2" />
              Refresh
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
            <div className="text-2xl font-bold">{exercises.length}</div>
            <p className="text-xs text-muted-foreground">
              Across all categories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
            <p className="text-xs text-muted-foreground">
              Exercise types
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Muscle Groups</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{muscleGroups.length}</div>
            <p className="text-xs text-muted-foreground">
              Target areas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Beginner Friendly</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {exercises.filter(e => e.difficulty_level === 'beginner').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Easy to start
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Search & Filter</CardTitle>
              <CardDescription>Find specific exercises</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Search</label>
                  <Input
                    placeholder="Exercise name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button onClick={handleSearch} className="w-full">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
              <CardDescription>Filter by exercise type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button
                  variant={selectedCategory === null ? "default" : "outline"}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setSelectedCategory(null)}
                >
                  All Categories
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Button>
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
              <div className="space-y-2">
                <Button
                  variant={selectedMuscleGroup === null ? "default" : "outline"}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setSelectedMuscleGroup(null)}
                >
                  All Muscles
                </Button>
                {muscleGroups.map((muscle) => (
                  <Button
                    key={muscle}
                    variant={selectedMuscleGroup === muscle ? "default" : "outline"}
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => setSelectedMuscleGroup(muscle)}
                  >
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
                  <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                    Refresh
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredExercises.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Dumbbell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No exercises found</p>
                    <p className="text-sm">Try adjusting your search or filters</p>
                    <Button className="mt-4" asChild>
                      <Link href="/trainer/exercises/new">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Exercise
                      </Link>
                    </Button>
                  </div>
                ) : (
                  filteredExercises.map((exercise) => (
                    <div
                      key={exercise.id}
                      className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-semibold text-lg">{exercise.name}</h4>
                          </div>
                          <p className="text-gray-600 text-sm mb-2">
                            {exercise.instructions || exercise.description || "No instructions available"}
                          </p>
                          
                          <div className="flex flex-wrap gap-2 mb-2">
                            {exercise.muscle_groups.split(',').map((muscle, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {muscle.trim()}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div className="text-right ml-4">
                          <Badge variant={getDifficultyBadgeVariant(exercise.difficulty_level)}>
                            {exercise.difficulty_level}
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
                          <p className="font-medium">{exercise.equipment_needed || "None"}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Duration:</span>
                          <p className="font-medium">{exercise.duration_minutes ? `${exercise.duration_minutes} min` : "Variable"}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Calories:</span>
                          <p className="font-medium">{exercise.calories_burned || "N/A"}</p>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center pt-3 border-t">
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/trainer/exercises/${exercise.id}`}>
                              View Details
                            </Link>
                          </Button>
                          <Button size="sm" variant="outline">
                            Add to Program
                          </Button>
                        </div>
                        <Button size="sm">
                          Use Exercise
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              {filteredExercises.length > 0 && (
                <div className="mt-6 flex justify-center">
                  <Button variant="outline" onClick={loadInitialData}>
                    Load More Exercises
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

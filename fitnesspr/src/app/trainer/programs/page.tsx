"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dumbbell, Plus, Search, Users, Calendar, Clock, Loader2 } from "lucide-react"
import Link from "next/link"
import { programsService, Program } from "@/lib/programs-service"
import { authService } from "@/lib/auth-service"

export default function TrainingPrograms() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadPrograms()
  }, [])

  const loadPrograms = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Check if user is authenticated
      if (!authService.isAuthenticated()) {
        setError('Please log in to view programs')
        return
      }
      
      const response = await programsService.getPrograms()
      setPrograms(response.programs)
    } catch (err: any) {
      console.error('Failed to load programs:', err)
      setError('Failed to load programs. Using demo data for now.')
      
      // Fallback to mock data for demo purposes
      setPrograms([
        {
          id: "1",
          name: "Full Body Strength Training",
          description: "Complete strength training program focusing on all major muscle groups",
          duration_weeks: 8,
          sessions_per_week: 3,
          difficulty_level: "intermediate",
          category: "Strength",
          trainer_id: "1",
          is_active: true,
          created_at: "2025-01-01T00:00:00Z",
          updated_at: "2025-01-03T00:00:00Z",
        },
        {
          id: "2",
          name: "HIIT Fat Burn Program", 
          description: "High-intensity interval training for maximum calorie burn",
          duration_weeks: 6,
          sessions_per_week: 4,
          difficulty_level: "advanced",
          category: "Cardio",
          trainer_id: "1",
          is_active: true,
          created_at: "2024-12-20T00:00:00Z",
          updated_at: "2024-12-27T00:00:00Z",
        },
        {
          id: "3",
          name: "Beginner Fitness Foundation",
          description: "Perfect starting program for fitness newcomers",
          duration_weeks: 4,
          sessions_per_week: 3,
          difficulty_level: "beginner",
          category: "General",
          trainer_id: "1",
          is_active: true,
          created_at: "2025-01-02T00:00:00Z",
          updated_at: "2025-01-02T00:00:00Z",
        },
        {
          id: "4",
          name: "Powerlifting Prep",
          description: "Advanced powerlifting program for competition preparation",
          duration_weeks: 12,
          sessions_per_week: 4,
          difficulty_level: "advanced",
          category: "Powerlifting",
          trainer_id: "1",
          is_active: false,
          created_at: "2024-12-01T00:00:00Z",
          updated_at: "2024-12-01T00:00:00Z",
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async (programId: string, currentStatus: boolean) => {
    try {
      await programsService.toggleProgramStatus(programId, !currentStatus)
      await loadPrograms() // Reload to show updated status
    } catch (err) {
      console.error('Failed to toggle program status:', err)
      setError('Failed to update program status')
    }
  }

  const getTimeSince = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return "1 day ago"
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`
    return `${Math.ceil(diffDays / 30)} months ago`
  }

  const getDifficultyBadgeVariant = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'secondary'
      case 'intermediate': return 'default'
      case 'advanced': return 'destructive'
      default: return 'outline'
    }
  }

  const programStats = {
    totalPrograms: programs.length,
    activePrograms: programs.filter(p => p.is_active).length,
    totalSessions: programs.reduce((sum, p) => sum + (p.duration_weeks * p.sessions_per_week), 0),
    avgDuration: programs.length > 0 ? Math.round(programs.reduce((sum, p) => sum + p.duration_weeks, 0) / programs.length) : 0
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading programs...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Training Programs</h1>
            <p className="text-gray-600 mt-1">Create and manage workout programs for your clients</p>
            {error && (
              <div className="mt-2 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
                {error}
              </div>
            )}
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={loadPrograms}>
              <Dumbbell className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button asChild>
              <Link href="/trainer/programs/new">
                <Plus className="h-4 w-4 mr-2" />
                Create Program
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Programs</CardTitle>
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{programStats.totalPrograms}</div>
            <p className="text-xs text-muted-foreground">
              {programStats.activePrograms} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Programs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{programStats.activePrograms}</div>
            <p className="text-xs text-muted-foreground">
              Currently in use
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{programStats.totalSessions}</div>
            <p className="text-xs text-muted-foreground">
              Sessions designed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{programStats.avgDuration} weeks</div>
            <p className="text-xs text-muted-foreground">
              Program length
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Programs List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Your Programs</CardTitle>
                  <CardDescription>Manage your training programs</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={loadPrograms}>
                    <Search className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {programs.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Dumbbell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No programs yet</p>
                    <p className="text-sm">Create your first training program</p>
                    <Button className="mt-4" asChild>
                      <Link href="/trainer/programs/new">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Program
                      </Link>
                    </Button>
                  </div>
                ) : (
                  programs.map((program) => (
                    <div
                      key={program.id}
                      className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-lg">{program.name}</h4>
                          <p className="text-gray-600 text-sm mt-1">{program.description}</p>
                        </div>
                        <Badge variant={program.is_active ? "default" : "secondary"}>
                          {program.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Duration:</span>
                          <p className="font-medium">{program.duration_weeks} weeks</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Sessions/Week:</span>
                          <p className="font-medium">{program.sessions_per_week}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Difficulty:</span>
                          <Badge variant={getDifficultyBadgeVariant(program.difficulty_level)}>
                            {program.difficulty_level}
                          </Badge>
                        </div>
                        <div>
                          <span className="text-gray-500">Client:</span>
                          <p className="font-medium">{program.client_id ? 'Assigned' : 'Available'}</p>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center mt-4 pt-3 border-t">
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <Badge variant="outline">{program.category}</Badge>
                          <span>Updated {getTimeSince(program.updated_at)}</span>
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleToggleStatus(program.id, program.is_active)}
                          >
                            {program.is_active ? 'Deactivate' : 'Activate'}
                          </Button>
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/trainer/programs/${program.id}/edit`}>
                              Edit
                            </Link>
                          </Button>
                          <Button size="sm" asChild>
                            <Link href={`/trainer/programs/${program.id}`}>
                              View Details
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Templates */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common program tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button className="w-full justify-start" asChild>
                  <Link href="/trainer/programs/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Program
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/trainer/programs/templates">
                    <Dumbbell className="h-4 w-4 mr-2" />
                    Use Template
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={loadPrograms}>
                  <Search className="h-4 w-4 mr-2" />
                  Refresh Programs
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Popular Templates</CardTitle>
              <CardDescription>Get started with proven programs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: "Push/Pull/Legs Split", category: "Strength", popularity: "High" },
                  { name: "Upper/Lower Body Split", category: "Strength", popularity: "High" },
                  { name: "Circuit Training", category: "Cardio", popularity: "Medium" },
                  { name: "Core & Flexibility", category: "Flexibility", popularity: "Medium" }
                ].map((template, index) => (
                  <div key={index} className="p-3 border rounded hover:bg-gray-50 cursor-pointer">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-sm">{template.name}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" className="text-xs">{template.category}</Badge>
                          <span className="text-xs text-gray-500">{template.popularity} demand</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4" asChild>
                <Link href="/trainer/programs/templates">
                  View All Templates
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Program Analytics</CardTitle>
              <CardDescription>Performance insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Most Popular Category</span>
                  <span className="text-sm font-medium">
                    {programs.length > 0 && programs[0] ? programs[0].category : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Active Rate</span>
                  <span className="text-sm font-medium">
                    {programs.length > 0 ? Math.round((programStats.activePrograms / programStats.totalPrograms) * 100) : 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Avg Sessions/Week</span>
                  <span className="text-sm font-medium">
                    {programs.length > 0 ? Math.round(programs.reduce((sum, p) => sum + p.sessions_per_week, 0) / programs.length) : 0}
                  </span>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-4" asChild>
                <Link href="/trainer/reports">
                  View Detailed Analytics
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

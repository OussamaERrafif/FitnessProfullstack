import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dumbbell, Plus, Search, Users, Calendar, Clock } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: 'Training Programs | Trainer Dashboard',
  description: 'Create and manage workout programs for your clients',
}

// Mock training programs data
const mockPrograms = [
  {
    id: "1",
    name: "Full Body Strength Training",
    description: "Complete strength training program focusing on all major muscle groups",
    duration: "8 weeks",
    sessions: 24,
    difficulty: "Intermediate",
    assignedClients: 8,
    category: "Strength",
    lastUpdated: "2 days ago",
    isActive: true
  },
  {
    id: "2",
    name: "HIIT Fat Burn Program", 
    description: "High-intensity interval training for maximum calorie burn",
    duration: "6 weeks",
    sessions: 18,
    difficulty: "Advanced",
    assignedClients: 5,
    category: "Cardio",
    lastUpdated: "1 week ago",
    isActive: true
  },
  {
    id: "3",
    name: "Beginner Fitness Foundation",
    description: "Perfect starting program for fitness newcomers",
    duration: "4 weeks", 
    sessions: 12,
    difficulty: "Beginner",
    assignedClients: 12,
    category: "General",
    lastUpdated: "3 days ago",
    isActive: true
  },
  {
    id: "4",
    name: "Powerlifting Prep",
    description: "Advanced powerlifting program for competition preparation",
    duration: "12 weeks",
    sessions: 36,
    difficulty: "Advanced",
    assignedClients: 3,
    category: "Powerlifting",
    lastUpdated: "1 month ago",
    isActive: false
  }
]

const mockTemplates = [
  { name: "Push/Pull/Legs Split", category: "Strength", popularity: "High" },
  { name: "Upper/Lower Body Split", category: "Strength", popularity: "High" },
  { name: "Circuit Training", category: "Cardio", popularity: "Medium" },
  { name: "Core & Flexibility", category: "Flexibility", popularity: "Medium" }
]

export default function TrainingPrograms() {
  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Training Programs</h1>
            <p className="text-gray-600 mt-1">Create and manage workout programs for your clients</p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" asChild>
              <Link href="/trainer/programs/templates">
                <Dumbbell className="h-4 w-4 mr-2" />
                Browse Templates
              </Link>
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
            <div className="text-2xl font-bold">{mockPrograms.length}</div>
            <p className="text-xs text-muted-foreground">
              {mockPrograms.filter(p => p.isActive).length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockPrograms.reduce((sum, p) => sum + p.assignedClients, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all programs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockPrograms.reduce((sum, p) => sum + p.sessions, 0)}
            </div>
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
            <div className="text-2xl font-bold">7 weeks</div>
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
                  <Button variant="outline" size="sm">
                    <Search className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockPrograms.map((program) => (
                  <div
                    key={program.id}
                    className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-lg">{program.name}</h4>
                        <p className="text-gray-600 text-sm mt-1">{program.description}</p>
                      </div>
                      <Badge variant={program.isActive ? "default" : "secondary"}>
                        {program.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Duration:</span>
                        <p className="font-medium">{program.duration}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Sessions:</span>
                        <p className="font-medium">{program.sessions}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Difficulty:</span>
                        <p className="font-medium">{program.difficulty}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Clients:</span>
                        <p className="font-medium">{program.assignedClients}</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mt-4 pt-3 border-t">
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <Badge variant="outline">{program.category}</Badge>
                        <span>Updated {program.lastUpdated}</span>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          Edit
                        </Button>
                        <Button size="sm" variant="outline">
                          Assign
                        </Button>
                        <Button size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
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
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/trainer/programs/import">
                    <Search className="h-4 w-4 mr-2" />
                    Import Program
                  </Link>
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
                {mockTemplates.map((template, index) => (
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
              <Button variant="outline" className="w-full mt-4">
                View All Templates
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
                  <span className="text-sm">Most Popular Program</span>
                  <span className="text-sm font-medium">Beginner Foundation</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Highest Completion Rate</span>
                  <span className="text-sm font-medium">94%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Avg Client Satisfaction</span>
                  <span className="text-sm font-medium">4.8/5</span>
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

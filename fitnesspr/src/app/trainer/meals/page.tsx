import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { UtensilsCrossed, Plus, Search, Users, Calendar, Apple } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: 'Meal Plans | Trainer Dashboard',
  description: 'Create and manage nutrition plans for your clients',
}

// Mock meal plans data
const mockMealPlans = [
  {
    id: "1",
    name: "High Protein Fat Loss",
    description: "Balanced high-protein meals for sustainable weight loss",
    duration: "4 weeks",
    mealsPerDay: 5,
    calories: "1800-2000",
    assignedClients: 6,
    category: "Weight Loss",
    lastUpdated: "2 days ago",
    isActive: true
  },
  {
    id: "2",
    name: "Muscle Building Nutrition",
    description: "Calorie-dense meals to support muscle growth and recovery",
    duration: "8 weeks", 
    mealsPerDay: 6,
    calories: "2800-3200",
    assignedClients: 4,
    category: "Muscle Gain",
    lastUpdated: "1 week ago",
    isActive: true
  },
  {
    id: "3",
    name: "Balanced Maintenance Plan",
    description: "Healthy, balanced meals for weight maintenance",
    duration: "Ongoing",
    mealsPerDay: 4,
    calories: "2200-2400",
    assignedClients: 8,
    category: "Maintenance",
    lastUpdated: "3 days ago",
    isActive: true
  },
  {
    id: "4",
    name: "Vegetarian Performance",
    description: "Plant-based nutrition for athletic performance",
    duration: "6 weeks",
    mealsPerDay: 5,
    calories: "2400-2600", 
    assignedClients: 2,
    category: "Vegetarian",
    lastUpdated: "2 weeks ago",
    isActive: false
  }
]

const mockRecipes = [
  { name: "Grilled Chicken & Quinoa Bowl", category: "High Protein", prepTime: "25 min", popularity: "High" },
  { name: "Overnight Protein Oats", category: "Breakfast", prepTime: "5 min", popularity: "High" },
  { name: "Salmon & Sweet Potato", category: "Dinner", prepTime: "30 min", popularity: "Medium" },
  { name: "Green Smoothie Bowl", category: "Snack", prepTime: "10 min", popularity: "Medium" }
]

export default function MealPlans() {
  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Meal Plans & Nutrition</h1>
            <p className="text-gray-600 mt-1">Create and manage nutrition plans for your clients</p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" asChild>
              <Link href="/trainer/meals/recipes">
                <UtensilsCrossed className="h-4 w-4 mr-2" />
                Recipe Library
              </Link>
            </Button>
            <Button asChild>
              <Link href="/trainer/meals/new">
                <Plus className="h-4 w-4 mr-2" />
                Create Meal Plan
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Meal Plans</CardTitle>
            <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockMealPlans.length}</div>
            <p className="text-xs text-muted-foreground">
              {mockMealPlans.filter(p => p.isActive).length} active
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
              {mockMealPlans.reduce((sum, p) => sum + p.assignedClients, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Following meal plans
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recipe Library</CardTitle>
            <Apple className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">125</div>
            <p className="text-xs text-muted-foreground">
              Available recipes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Compliance</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87%</div>
            <p className="text-xs text-muted-foreground">
              Client adherence
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Meal Plans List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Your Meal Plans</CardTitle>
                  <CardDescription>Manage your nutrition plans</CardDescription>
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
                {mockMealPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-lg">{plan.name}</h4>
                        <p className="text-gray-600 text-sm mt-1">{plan.description}</p>
                      </div>
                      <Badge variant={plan.isActive ? "default" : "secondary"}>
                        {plan.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Duration:</span>
                        <p className="font-medium">{plan.duration}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Meals/Day:</span>
                        <p className="font-medium">{plan.mealsPerDay}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Calories:</span>
                        <p className="font-medium">{plan.calories}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Clients:</span>
                        <p className="font-medium">{plan.assignedClients}</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mt-4 pt-3 border-t">
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <Badge variant="outline">{plan.category}</Badge>
                        <span>Updated {plan.lastUpdated}</span>
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

        {/* Quick Actions & Recipes */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common nutrition tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button className="w-full justify-start" asChild>
                  <Link href="/trainer/meals/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Meal Plan
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/trainer/meals/recipes/new">
                    <UtensilsCrossed className="h-4 w-4 mr-2" />
                    Add Recipe
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/trainer/meals/templates">
                    <Search className="h-4 w-4 mr-2" />
                    Browse Templates
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Popular Recipes</CardTitle>
              <CardDescription>Most requested by clients</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockRecipes.map((recipe, index) => (
                  <div key={index} className="p-3 border rounded hover:bg-gray-50 cursor-pointer">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-sm">{recipe.name}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" className="text-xs">{recipe.category}</Badge>
                          <span className="text-xs text-gray-500">{recipe.prepTime}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4" asChild>
                <Link href="/trainer/meals/recipes">
                  View All Recipes
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Nutrition Analytics</CardTitle>
              <CardDescription>Client compliance insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Most Popular Plan</span>
                  <span className="text-sm font-medium">Balanced Maintenance</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Highest Compliance</span>
                  <span className="text-sm font-medium">91%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Avg Results</span>
                  <span className="text-sm font-medium">Goal achieved</span>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-4" asChild>
                <Link href="/trainer/reports">
                  View Nutrition Reports
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

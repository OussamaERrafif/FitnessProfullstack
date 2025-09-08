import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BarChart3, TrendingUp, Target, Award, Activity } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: 'Progress Tracking | Trainer Dashboard',
  description: 'Track and analyze client progress and performance',
}

// Mock progress data
const mockClientProgress = [
  {
    id: "1",
    name: "Sarah Johnson",
    program: "Full Body Strength",
    startDate: "2025-06-01",
    currentWeek: 12,
    totalWeeks: 16,
    progressPercentage: 85,
    goals: [
      { name: "Weight Loss", target: "10 lbs", current: "8.5 lbs", percentage: 85 },
      { name: "Squat PR", target: "150 lbs", current: "140 lbs", percentage: 93 },
      { name: "Body Fat", target: "18%", current: "19.2%", percentage: 78 }
    ],
    lastUpdate: "2 days ago",
    status: "on-track"
  },
  {
    id: "2",
    name: "Mike Chen",
    program: "Muscle Building",
    startDate: "2025-07-15",
    currentWeek: 6,
    totalWeeks: 12,
    progressPercentage: 92,
    goals: [
      { name: "Muscle Gain", target: "15 lbs", current: "12 lbs", percentage: 80 },
      { name: "Bench Press", target: "225 lbs", current: "210 lbs", percentage: 93 },
      { name: "Body Weight", target: "180 lbs", current: "175 lbs", percentage: 88 }
    ],
    lastUpdate: "1 day ago",
    status: "ahead"
  },
  {
    id: "3",
    name: "Emily Davis",
    program: "Cardio Focus",
    startDate: "2025-05-20",
    currentWeek: 8,
    totalWeeks: 10,
    progressPercentage: 67,
    goals: [
      { name: "5K Time", target: "25:00", current: "27:30", percentage: 72 },
      { name: "Endurance", target: "45 min", current: "35 min", percentage: 78 },
      { name: "Resting HR", target: "65 bpm", current: "68 bpm", percentage: 85 }
    ],
    lastUpdate: "1 week ago",
    status: "behind"
  }
]

const mockAchievements = [
  { client: "Sarah Johnson", achievement: "First 10 lb weight loss milestone", date: "3 days ago", type: "weight-loss" },
  { client: "Mike Chen", achievement: "Reached 200 lb bench press", date: "1 week ago", type: "strength" },
  { client: "Emily Davis", achievement: "Completed first 5K run", date: "2 weeks ago", type: "endurance" },
  { client: "David Wilson", achievement: "30-day consistency streak", date: "1 week ago", type: "consistency" }
]

const progressMetrics = {
  totalActiveClients: 18,
  clientsOnTrack: 14,
  avgProgressRate: 83,
  goalsAchievedThisMonth: 12
}

export default function ProgressTracking() {
  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Progress Tracking</h1>
            <p className="text-gray-600 mt-1">Monitor client progress and celebrate achievements</p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" asChild>
              <Link href="/trainer/progress/analytics">
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </Link>
            </Button>
            <Button asChild>
              <Link href="/trainer/progress/reports">
                <Activity className="h-4 w-4 mr-2" />
                Generate Report
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Progress Overview Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progressMetrics.totalActiveClients}</div>
            <p className="text-xs text-muted-foreground">
              Currently tracking progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Track</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progressMetrics.clientsOnTrack}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((progressMetrics.clientsOnTrack / progressMetrics.totalActiveClients) * 100)}% of clients
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progressMetrics.avgProgressRate}%</div>
            <p className="text-xs text-muted-foreground">
              Across all active goals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Goals Achieved</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progressMetrics.goalsAchievedThisMonth}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Client Progress Details */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Client Progress Overview</CardTitle>
              <CardDescription>Detailed progress tracking for all active clients</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {mockClientProgress.map((client) => (
                  <div key={client.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-semibold text-lg">{client.name}</h4>
                        <p className="text-gray-600 text-sm">{client.program}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Week {client.currentWeek} of {client.totalWeeks} • Started {client.startDate}
                        </p>
                      </div>
                      <Badge variant={
                        client.status === 'ahead' ? 'default' :
                        client.status === 'on-track' ? 'secondary' : 'destructive'
                      }>
                        {client.status === 'ahead' ? 'Ahead of Schedule' :
                         client.status === 'on-track' ? 'On Track' : 'Needs Attention'}
                      </Badge>
                    </div>

                    {/* Overall Progress */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Overall Progress</span>
                        <span className="text-sm font-bold">{client.progressPercentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary-600 h-2 rounded-full"
                          style={{ width: `${client.progressPercentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Individual Goals */}
                    <div className="space-y-3">
                      <h5 className="font-medium text-sm">Individual Goals</h5>
                      {client.goals.map((goal, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <div>
                            <p className="font-medium text-sm">{goal.name}</p>
                            <p className="text-xs text-gray-600">
                              {goal.current} / {goal.target}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-medium">{goal.percentage}%</span>
                            <div className="w-16 bg-gray-200 rounded-full h-1 mt-1">
                              <div 
                                className="bg-primary-500 h-1 rounded-full"
                                style={{ width: `${goal.percentage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center mt-4 pt-3 border-t text-xs text-gray-500">
                      <span>Last updated {client.lastUpdate}</span>
                      <div className="space-x-2">
                        <Button size="sm" variant="outline">
                          Update Progress
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

        {/* Recent Achievements & Quick Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="h-5 w-5 mr-2" />
                Recent Achievements
              </CardTitle>
              <CardDescription>Client milestones and accomplishments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockAchievements.map((achievement, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex items-start space-x-3">
                      <div className={`w-3 h-3 rounded-full mt-1 ${
                        achievement.type === 'weight-loss' ? 'bg-green-500' :
                        achievement.type === 'strength' ? 'bg-blue-500' :
                        achievement.type === 'endurance' ? 'bg-purple-500' : 'bg-orange-500'
                      }`} />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{achievement.client}</p>
                        <p className="text-xs text-gray-600 mt-1">{achievement.achievement}</p>
                        <p className="text-xs text-gray-500 mt-1">{achievement.date}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                View All Achievements
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Progress Actions</CardTitle>
              <CardDescription>Quick progress management tools</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button className="w-full justify-start" asChild>
                  <Link href="/trainer/progress/update">
                    <Activity className="h-4 w-4 mr-2" />
                    Update Client Progress
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/trainer/progress/goals">
                    <Target className="h-4 w-4 mr-2" />
                    Set New Goals
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/trainer/progress/analytics">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Analytics
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Progress Insights</CardTitle>
              <CardDescription>Key performance indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Fastest Progressing</span>
                  <span className="text-sm font-medium">Mike Chen</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Most Consistent</span>
                  <span className="text-sm font-medium">Sarah Johnson</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Completion Rate</span>
                  <span className="text-sm font-medium">89%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Avg Session Attendance</span>
                  <span className="text-sm font-medium">94%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

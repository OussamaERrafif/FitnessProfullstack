import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, Download, TrendingUp, Users, Calendar, DollarSign, Target } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: 'Reports & Analytics | Trainer Dashboard',
  description: 'Business insights and performance analytics',
}

// Mock data for reports
const mockMetrics = {
  clientRetention: 87,
  avgSessionsPerClient: 3.2,
  monthlyGrowth: 15,
  goalCompletionRate: 78
}

const mockClientProgress = [
  { name: "Sarah Johnson", sessions: 12, progress: 85, goal: "Weight Loss" },
  { name: "Mike Chen", sessions: 8, progress: 92, goal: "Muscle Gain" },
  { name: "Emily Davis", sessions: 15, progress: 67, goal: "Endurance" },
  { name: "David Wilson", sessions: 10, progress: 78, goal: "Strength" }
]

const mockRevenueTrend = [
  { month: "Jan", revenue: 2800, clients: 18 },
  { month: "Feb", revenue: 3100, clients: 20 },
  { month: "Mar", revenue: 2950, clients: 19 },
  { month: "Apr", revenue: 3400, clients: 22 },
  { month: "May", revenue: 3200, clients: 21 },
  { month: "Jun", revenue: 3600, clients: 24 }
]

export default function TrainerReports() {
  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
            <p className="text-gray-600 mt-1">Track your business performance and client success</p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" asChild>
              <Link href="/trainer/reports/export">
                <Download className="h-4 w-4 mr-2" />
                Export Reports
              </Link>
            </Button>
            <Button asChild>
              <Link href="/trainer/reports/custom">
                <BarChart3 className="h-4 w-4 mr-2" />
                Custom Report
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Client Retention</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockMetrics.clientRetention}%</div>
            <p className="text-xs text-muted-foreground">
              +5% from last quarter
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Sessions/Client</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockMetrics.avgSessionsPerClient}</div>
            <p className="text-xs text-muted-foreground">
              Sessions per month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Growth</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{mockMetrics.monthlyGrowth}%</div>
            <p className="text-xs text-muted-foreground">
              Revenue growth
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Goal Completion</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockMetrics.goalCompletionRate}%</div>
            <p className="text-xs text-muted-foreground">
              Client goals achieved
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Monthly revenue and client growth</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockRevenueTrend.map((data, index) => (
                <div key={data.month} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">{data.month} 2025</p>
                    <p className="text-sm text-gray-600">{data.clients} active clients</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">${data.revenue.toLocaleString()}</p>
                    {index > 0 && mockRevenueTrend[index - 1] && (
                      <p className={`text-xs ${
                        data.revenue > mockRevenueTrend[index - 1]!.revenue 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {data.revenue > mockRevenueTrend[index - 1]!.revenue ? '+' : ''}
                        {Math.round(((data.revenue - mockRevenueTrend[index - 1]!.revenue) / mockRevenueTrend[index - 1]!.revenue) * 100)}%
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Client Progress Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Client Progress Overview</CardTitle>
            <CardDescription>Top performing clients this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockClientProgress.map((client) => (
                <div key={client.name} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">{client.name}</p>
                    <p className="text-sm text-gray-600">{client.goal} • {client.sessions} sessions</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary-600 rounded-full"
                          style={{ width: `${client.progress}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{client.progress}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4" asChild>
              <Link href="/trainer/progress">View Detailed Progress</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Report Categories */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="h-5 w-5 mr-2" />
              Financial Reports
            </CardTitle>
            <CardDescription>Revenue, expenses, and profit analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                Monthly Revenue Report
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Client Payment Analysis
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Tax Summary Report
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Client Reports
            </CardTitle>
            <CardDescription>Client engagement and progress insights</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                Client Progress Summary
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Attendance Reports
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Goal Achievement Analysis
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Business Analytics
            </CardTitle>
            <CardDescription>Performance metrics and growth insights</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                Business Performance
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Session Analytics
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Marketing ROI Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

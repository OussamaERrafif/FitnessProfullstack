import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Calendar, DollarSign, TrendingUp, Plus } from "lucide-react"
import Link from "next/link"

// Mock data for demonstration
const mockStats = {
  totalClients: 24,
  activeClients: 18,
  todaySessions: 5,
  monthlyRevenue: 3200,
  progressCompletion: 78
}

const mockTodaySessions = [
  { id: "1", clientName: "Sarah Johnson", time: "09:00", type: "Personal Training", status: "confirmed" },
  { id: "2", clientName: "Mike Chen", time: "10:30", type: "Consultation", status: "confirmed" },
  { id: "3", clientName: "Emily Davis", time: "14:00", type: "Group Class", status: "pending" },
  { id: "4", clientName: "David Wilson", time: "16:30", type: "Personal Training", status: "confirmed" },
  { id: "5", clientName: "Lisa Brown", time: "18:00", type: "Virtual Session", status: "confirmed" },
]

const mockRecentClients = [
  { id: "1", name: "Sarah Johnson", lastSession: "2 days ago", progress: 85 },
  { id: "2", name: "Mike Chen", lastSession: "1 week ago", progress: 92 },
  { id: "3", name: "Emily Davis", lastSession: "3 days ago", progress: 67 },
  { id: "4", name: "David Wilson", lastSession: "Yesterday", progress: 78 },
]

export default function TrainerDashboard() {
  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, Alex!</h1>
            <p className="text-gray-600 mt-1">Here's what's happening with your training business today.</p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" asChild>
              <Link href="/trainer/calendar">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Session
              </Link>
            </Button>
            <Button asChild>
              <Link href="/trainer/clients/new">
                <Plus className="h-4 w-4 mr-2" />
                Add Client
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalClients}</div>
            <p className="text-xs text-muted-foreground">
              +2 from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.activeClients}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((mockStats.activeClients / mockStats.totalClients) * 100)}% engagement rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.todaySessions}</div>
            <p className="text-xs text-muted-foreground">
              Next session at 9:00 AM
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${mockStats.monthlyRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Today's Sessions */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Sessions</CardTitle>
            <CardDescription>Your scheduled sessions for today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockTodaySessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{session.clientName}</p>
                    <p className="text-sm text-gray-600">{session.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{session.time}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      session.status === 'confirmed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {session.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4" asChild>
              <Link href="/trainer/calendar">View Full Calendar</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Clients */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Client Activity</CardTitle>
            <CardDescription>Latest updates from your clients</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockRecentClients.map((client) => (
                <div key={client.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{client.name}</p>
                    <p className="text-sm text-gray-600">Last session: {client.lastSession}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
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
              <Link href="/trainer/clients">View All Clients</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

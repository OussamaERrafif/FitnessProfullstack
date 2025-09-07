import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Users, Calendar, TrendingUp, Filter, MoreVertical } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: 'Clients | Trainer Dashboard',
  description: 'Manage your fitness clients and their progress',
}

// Mock clients data
const mockClients = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah.j@email.com",
    pin: "123456",
    status: "active",
    lastSession: "2 days ago",
    progress: 85,
    plan: "Full Body Strength",
    joinDate: "2025-01-15",
    nextSession: "Tomorrow 9:00 AM"
  },
  {
    id: "2", 
    name: "Mike Chen",
    email: "mike.chen@email.com",
    pin: "654321",
    status: "active",
    lastSession: "1 week ago",
    progress: 92,
    plan: "Weight Loss Program",
    joinDate: "2024-12-10",
    nextSession: "Today 2:00 PM"
  },
  {
    id: "3",
    name: "Emily Davis", 
    email: "emily.d@email.com",
    pin: "111222",
    status: "inactive",
    lastSession: "3 weeks ago",
    progress: 67,
    plan: "Cardio Focus",
    joinDate: "2025-02-01",
    nextSession: "Not scheduled"
  },
  {
    id: "4",
    name: "David Wilson",
    email: "david.w@email.com", 
    pin: "333444",
    status: "active",
    lastSession: "Yesterday",
    progress: 78,
    plan: "Strength Building",
    joinDate: "2025-01-20",
    nextSession: "Friday 4:00 PM"
  },
  {
    id: "5",
    name: "Lisa Brown",
    email: "lisa.b@email.com",
    pin: "555666",
    status: "active", 
    lastSession: "3 days ago",
    progress: 88,
    plan: "Marathon Training",
    joinDate: "2024-11-05",
    nextSession: "Monday 7:00 AM"
  }
]

const clientStats = {
  totalClients: mockClients.length,
  activeClients: mockClients.filter(c => c.status === 'active').length,
  avgProgress: Math.round(mockClients.reduce((sum, c) => sum + c.progress, 0) / mockClients.length),
  newThisMonth: 2
}

export default function TrainerClients() {
  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Client Management</h1>
            <p className="text-gray-600 mt-1">Manage your clients and track their fitness journey</p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" asChild>
              <Link href="/trainer/clients/import">
                <Users className="h-4 w-4 mr-2" />
                Import Clients
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

      {/* Client Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientStats.totalClients}</div>
            <p className="text-xs text-muted-foreground">
              +{clientStats.newThisMonth} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientStats.activeClients}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((clientStats.activeClients / clientStats.totalClients) * 100)}% retention rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Progress</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientStats.avgProgress}%</div>
            <p className="text-xs text-muted-foreground">
              Across all active clients
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessions This Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-muted-foreground">
              5 sessions today
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Search clients by name, email, or plan..." 
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                Status
              </Button>
              <Button variant="outline" size="sm">
                Program
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Clients List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Clients</CardTitle>
          <CardDescription>Complete overview of your client roster</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockClients.map((client) => (
              <div 
                key={client.id} 
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <div className="flex items-center space-x-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-700 font-semibold text-lg">
                      {client.name.charAt(0)}
                    </span>
                  </div>
                  
                  {/* Client Info */}
                  <div>
                    <h4 className="font-semibold text-lg">{client.name}</h4>
                    <p className="text-gray-600 text-sm">{client.email}</p>
                    <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                      <span>PIN: {client.pin}</span>
                      <span>Joined: {client.joinDate}</span>
                      <span>Plan: {client.plan}</span>
                    </div>
                  </div>
                </div>
                
                {/* Status and Progress */}
                <div className="text-right space-y-2">
                  <div className="flex items-center space-x-2">
                    <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>
                      {client.status}
                    </Badge>
                    <span className="text-sm font-medium">{client.progress}%</span>
                  </div>
                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary-600 rounded-full"
                      style={{ width: `${client.progress}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500">
                    <p>Last: {client.lastSession}</p>
                    <p>Next: {client.nextSession}</p>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/trainer/clients/${client.id}`}>
                      View Profile
                    </Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link href={`/trainer/calendar/new-session?client=${client.id}`}>
                      Schedule
                    </Link>
                  </Button>
                  <Button size="sm" variant="ghost">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Pagination */}
          <div className="flex justify-between items-center mt-6 pt-4 border-t">
            <p className="text-sm text-gray-600">
              Showing {mockClients.length} of {mockClients.length} clients
            </p>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled>
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

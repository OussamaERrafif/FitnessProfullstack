"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Users, Calendar, TrendingUp, Filter, MoreVertical, Loader2 } from "lucide-react"
import Link from "next/link"
import { authService } from "@/lib/auth-service"

interface Client {
  id: string
  name: string
  email: string
  status: "active" | "inactive"
  lastSession?: string
  progress: number
  plan?: string
  joinDate: string
  nextSession?: string
}

interface ClientStats {
  totalClients: number
  activeClients: number
  avgProgress: number
  newThisMonth: number
}

export default function TrainerClients() {
  const [clients, setClients] = useState<Client[]>([])
  const [clientStats, setClientStats] = useState<ClientStats>({
    totalClients: 0,
    activeClients: 0,
    avgProgress: 0,
    newThisMonth: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()

  useEffect(() => {
    const loadClients = async () => {
      try {
        setIsLoading(true)
        setError("")

        // Check if user is authenticated
        if (!authService.isAuthenticated()) {
          router.push('/login')
          return
        }

        // Verify user is a trainer
        try {
          const user = await authService.getCurrentUser()
          if (user.role !== 'TRAINER') {
            router.push('/login')
            return
          }
        } catch {
          router.push('/login')
          return
        }

        // TODO: Replace with actual API call when backend is ready
        // For now, showing placeholder data without PINs
        const placeholderClients: Client[] = [
          {
            id: "1",
            name: "Sarah Johnson",
            email: "sarah.j@email.com",
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
            status: "active",
            lastSession: "1 week ago",
            progress: 92,
            plan: "Weight Loss Program",
            joinDate: "2024-12-10",
            nextSession: "Today 2:00 PM"
          }
        ]

        setClients(placeholderClients)
        setClientStats({
          totalClients: placeholderClients.length,
          activeClients: placeholderClients.filter(c => c.status === 'active').length,
          avgProgress: Math.round(placeholderClients.reduce((sum, c) => sum + c.progress, 0) / placeholderClients.length),
          newThisMonth: 1
        })

      } catch (err) {
        console.error('Failed to load clients:', err)
        setError('Failed to load clients')
      } finally {
        setIsLoading(false)
      }
    }

    loadClients()
  }, [router])

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading clients...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-red-600">Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/trainer/dashboard')} className="w-full">
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }
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
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
            {filteredClients.map((client) => (
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
                      <span>Joined: {client.joinDate}</span>
                      <span>Plan: {client.plan}</span>
                      <span>Last: {client.lastSession}</span>
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
              Showing {filteredClients.length} of {clients.length} clients
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

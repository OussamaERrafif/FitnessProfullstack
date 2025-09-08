"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Users, Calendar, TrendingUp, Filter, Loader2 } from "lucide-react"
import Link from "next/link"
import { clientsService, Client } from "@/lib/clients-service"
import { authService } from "@/lib/auth-service"

// Remove the metadata export for client components
// export const metadata: Metadata = {
//   title: 'Clients | Trainer Dashboard',
//   description: 'Manage your fitness clients and their progress',
// }

export default function TrainerClients() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    loadClients()
  }, [])

  const loadClients = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Check if user is authenticated
      if (!authService.isAuthenticated()) {
        setError('Please log in to view clients')
        return
      }
      
      const response = await clientsService.getClients()
      setClients(response)
    } catch (err: any) {
      console.error('Failed to load clients:', err)
      setError('Failed to load clients. Using demo data for now.')
      
      // Fallback to mock data for demo purposes
      setClients([
        {
          id: "1",
          name: "Sarah Johnson",
          email: "sarah.j@email.com",
          created_at: "2025-01-15T00:00:00Z",
          updated_at: "2025-01-15T00:00:00Z",
        },
        {
          id: "2", 
          name: "Mike Chen",
          email: "mike.chen@email.com",
          created_at: "2024-12-10T00:00:00Z",
          updated_at: "2024-12-10T00:00:00Z",
        },
        {
          id: "3",
          name: "Emily Davis", 
          email: "emily.d@email.com",
          created_at: "2025-02-01T00:00:00Z",
          updated_at: "2025-02-01T00:00:00Z",
        },
        {
          id: "4",
          name: "David Wilson",
          email: "david.w@email.com", 
          created_at: "2025-01-20T00:00:00Z",
          updated_at: "2025-01-20T00:00:00Z",
        },
        {
          id: "5",
          name: "Lisa Brown",
          email: "lisa.b@email.com",
          created_at: "2024-11-05T00:00:00Z",
          updated_at: "2024-11-05T00:00:00Z",
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const clientStats = {
    totalClients: clients.length,
    activeClients: clients.length, // All clients are considered active in the basic API
    avgProgress: 85, // This would come from progress API in future
    newThisMonth: clients.filter(c => {
      const created = new Date(c.created_at)
      const now = new Date()
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
    }).length
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading clients...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Client Management</h1>
            <p className="text-gray-600 mt-1">Manage your clients and track their fitness journey</p>
            {error && (
              <div className="mt-2 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
                {error}
              </div>
            )}
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
              {clientStats.totalClients > 0 ? Math.round((clientStats.activeClients / clientStats.totalClients) * 100) : 0}% retention rate
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
                  placeholder="Search clients by name or email..." 
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
              <Button variant="outline" size="sm" onClick={loadClients}>
                Refresh
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
            {filteredClients.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? (
                  <>
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No clients found matching "{searchTerm}"</p>
                    <p className="text-sm">Try adjusting your search terms</p>
                  </>
                ) : (
                  <>
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No clients yet</p>
                    <p className="text-sm">Add your first client to get started</p>
                    <Button className="mt-4" asChild>
                      <Link href="/trainer/clients/new">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Client
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            ) : (
              filteredClients.map((client) => (
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
                        {client.pin && <span>PIN: {client.pin}</span>}
                        <span>Joined: {new Date(client.created_at).toLocaleDateString()}</span>
                        {client.fitness_level && <span>Level: {client.fitness_level}</span>}
                      </div>
                    </div>
                  </div>
                  
                  {/* Status and Actions */}
                  <div className="text-right space-y-2">
                    <div className="flex items-center space-x-2">
                      <Badge variant="default">Active</Badge>
                      {client.age && <span className="text-sm text-gray-500">Age: {client.age}</span>}
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/trainer/clients/${client.id}`}>
                          View Profile
                        </Link>
                      </Button>
                      <Button size="sm" asChild>
                        <Link href={`/trainer/programs/new?client=${client.id}`}>
                          Assign Program
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
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

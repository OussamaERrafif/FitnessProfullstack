"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Calendar, DollarSign, TrendingUp, Plus, Loader2 } from "lucide-react"
import Link from "next/link"
import { statisticsService, TrainerStats, ClientProgress } from "@/lib/statistics-service"
import { sessionsService, Session } from "@/lib/sessions-service"
import { authService } from "@/lib/auth-service"

export default function TrainerDashboard() {
  const [stats, setStats] = useState<TrainerStats | null>(null)
  const [todaySessions, setTodaySessions] = useState<Session[]>([])
  const [recentProgress, setRecentProgress] = useState<ClientProgress[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true)
        setError("")

        // Check if user is authenticated
        if (!authService.isAuthenticated()) {
          setError("Please log in to view dashboard")
          return
        }

        // Load dashboard data in parallel
        const [dashboardStats, todaySessionsData] = await Promise.all([
          statisticsService.getDashboardOverview(),
          sessionsService.getTodaySessions(),
        ])

        setStats(dashboardStats.stats)
        setRecentProgress(dashboardStats.recentProgress)
        setTodaySessions(todaySessionsData)
      } catch (err) {
        console.error('Failed to load dashboard data:', err)
        setError("Failed to load dashboard data. Using default values.")
        
        // Set fallback data
        setStats({
          total_clients: 0,
          active_clients: 0,
          todays_sessions: 0,
          monthly_revenue: 0,
          progress_completion: 0,
          client_growth: 0,
          engagement_rate: 0,
        })
        setTodaySessions([])
        setRecentProgress([])
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-600">{error}</p>
        </div>
      )}

      {/* Page Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome back!</h1>
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
            <div className="text-2xl font-bold">{stats?.total_clients || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.client_growth ? `+${stats.client_growth} from last month` : 'No growth data'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.active_clients || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.engagement_rate ? `${Math.round(stats.engagement_rate)}% engagement rate` : 'No engagement data'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.todays_sessions || 0}</div>
            <p className="text-xs text-muted-foreground">
              {todaySessions.length > 0 
                ? `Next session at ${new Date(todaySessions[0].scheduled_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
                : 'No sessions scheduled'
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats?.monthly_revenue?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">
              Current month earnings
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
              {todaySessions.length > 0 ? (
                todaySessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{session.client_name || 'Unknown Client'}</p>
                      <p className="text-sm text-gray-600">
                        {session.session_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {new Date(session.scheduled_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                      </p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        session.status === 'confirmed' 
                          ? 'bg-green-100 text-green-800' 
                          : session.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {session.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No sessions scheduled for today</p>
                  <p className="text-sm">Book a session to get started</p>
                </div>
              )}
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
              {recentProgress.length > 0 ? (
                recentProgress.map((client) => (
                  <div key={client.client_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{client.client_name}</p>
                      <p className="text-sm text-gray-600">Last session: {client.last_session}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary-600 rounded-full"
                            style={{ width: `${client.progress_percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{client.progress_percentage}%</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No recent client activity</p>
                  <p className="text-sm">Client progress will appear here</p>
                </div>
              )}
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

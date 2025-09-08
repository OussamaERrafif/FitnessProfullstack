"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, Mail, Phone, MapPin, Target, Activity, Edit, Loader2 } from "lucide-react"
import Link from "next/link"
import { authService } from "@/lib/auth-service"

interface ClientProfileProps {
  params: Promise<{
    id: string
  }>
}

interface Client {
  id: string
  name: string
  email: string
  phone?: string
  address?: string
  status: "active" | "inactive"
  joinDate: string
  dateOfBirth?: string
  emergencyContact?: string
  plan?: string
  trainer?: string
  goals?: Array<{
    name: string
    target: string
    current: string
    percentage: number
  }>
  recentSessions?: Array<{
    date: string
    type: string
    duration: string
    notes: string
  }>
  upcomingSessions?: Array<{
    date: string
    time: string
    type: string
    location: string
  }>
  measurements?: {
    weight?: string
    height?: string
    bodyFat?: string
    muscleMass?: string
  }
}

interface ClientProfileProps {
  params: Promise<{
    id: string
  }>
}

export default function ClientProfile({ params }: ClientProfileProps) {
  const [client, setClient] = useState<Client | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    const loadClient = async () => {
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

        // Get the client ID from params
        const { id } = await params

        // TODO: Replace with actual API call when backend is ready
        // For now, showing placeholder data without PIN
        const placeholderClient: Client = {
          id: id,
          name: "Sarah Johnson",
          email: "sarah.j@email.com",
          phone: "+1 (555) 123-4567",
          address: "123 Main St, New York, NY 10001",
          status: "active",
          joinDate: "2025-01-15",
          dateOfBirth: "1990-05-20",
          emergencyContact: "John Johnson - +1 (555) 987-6543",
          plan: "Full Body Strength",
          trainer: "Alex Johnson",
          goals: [
            { name: "Weight Loss", target: "10 lbs", current: "8.5 lbs", percentage: 85 },
            { name: "Squat PR", target: "150 lbs", current: "140 lbs", percentage: 93 },
            { name: "Body Fat", target: "18%", current: "19.2%", percentage: 78 }
          ],
          recentSessions: [
            { date: "2025-09-05", type: "Full Body Workout", duration: "60 min", notes: "Great progress on squats" },
            { date: "2025-09-03", type: "Upper Body Focus", duration: "45 min", notes: "Increased bench press weight" },
            { date: "2025-09-01", type: "Cardio + Core", duration: "50 min", notes: "Excellent endurance improvement" }
          ],
          upcomingSessions: [
            { date: "2025-09-08", time: "09:00", type: "Full Body Workout", location: "Gym Floor A" },
            { date: "2025-09-10", time: "10:00", type: "Consultation", location: "Office" }
          ],
          measurements: {
            weight: "142 lbs",
            height: "5'6\"",
            bodyFat: "19.2%",
            muscleMass: "45.8%"
          }
        }

        setClient(placeholderClient)

      } catch (err) {
        console.error('Failed to load client:', err)
        setError('Failed to load client')
      } finally {
        setIsLoading(false)
      }
    }

    loadClient()
  }, [params, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading client profile...</p>
        </div>
      </div>
    )
  }

  if (error || !client) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-red-600">Error</CardTitle>
            <CardDescription>{error || "Client not found"}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/trainer/clients')} className="w-full">
              Return to Clients
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
        <div className="flex items-center space-x-4 mb-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/trainer/clients">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Clients
            </Link>
          </Button>
        </div>
        
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-6">
            {/* Client Avatar */}
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-700 font-bold text-2xl">
                {client.name.charAt(0)}
              </span>
            </div>
            
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{client.name}</h1>
              <p className="text-gray-600 mt-1">Client since {client.joinDate}</p>
              <div className="flex items-center space-x-4 mt-2">
                <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>
                  {client.status}
                </Badge>
                <span className="text-sm text-gray-600">{client.plan}</span>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <Button variant="outline" asChild>
              <Link href={`/trainer/clients/${client.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/trainer/calendar/new-session?client=${client.id}`}>
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Session
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>Personal and emergency contact details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">{client.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium">{client.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Address</p>
                      <p className="font-medium">{client.address}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Date of Birth</p>
                    <p className="font-medium">{client.dateOfBirth}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Emergency Contact</p>
                    <p className="font-medium">{client.emergencyContact}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Primary Trainer</p>
                    <p className="font-medium">{client.trainer}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Goals Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Goals Progress
              </CardTitle>
              <CardDescription>Track progress towards fitness goals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {client.goals?.map((goal, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">{goal.name}</h4>
                      <span className="text-sm font-bold">{goal.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div 
                        className="bg-primary-600 h-2 rounded-full"
                        style={{ width: `${goal.percentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Current: {goal.current}</span>
                      <span>Target: {goal.target}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Sessions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Recent Sessions
              </CardTitle>
              <CardDescription>Latest training sessions and progress notes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {client.recentSessions?.map((session, index) => (
                  <div key={index} className="flex justify-between items-start p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{session.type}</p>
                      <p className="text-sm text-gray-600">{session.date} • {session.duration}</p>
                      <p className="text-sm text-gray-700 mt-1">{session.notes}</p>
                    </div>
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                View All Sessions
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
              <CardDescription>Current measurements and progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Weight</span>
                  <span className="font-medium">{client.measurements?.weight}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Height</span>
                  <span className="font-medium">{client.measurements?.height}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Body Fat</span>
                  <span className="font-medium">{client.measurements?.bodyFat}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Muscle Mass</span>
                  <span className="font-medium">{client.measurements?.muscleMass}</span>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-4">
                Update Measurements
              </Button>
            </CardContent>
          </Card>

          {/* Upcoming Sessions */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Sessions</CardTitle>
              <CardDescription>Scheduled appointments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {client.upcomingSessions?.map((session, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <p className="font-medium text-sm">{session.type}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {session.date} at {session.time}
                    </p>
                    <p className="text-xs text-gray-600">{session.location}</p>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4" asChild>
                <Link href="/trainer/calendar">
                  View Calendar
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common client management tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Session
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Activity className="h-4 w-4 mr-2" />
                  Log Progress
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Target className="h-4 w-4 mr-2" />
                  Update Goals
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Mail className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

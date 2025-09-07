import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, Mail, Phone, MapPin, Target, Activity, Edit } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: 'Client Profile | Trainer Dashboard',
  description: 'View and manage client details and progress',
}

// This would normally come from a database based on the [id] parameter
const mockClient = {
  id: "1",
  name: "Sarah Johnson",
  email: "sarah.j@email.com",
  phone: "+1 (555) 123-4567",
  address: "123 Main St, New York, NY 10001",
  pin: "123456",
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

interface ClientProfileProps {
  params: {
    id: string
  }
}

export default function ClientProfile({ params }: ClientProfileProps) {
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
                {mockClient.name.charAt(0)}
              </span>
            </div>
            
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{mockClient.name}</h1>
              <p className="text-gray-600 mt-1">Client since {mockClient.joinDate}</p>
              <div className="flex items-center space-x-4 mt-2">
                <Badge variant={mockClient.status === 'active' ? 'default' : 'secondary'}>
                  {mockClient.status}
                </Badge>
                <span className="text-sm text-gray-600">PIN: {mockClient.pin}</span>
                <span className="text-sm text-gray-600">{mockClient.plan}</span>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <Button variant="outline" asChild>
              <Link href={`/trainer/clients/${params.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/trainer/calendar/new-session?client=${params.id}`}>
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
                      <p className="font-medium">{mockClient.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium">{mockClient.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Address</p>
                      <p className="font-medium">{mockClient.address}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Date of Birth</p>
                    <p className="font-medium">{mockClient.dateOfBirth}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Emergency Contact</p>
                    <p className="font-medium">{mockClient.emergencyContact}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Primary Trainer</p>
                    <p className="font-medium">{mockClient.trainer}</p>
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
                {mockClient.goals.map((goal, index) => (
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
                {mockClient.recentSessions.map((session, index) => (
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
                  <span className="font-medium">{mockClient.measurements.weight}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Height</span>
                  <span className="font-medium">{mockClient.measurements.height}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Body Fat</span>
                  <span className="font-medium">{mockClient.measurements.bodyFat}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Muscle Mass</span>
                  <span className="font-medium">{mockClient.measurements.muscleMass}</span>
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
                {mockClient.upcomingSessions.map((session, index) => (
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

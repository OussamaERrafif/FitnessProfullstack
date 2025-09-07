import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarDays, Plus, Clock, Users, MapPin } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: 'Calendar | Trainer Dashboard',
  description: 'Manage your appointments and schedule',
}

// Mock data for calendar events
const mockUpcomingEvents = [
  {
    id: "1",
    title: "Personal Training - Sarah Johnson",
    time: "09:00 - 10:00",
    date: "Today",
    type: "personal",
    location: "Gym Floor A",
    status: "confirmed"
  },
  {
    id: "2", 
    title: "Consultation - Mike Chen",
    time: "10:30 - 11:30",
    date: "Today",
    type: "consultation",
    location: "Office",
    status: "confirmed"
  },
  {
    id: "3",
    title: "Group Class - HIIT Training",
    time: "18:00 - 19:00", 
    date: "Today",
    type: "group",
    location: "Studio B",
    status: "confirmed"
  },
  {
    id: "4",
    title: "Personal Training - Emily Davis",
    time: "09:00 - 10:00",
    date: "Tomorrow",
    type: "personal", 
    location: "Gym Floor A",
    status: "pending"
  }
]

const mockAvailability = [
  { day: "Monday", slots: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00", "18:00"] },
  { day: "Tuesday", slots: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00", "18:00"] },
  { day: "Wednesday", slots: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00", "18:00"] },
  { day: "Thursday", slots: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00", "18:00"] },
  { day: "Friday", slots: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00", "18:00"] },
  { day: "Saturday", slots: ["09:00", "10:00", "11:00", "14:00", "15:00"] },
  { day: "Sunday", slots: ["10:00", "11:00", "15:00", "16:00"] }
]

export default function TrainerCalendar() {
  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Calendar & Schedule</h1>
            <p className="text-gray-600 mt-1">Manage your appointments and availability</p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" asChild>
              <Link href="/trainer/calendar/availability">
                <Clock className="h-4 w-4 mr-2" />
                Set Availability
              </Link>
            </Button>
            <Button asChild>
              <Link href="/trainer/calendar/new-session">
                <Plus className="h-4 w-4 mr-2" />
                Schedule Session
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar Overview */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CalendarDays className="h-5 w-5 mr-2" />
                September 2025
              </CardTitle>
              <CardDescription>Click on any date to view or schedule sessions</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Simple calendar grid - in a real app this would be a proper calendar component */}
              <div className="grid grid-cols-7 gap-2 text-center">
                {/* Calendar headers */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="p-2 text-sm font-medium text-gray-600 bg-gray-50 rounded">
                    {day}
                  </div>
                ))}
                
                {/* Calendar days - simplified example */}
                {Array.from({ length: 30 }, (_, i) => (
                  <div
                    key={i + 1}
                    className={`p-2 text-sm border rounded cursor-pointer hover:bg-gray-50 ${
                      i + 1 === 7 ? 'bg-primary-50 border-primary-200' : 'border-gray-200'
                    }`}
                  >
                    <div className="font-medium">{i + 1}</div>
                    {/* Show indicators for booked sessions */}
                    {(i + 1 === 7 || i + 1 === 8) && (
                      <div className="mt-1 space-y-1">
                        <div className="h-1 bg-primary-400 rounded-full"></div>
                        {i + 1 === 7 && <div className="h-1 bg-blue-400 rounded-full"></div>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Sessions */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Sessions</CardTitle>
              <CardDescription>Your next appointments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockUpcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-medium text-sm">{event.title}</div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        event.status === 'confirmed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {event.status}
                      </span>
                    </div>
                    <div className="space-y-1 text-xs text-gray-600">
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {event.date} - {event.time}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {event.location}
                      </div>
                      <div className="flex items-center">
                        <Users className="h-3 w-3 mr-1" />
                        {event.type === 'group' ? 'Group Session' : 'Individual'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                View All Sessions
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Weekly Availability Overview */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Availability</CardTitle>
            <CardDescription>Your current available time slots</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-7 gap-4">
              {mockAvailability.map((day) => (
                <div key={day.day} className="space-y-2">
                  <h4 className="font-medium text-sm text-gray-900">{day.day}</h4>
                  <div className="space-y-1">
                    {day.slots.map((slot) => (
                      <div
                        key={slot}
                        className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded border border-green-200"
                      >
                        {slot}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

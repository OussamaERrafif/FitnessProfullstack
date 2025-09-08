import { NextRequest, NextResponse } from 'next/server'

// Mock client data that matches the backend structure
const mockClients = {
  "1": { 
    id: "1", 
    name: "Sarah Johnson", 
    pin: "123456", 
    email: "sarah.j@email.com", 
    age: 28,
    weight: 68.2,
    height: 165,
    fitness_level: "intermediate",
    trainer_id: "1",
    goals: "Weight loss and strength building",
    created_at: "2025-09-01T00:00:00Z",
    updated_at: "2025-09-08T10:00:00Z"
  },
  "2": { 
    id: "2", 
    name: "Mike Chen", 
    pin: "654321", 
    email: "mike.chen@email.com",
    age: 34, 
    weight: 82.1,
    height: 178,
    fitness_level: "advanced",
    trainer_id: "1",
    goals: "Muscle building and cardio improvement",
    created_at: "2025-08-15T00:00:00Z",
    updated_at: "2025-09-08T10:00:00Z"
  },
  "3": { 
    id: "3", 
    name: "Emily Davis", 
    pin: "111222", 
    email: "emily.d@email.com",
    age: 25,
    weight: 65.0,
    height: 162,
    fitness_level: "beginner", 
    trainer_id: "1",
    goals: "General fitness and health",
    created_at: "2025-08-20T00:00:00Z",
    updated_at: "2025-09-08T10:00:00Z"
  },
  "4": { 
    id: "4", 
    name: "David Wilson", 
    pin: "333444", 
    email: "david.w@email.com",
    age: 45,
    weight: 88.5,
    height: 180,
    fitness_level: "intermediate",
    trainer_id: "1", 
    goals: "Weight loss and injury recovery",
    created_at: "2025-07-10T00:00:00Z",
    updated_at: "2025-09-08T10:00:00Z"
  },
  "5": { 
    id: "5", 
    name: "Lisa Brown", 
    pin: "555666", 
    email: "lisa.b@email.com",
    age: 32,
    weight: 70.0,
    height: 168,
    fitness_level: "advanced",
    trainer_id: "1",
    goals: "Marathon training and endurance",
    created_at: "2025-06-25T00:00:00Z",
    updated_at: "2025-09-08T10:00:00Z"
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const client = mockClients[id as keyof typeof mockClients]
    
    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(client)

  } catch (error) {
    console.error('Error fetching client:', error)
    return NextResponse.json(
      { error: 'Failed to fetch client' },
      { status: 500 }
    )
  }
}
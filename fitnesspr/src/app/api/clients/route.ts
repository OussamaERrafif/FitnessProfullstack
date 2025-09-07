import { NextRequest, NextResponse } from 'next/server'

// Mock database - in a real app, this would be stored in an actual database
let mockClients = [
  { id: "1", name: "Sarah Johnson", email: "sarah.j@email.com", pin: "123456", phone: "+1 (555) 123-4567", age: 28, weight: 68.2, height: 165, goals: "Weight loss and strength building", healthData: "No major health issues", fitnessLevel: "intermediate", createdAt: new Date("2025-01-15") },
  { id: "2", name: "Mike Chen", email: "mike.chen@email.com", pin: "654321", phone: "+1 (555) 234-5678", age: 35, weight: 82.1, height: 178, goals: "Lose 10kg and build lean muscle", healthData: "Mild knee pain from old injury", fitnessLevel: "beginner", createdAt: new Date("2024-12-10") },
  { id: "3", name: "Emily Davis", email: "emily.d@email.com", pin: "111222", phone: "+1 (555) 345-6789", age: 26, weight: 65.0, height: 160, goals: "Improve cardiovascular endurance", healthData: "Asthma - needs inhaler during intense workouts", fitnessLevel: "intermediate", createdAt: new Date("2025-02-01") },
  { id: "4", name: "David Wilson", email: "david.w@email.com", pin: "333444", phone: "+1 (555) 456-7890", age: 42, weight: 85.5, height: 183, goals: "Build strength and muscle mass", healthData: "No health issues", fitnessLevel: "advanced", createdAt: new Date("2025-01-20") },
  { id: "5", name: "Lisa Brown", email: "lisa.b@email.com", pin: "555666", phone: "+1 (555) 567-8901", age: 31, weight: 59.8, height: 155, goals: "Marathon training and endurance", healthData: "Vegetarian diet", fitnessLevel: "advanced", createdAt: new Date("2024-11-05") }
]

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Validate required fields
    if (!data.name || !data.email || !data.pin) {
      return NextResponse.json(
        { error: 'Name, email, and PIN are required' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingClient = mockClients.find(client => client.email === data.email)
    if (existingClient) {
      return NextResponse.json(
        { error: 'A client with this email already exists' },
        { status: 409 }
      )
    }

    // Check if PIN already exists
    const existingPin = mockClients.find(client => client.pin === data.pin)
    if (existingPin) {
      return NextResponse.json(
        { error: 'This PIN is already in use. Please generate a new one.' },
        { status: 409 }
      )
    }

    // Create new client
    const newClient = {
      id: (mockClients.length + 1).toString(),
      name: data.name,
      email: data.email,
      pin: data.pin,
      phone: data.phone || "",
      age: data.age || null,
      weight: data.weight || null,
      height: data.height || null,
      goals: data.goals || "",
      healthData: data.healthData || "",
      fitnessLevel: data.fitnessLevel || "beginner",
      createdAt: new Date()
    }

    // Add to mock database
    mockClients.push(newClient)

    // In a real app, you would:
    // 1. Save to actual database
    // 2. Send welcome email with PIN
    // 3. Create initial training and meal plans
    // 4. Set up default progress tracking

    return NextResponse.json({
      success: true,
      client: {
        id: newClient.id,
        name: newClient.name,
        email: newClient.email,
        pin: newClient.pin
      },
      message: 'Client created successfully'
    })

  } catch (error) {
    console.error('Error creating client:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Return all clients (without sensitive data)
    const clientsList = mockClients.map(client => ({
      id: client.id,
      name: client.name,
      email: client.email,
      pin: client.pin,
      phone: client.phone,
      age: client.age,
      weight: client.weight,
      height: client.height,
      goals: client.goals,
      fitnessLevel: client.fitnessLevel,
      createdAt: client.createdAt
    }))

    return NextResponse.json({
      clients: clientsList,
      total: clientsList.length
    })

  } catch (error) {
    console.error('Error fetching clients:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
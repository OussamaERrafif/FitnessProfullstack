import { NextRequest, NextResponse } from 'next/server'
import { validatePin } from '@/lib/utils'

// Mock client data - in a real app, this would come from a database
const mockClients = [
  { id: "1", name: "Sarah Johnson", pin: "123456", email: "sarah.j@email.com" },
  { id: "2", name: "Mike Chen", pin: "654321", email: "mike.chen@email.com" },
  { id: "3", name: "Emily Davis", pin: "111222", email: "emily.d@email.com" },
  { id: "4", name: "David Wilson", pin: "333444", email: "david.w@email.com" },
  { id: "5", name: "Lisa Brown", pin: "555666", email: "lisa.b@email.com" },
]

export async function POST(request: NextRequest) {
  try {
    const { pin } = await request.json()

    // Validate PIN format
    if (!validatePin(pin)) {
      return NextResponse.json(
        { error: 'Invalid PIN format. Please enter a 6-digit PIN.' },
        { status: 400 }
      )
    }

    // Find client by PIN
    const client = mockClients.find(c => c.pin === pin)
    
    if (!client) {
      return NextResponse.json(
        { error: 'Invalid PIN. Please check with your trainer.' },
        { status: 401 }
      )
    }

    // In a real app, you would:
    // 1. Query the database for the client with this PIN
    // 2. Create a session or JWT token
    // 3. Set secure httpOnly cookies
    
    return NextResponse.json({
      success: true,
      client: {
        id: client.id,
        name: client.name,
        email: client.email,
        pin: client.pin
      },
      redirectUrl: `/client/${pin}`
    })

  } catch (error) {
    console.error('PIN authentication error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
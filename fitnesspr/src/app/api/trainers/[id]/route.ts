import { NextRequest, NextResponse } from 'next/server'

// Mock trainer data
const mockTrainers = {
  "1": {
    id: "1",
    name: "Alex Thompson",
    email: "alex.thompson@fitnesspr.com",
    specialization: "Strength Training & Weight Loss",
    bio: "Certified personal trainer with 8+ years of experience helping clients achieve their fitness goals.",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-09-08T10:00:00Z"
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const trainer = mockTrainers[id as keyof typeof mockTrainers]
    
    if (!trainer) {
      return NextResponse.json(
        { error: 'Trainer not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(trainer)

  } catch (error) {
    console.error('Error fetching trainer:', error)
    return NextResponse.json(
      { error: 'Failed to fetch trainer' },
      { status: 500 }
    )
  }
}
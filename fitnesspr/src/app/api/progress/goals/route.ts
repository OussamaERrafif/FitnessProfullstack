import { NextRequest, NextResponse } from 'next/server'

// Mock goals data for clients
const mockGoals = {
  "1": [ // Sarah Johnson
    {
      id: "1",
      client_id: "1",
      title: "Lose 5kg in 3 months",
      description: "Sustainable weight loss through balanced nutrition and exercise",
      target_value: 63,
      target_unit: "kg",
      target_date: "2025-12-01",
      current_value: 68.2,
      status: "active",
      created_at: "2025-09-01T00:00:00Z",
      achieved_at: null
    },
    {
      id: "2",
      client_id: "1", 
      title: "Complete 50 push-ups in a row",
      description: "Build upper body strength progressively",
      target_value: 50,
      target_unit: "reps",
      target_date: "2025-11-01",
      current_value: 12,
      status: "active",
      created_at: "2025-09-01T00:00:00Z",
      achieved_at: null
    },
    {
      id: "3",
      client_id: "1",
      title: "Workout 4 times per week",
      description: "Maintain consistent exercise routine",
      target_value: 4,
      target_unit: "sessions/week",
      target_date: "2025-12-31",
      current_value: 3,
      status: "active",
      created_at: "2025-09-01T00:00:00Z",
      achieved_at: null
    }
  ],
  "2": [ // Mike Chen
    {
      id: "4",
      client_id: "2",
      title: "Gain 5kg muscle mass",
      description: "Build lean muscle through strength training",
      target_value: 87,
      target_unit: "kg",
      target_date: "2025-12-15",
      current_value: 82.1,
      status: "active",
      created_at: "2025-08-15T00:00:00Z",
      achieved_at: null
    },
    {
      id: "5",
      client_id: "2",
      title: "Run 5km under 25 minutes",
      description: "Improve cardiovascular endurance",
      target_value: 25,
      target_unit: "minutes",
      target_date: "2025-11-01",
      current_value: 28,
      status: "active",
      created_at: "2025-08-15T00:00:00Z",
      achieved_at: null
    },
    {
      id: "6",
      client_id: "2",
      title: "Master proper deadlift form",
      description: "Learn correct technique for safe lifting",
      status: "achieved",
      created_at: "2025-08-15T00:00:00Z",
      achieved_at: "2025-09-01T00:00:00Z"
    }
  ],
  "3": [],
  "4": [],
  "5": []
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('client_id')
    
    if (!clientId) {
      return NextResponse.json(
        { error: 'Client ID is required' },
        { status: 400 }
      )
    }
    
    const goals = mockGoals[clientId as keyof typeof mockGoals] || []
    
    return NextResponse.json(goals)

  } catch (error) {
    console.error('Error fetching goals:', error)
    return NextResponse.json(
      { error: 'Failed to fetch goals' },
      { status: 500 }
    )
  }
}
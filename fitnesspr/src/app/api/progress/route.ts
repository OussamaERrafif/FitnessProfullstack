import { NextRequest, NextResponse } from 'next/server'

// Mock progress data for clients
const mockProgress = {
  "1": [ // Sarah Johnson
    {
      id: "1",
      client_id: "1",
      measurement_type: "weight",
      value: 68.2,
      unit: "kg",
      date: "2025-09-06",
      notes: "Feeling stronger!",
      created_at: "2025-09-06T08:00:00Z",
      updated_at: "2025-09-06T08:00:00Z"
    },
    {
      id: "2", 
      client_id: "1",
      measurement_type: "weight",
      value: 68.5,
      unit: "kg", 
      date: "2025-09-04",
      notes: "Great workout today",
      created_at: "2025-09-04T08:00:00Z",
      updated_at: "2025-09-04T08:00:00Z"
    },
    {
      id: "3",
      client_id: "1",
      measurement_type: "weight", 
      value: 68.8,
      unit: "kg",
      date: "2025-09-02",
      notes: "Starting to see progress",
      created_at: "2025-09-02T08:00:00Z",
      updated_at: "2025-09-02T08:00:00Z"
    },
    {
      id: "4",
      client_id: "1",
      measurement_type: "body_fat",
      value: 22.5,
      unit: "%",
      date: "2025-09-01",
      notes: "Baseline measurement",
      created_at: "2025-09-01T08:00:00Z",
      updated_at: "2025-09-01T08:00:00Z"
    }
  ],
  "2": [ // Mike Chen
    {
      id: "5",
      client_id: "2",
      measurement_type: "weight",
      value: 82.1,
      unit: "kg",
      date: "2025-09-06",
      notes: "Energy levels improving!",
      created_at: "2025-09-06T08:00:00Z",
      updated_at: "2025-09-06T08:00:00Z"
    },
    {
      id: "6",
      client_id: "2",
      measurement_type: "weight",
      value: 82.4,
      unit: "kg",
      date: "2025-09-04",
      notes: "Tough but rewarding session",
      created_at: "2025-09-04T08:00:00Z",
      updated_at: "2025-09-04T08:00:00Z"
    },
    {
      id: "7",
      client_id: "2",
      measurement_type: "weight",
      value: 82.7,
      unit: "kg", 
      date: "2025-09-02",
      notes: "Making good progress",
      created_at: "2025-09-02T08:00:00Z",
      updated_at: "2025-09-02T08:00:00Z"
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
    
    const progress = mockProgress[clientId as keyof typeof mockProgress] || []
    
    // Sort by date (newest first)
    const sortedProgress = progress.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    
    return NextResponse.json(sortedProgress)

  } catch (error) {
    console.error('Error fetching progress:', error)
    return NextResponse.json(
      { error: 'Failed to fetch progress' },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'

// Mock workout statistics for clients
const mockWorkoutStats = {
  "1": { // Sarah Johnson
    total_workouts: 12,
    total_exercises: 48,
    average_duration: 45,
    workout_frequency: 3,
    strength_progress: 15.5
  },
  "2": { // Mike Chen  
    total_workouts: 20,
    total_exercises: 80,
    average_duration: 60,
    workout_frequency: 5,
    strength_progress: 22.3
  },
  "3": {
    total_workouts: 0,
    total_exercises: 0,
    average_duration: 0,
    workout_frequency: 0,
    strength_progress: 0
  },
  "4": {
    total_workouts: 8,
    total_exercises: 24,
    average_duration: 30,
    workout_frequency: 2,
    strength_progress: 8.1
  },
  "5": {
    total_workouts: 25,
    total_exercises: 125,
    average_duration: 75,
    workout_frequency: 6,
    strength_progress: 35.7
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const { clientId } = await params
    
    const stats = mockWorkoutStats[clientId as keyof typeof mockWorkoutStats] || {
      total_workouts: 0,
      total_exercises: 0,
      average_duration: 0,
      workout_frequency: 0,
      strength_progress: 0
    }
    
    return NextResponse.json(stats)

  } catch (error) {
    console.error('Error fetching workout stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch workout stats' },
      { status: 500 }
    )
  }
}
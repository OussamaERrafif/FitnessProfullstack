import { NextRequest, NextResponse } from 'next/server'

// Mock training programs for clients
const mockPrograms = {
  "1": [ // Sarah Johnson
    {
      id: "1",
      name: "Full Body Strength & Cardio",
      description: "4-week program focused on building strength and improving cardiovascular health",
      client_id: "1", 
      trainer_id: "1",
      duration_weeks: 4,
      sessions_per_week: 4,
      difficulty_level: "intermediate",
      goals: "Weight loss and strength building",
      is_active: true,
      exercises: [
        {
          id: "1",
          exercise_id: "e1",
          exercise: {
            id: "e1",
            name: "Push-ups",
            description: "Standard push-ups for upper body strength",
            category: "Upper Body",
            muscle_groups: ["chest", "triceps", "shoulders"],
            difficulty_level: "intermediate"
          },
          sets: 3,
          reps: "12",
          rest_seconds: 60,
          notes: "Keep core tight throughout the movement",
          order_in_program: 1,
          week_number: 1,
          day_number: 1, // Monday
          completed: true
        },
        {
          id: "2", 
          exercise_id: "e2",
          exercise: {
            id: "e2",
            name: "Squats",
            description: "Bodyweight squats for leg strength",
            category: "Lower Body", 
            muscle_groups: ["quadriceps", "glutes", "hamstrings"],
            difficulty_level: "beginner"
          },
          sets: 3,
          reps: "15",
          rest_seconds: 90,
          notes: "Go down until thighs are parallel to floor",
          order_in_program: 2,
          week_number: 1,
          day_number: 1, // Monday
          completed: true
        },
        {
          id: "3",
          exercise_id: "e3", 
          exercise: {
            id: "e3",
            name: "Plank",
            description: "Core stability exercise",
            category: "Core",
            muscle_groups: ["core", "abs"],
            difficulty_level: "beginner"
          },
          sets: 3,
          reps: "30 seconds",
          rest_seconds: 45,
          notes: "Maintain straight line from head to heels",
          order_in_program: 3,
          week_number: 1,
          day_number: 1, // Monday  
          completed: false
        },
        {
          id: "4",
          exercise_id: "e4",
          exercise: {
            id: "e4", 
            name: "Jumping Jacks",
            description: "Cardio exercise for heart rate",
            category: "Cardio",
            muscle_groups: ["full body"],
            difficulty_level: "beginner"
          },
          sets: 2,
          reps: "20",
          rest_seconds: 30,
          notes: "Keep consistent rhythm",
          order_in_program: 4,
          week_number: 1,
          day_number: 1, // Monday
          completed: false
        }
      ],
      created_at: "2025-09-01T00:00:00Z",
      updated_at: "2025-09-08T10:00:00Z"
    }
  ],
  "2": [ // Mike Chen
    {
      id: "2",
      name: "Weight Loss Program",
      description: "6-week intensive program for maximum calorie burn and strength",
      client_id: "2",
      trainer_id: "1", 
      duration_weeks: 6,
      sessions_per_week: 5,
      difficulty_level: "advanced",
      goals: "Muscle building and cardio improvement",
      is_active: true,
      exercises: [
        {
          id: "5",
          exercise_id: "e5",
          exercise: {
            id: "e5",
            name: "Burpees", 
            description: "Full body cardio and strength exercise",
            category: "Full Body",
            muscle_groups: ["full body"],
            difficulty_level: "advanced"
          },
          sets: 4,
          reps: "10",
          rest_seconds: 90,
          notes: "Focus on explosive movement",
          order_in_program: 1,
          week_number: 1,
          day_number: 1, // Monday
          completed: true
        },
        {
          id: "6",
          exercise_id: "e6",
          exercise: {
            id: "e6",
            name: "Mountain Climbers",
            description: "High intensity cardio exercise",
            category: "Cardio",
            muscle_groups: ["core", "legs"],
            difficulty_level: "intermediate"
          },
          sets: 3,
          reps: "20",
          rest_seconds: 60,
          notes: "Keep hips level throughout",
          order_in_program: 2,
          week_number: 1,
          day_number: 1, // Monday
          completed: true
        },
        {
          id: "7",
          exercise_id: "e7",
          exercise: {
            id: "e7",
            name: "Kettlebell Swings",
            description: "Dynamic hip hinge movement",
            category: "Lower Body",
            muscle_groups: ["glutes", "hamstrings", "core"],
            difficulty_level: "intermediate"
          },
          sets: 3,
          reps: "15",
          weight: 16,
          rest_seconds: 90,
          notes: "Drive with hips, not arms",
          order_in_program: 3,
          week_number: 1,
          day_number: 1, // Monday
          completed: false
        },
        {
          id: "8",
          exercise_id: "e8",
          exercise: {
            id: "e8",
            name: "Jump Rope",
            description: "Cardio endurance exercise",
            category: "Cardio",
            muscle_groups: ["calves", "cardiovascular"],
            difficulty_level: "intermediate"
          },
          sets: 3,
          reps: "1 minute",
          rest_seconds: 60,
          notes: "Stay light on feet",
          order_in_program: 4,
          week_number: 1,
          day_number: 1, // Monday
          completed: false
        }
      ],
      created_at: "2025-08-15T00:00:00Z",
      updated_at: "2025-09-08T10:00:00Z"
    }
  ],
  // Add programs for other clients
  "3": [],
  "4": [],
  "5": []
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const { clientId } = await params
    
    const programs = mockPrograms[clientId as keyof typeof mockPrograms] || []
    
    return NextResponse.json(programs)

  } catch (error) {
    console.error('Error fetching client programs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch programs' },
      { status: 500 }
    )
  }
}
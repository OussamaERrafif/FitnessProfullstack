import { NextRequest, NextResponse } from 'next/server'

// Mock client data with complete profiles
const mockClients = {
  "123456": {
    id: "1",
    name: "Sarah Johnson", 
    email: "sarah.j@email.com",
    pin: "123456",
    trainer: "Alex Thompson",
    currentTrainingPlan: {
      title: "Full Body Strength & Cardio",
      description: "4-week program focused on building strength and improving cardiovascular health",
      exercises: [
        { id: 1, name: "Push-ups", sets: "3 sets × 12", completed: true },
        { id: 2, name: "Squats", sets: "3 sets × 15", completed: true },
        { id: 3, name: "Plank", sets: "3 sets × 30s", completed: false },
        { id: 4, name: "Jumping Jacks", sets: "2 sets × 20", completed: false }
      ]
    },
    currentMealPlan: {
      title: "Balanced Nutrition Plan",
      todaysMeals: [
        { id: 1, name: "Greek Yogurt with Berries", type: "Breakfast", calories: 250, completed: true },
        { id: 2, name: "Grilled Chicken Salad", type: "Lunch", calories: 400, completed: true },
        { id: 3, name: "Apple with Almond Butter", type: "Snack", calories: 180, completed: false },
        { id: 4, name: "Salmon with Vegetables", type: "Dinner", calories: 450, completed: false }
      ]
    },
    recentProgress: [
      { date: "2025-09-06", weight: 68.2, notes: "Feeling stronger!" },
      { date: "2025-09-04", weight: 68.5, notes: "Great workout today" },
      { date: "2025-09-02", weight: 68.8, notes: "Starting to see progress" }
    ],
    currentGoal: "Weight loss and strength building"
  },
  "654321": {
    id: "2",
    name: "Mike Chen",
    email: "mike.chen@email.com", 
    pin: "654321",
    trainer: "Alex Thompson",
    currentTrainingPlan: {
      title: "Weight Loss Program",
      description: "6-week intensive program for maximum calorie burn and strength",
      exercises: [
        { id: 1, name: "Burpees", sets: "4 sets × 10", completed: true },
        { id: 2, name: "Mountain Climbers", sets: "3 sets × 20", completed: true },
        { id: 3, name: "Kettlebell Swings", sets: "3 sets × 15", completed: false },
        { id: 4, name: "Jump Rope", sets: "3 sets × 1 min", completed: false }
      ]
    },
    currentMealPlan: {
      title: "High Protein Low Carb",
      todaysMeals: [
        { id: 1, name: "Protein Smoothie", type: "Breakfast", calories: 300, completed: true },
        { id: 2, name: "Turkey Wrap", type: "Lunch", calories: 350, completed: false },
        { id: 3, name: "Protein Bar", type: "Snack", calories: 200, completed: false },
        { id: 4, name: "Grilled Fish & Veggies", type: "Dinner", calories: 400, completed: false }
      ]
    },
    recentProgress: [
      { date: "2025-09-06", weight: 82.1, notes: "Energy levels improving!" },
      { date: "2025-09-04", weight: 82.4, notes: "Tough but rewarding session" },
      { date: "2025-09-02", weight: 82.7, notes: "Making good progress" }
    ],
    currentGoal: "Lose 10kg and build lean muscle"
  },
  "111222": {
    id: "3",
    name: "Emily Davis",
    email: "emily.d@email.com",
    pin: "111222", 
    trainer: "Alex Thompson",
    currentTrainingPlan: {
      title: "Cardio Focus Program",
      description: "Intensive cardio program for endurance and heart health",
      exercises: [
        { id: 1, name: "Running", sets: "30 minutes", completed: false },
        { id: 2, name: "Cycling", sets: "20 minutes", completed: false },
        { id: 3, name: "Rowing", sets: "15 minutes", completed: false }
      ]
    },
    currentMealPlan: {
      title: "Endurance Nutrition",
      todaysMeals: [
        { id: 1, name: "Oatmeal with Banana", type: "Breakfast", calories: 350, completed: false },
        { id: 2, name: "Quinoa Bowl", type: "Lunch", calories: 400, completed: false },
        { id: 3, name: "Energy Bar", type: "Snack", calories: 150, completed: false },
        { id: 4, name: "Pasta with Chicken", type: "Dinner", calories: 500, completed: false }
      ]
    },
    recentProgress: [
      { date: "2025-08-20", weight: 65.0, notes: "Getting back into routine" }
    ],
    currentGoal: "Improve cardiovascular endurance"
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ pin: string }> }
) {
  try {
    const { pin } = await params

    const client = mockClients[pin as keyof typeof mockClients]
    
    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ client })

  } catch (error) {
    console.error('Error fetching client data:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
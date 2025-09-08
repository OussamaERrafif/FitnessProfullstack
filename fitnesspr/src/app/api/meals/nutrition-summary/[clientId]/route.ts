import { NextRequest, NextResponse } from 'next/server'

// Mock nutrition summary data for clients
const mockNutritionSummary = {
  "1": { // Sarah Johnson
    total_calories: 1280,
    total_protein: 55,
    total_carbs: 55,
    total_fat: 20,
    meals_completed: 2,
    meals_total: 4
  },
  "2": { // Mike Chen
    total_calories: 300,
    total_protein: 35,
    total_carbs: 25,
    total_fat: 8,
    meals_completed: 1,
    meals_total: 4
  },
  "3": {
    total_calories: 0,
    total_protein: 0,
    total_carbs: 0,
    total_fat: 0,
    meals_completed: 0,
    meals_total: 0
  },
  "4": {
    total_calories: 0,
    total_protein: 0,
    total_carbs: 0,
    total_fat: 0,
    meals_completed: 0,
    meals_total: 0
  },
  "5": {
    total_calories: 0,
    total_protein: 0,
    total_carbs: 0,
    total_fat: 0,
    meals_completed: 0,
    meals_total: 0
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const { clientId } = await params
    
    const summary = mockNutritionSummary[clientId as keyof typeof mockNutritionSummary] || {
      total_calories: 0,
      total_protein: 0,
      total_carbs: 0,
      total_fat: 0,
      meals_completed: 0,
      meals_total: 0
    }
    
    return NextResponse.json(summary)

  } catch (error) {
    console.error('Error fetching nutrition summary:', error)
    return NextResponse.json(
      { error: 'Failed to fetch nutrition summary' },
      { status: 500 }
    )
  }
}
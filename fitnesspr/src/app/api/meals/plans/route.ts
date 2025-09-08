import { NextRequest, NextResponse } from 'next/server'

// Mock meal plans for clients
const mockMealPlans = {
  "1": [ // Sarah Johnson
    {
      id: "1",
      name: "Balanced Nutrition Plan",
      trainer_id: "1",
      client_id: "1",
      start_date: "2025-09-01",
      end_date: "2025-09-30",
      target_calories: 1800,
      target_protein: 120,
      target_carbs: 200,
      target_fat: 60,
      is_active: true,
      meals: [
        {
          id: "1",
          meal_plan_id: "1",
          meal_id: "m1",
          meal: {
            id: "m1",
            name: "Greek Yogurt with Berries",
            description: "High protein breakfast with antioxidants",
            meal_type: "breakfast",
            calories_per_serving: 250,
            protein_grams: 20,
            carbs_grams: 30,
            fat_grams: 5,
            preparation_time: 5,
            is_vegetarian: true
          },
          day_of_week: 1, // Monday
          meal_order: 1,
          portions: 1,
          is_completed: true
        },
        {
          id: "2", 
          meal_plan_id: "1",
          meal_id: "m2",
          meal: {
            id: "m2",
            name: "Grilled Chicken Salad",
            description: "Lean protein with mixed vegetables",
            meal_type: "lunch",
            calories_per_serving: 400,
            protein_grams: 35,
            carbs_grams: 25,
            fat_grams: 15,
            preparation_time: 15,
            is_vegetarian: false
          },
          day_of_week: 1, // Monday
          meal_order: 2,
          portions: 1,
          is_completed: true
        },
        {
          id: "3",
          meal_plan_id: "1", 
          meal_id: "m3",
          meal: {
            id: "m3",
            name: "Apple with Almond Butter",
            description: "Healthy snack with fiber and healthy fats",
            meal_type: "snack",
            calories_per_serving: 180,
            protein_grams: 6,
            carbs_grams: 20,
            fat_grams: 10,
            preparation_time: 2,
            is_vegetarian: true
          },
          day_of_week: 1, // Monday
          meal_order: 3,
          portions: 1,
          is_completed: false
        },
        {
          id: "4",
          meal_plan_id: "1",
          meal_id: "m4", 
          meal: {
            id: "m4",
            name: "Salmon with Vegetables",
            description: "Omega-3 rich fish with roasted vegetables",
            meal_type: "dinner",
            calories_per_serving: 450,
            protein_grams: 40,
            carbs_grams: 30,
            fat_grams: 20,
            preparation_time: 25,
            is_vegetarian: false
          },
          day_of_week: 1, // Monday
          meal_order: 4,
          portions: 1,
          is_completed: false
        }
      ],
      created_at: "2025-09-01T00:00:00Z",
      updated_at: "2025-09-08T10:00:00Z"
    }
  ],
  "2": [ // Mike Chen  
    {
      id: "2",
      name: "High Protein Low Carb",
      trainer_id: "1",
      client_id: "2",
      start_date: "2025-08-15",
      end_date: "2025-10-15",
      target_calories: 2200,
      target_protein: 180,
      target_carbs: 150,
      target_fat: 80,
      is_active: true,
      meals: [
        {
          id: "5",
          meal_plan_id: "2",
          meal_id: "m5",
          meal: {
            id: "m5",
            name: "Protein Smoothie",
            description: "Whey protein with berries and spinach",
            meal_type: "breakfast",
            calories_per_serving: 300,
            protein_grams: 35,
            carbs_grams: 25,
            fat_grams: 8,
            preparation_time: 5,
            is_vegetarian: true
          },
          day_of_week: 1, // Monday
          meal_order: 1,
          portions: 1,
          is_completed: true
        },
        {
          id: "6",
          meal_plan_id: "2",
          meal_id: "m6",
          meal: {
            id: "m6",
            name: "Turkey Wrap",
            description: "Lean turkey with vegetables in whole grain wrap",
            meal_type: "lunch",
            calories_per_serving: 350,
            protein_grams: 30,
            carbs_grams: 35,
            fat_grams: 12,
            preparation_time: 10,
            is_vegetarian: false
          },
          day_of_week: 1, // Monday
          meal_order: 2,
          portions: 1,
          is_completed: false
        },
        {
          id: "7",
          meal_plan_id: "2",
          meal_id: "m7",
          meal: {
            id: "m7",
            name: "Protein Bar",
            description: "High protein snack for muscle recovery",
            meal_type: "snack",
            calories_per_serving: 200,
            protein_grams: 20,
            carbs_grams: 15,
            fat_grams: 8,
            preparation_time: 0,
            is_vegetarian: true
          },
          day_of_week: 1, // Monday
          meal_order: 3,
          portions: 1,
          is_completed: false
        },
        {
          id: "8",
          meal_plan_id: "2",
          meal_id: "m8",
          meal: {
            id: "m8",
            name: "Grilled Fish & Veggies",
            description: "White fish with steamed broccoli and quinoa",
            meal_type: "dinner",
            calories_per_serving: 400,
            protein_grams: 45,
            carbs_grams: 25,
            fat_grams: 15,
            preparation_time: 20,
            is_vegetarian: false
          },
          day_of_week: 1, // Monday
          meal_order: 4,
          portions: 1,
          is_completed: false
        }
      ],
      created_at: "2025-08-15T00:00:00Z",
      updated_at: "2025-09-08T10:00:00Z"
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
    
    const mealPlans = mockMealPlans[clientId as keyof typeof mockMealPlans] || []
    
    return NextResponse.json(mealPlans)

  } catch (error) {
    console.error('Error fetching meal plans:', error)
    return NextResponse.json(
      { error: 'Failed to fetch meal plans' },
      { status: 500 }
    )
  }
}
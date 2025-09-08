/**
 * Meals service for backend integration
 */

import { apiRequest, API_ENDPOINTS } from './api-client';
import { authService } from './auth-service';

export interface Meal {
  id: string;
  name: string;
  description?: string;
  trainer_id: string;
  client_id?: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'pre_workout' | 'post_workout';
  preparation_time?: number;
  cooking_time?: number;
  servings?: number;
  calories_per_serving?: number;
  protein_grams?: number;
  carbs_grams?: number;
  fat_grams?: number;
  fiber_grams?: number;
  sugar_grams?: number;
  ingredients?: string;
  instructions?: string;
  image_url?: string;
  is_vegetarian?: boolean;
  is_vegan?: boolean;
  is_gluten_free?: boolean;
  is_dairy_free?: boolean;
  is_template?: boolean;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
}

export interface MealPlan {
  id: string;
  name: string;
  trainer_id: string;
  client_id: string;
  start_date?: string;
  end_date?: string;
  target_calories?: number;
  target_protein?: number;
  target_carbs?: number;
  target_fat?: number;
  is_active?: boolean;
  meals: MealPlanMeal[];
  created_at: string;
  updated_at: string;
}

export interface MealPlanMeal {
  id: string;
  meal_plan_id: string;
  meal_id: string;
  meal: Meal;
  day_of_week: number; // 1 = Monday, 7 = Sunday
  meal_order: number; // Order of meal in the day
  portions: number;
  is_completed?: boolean;
}

export interface CreateMealRequest {
  name: string;
  description?: string;
  client_id?: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'pre_workout' | 'post_workout';
  preparation_time?: number;
  cooking_time?: number;
  servings?: number;
  calories_per_serving?: number;
  protein_grams?: number;
  carbs_grams?: number;
  fat_grams?: number;
  fiber_grams?: number;
  sugar_grams?: number;
  ingredients?: string;
  instructions?: string;
  image_url?: string;
  is_vegetarian?: boolean;
  is_vegan?: boolean;
  is_gluten_free?: boolean;
  is_dairy_free?: boolean;
  is_template?: boolean;
}

export interface CreateMealPlanRequest {
  name: string;
  client_id: string;
  start_date?: string;
  end_date?: string;
  target_calories?: number;
  target_protein?: number;
  target_carbs?: number;
  target_fat?: number;
  meals?: {
    meal_id: string;
    day_of_week: number;
    meal_order: number;
    portions: number;
  }[];
}

export interface UpdateMealRequest extends Partial<CreateMealRequest> {
  id: string;
}

export interface UpdateMealPlanRequest extends Partial<CreateMealPlanRequest> {
  id: string;
}

export const mealsService = {
  /**
   * Get all meals for a client (including templates)
   */
  async getClientMeals(clientId: string): Promise<Meal[]> {
    try {
      const response = await apiRequest<Meal[]>(
        `${API_ENDPOINTS.meals.list()}?client_id=${clientId}`,
        {
          method: 'GET',
          headers: authService.getAuthHeaders(),
        }
      );
      
      return response;
    } catch (error) {
      console.error(`Failed to fetch meals for client ${clientId}:`, error);
      throw error;
    }
  },

  /**
   * Get meal templates
   */
  async getMealTemplates(): Promise<Meal[]> {
    try {
      const response = await apiRequest<Meal[]>(
        '/meals/templates',
        {
          method: 'GET',
          headers: authService.getAuthHeaders(),
        }
      );
      
      return response;
    } catch (error) {
      console.error('Failed to fetch meal templates:', error);
      throw error;
    }
  },

  /**
   * Get a specific meal by ID
   */
  async getMeal(id: string): Promise<Meal> {
    try {
      const response = await apiRequest<Meal>(
        API_ENDPOINTS.meals.get(id),
        {
          method: 'GET',
          headers: authService.getAuthHeaders(),
        }
      );
      
      return response;
    } catch (error) {
      console.error(`Failed to fetch meal ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new meal
   */
  async createMeal(mealData: CreateMealRequest): Promise<Meal> {
    try {
      const response = await apiRequest<Meal>(
        API_ENDPOINTS.meals.create(),
        {
          method: 'POST',
          headers: authService.getAuthHeaders(),
          body: JSON.stringify(mealData),
        }
      );
      
      return response;
    } catch (error) {
      console.error('Failed to create meal:', error);
      throw error;
    }
  },

  /**
   * Update an existing meal
   */
  async updateMeal(mealData: UpdateMealRequest): Promise<Meal> {
    try {
      const { id, ...updateData } = mealData;
      const response = await apiRequest<Meal>(
        API_ENDPOINTS.meals.update(id),
        {
          method: 'PUT',
          headers: authService.getAuthHeaders(),
          body: JSON.stringify(updateData),
        }
      );
      
      return response;
    } catch (error) {
      console.error(`Failed to update meal ${mealData.id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a meal
   */
  async deleteMeal(id: string): Promise<void> {
    try {
      await apiRequest<void>(
        API_ENDPOINTS.meals.delete(id),
        {
          method: 'DELETE',
          headers: authService.getAuthHeaders(),
        }
      );
    } catch (error) {
      console.error(`Failed to delete meal ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get all meal plans for a client
   */
  async getClientMealPlans(clientId: string): Promise<MealPlan[]> {
    try {
      const response = await apiRequest<MealPlan[]>(
        `/meals/plans?client_id=${clientId}`,
        {
          method: 'GET',
          headers: authService.getAuthHeaders(),
        }
      );
      
      return response;
    } catch (error) {
      console.error(`Failed to fetch meal plans for client ${clientId}:`, error);
      throw error;
    }
  },

  /**
   * Get current active meal plan for a client
   */
  async getCurrentMealPlan(clientId: string): Promise<MealPlan | null> {
    try {
      const mealPlans = await this.getClientMealPlans(clientId);
      const activePlan = mealPlans.find(plan => plan.is_active);
      return activePlan || null;
    } catch (error) {
      console.error(`Failed to fetch current meal plan for client ${clientId}:`, error);
      throw error;
    }
  },

  /**
   * Get a specific meal plan by ID
   */
  async getMealPlan(id: string): Promise<MealPlan> {
    try {
      const response = await apiRequest<MealPlan>(
        `/meals/plans/${id}`,
        {
          method: 'GET',
          headers: authService.getAuthHeaders(),
        }
      );
      
      return response;
    } catch (error) {
      console.error(`Failed to fetch meal plan ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new meal plan
   */
  async createMealPlan(mealPlanData: CreateMealPlanRequest): Promise<MealPlan> {
    try {
      const response = await apiRequest<MealPlan>(
        '/meals/plans',
        {
          method: 'POST',
          headers: authService.getAuthHeaders(),
          body: JSON.stringify(mealPlanData),
        }
      );
      
      return response;
    } catch (error) {
      console.error('Failed to create meal plan:', error);
      throw error;
    }
  },

  /**
   * Update an existing meal plan
   */
  async updateMealPlan(mealPlanData: UpdateMealPlanRequest): Promise<MealPlan> {
    try {
      const { id, ...updateData } = mealPlanData;
      const response = await apiRequest<MealPlan>(
        `/meals/plans/${id}`,
        {
          method: 'PUT',
          headers: authService.getAuthHeaders(),
          body: JSON.stringify(updateData),
        }
      );
      
      return response;
    } catch (error) {
      console.error(`Failed to update meal plan ${mealPlanData.id}:`, error);
      throw error;
    }
  },

  /**
   * Get today's meals for a client
   */
  async getTodayMeals(clientId: string): Promise<MealPlanMeal[]> {
    try {
      const currentMealPlan = await this.getCurrentMealPlan(clientId);
      if (!currentMealPlan) {
        return [];
      }

      // Get today's day of the week (1 = Monday, 7 = Sunday)
      const today = new Date().getDay();
      const dayNumber = today === 0 ? 7 : today; // Convert Sunday from 0 to 7

      // Filter meals for today
      const todayMeals = currentMealPlan.meals.filter(
        meal => meal.day_of_week === dayNumber
      );

      return todayMeals.sort((a, b) => a.meal_order - b.meal_order);
    } catch (error) {
      console.error(`Failed to fetch today's meals for client ${clientId}:`, error);
      return [];
    }
  },

  /**
   * Mark meal as completed
   */
  async markMealCompleted(
    mealPlanId: string, 
    mealPlanMealId: string, 
    completed: boolean = true
  ): Promise<void> {
    try {
      await apiRequest<void>(
        `/meals/plans/${mealPlanId}/meals/${mealPlanMealId}/complete`,
        {
          method: 'POST',
          headers: authService.getAuthHeaders(),
          body: JSON.stringify({ completed }),
        }
      );
    } catch (error) {
      console.error(`Failed to mark meal ${mealPlanMealId} as completed:`, error);
      throw error;
    }
  },

  /**
   * Get nutrition summary for a client
   */
  async getNutritionSummary(clientId: string, date?: string): Promise<{
    total_calories: number;
    total_protein: number;
    total_carbs: number;
    total_fat: number;
    meals_completed: number;
    meals_total: number;
  }> {
    try {
      const params = new URLSearchParams();
      if (date) params.append('date', date);

      const response = await apiRequest<{
        total_calories: number;
        total_protein: number;
        total_carbs: number;
        total_fat: number;
        meals_completed: number;
        meals_total: number;
      }>(
        `/meals/nutrition-summary/${clientId}?${params.toString()}`,
        {
          method: 'GET',
          headers: authService.getAuthHeaders(),
        }
      );
      
      return response;
    } catch (error) {
      console.error(`Failed to fetch nutrition summary for client ${clientId}:`, error);
      return {
        total_calories: 0,
        total_protein: 0,
        total_carbs: 0,
        total_fat: 0,
        meals_completed: 0,
        meals_total: 0,
      };
    }
  },

  /**
   * Search meals by name or ingredients
   */
  async searchMeals(query: string, mealType?: string): Promise<Meal[]> {
    try {
      const params = new URLSearchParams();
      if (query) params.append('search', query);
      if (mealType) params.append('meal_type', mealType);

      const response = await apiRequest<Meal[]>(
        `${API_ENDPOINTS.meals.list()}?${params.toString()}`,
        {
          method: 'GET',
          headers: authService.getAuthHeaders(),
        }
      );
      
      return response;
    } catch (error) {
      console.error('Failed to search meals:', error);
      throw error;
    }
  },
};
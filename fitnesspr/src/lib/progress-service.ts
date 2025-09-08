/**
 * Progress service for backend integration
 */

import { apiRequest, API_ENDPOINTS } from './api-client';
import { authService } from './auth-service';

export interface ProgressEntry {
  id: string;
  client_id: string;
  measurement_type: 'weight' | 'body_fat' | 'muscle_mass' | 'measurements' | 'performance';
  value: number;
  unit: string;
  date: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface WorkoutLog {
  id: string;
  client_id: string;
  session_id?: string;
  exercises: {
    exercise_id: string;
    exercise_name: string;
    sets: number;
    reps: number;
    weight?: number;
    duration?: number;
    notes?: string;
  }[];
  workout_date: string;
  duration_minutes: number;
  notes?: string;
  created_at: string;
}

export interface Goal {
  id: string;
  client_id: string;
  title: string;
  description?: string;
  target_value?: number;
  target_unit?: string;
  target_date?: string;
  current_value?: number;
  status: 'active' | 'achieved' | 'paused' | 'cancelled';
  created_at: string;
  achieved_at?: string;
}

export interface CreateProgressRequest {
  client_id: string;
  measurement_type: 'weight' | 'body_fat' | 'muscle_mass' | 'measurements' | 'performance';
  value: number;
  unit: string;
  date?: string;
  notes?: string;
}

export interface CreateWorkoutLogRequest {
  client_id: string;
  session_id?: string;
  exercises: {
    exercise_id: string;
    sets: number;
    reps: number;
    weight?: number;
    duration?: number;
    notes?: string;
  }[];
  workout_date?: string;
  duration_minutes: number;
  notes?: string;
}

export interface CreateGoalRequest {
  client_id: string;
  title: string;
  description?: string;
  target_value?: number;
  target_unit?: string;
  target_date?: string;
}

export const progressService = {
  /**
   * Get progress entries for a client
   */
  async getClientProgress(clientId: string): Promise<ProgressEntry[]> {
    try {
      const response = await apiRequest<ProgressEntry[]>(
        `${API_ENDPOINTS.progress.list()}?client_id=${clientId}`,
        {
          method: 'GET',
          headers: authService.getAuthHeaders(),
        }
      );
      
      return response;
    } catch (error) {
      console.error(`Failed to fetch progress for client ${clientId}:`, error);
      throw error;
    }
  },

  /**
   * Create a new progress entry
   */
  async createProgressEntry(progressData: CreateProgressRequest): Promise<ProgressEntry> {
    try {
      const response = await apiRequest<ProgressEntry>(
        API_ENDPOINTS.progress.create(),
        {
          method: 'POST',
          headers: authService.getAuthHeaders(),
          body: JSON.stringify(progressData),
        }
      );
      
      return response;
    } catch (error) {
      console.error('Failed to create progress entry:', error);
      throw error;
    }
  },

  /**
   * Get workout logs for a client
   */
  async getClientWorkouts(clientId: string): Promise<WorkoutLog[]> {
    try {
      const response = await apiRequest<WorkoutLog[]>(
        `/progress/workouts?client_id=${clientId}`,
        {
          method: 'GET',
          headers: authService.getAuthHeaders(),
        }
      );
      
      return response;
    } catch (error) {
      console.error(`Failed to fetch workouts for client ${clientId}:`, error);
      throw error;
    }
  },

  /**
   * Create a new workout log
   */
  async createWorkoutLog(workoutData: CreateWorkoutLogRequest): Promise<WorkoutLog> {
    try {
      const response = await apiRequest<WorkoutLog>(
        '/progress/workouts',
        {
          method: 'POST',
          headers: authService.getAuthHeaders(),
          body: JSON.stringify(workoutData),
        }
      );
      
      return response;
    } catch (error) {
      console.error('Failed to create workout log:', error);
      throw error;
    }
  },

  /**
   * Get goals for a client
   */
  async getClientGoals(clientId: string): Promise<Goal[]> {
    try {
      const response = await apiRequest<Goal[]>(
        `/progress/goals?client_id=${clientId}`,
        {
          method: 'GET',
          headers: authService.getAuthHeaders(),
        }
      );
      
      return response;
    } catch (error) {
      console.error(`Failed to fetch goals for client ${clientId}:`, error);
      throw error;
    }
  },

  /**
   * Create a new goal
   */
  async createGoal(goalData: CreateGoalRequest): Promise<Goal> {
    try {
      const response = await apiRequest<Goal>(
        '/progress/goals',
        {
          method: 'POST',
          headers: authService.getAuthHeaders(),
          body: JSON.stringify(goalData),
        }
      );
      
      return response;
    } catch (error) {
      console.error('Failed to create goal:', error);
      throw error;
    }
  },

  /**
   * Mark a goal as achieved
   */
  async achieveGoal(goalId: string): Promise<Goal> {
    try {
      const response = await apiRequest<Goal>(
        `/progress/goals/${goalId}/achieve`,
        {
          method: 'PUT',
          headers: authService.getAuthHeaders(),
        }
      );
      
      return response;
    } catch (error) {
      console.error(`Failed to achieve goal ${goalId}:`, error);
      throw error;
    }
  },

  /**
   * Get workout statistics for a client
   */
  async getWorkoutStats(clientId: string): Promise<{
    total_workouts: number;
    total_exercises: number;
    average_duration: number;
    workout_frequency: number;
    strength_progress: number;
  }> {
    try {
      const response = await apiRequest<{
        total_workouts: number;
        total_exercises: number;
        average_duration: number;
        workout_frequency: number;
        strength_progress: number;
      }>(
        `/progress/workouts/stats/${clientId}`,
        {
          method: 'GET',
          headers: authService.getAuthHeaders(),
        }
      );
      
      return response;
    } catch (error) {
      console.error(`Failed to fetch workout stats for client ${clientId}:`, error);
      return {
        total_workouts: 0,
        total_exercises: 0,
        average_duration: 0,
        workout_frequency: 0,
        strength_progress: 0,
      };
    }
  },
};
/**
 * Exercises service for backend integration
 */

import { apiRequest, API_ENDPOINTS } from './api-client';
import { authService } from './auth-service';

export interface Exercise {
  id: string;
  name: string;
  description?: string;
  category: string;
  muscle_groups: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  equipment_needed?: string;
  instructions?: string;
  video_url?: string;
  image_url?: string;
  duration_minutes?: number;
  calories_burned?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateExerciseRequest {
  name: string;
  description?: string;
  category: string;
  muscle_groups: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  equipment_needed?: string;
  instructions?: string;
  video_url?: string;
  image_url?: string;
  duration_minutes?: number;
  calories_burned?: number;
}

export interface UpdateExerciseRequest extends Partial<CreateExerciseRequest> {
  id: string;
}

export interface ExerciseSearchQuery {
  category?: string;
  muscle_groups?: string;
  difficulty_level?: 'beginner' | 'intermediate' | 'advanced';
  equipment_needed?: string;
  name?: string;
}

export interface ExerciseListResponse {
  exercises: Exercise[];
  total: number;
  page: number;
  size: number;
}

export const exercisesService = {
  /**
   * Get all exercises
   */
  async getExercises(skip: number = 0, limit: number = 100): Promise<ExerciseListResponse> {
    try {
      const response = await apiRequest<ExerciseListResponse>(
        `${API_ENDPOINTS.exercises.list()}?skip=${skip}&limit=${limit}`,
        {
          method: 'GET',
          headers: authService.getAuthHeaders(),
        }
      );
      
      return response;
    } catch (error) {
      console.error('Failed to fetch exercises:', error);
      throw error;
    }
  },

  /**
   * Get a specific exercise by ID
   */
  async getExercise(id: string): Promise<Exercise> {
    try {
      const response = await apiRequest<Exercise>(
        API_ENDPOINTS.exercises.get(id),
        {
          method: 'GET',
          headers: authService.getAuthHeaders(),
        }
      );
      
      return response;
    } catch (error) {
      console.error(`Failed to fetch exercise ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new exercise
   */
  async createExercise(exerciseData: CreateExerciseRequest): Promise<Exercise> {
    try {
      const response = await apiRequest<Exercise>(
        API_ENDPOINTS.exercises.create(),
        {
          method: 'POST',
          headers: authService.getAuthHeaders(),
          body: JSON.stringify(exerciseData),
        }
      );
      
      return response;
    } catch (error) {
      console.error('Failed to create exercise:', error);
      throw error;
    }
  },

  /**
   * Update an existing exercise
   */
  async updateExercise(exerciseData: UpdateExerciseRequest): Promise<Exercise> {
    try {
      const { id, ...updateData } = exerciseData;
      const response = await apiRequest<Exercise>(
        API_ENDPOINTS.exercises.update(id),
        {
          method: 'PUT',
          headers: authService.getAuthHeaders(),
          body: JSON.stringify(updateData),
        }
      );
      
      return response;
    } catch (error) {
      console.error(`Failed to update exercise ${exerciseData.id}:`, error);
      throw error;
    }
  },

  /**
   * Delete an exercise
   */
  async deleteExercise(id: string): Promise<void> {
    try {
      await apiRequest<void>(
        API_ENDPOINTS.exercises.delete(id),
        {
          method: 'DELETE',
          headers: authService.getAuthHeaders(),
        }
      );
    } catch (error) {
      console.error(`Failed to delete exercise ${id}:`, error);
      throw error;
    }
  },

  /**
   * Search exercises with filters
   */
  async searchExercises(query: ExerciseSearchQuery, skip: number = 0, limit: number = 100): Promise<ExerciseListResponse> {
    try {
      const response = await apiRequest<ExerciseListResponse>(
        `${API_ENDPOINTS.exercises.list()}/search/?skip=${skip}&limit=${limit}`,
        {
          method: 'POST',
          headers: authService.getAuthHeaders(),
          body: JSON.stringify(query),
        }
      );
      
      return response;
    } catch (error) {
      console.error('Failed to search exercises:', error);
      throw error;
    }
  },

  /**
   * Get exercise categories
   */
  async getCategories(): Promise<string[]> {
    try {
      const response = await apiRequest<string[]>(
        `${API_ENDPOINTS.exercises.list()}/categories/`,
        {
          method: 'GET',
          headers: authService.getAuthHeaders(),
        }
      );
      
      return response;
    } catch (error) {
      console.error('Failed to fetch exercise categories:', error);
      throw error;
    }
  },

  /**
   * Get muscle groups
   */
  async getMuscleGroups(): Promise<string[]> {
    try {
      const response = await apiRequest<string[]>(
        `${API_ENDPOINTS.exercises.list()}/muscle-groups/`,
        {
          method: 'GET',
          headers: authService.getAuthHeaders(),
        }
      );
      
      return response;
    } catch (error) {
      console.error('Failed to fetch muscle groups:', error);
      throw error;
    }
  },

  /**
   * Get exercises by category
   */
  async getExercisesByCategory(category: string, skip: number = 0, limit: number = 100): Promise<ExerciseListResponse> {
    try {
      const response = await apiRequest<ExerciseListResponse>(
        `${API_ENDPOINTS.exercises.list()}/category/${category}?skip=${skip}&limit=${limit}`,
        {
          method: 'GET',
          headers: authService.getAuthHeaders(),
        }
      );
      
      return response;
    } catch (error) {
      console.error(`Failed to fetch exercises for category ${category}:`, error);
      throw error;
    }
  },
};
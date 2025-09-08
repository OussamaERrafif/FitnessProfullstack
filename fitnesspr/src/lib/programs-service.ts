/**
 * Programs service for backend integration
 */

import { apiRequest, API_ENDPOINTS } from './api-client';
import { authService } from './auth-service';

export interface Exercise {
  id: string;
  name: string;
  description?: string;
  category: string;
  muscle_groups: string[];
  equipment?: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  instructions?: string;
  video_url?: string;
  image_url?: string;
}

export interface ProgramExercise {
  id: string;
  exercise_id: string;
  exercise: Exercise;
  sets?: number;
  reps?: string;
  weight?: number;
  rest_seconds?: number;
  notes?: string;
  order_in_program?: number;
  week_number?: number;
  day_number?: number;
  completed?: boolean;
}

export interface Program {
  id: string;
  name: string;
  description?: string;
  client_id: string;
  trainer_id: string;
  duration_weeks?: number;
  sessions_per_week?: number;
  difficulty_level?: string;
  goals?: string;
  is_active: boolean;
  exercises: ProgramExercise[];
  created_at: string;
  updated_at: string;
}

export interface CreateProgramRequest {
  name: string;
  description?: string;
  client_id: string;
  duration_weeks?: number;
  sessions_per_week?: number;
  difficulty_level?: string;
  goals?: string;
  exercises?: {
    exercise_id: string;
    sets?: number;
    reps?: string;
    weight?: number;
    rest_seconds?: number;
    notes?: string;
    order_in_program?: number;
    week_number?: number;
    day_number?: number;
  }[];
}

export interface UpdateProgramRequest extends Partial<CreateProgramRequest> {
  id: string;
}

export const programsService = {
  /**
   * Get all programs for a client
   */
  async getClientPrograms(clientId: string): Promise<Program[]> {
    try {
      const response = await apiRequest<Program[]>(
        `/programs/client/${clientId}`,
        {
          method: 'GET',
          headers: authService.getAuthHeaders(),
        }
      );
      
      return response;
    } catch (error) {
      console.error(`Failed to fetch programs for client ${clientId}:`, error);
      throw error;
    }
  },

  /**
   * Get a specific program by ID
   */
  async getProgram(id: string): Promise<Program> {
    try {
      const response = await apiRequest<Program>(
        API_ENDPOINTS.programs.get(id),
        {
          method: 'GET',
          headers: authService.getAuthHeaders(),
        }
      );
      
      return response;
    } catch (error) {
      console.error(`Failed to fetch program ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get current active program for a client
   */
  async getCurrentProgram(clientId: string): Promise<Program | null> {
    try {
      const programs = await this.getClientPrograms(clientId);
      const activeProgram = programs.find(program => program.is_active);
      return activeProgram || null;
    } catch (error) {
      console.error(`Failed to fetch current program for client ${clientId}:`, error);
      throw error;
    }
  },

  /**
   * Create a new program
   */
  async createProgram(programData: CreateProgramRequest): Promise<Program> {
    try {
      const response = await apiRequest<Program>(
        API_ENDPOINTS.programs.create(),
        {
          method: 'POST',
          headers: authService.getAuthHeaders(),
          body: JSON.stringify(programData),
        }
      );
      
      return response;
    } catch (error) {
      console.error('Failed to create program:', error);
      throw error;
    }
  },

  /**
   * Update an existing program
   */
  async updateProgram(programData: UpdateProgramRequest): Promise<Program> {
    try {
      const { id, ...updateData } = programData;
      const response = await apiRequest<Program>(
        API_ENDPOINTS.programs.update(id),
        {
          method: 'PUT',
          headers: authService.getAuthHeaders(),
          body: JSON.stringify(updateData),
        }
      );
      
      return response;
    } catch (error) {
      console.error(`Failed to update program ${programData.id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a program
   */
  async deleteProgram(id: string): Promise<void> {
    try {
      await apiRequest<void>(
        API_ENDPOINTS.programs.delete(id),
        {
          method: 'DELETE',
          headers: authService.getAuthHeaders(),
        }
      );
    } catch (error) {
      console.error(`Failed to delete program ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get today's workout for a client
   */
  async getTodayWorkout(clientId: string): Promise<ProgramExercise[]> {
    try {
      const currentProgram = await this.getCurrentProgram(clientId);
      if (!currentProgram) {
        return [];
      }

      // Get today's day of the week (1 = Monday, 7 = Sunday)
      const today = new Date().getDay();
      const dayNumber = today === 0 ? 7 : today; // Convert Sunday from 0 to 7

      // Filter exercises for today
      const todayExercises = currentProgram.exercises.filter(
        exercise => exercise.day_number === dayNumber
      );

      return todayExercises.sort((a, b) => (a.order_in_program || 0) - (b.order_in_program || 0));
    } catch (error) {
      console.error(`Failed to fetch today's workout for client ${clientId}:`, error);
      return [];
    }
  },

  /**
   * Mark exercise as completed in a workout
   */
  async markExerciseCompleted(
    programId: string, 
    exerciseId: string, 
    completed: boolean = true
  ): Promise<void> {
    try {
      await apiRequest<void>(
        `/programs/${programId}/exercises/${exerciseId}/complete`,
        {
          method: 'POST',
          headers: authService.getAuthHeaders(),
          body: JSON.stringify({ completed }),
        }
      );
    } catch (error) {
      console.error(`Failed to mark exercise ${exerciseId} as completed:`, error);
      throw error;
    }
  },

  /**
   * Get exercise library
   */
  async getExercises(): Promise<Exercise[]> {
    try {
      const response = await apiRequest<Exercise[]>(
        API_ENDPOINTS.exercises.list(),
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
   * Search exercises by category or muscle group
   */
  async searchExercises(query: string, category?: string): Promise<Exercise[]> {
    try {
      const params = new URLSearchParams();
      if (query) params.append('search', query);
      if (category) params.append('category', category);

      const response = await apiRequest<Exercise[]>(
        `${API_ENDPOINTS.exercises.list()}?${params.toString()}`,
        {
          method: 'GET',
          headers: authService.getAuthHeaders(),
        }
      );
      
      return response;
    } catch (error) {
      console.error('Failed to search exercises:', error);
      throw error;
    }
  },
};
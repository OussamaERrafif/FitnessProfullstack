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
  duration_weeks: number;
  sessions_per_week: number;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  goals?: string;
  trainer_id: string;
  client_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  exercises?: ProgramExercise[];
}

export interface CreateProgramRequest {
  name: string;
  description?: string;
  duration_weeks: number;
  sessions_per_week: number;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  goals?: string;
  client_id?: string;
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
  is_active?: boolean;
}

export interface ProgramExerciseCreate {
  exercise_id: string;
  sets: number;
  reps: number;
  weight?: number;
  duration_minutes?: number;
  rest_seconds?: number;
  notes?: string;
  order_index: number;
}

export interface ProgramListResponse {
  programs: Program[];
  total: number;
  page: number;
  size: number;

}

export const programsService = {
  /**
   * Get all programs for the authenticated trainer
   */
  async getPrograms(skip: number = 0, limit: number = 100, clientId?: string): Promise<ProgramListResponse> {
    try {
      let url = `${API_ENDPOINTS.programs.list()}?skip=${skip}&limit=${limit}`;
      if (clientId) {
        url += `&client_id=${clientId}`;
      }
      
      const response = await apiRequest<ProgramListResponse>(
        url,
        {
          method: 'GET',
          headers: authService.getAuthHeaders(),
        }
      );
      
      return response;
    } catch (error) {
      console.error('Failed to fetch programs:', error);
      throw error;
    }
  },

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
   * Get a specific program by ID with exercises

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
   * Add exercise to program
   */
  async addExerciseToProgram(programId: string, exerciseData: ProgramExerciseCreate): Promise<ProgramExercise> {
    try {
      const response = await apiRequest<ProgramExercise>(
        `${API_ENDPOINTS.programs.get(programId)}/exercises`,
        {
          method: 'POST',
          headers: authService.getAuthHeaders(),
          body: JSON.stringify(exerciseData),
        }
      );
      
      return response;
    } catch (error) {
      console.error(`Failed to add exercise to program ${programId}:`, error);
      throw error;
    }
  },

  /**
   * Remove exercise from program
   */
  async removeExerciseFromProgram(programId: string, exerciseId: string): Promise<void> {
    try {
      await apiRequest<void>(
        `${API_ENDPOINTS.programs.get(programId)}/exercises/${exerciseId}`,
        {
          method: 'DELETE',
          headers: authService.getAuthHeaders(),
        }
      );
    } catch (error) {
      console.error(`Failed to remove exercise ${exerciseId} from program ${programId}:`, error);

      throw error;
    }
  },

  /**
   * Assign program to client
   */
  async assignProgramToClient(programId: string, clientId: string): Promise<Program> {
    try {
      const response = await apiRequest<Program>(
        API_ENDPOINTS.programs.update(programId),
        {
          method: 'PUT',
          headers: authService.getAuthHeaders(),
          body: JSON.stringify({ client_id: clientId }),
        }
      );
      
      return response;
    } catch (error) {
      console.error(`Failed to assign program ${programId} to client ${clientId}:`, error);
      throw error;
    }
  },

  /**
   * Toggle program active status
   */
  async toggleProgramStatus(programId: string, isActive: boolean): Promise<Program> {
    try {
      const response = await apiRequest<Program>(
        API_ENDPOINTS.programs.update(programId),
        {
          method: 'PUT',
          headers: authService.getAuthHeaders(),
          body: JSON.stringify({ is_active: isActive }),

        }
      );
      
      return response;
    } catch (error) {
      console.error(`Failed to toggle program ${programId} status:`, error);

      throw error;
    }
  },
};
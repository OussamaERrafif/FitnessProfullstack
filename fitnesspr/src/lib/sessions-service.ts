/**
 * Sessions service for backend integration
 */

import { apiRequest } from './api-client';
import { authService } from './auth-service';

export interface Session {
  id: string;
  client_id: string;
  trainer_id: string;
  client_name?: string;
  scheduled_at: string;
  duration_minutes: number;
  session_type: 'personal_training' | 'consultation' | 'group_class' | 'virtual_session';
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'pending';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateSessionRequest {
  client_id: string;
  scheduled_at: string;
  duration_minutes: number;
  session_type: 'personal_training' | 'consultation' | 'group_class' | 'virtual_session';
  notes?: string;
}

export interface UpdateSessionRequest extends Partial<CreateSessionRequest> {
  id: string;
  status?: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'pending';
}

export const sessionsService = {
  /**
   * Get all sessions for the authenticated trainer
   */
  async getSessions(date?: string): Promise<Session[]> {
    try {
      const url = date ? `/sessions?date=${date}` : '/sessions';
      const response = await apiRequest<Session[]>(
        url,
        {
          method: 'GET',
          headers: authService.getAuthHeaders(),
        }
      );
      
      return response;
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
      throw error;
    }
  },

  /**
   * Get sessions for today
   */
  async getTodaySessions(): Promise<Session[]> {
    try {
      const today = new Date().toISOString().split('T')[0];
      return await this.getSessions(today);
    } catch (error) {
      console.error('Failed to fetch today sessions:', error);
      throw error;
    }
  },

  /**
   * Get a specific session by ID
   */
  async getSession(id: string): Promise<Session> {
    try {
      const response = await apiRequest<Session>(
        `/sessions/${id}`,
        {
          method: 'GET',
          headers: authService.getAuthHeaders(),
        }
      );
      
      return response;
    } catch (error) {
      console.error(`Failed to fetch session ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new session
   */
  async createSession(sessionData: CreateSessionRequest): Promise<Session> {
    try {
      const response = await apiRequest<Session>(
        '/sessions',
        {
          method: 'POST',
          headers: authService.getAuthHeaders(),
          body: JSON.stringify(sessionData),
        }
      );
      
      return response;
    } catch (error) {
      console.error('Failed to create session:', error);
      throw error;
    }
  },

  /**
   * Update an existing session
   */
  async updateSession(sessionData: UpdateSessionRequest): Promise<Session> {
    try {
      const { id, ...updateData } = sessionData;
      const response = await apiRequest<Session>(
        `/sessions/${id}`,
        {
          method: 'PUT',
          headers: authService.getAuthHeaders(),
          body: JSON.stringify(updateData),
        }
      );
      
      return response;
    } catch (error) {
      console.error(`Failed to update session ${sessionData.id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a session
   */
  async deleteSession(id: string): Promise<void> {
    try {
      await apiRequest<void>(
        `/sessions/${id}`,
        {
          method: 'DELETE',
          headers: authService.getAuthHeaders(),
        }
      );
    } catch (error) {
      console.error(`Failed to delete session ${id}:`, error);
      throw error;
    }
  },

  /**
   * Mark session as completed
   */
  async completeSession(id: string, notes?: string): Promise<Session> {
    try {
      return await this.updateSession({
        id,
        status: 'completed',
        ...(notes && { notes }),
      });
    } catch (error) {
      console.error(`Failed to complete session ${id}:`, error);
      throw error;
    }
  },
};
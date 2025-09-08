/**
 * Clients service for backend integration
 */

import { apiRequest, API_ENDPOINTS } from './api-client';
import { authService } from './auth-service';

export interface Client {
  id: string;
  name: string;
  email: string;
  pin?: string;
  phone?: string;
  age?: number;
  weight?: number;
  height?: number;
  goals?: string;
  health_data?: string;
  fitness_level?: 'beginner' | 'intermediate' | 'advanced';
  trainer_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateClientRequest {
  name: string;
  email: string;
  phone?: string;
  age?: number;
  weight?: number;
  height?: number;
  goals?: string;
  health_data?: string;
  fitness_level?: 'beginner' | 'intermediate' | 'advanced';
}

export interface UpdateClientRequest extends Partial<CreateClientRequest> {
  id: string;
}

export const clientsService = {
  /**
   * Get all clients for the authenticated trainer
   */
  async getClients(): Promise<Client[]> {
    try {
      const response = await apiRequest<Client[]>(
        API_ENDPOINTS.clients.list(),
        {
          method: 'GET',
          headers: authService.getAuthHeaders(),
        }
      );
      
      return response;
    } catch (error) {
      console.error('Failed to fetch clients:', error);
      throw error;
    }
  },

  /**
   * Get a specific client by ID
   */
  async getClient(id: string): Promise<Client> {
    try {
      const response = await apiRequest<Client>(
        API_ENDPOINTS.clients.get(id),
        {
          method: 'GET',
          headers: authService.getAuthHeaders(),
        }
      );
      
      return response;
    } catch (error) {
      console.error(`Failed to fetch client ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new client
   */
  async createClient(clientData: CreateClientRequest): Promise<Client> {
    try {
      const response = await apiRequest<Client>(
        API_ENDPOINTS.clients.create(),
        {
          method: 'POST',
          headers: authService.getAuthHeaders(),
          body: JSON.stringify(clientData),
        }
      );
      
      return response;
    } catch (error) {
      console.error('Failed to create client:', error);
      throw error;
    }
  },

  /**
   * Update an existing client
   */
  async updateClient(clientData: UpdateClientRequest): Promise<Client> {
    try {
      const { id, ...updateData } = clientData;
      const response = await apiRequest<Client>(
        API_ENDPOINTS.clients.update(id),
        {
          method: 'PUT',
          headers: authService.getAuthHeaders(),
          body: JSON.stringify(updateData),
        }
      );
      
      return response;
    } catch (error) {
      console.error(`Failed to update client ${clientData.id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a client
   */
  async deleteClient(id: string): Promise<void> {
    try {
      await apiRequest<void>(
        API_ENDPOINTS.clients.delete(id),
        {
          method: 'DELETE',
          headers: authService.getAuthHeaders(),
        }
      );
    } catch (error) {
      console.error(`Failed to delete client ${id}:`, error);
      throw error;
    }
  },

  /**
   * Generate a new PIN for client
   */
  async generateClientPin(clientId: string): Promise<{ pin: string }> {
    try {
      const response = await apiRequest<{ pin: string }>(
        `/clients/${clientId}/pin`,
        {
          method: 'POST',
          headers: authService.getAuthHeaders(),
        }
      );
      
      return response;
    } catch (error) {
      console.error(`Failed to generate PIN for client ${clientId}:`, error);
      throw error;
    }
  },

  /**
   * Verify client PIN (for client access)
   */
  async verifyClientPin(pin: string): Promise<Client> {
    try {
      const response = await apiRequest<Client>(
        `/clients/verify-pin`,
        {
          method: 'POST',
          body: JSON.stringify({ pin }),
        }
      );
      
      return response;
    } catch (error) {
      console.error('Failed to verify client PIN:', error);
      throw error;
    }
  },

  /**
   * Get comprehensive client dashboard data
   */
  async getClientDashboardData(clientId: string): Promise<{
    client: Client;
    trainer?: {
      id: string;
      name: string;
      email: string;
      specialization?: string;
    };
    currentProgram?: any;
    currentMealPlan?: any;
    recentProgress: any[];
    goals: any[];
    workoutStats: any;
    nutritionSummary: any;
  }> {
    try {
      // Import services dynamically to avoid circular dependencies
      const { programsService } = await import('./programs-service');
      const { mealsService } = await import('./meals-service');
      const { progressService } = await import('./progress-service');

      // Fetch all client data in parallel
      const [
        client,
        currentProgram,
        currentMealPlan,
        recentProgress,
        goals,
        workoutStats,
        nutritionSummary
      ] = await Promise.allSettled([
        this.getClient(clientId),
        programsService.getCurrentProgram(clientId),
        mealsService.getCurrentMealPlan(clientId),
        progressService.getClientProgress(clientId),
        progressService.getClientGoals(clientId),
        progressService.getWorkoutStats(clientId),
        mealsService.getNutritionSummary(clientId)
      ]);

      // Extract successful results
      const result = {
        client: client.status === 'fulfilled' ? client.value : null,
        currentProgram: currentProgram.status === 'fulfilled' ? currentProgram.value : null,
        currentMealPlan: currentMealPlan.status === 'fulfilled' ? currentMealPlan.value : null,
        recentProgress: recentProgress.status === 'fulfilled' ? recentProgress.value.slice(0, 5) : [],
        goals: goals.status === 'fulfilled' ? goals.value : [],
        workoutStats: workoutStats.status === 'fulfilled' ? workoutStats.value : null,
        nutritionSummary: nutritionSummary.status === 'fulfilled' ? nutritionSummary.value : null,
      };

      // Get trainer info if available
      if (result.client?.trainer_id) {
        try {
          const trainer = await apiRequest<any>(
            API_ENDPOINTS.trainers.get(result.client.trainer_id.toString()),
            {
              method: 'GET',
              headers: authService.getAuthHeaders(),
            }
          );
          result.trainer = trainer;
        } catch (error) {
          console.warn('Failed to fetch trainer info:', error);
        }
      }

      return result;
    } catch (error) {
      console.error(`Failed to fetch dashboard data for client ${clientId}:`, error);
      throw error;
    }
  },

  /**
   * Get client's name and email by PIN (lightweight version for PIN verification)
   */
  async getClientByPin(pin: string): Promise<Client> {
    return this.verifyClientPin(pin);
  },

  /**
   * Update client goals
   */
  async updateClientGoals(clientId: string, goals: string): Promise<Client> {
    try {
      const response = await apiRequest<Client>(
        API_ENDPOINTS.clients.update(clientId),
        {
          method: 'PUT',
          headers: authService.getAuthHeaders(),
          body: JSON.stringify({ goals }),
        }
      );
      
      return response;
    } catch (error) {
      console.error(`Failed to update goals for client ${clientId}:`, error);
      throw error;
    }
  },
};
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
};
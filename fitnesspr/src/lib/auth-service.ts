/**
 * Authentication service for backend integration
 */

import { apiRequest, API_ENDPOINTS, ApiError } from './api-client';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role?: 'TRAINER' | 'CLIENT';
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'TRAINER' | 'CLIENT' | 'ADMIN';
  subscription?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: AuthUser;
}

export const authService = {
  /**
   * Login user with email and password
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await apiRequest<AuthResponse>(
        API_ENDPOINTS.auth.login(),
        {
          method: 'POST',
          body: JSON.stringify(credentials),
        }
      );
      
      // Store token in localStorage for subsequent requests
      if (response.access_token) {
        localStorage.setItem('auth_token', response.access_token);
      }
      
      return response;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },

  /**
   * Register new user
   */
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await apiRequest<AuthResponse>(
        API_ENDPOINTS.auth.register(),
        {
          method: 'POST',
          body: JSON.stringify(userData),
        }
      );
      
      // Store token in localStorage for subsequent requests
      if (response.access_token) {
        localStorage.setItem('auth_token', response.access_token);
      }
      
      return response;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  },

  /**
   * Get current user info
   */
  async getCurrentUser(): Promise<AuthUser> {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new ApiError('No authentication token found', 401);
      }

      const response = await apiRequest<AuthUser>(
        API_ENDPOINTS.auth.me(),
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      
      return response;
    } catch (error) {
      console.error('Failed to get current user:', error);
      // Clear invalid token
      if (error instanceof ApiError && error.status === 401) {
        localStorage.removeItem('auth_token');
      }
      throw error;
    }
  },

  /**
   * Logout user
   */
  logout(): void {
    localStorage.removeItem('auth_token');
  },

  /**
   * Get stored auth token
   */
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  /**
   * Create authorized request headers
   */
  getAuthHeaders(): Record<string, string> {
    const token = this.getToken();
    if (!token) {
      return {};
    }
    
    return {
      'Authorization': `Bearer ${token}`,
    };
  },
};
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
      // Backend expects OAuth2PasswordRequestForm format
      const formData = new FormData();
      formData.append('username', credentials.email);
      formData.append('password', credentials.password);

      // First, get the token
      const tokenResponse = await apiRequest<{ access_token: string; token_type: string }>(
        API_ENDPOINTS.auth.login(),
        {
          method: 'POST',
          body: formData,
          headers: {
            // Don't set Content-Type, let the browser set it for FormData
          },
        }
      );
      
      // Store token in localStorage for subsequent requests
      if (tokenResponse.access_token) {
        localStorage.setItem('auth_token', tokenResponse.access_token);
      }

      // Then, get user data using the token
      const userResponse = await apiRequest<any>(
        API_ENDPOINTS.auth.me(),
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${tokenResponse.access_token}`,
          },
        }
      );

      // Map backend user data to frontend format
      const user: AuthUser = {
        id: userResponse.id.toString(),
        email: userResponse.email,
        name: userResponse.full_name || userResponse.email,
        role: userResponse.is_superuser ? 'ADMIN' : (userResponse.is_trainer ? 'TRAINER' : 'CLIENT'),
      };

      return {
        access_token: tokenResponse.access_token,
        token_type: tokenResponse.token_type,
        user: user,
      };
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
      // Map frontend fields to backend fields
      const backendData = {
        email: userData.email,
        password: userData.password,
        full_name: userData.name, // Map 'name' to 'full_name'
        is_trainer: userData.role === 'TRAINER' // Map 'role' to 'is_trainer'
      };

      // First, register the user
      await apiRequest<any>(
        API_ENDPOINTS.auth.register(),
        {
          method: 'POST',
          body: JSON.stringify(backendData),
        }
      );
      
      // Then, automatically log them in to get a token
      const loginResponse = await this.login({
        email: userData.email,
        password: userData.password
      });
      
      return loginResponse;
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
      if (typeof window === 'undefined') {
        throw new ApiError('Cannot access localStorage during SSR', 401);
      }

      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new ApiError('No authentication token found', 401);
      }

      const userResponse = await apiRequest<any>(
        API_ENDPOINTS.auth.me(),
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      
      // Map backend user data to frontend format
      const user: AuthUser = {
        id: userResponse.id.toString(),
        email: userResponse.email,
        name: userResponse.full_name || userResponse.email,
        role: userResponse.is_superuser ? 'ADMIN' : (userResponse.is_trainer ? 'TRAINER' : 'CLIENT'),
      };

      return user;
    } catch (error) {
      console.error('Failed to get current user:', error);
      // Clear invalid token
      if (error instanceof ApiError && error.status === 401 && typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
      }
      throw error;
    }
  },

  /**
   * Logout user
   */
  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  },

  /**
   * Get stored auth token
   */
  getToken(): string | null {
    if (typeof window === 'undefined') {
      return null; // No localStorage during SSR
    }
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
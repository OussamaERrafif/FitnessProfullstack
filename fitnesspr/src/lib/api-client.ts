/**
 * Backend API client configuration and utilities
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000/api';
const API_BASE_URL = `${BACKEND_URL}`;

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Generic API client with error handling
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  const config: RequestInit = {
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorData
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Network or other errors
    throw new ApiError(
      error instanceof Error ? error.message : 'Network error occurred',
      0,
      error
    );
  }
}

/**
 * API endpoints configuration
 */
export const API_ENDPOINTS = {
  // Health check
  health: () => '/health',
  
  // Authentication
  auth: {
    login: () => '/auth/login',
    register: () => '/auth/register',
    me: () => '/auth/me',
  },
  
  // Trainers
  trainers: {
    list: () => '/trainers',
    create: () => '/trainers',
    get: (id: string) => `/trainers/${id}`,
    update: (id: string) => `/trainers/${id}`,
    delete: (id: string) => `/trainers/${id}`,
  },
  
  // Clients
  clients: {
    list: () => '/clients',
    create: () => '/clients',
    get: (id: string) => `/clients/${id}`,
    update: (id: string) => `/clients/${id}`,
    delete: (id: string) => `/clients/${id}`,
  },
  
  // Exercises
  exercises: {
    list: () => '/exercises',
    create: () => '/exercises',
    get: (id: string) => `/exercises/${id}`,
    update: (id: string) => `/exercises/${id}`,
    delete: (id: string) => `/exercises/${id}`,
  },
  
  // Programs
  programs: {
    list: () => '/programs',
    create: () => '/programs',
    get: (id: string) => `/programs/${id}`,
    update: (id: string) => `/programs/${id}`,
    delete: (id: string) => `/programs/${id}`,
  },
  
  // Meals
  meals: {
    list: () => '/meals',
    create: () => '/meals',
    get: (id: string) => `/meals/${id}`,
    update: (id: string) => `/meals/${id}`,
    delete: (id: string) => `/meals/${id}`,
  },
  
  // Progress
  progress: {
    list: () => '/progress',
    create: () => '/progress',
    get: (id: string) => `/progress/${id}`,
    update: (id: string) => `/progress/${id}`,
    delete: (id: string) => `/progress/${id}`,
  },
  
  // Payments
  payments: {
    list: () => '/payments',
    create: () => '/payments',
    get: (id: string) => `/payments/${id}`,
  },

  // Sessions
  sessions: {
    list: () => '/sessions',
    create: () => '/sessions',
    get: (id: string) => `/sessions/${id}`,
    update: (id: string) => `/sessions/${id}`,
    delete: (id: string) => `/sessions/${id}`,
  },

  // Statistics
  statistics: {
    trainer: () => '/statistics/trainer',
    clientProgress: () => '/statistics/client-progress',
    revenue: () => '/statistics/revenue',
  },
} as const;
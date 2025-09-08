/**
 * Authentication API slice
 */

import { fitnessApi } from './api'

// Types
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
  role?: 'TRAINER' | 'CLIENT'
}

export interface AuthUser {
  id: string
  email: string
  name: string
  role: 'TRAINER' | 'CLIENT' | 'ADMIN'
  subscription?: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
  user: AuthUser
}

// Auth API slice
export const authApi = fitnessApi.injectEndpoints({
  endpoints: (builder) => ({
    // Login mutation
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      transformResponse: (response: AuthResponse) => {
        // Store token in localStorage
        if (typeof window !== 'undefined' && response.access_token) {
          localStorage.setItem('auth_token', response.access_token)
        }
        return response
      },
      invalidatesTags: ['Auth'],
    }),

    // Register mutation
    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
      transformResponse: (response: AuthResponse) => {
        // Store token in localStorage
        if (typeof window !== 'undefined' && response.access_token) {
          localStorage.setItem('auth_token', response.access_token)
        }
        return response
      },
      invalidatesTags: ['Auth'],
    }),

    // Get current user
    getCurrentUser: builder.query<AuthUser, void>({
      query: () => '/auth/me',
      providesTags: ['Auth'],
    }),

    // Test token
    testToken: builder.query<AuthUser, void>({
      query: () => '/auth/test-token',
      providesTags: ['Auth'],
    }),
  }),
})

// Export hooks
export const {
  useLoginMutation,
  useRegisterMutation,
  useGetCurrentUserQuery,
  useLazyGetCurrentUserQuery,
  useTestTokenQuery,
} = authApi
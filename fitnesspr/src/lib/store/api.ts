/**
 * RTK Query API definition
 * Base API slice with authentication handling
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
const API_BASE_URL = `${BACKEND_URL}/api/v1`

// Base query with auth handling
const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers) => {
    // Get token from localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token')
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
    }
    headers.set('accept', 'application/json')
    headers.set('content-type', 'application/json')
    return headers
  },
})

// Enhanced base query with auth error handling
const baseQueryWithAuth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions)
  
  // Handle auth errors
  if (result.error && result.error.status === 401) {
    // Clear invalid token
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
    }
    // You could also dispatch a logout action here if you have auth slice
  }
  
  return result
}

// Create the API slice
export const fitnessApi = createApi({
  reducerPath: 'fitnessApi',
  baseQuery: baseQueryWithAuth,
  tagTypes: [
    'Auth',
    'Client', 
    'Trainer',
    'Exercise',
    'Program',
    'Meal',
    'Progress',
    'Payment',
    'Session',
    'Statistics'
  ],
  endpoints: () => ({}),
})

// Export types
export type { BaseQueryFn, FetchArgs, FetchBaseQueryError }
/**
 * RTK Query API exports
 * Centralized exports for all API slices and hooks
 */

// Export store and provider
export { store } from './index'
export { ReduxProvider } from './ReduxProvider'

// Export base API
export { fitnessApi } from './api'

// Export auth API
export * from './authApi'

// Export clients API
export * from './clientsApi'

// Export types
export type { RootState, AppDispatch } from './index'
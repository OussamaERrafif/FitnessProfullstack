/**
 * Error Page Component Types
 * Centralized type definitions for all error pages in the FitnessPr application
 */

// Base error props interface
export interface BaseErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

// Error page context types
export type ErrorContext = 
  | 'global'
  | 'trainer'
  | 'client'
  | 'auth'
  | 'payment'
  | 'api'

// Error severity levels
export type ErrorSeverity = 
  | 'low'      // Minor issues, user can continue
  | 'medium'   // Significant issues, some features affected
  | 'high'     // Major issues, most features affected
  | 'critical' // Complete failure, app unusable

// Error categories for analytics
export type ErrorCategory =
  | 'network'
  | 'authentication'
  | 'authorization'
  | 'validation'
  | 'database'
  | 'external-service'
  | 'client-side'
  | 'server-side'
  | 'timeout'
  | 'maintenance'

// Error metadata interface
export interface ErrorMetadata {
  context: ErrorContext
  severity: ErrorSeverity
  category: ErrorCategory
  timestamp: Date
  userAgent?: string
  userId?: string
  trainerMode?: boolean
  retryable: boolean
  supportContact?: string
}

// Error reporting interface
export interface ErrorReport {
  error: Error
  metadata: ErrorMetadata
  stackTrace?: string
  breadcrumbs?: string[]
  userFeedback?: string
}

// Recovery action types
export interface RecoveryAction {
  label: string
  action: () => void | Promise<void>
  variant: 'default' | 'outline' | 'destructive' | 'secondary' | 'ghost' | 'link'
  icon?: React.ComponentType<{ className?: string }>
}

// Error page configuration
export interface ErrorPageConfig {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  colorScheme: 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'gray'
  showErrorDetails: boolean
  recoveryActions: RecoveryAction[]
  supportInfo?: {
    email?: string
    phone?: string
    helpUrl?: string
  }
}

// HTTP status code mappings
export const HTTP_STATUS_CODES = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  408: 'Request Timeout',
  429: 'Too Many Requests',
  500: 'Internal Server Error',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
  504: 'Gateway Timeout',
} as const

export type HttpStatusCode = keyof typeof HTTP_STATUS_CODES

// Offline status interface
export interface OfflineCapability {
  feature: string
  available: boolean
  description: string
  icon: 'available' | 'limited' | 'unavailable'
}

// Maintenance window interface
export interface MaintenanceWindow {
  start: Date
  end: Date
  reason: string
  affectedServices: string[]
  workarounds?: string[]
}

// PIN access specific types
export interface PinAccessError {
  attempts: number
  maxAttempts: number
  lockoutTime?: Date
  lastAttempt?: Date
}

// Trainer-specific error context
export interface TrainerErrorContext {
  trainerId?: string
  activeClients?: number
  currentPage?: string
  lastAction?: string
}

// Client-specific error context  
export interface ClientErrorContext {
  clientPin?: string
  trainerId?: string
  currentProgram?: string
  lastSync?: Date
}

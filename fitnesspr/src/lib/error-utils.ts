/**
 * Error Utilities
 * Helper functions for error handling, reporting, and recovery
 */

import { ErrorMetadata, ErrorReport, ErrorCategory, ErrorSeverity, ErrorContext } from '@/types/errors'

/**
 * Determines error category based on error message and context
 */
export function categorizeError(error: Error, context?: ErrorContext): ErrorCategory {
  const message = error.message.toLowerCase()
  
  if (message.includes('network') || message.includes('fetch')) {
    return 'network'
  }
  
  if (message.includes('unauthorized') || message.includes('login')) {
    return 'authentication'
  }
  
  if (message.includes('forbidden') || message.includes('permission')) {
    return 'authorization'
  }
  
  if (message.includes('validation') || message.includes('invalid')) {
    return 'validation'
  }
  
  if (message.includes('database') || message.includes('prisma')) {
    return 'database'
  }
  
  if (message.includes('timeout')) {
    return 'timeout'
  }
  
  if (context === 'client') {
    return 'client-side'
  }
  
  return 'server-side'
}

/**
 * Determines error severity based on error type and context
 */
export function determineErrorSeverity(error: Error, _context?: ErrorContext): ErrorSeverity {
  const message = error.message.toLowerCase()
  
  // Critical errors that break the entire app
  if (message.includes('chunk') || message.includes('module')) {
    return 'critical'
  }
  
  // High severity errors that affect major functionality
  if (message.includes('database') || message.includes('auth')) {
    return 'high'
  }
  
  // Medium severity errors that affect some features
  if (message.includes('network') || message.includes('api')) {
    return 'medium'
  }
  
  // Low severity errors that are minor inconveniences
  return 'low'
}

/**
 * Checks if an error is retryable
 */
export function isRetryableError(error: Error): boolean {
  const message = error.message.toLowerCase()
  
  const retryablePatterns = [
    'network',
    'timeout',
    'rate limit',
    'service unavailable',
    'temporary',
    'retry'
  ]
  
  return retryablePatterns.some(pattern => message.includes(pattern))
}

/**
 * Generates error metadata
 */
export function generateErrorMetadata(
  error: Error,
  context: ErrorContext = 'global'
): ErrorMetadata {
  const metadata: ErrorMetadata = {
    context,
    severity: determineErrorSeverity(error, context),
    category: categorizeError(error, context),
    timestamp: new Date(),
    retryable: isRetryableError(error)
  }

  // Add optional properties only if they have values
  const userAgent = typeof window !== 'undefined' ? window.navigator?.userAgent : undefined
  if (userAgent) {
    metadata.userAgent = userAgent
  }

  const supportContact = getSupportContact(context)
  if (supportContact) {
    metadata.supportContact = supportContact
  }

  return metadata
}

/**
 * Gets appropriate support contact based on context
 */
export function getSupportContact(context: ErrorContext): string {
  switch (context) {
    case 'trainer':
      return 'trainer-support@fitnesspro.com'
    case 'client':
      return 'client-support@fitnesspro.com'
    case 'payment':
      return 'billing@fitnesspro.com'
    default:
      return 'support@fitnesspro.com'
  }
}

/**
 * Creates an error report for logging/analytics
 */
export function createErrorReport(
  error: Error,
  context: ErrorContext = 'global',
  additionalData?: Record<string, any>
): ErrorReport {
  const metadata = generateErrorMetadata(error, context)
  
  const report: ErrorReport = {
    error,
    metadata,
    ...additionalData
  }

  // Add optional properties only if they have values
  if (error.stack) {
    report.stackTrace = error.stack
  }

  const breadcrumbs = getBreadcrumbs()
  if (breadcrumbs.length > 0) {
    report.breadcrumbs = breadcrumbs
  }

  return report
}

/**
 * Gets user breadcrumbs for error context
 */
function getBreadcrumbs(): string[] {
  if (typeof window === 'undefined') return []
  
  const breadcrumbs = []
  
  // Add current URL
  breadcrumbs.push(`Current: ${window.location.pathname}`)
  
  // Add referrer if available
  if (document.referrer) {
    breadcrumbs.push(`From: ${new URL(document.referrer).pathname}`)
  }
  
  // Add timestamp
  breadcrumbs.push(`Time: ${new Date().toISOString()}`)
  
  return breadcrumbs
}

/**
 * Logs error to console in development
 */
export function logErrorToDev(error: Error, context?: ErrorContext): void {
  if (process.env.NODE_ENV === 'development') {
    console.group(`🚨 Error in ${context || 'app'}`)
    console.error('Error:', error.message)
    console.error('Stack:', error.stack)
    console.error('Context:', context)
    console.groupEnd()
  }
}

/**
 * Reports error to external service (implement based on your needs)
 */
export async function reportError(errorReport: ErrorReport): Promise<void> {
  // In a real app, you'd send this to your error tracking service
  // Example: Sentry, LogRocket, Bugsnag, etc.
  
  if (process.env.NODE_ENV === 'development') {
    console.log('Error Report:', errorReport)
    return
  }
  
  try {
    // Example implementation:
    // await fetch('/api/errors', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(errorReport)
    // })
  } catch (reportingError) {
    console.error('Failed to report error:', reportingError)
  }
}

/**
 * Gets user-friendly error message
 */
export function getUserFriendlyMessage(error: Error, context?: ErrorContext): string {
  const message = error.message.toLowerCase()
  
  // Network errors
  if (message.includes('network') || message.includes('fetch')) {
    return 'Please check your internet connection and try again.'
  }
  
  // Authentication errors
  if (message.includes('unauthorized') || message.includes('401')) {
    return context === 'client' 
      ? 'Your PIN may be incorrect. Please try again.'
      : 'Please log in to continue.'
  }
  
  // Permission errors
  if (message.includes('forbidden') || message.includes('403')) {
    return 'You don\'t have permission to access this feature.'
  }
  
  // Timeout errors
  if (message.includes('timeout')) {
    return 'The request took too long. Please try again.'
  }
  
  // Rate limiting
  if (message.includes('rate') || message.includes('429')) {
    return 'Too many requests. Please wait a moment and try again.'
  }
  
  // Default messages by context
  switch (context) {
    case 'trainer':
      return 'Something went wrong in the trainer dashboard. Your client data is safe.'
    case 'client':
      return 'Something went wrong with your training portal. Your progress is saved.'
    case 'payment':
      return 'There was an issue processing your payment. Please try again.'
    default:
      return 'Something unexpected happened. Please try again.'
  }
}

/**
 * Generates recovery suggestions based on error type
 */
export function getRecoverySuggestions(error: Error, context?: ErrorContext): string[] {
  const suggestions: string[] = []
  const message = error.message.toLowerCase()
  
  if (message.includes('network')) {
    suggestions.push('Check your internet connection')
    suggestions.push('Try refreshing the page')
  }
  
  if (message.includes('timeout')) {
    suggestions.push('Wait a moment and try again')
    suggestions.push('Check if the server is responding')
  }
  
  if (context === 'client' && message.includes('unauthorized')) {
    suggestions.push('Verify your PIN is correct')
    suggestions.push('Contact your trainer for a new PIN')
  }
  
  if (context === 'trainer') {
    suggestions.push('Try refreshing your dashboard')
    suggestions.push('Check if all client data is synced')
  }
  
  // Default suggestions
  if (suggestions.length === 0) {
    suggestions.push('Try refreshing the page')
    suggestions.push('Clear your browser cache')
    suggestions.push('Contact support if the issue persists')
  }
  
  return suggestions
}

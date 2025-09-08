/**
 * Error Boundary Component
 * React Error Boundary for catching JavaScript errors in component tree
 */

'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { AlertTriangle, RefreshCcw, Home, Bug } from 'lucide-react'
import { createErrorReport, reportError, getUserFriendlyMessage } from '@/lib/error-utils'
import type { ErrorContext } from '@/types/errors'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  context?: ErrorContext
  fallback?: React.ComponentType<ErrorFallbackProps>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface ErrorFallbackProps {
  error: Error
  resetError: () => void
  context?: ErrorContext
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error, errorInfo: null }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo })
    
    // Report error
    const errorReport = createErrorReport(error, this.props.context, {
      componentStack: errorInfo.componentStack,
      errorBoundary: true
    })
    
    reportError(errorReport)
    
    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo)
  }

  resetError = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback
      
      return (
        <FallbackComponent 
          error={this.state.error}
          resetError={this.resetError}
          {...(this.props.context && { context: this.props.context })}
        />
      )
    }

    return this.props.children
  }
}

/**
 * Default Error Fallback Component
 */
function DefaultErrorFallback({ error, resetError, context }: ErrorFallbackProps) {
  const userMessage = getUserFriendlyMessage(error, context)
  
  const getContextTitle = () => {
    switch (context) {
      case 'trainer': return 'Trainer Dashboard Error'
      case 'client': return 'Client Portal Error'
      case 'auth': return 'Authentication Error'
      case 'payment': return 'Payment Error'
      default: return 'Something went wrong'
    }
  }

  const getContextColor = () => {
    switch (context) {
      case 'trainer': return 'blue'
      case 'client': return 'green'
      case 'auth': return 'yellow'
      case 'payment': return 'purple'
      default: return 'red'
    }
  }

  const color = getContextColor()

  return (
    <div className="min-h-[400px] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg border-0">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <div className={`mx-auto w-16 h-16 bg-${color}-100 rounded-full flex items-center justify-center mb-4`}>
                <AlertTriangle className={`w-8 h-8 text-${color}-600`} />
              </div>
              
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {getContextTitle()}
              </h2>
              
              <p className="text-gray-600 text-sm leading-relaxed">
                {userMessage}
              </p>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg text-left">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <Bug className="w-4 h-4 mr-2" />
                  Debug Info:
                </h3>
                <p className="text-xs text-gray-600 font-mono break-all">
                  {error.message}
                </p>
                {error.stack && (
                  <details className="mt-2">
                    <summary className="text-xs text-gray-500 cursor-pointer">
                      Stack trace
                    </summary>
                    <pre className="text-xs text-gray-600 mt-1 overflow-auto max-h-32">
                      {error.stack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <div className="space-y-3">
              <Button 
                onClick={resetError}
                className="w-full"
                variant="default"
              >
                <RefreshCcw className="w-4 h-4 mr-2" />
                Try again
              </Button>
              
              <Button 
                onClick={() => window.location.href = context === 'trainer' ? '/trainer/dashboard' : '/'}
                variant="outline"
                className="w-full"
              >
                <Home className="w-4 h-4 mr-2" />
                {context === 'trainer' ? 'Dashboard' : 'Homepage'}
              </Button>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                If this continues, please contact support.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

/**
 * Hook for using error boundary
 */
export function useErrorHandler(context?: ErrorContext) {
  return React.useCallback((error: Error, errorInfo?: React.ErrorInfo) => {
    const errorReport = createErrorReport(error, context, { errorInfo })
    reportError(errorReport)
  }, [context])
}

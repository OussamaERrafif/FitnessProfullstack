'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ErrorBoundary } from '@/components/error-boundary'
import { 
  ValidationError, 
  AuthenticationError, 
  AuthorizationError, 
  NotFoundError 
} from '@/lib/api-error-handler'

/**
 * Error Testing Component
 * Use this component to test different error scenarios in development
 */

interface ErrorTestProps {
  context?: 'global' | 'trainer' | 'client' | 'auth'
}

export function ErrorTestComponent({ context = 'global' }: ErrorTestProps) {
  const [error, setError] = useState<Error | null>(null)

  // Error trigger functions
  const triggerJSError = () => {
    throw new Error('Test JavaScript runtime error')
  }

  const triggerValidationError = () => {
    setError(new ValidationError('Test validation error', { field: 'email', message: 'Invalid format' }))
  }

  const triggerAuthError = () => {
    setError(new AuthenticationError('Test authentication error'))
  }

  const triggerAuthzError = () => {
    setError(new AuthorizationError('Test authorization error'))
  }

  const triggerNotFoundError = () => {
    setError(new NotFoundError('Test resource'))
  }

  const triggerNetworkError = () => {
    setError(new Error('Network request failed'))
  }

  const triggerAsyncError = async () => {
    try {
      await fetch('/api/nonexistent-endpoint')
    } catch (err) {
      setError(err as Error)
    }
  }

  const triggerTimeoutError = () => {
    setError(new Error('Request timeout'))
  }

  const clearError = () => {
    setError(null)
  }

  // Component that throws error
  function ErrorThrowingComponent() {
    if (error) {
      throw error
    }
    return <div>No error</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Error Testing Dashboard</CardTitle>
          <p className="text-sm text-gray-600">
            Test different error scenarios in {context} context
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            
            {/* JavaScript Errors */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">JavaScript Errors</h3>
              <Button 
                onClick={triggerJSError}
                variant="destructive"
                size="sm"
                className="w-full"
              >
                Throw JS Error
              </Button>
            </div>

            {/* Validation Errors */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Validation Errors</h3>
              <Button 
                onClick={triggerValidationError}
                variant="destructive"
                size="sm"
                className="w-full"
              >
                Validation Error
              </Button>
            </div>

            {/* Auth Errors */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Auth Errors</h3>
              <Button 
                onClick={triggerAuthError}
                variant="destructive"
                size="sm"
                className="w-full"
              >
                Auth Error
              </Button>
            </div>

            {/* Authorization Errors */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Permission Errors</h3>
              <Button 
                onClick={triggerAuthzError}
                variant="destructive"
                size="sm"
                className="w-full"
              >
                Permission Error
              </Button>
            </div>

            {/* Not Found Errors */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Not Found Errors</h3>
              <Button 
                onClick={triggerNotFoundError}
                variant="destructive"
                size="sm"
                className="w-full"
              >
                Not Found Error
              </Button>
            </div>

            {/* Network Errors */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Network Errors</h3>
              <Button 
                onClick={triggerNetworkError}
                variant="destructive"
                size="sm"
                className="w-full"
              >
                Network Error
              </Button>
            </div>

            {/* Async Errors */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Async Errors</h3>
              <Button 
                onClick={triggerAsyncError}
                variant="destructive"
                size="sm"
                className="w-full"
              >
                Async Error
              </Button>
            </div>

            {/* Timeout Errors */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Timeout Errors</h3>
              <Button 
                onClick={triggerTimeoutError}
                variant="destructive"
                size="sm"
                className="w-full"
              >
                Timeout Error
              </Button>
            </div>

            {/* Clear Errors */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Reset</h3>
              <Button 
                onClick={clearError}
                variant="outline"
                size="sm"
                className="w-full"
              >
                Clear Error
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Boundary Test Area */}
      <Card>
        <CardHeader>
          <CardTitle>Error Boundary Test</CardTitle>
        </CardHeader>
        <CardContent>
          <ErrorBoundary {...(context !== 'global' && { context })}>
            <div className="p-4 border rounded-lg">
              <ErrorThrowingComponent />
            </div>
          </ErrorBoundary>
        </CardContent>
      </Card>

      {/* Manual Error Pages Test */}
      <Card>
        <CardHeader>
          <CardTitle>Manual Error Page Tests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              onClick={() => window.location.href = '/nonexistent-page'}
              variant="outline"
              size="sm"
            >
              Test 404
            </Button>
            
            <Button 
              onClick={() => window.location.href = '/access-denied'}
              variant="outline"
              size="sm"
            >
              Access Denied
            </Button>
            
            <Button 
              onClick={() => window.location.href = '/maintenance'}
              variant="outline"
              size="sm"
            >
              Maintenance
            </Button>
            
            <Button 
              onClick={() => window.location.href = '/timeout'}
              variant="outline"
              size="sm"
            >
              Timeout
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error Context Info */}
      <Card>
        <CardHeader>
          <CardTitle>Current Error Context</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm space-y-2">
            <div><strong>Context:</strong> {context}</div>
            <div><strong>Environment:</strong> {process.env.NODE_ENV}</div>
            <div><strong>Current Error:</strong> {error?.message || 'None'}</div>
            <div><strong>User Agent:</strong> {typeof window !== 'undefined' ? window.navigator.userAgent.slice(0, 50) + '...' : 'Server'}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Quick test components for different contexts
export function TrainerErrorTest() {
  return <ErrorTestComponent context="trainer" />
}

export function ClientErrorTest() {
  return <ErrorTestComponent context="client" />
}

export function AuthErrorTest() {
  return <ErrorTestComponent context="auth" />
}

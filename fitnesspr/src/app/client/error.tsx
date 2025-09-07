'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { AlertTriangle, Home, RefreshCcw, Shield } from 'lucide-react'
import Link from 'next/link'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ClientError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Client section error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg border-0">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-green-600" />
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Client Portal Error
              </h1>
              
              <p className="text-gray-600 text-sm leading-relaxed">
                Something went wrong while accessing your training portal. Your data is secure and will not be lost.
              </p>
            </div>

            {/* Client-specific help */}
            <div className="mb-6 p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Shield className="w-4 h-4 text-green-600 mr-2" />
                <span className="font-semibold text-gray-900">Your Data is Safe</span>
              </div>
              <p className="text-xs text-gray-600">
                All your progress, meal plans, and training data remain secure during this temporary issue.
              </p>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg text-left">
                <h3 className="font-semibold text-gray-900 mb-2">Error Details:</h3>
                <p className="text-xs text-gray-600 font-mono break-all">
                  {error.message}
                </p>
                {error.digest && (
                  <p className="text-xs text-gray-500 mt-1">
                    Error ID: {error.digest}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-3">
              <Button 
                onClick={reset}
                className="w-full"
                variant="default"
              >
                <RefreshCcw className="w-4 h-4 mr-2" />
                Try again
              </Button>
              
              <Button 
                asChild
                variant="outline"
                className="w-full"
              >
                <Link href="/client/pin-login">
                  <Home className="w-4 h-4 mr-2" />
                  Back to login
                </Link>
              </Button>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Still having trouble? Contact your trainer for assistance.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

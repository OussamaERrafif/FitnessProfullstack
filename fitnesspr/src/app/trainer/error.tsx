'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { AlertTriangle, Home, RefreshCcw } from 'lucide-react'
import Link from 'next/link'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function TrainerError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Trainer section error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg border-0">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-orange-600" />
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Trainer Dashboard Error
              </h1>
              
              <p className="text-gray-600 text-sm leading-relaxed">
                Something went wrong in the trainer section. Don't worry, your client data is safe.
              </p>
            </div>

            {/* Quick actions for trainers */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">Quick Recovery:</h3>
              <div className="space-y-2 text-sm">
                <Link 
                  href="/trainer/dashboard" 
                  className="block text-blue-600 hover:text-blue-800 transition-colors"
                >
                  → Go to Dashboard
                </Link>
                <Link 
                  href="/trainer/clients" 
                  className="block text-blue-600 hover:text-blue-800 transition-colors"
                >
                  → View Clients
                </Link>
                <Link 
                  href="/trainer/programs" 
                  className="block text-blue-600 hover:text-blue-800 transition-colors"
                >
                  → Training Programs
                </Link>
              </div>
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
                <Link href="/trainer/dashboard">
                  <Home className="w-4 h-4 mr-2" />
                  Trainer Dashboard
                </Link>
              </Button>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                If this continues, contact support with error ID above.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

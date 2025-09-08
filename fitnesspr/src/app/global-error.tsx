'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { AlertTriangle, Home, RefreshCcw } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <Card className="shadow-lg border-0">
              <CardContent className="p-8 text-center">
                <div className="mb-6">
                  <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                  </div>
                  
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Application Error
                  </h1>
                  
                  <p className="text-gray-600 text-sm leading-relaxed">
                    We're experiencing technical difficulties. Our team has been automatically notified.
                  </p>
                </div>

                {process.env.NODE_ENV === 'development' && error && (
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
                    onClick={() => window.location.href = '/'}
                    variant="outline"
                    className="w-full"
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Go to homepage
                  </Button>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    Error occurred at: {new Date().toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </body>
    </html>
  )
}

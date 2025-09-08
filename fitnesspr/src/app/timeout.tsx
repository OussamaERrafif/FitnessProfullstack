'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Clock, Home, RefreshCcw } from 'lucide-react'
import Link from 'next/link'

export default function TimeoutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg border-0">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Session Timeout
              </h1>
              
              <p className="text-gray-600 text-sm leading-relaxed">
                Your session has expired for security reasons. Please log in again to continue.
              </p>
            </div>

            {/* Security info */}
            <div className="mb-6 p-4 bg-orange-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Why did this happen?</h3>
              <div className="text-sm text-gray-700 text-left space-y-1">
                <div>• Automatic logout after 30 minutes of inactivity</div>
                <div>• Protects your personal training data</div>
                <div>• Your progress has been saved</div>
              </div>
            </div>

            <div className="space-y-3">
              <Button 
                asChild
                className="w-full"
                variant="default"
              >
                <Link href="/login">
                  <RefreshCcw className="w-4 h-4 mr-2" />
                  Log in again
                </Link>
              </Button>
              
              <Button 
                asChild
                variant="outline"
                className="w-full"
              >
                <Link href="/">
                  <Home className="w-4 h-4 mr-2" />
                  Homepage
                </Link>
              </Button>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Your data is always protected and securely stored.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

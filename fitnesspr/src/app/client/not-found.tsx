'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { KeyRound, Home, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function ClientNotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <Card className="shadow-lg border-0">
          <CardContent className="p-8 text-center">
            <div className="mb-8">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <KeyRound className="w-8 h-8 text-green-600" />
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                Client Page Not Found
              </h1>
              
              <p className="text-gray-600 leading-relaxed">
                The page you're trying to access doesn't exist or requires a valid PIN to view.
              </p>
            </div>

            {/* Client access help */}
            <div className="mb-8 p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">Need Access?</h3>
              <div className="space-y-3 text-sm">
                <div className="p-3 bg-white rounded-md">
                  <div className="font-medium text-gray-900">Have a PIN?</div>
                  <div className="text-gray-500 text-xs">Enter your PIN to access your personal training portal</div>
                </div>
                <div className="p-3 bg-white rounded-md">
                  <div className="font-medium text-gray-900">Lost your PIN?</div>
                  <div className="text-gray-500 text-xs">Contact your trainer to get a new PIN code</div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button 
                asChild
                className="w-full"
                variant="default"
              >
                <Link href="/login">
                  <KeyRound className="w-4 h-4 mr-2" />
                  Enter PIN
                </Link>
              </Button>
              
              <Button 
                onClick={() => window.history.back()}
                variant="outline"
                className="w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go back
              </Button>
              
              <Button 
                asChild
                variant="ghost"
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
                Your trainer can provide you with a PIN if you don't have one.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

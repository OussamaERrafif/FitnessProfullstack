'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Ban, Home, ArrowLeft, Shield } from 'lucide-react'
import Link from 'next/link'

export default function AccessDeniedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg border-0">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <Ban className="w-8 h-8 text-red-600" />
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Access Denied
              </h1>
              
              <p className="text-gray-600 text-sm leading-relaxed">
                You don't have permission to access this page. Please check your credentials or contact your trainer.
              </p>
            </div>

            {/* Access help */}
            <div className="mb-6 p-4 bg-red-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Shield className="w-4 h-4 text-red-600 mr-2" />
                <span className="font-semibold text-gray-900">Secure Access Required</span>
              </div>
              <div className="space-y-2 text-sm text-left">
                <div className="text-gray-700">• Valid PIN required for client access</div>
                <div className="text-gray-700">• Trainer login needed for trainer tools</div>
                <div className="text-gray-700">• Some pages are restricted by user role</div>
              </div>
            </div>

            <div className="space-y-3">
              <Button 
                asChild
                className="w-full"
                variant="default"
              >
                <Link href="/client/pin-login">
                  Client Login
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
                Need help with access? Contact your trainer or system administrator.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

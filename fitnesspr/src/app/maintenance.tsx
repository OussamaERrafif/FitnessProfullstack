'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Wrench, Home, ArrowLeft, Clock } from 'lucide-react'
import Link from 'next/link'

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg border-0">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <Wrench className="w-8 h-8 text-yellow-600" />
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Scheduled Maintenance
              </h1>
              
              <p className="text-gray-600 text-sm leading-relaxed">
                We're currently performing system maintenance to improve your experience. We'll be back shortly.
              </p>
            </div>

            {/* Maintenance info */}
            <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Clock className="w-4 h-4 text-yellow-600 mr-2" />
                <span className="font-semibold text-gray-900">Expected Duration</span>
              </div>
              <p className="text-sm text-gray-700 mb-3">
                Approximately 30 minutes
              </p>
              <div className="text-xs text-gray-600 space-y-1">
                <div>• Client data remains secure</div>
                <div>• All features will return after maintenance</div>
                <div>• Emergency contact: support@fitnesspro.com</div>
              </div>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={() => window.location.reload()}
                className="w-full"
                variant="default"
              >
                Check if we're back
              </Button>
              
              <Button 
                onClick={() => window.history.back()}
                variant="outline"
                className="w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go back
              </Button>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Follow us on social media for real-time updates.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

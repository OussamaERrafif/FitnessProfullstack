'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Globe, Home, ArrowLeft, Wifi } from 'lucide-react'
import Link from 'next/link'

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg border-0">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Wifi className="w-8 h-8 text-gray-600" />
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                You're Offline
              </h1>
              
              <p className="text-gray-600 text-sm leading-relaxed">
                Please check your internet connection and try again. Some features may be limited while offline.
              </p>
            </div>

            {/* Offline capabilities */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">Available Offline:</h3>
              <div className="space-y-2 text-sm text-left">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-gray-700">View cached training programs</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-gray-700">Access downloaded meal plans</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                  <span className="text-gray-700">Log workouts (sync when online)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                  <span className="text-gray-700">Live features require connection</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={() => window.location.reload()}
                className="w-full"
                variant="default"
              >
                <Globe className="w-4 h-4 mr-2" />
                Try to reconnect
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
                Your progress will sync automatically when you're back online.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

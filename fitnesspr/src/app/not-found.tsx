'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Home, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <Card className="shadow-lg border-0">
          <CardContent className="p-8 text-center">
            <div className="mb-8">
              {/* Large 404 Text */}
              <div className="text-8xl font-bold text-gray-200 mb-4">404</div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                Page not found
              </h1>
              
              <p className="text-gray-600 leading-relaxed">
                The page you're looking for doesn't exist or has been moved. 
                Let's get you back on track.
              </p>
            </div>

            {/* Search suggestions */}
            <div className="mb-8 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">Popular pages:</h3>
              <div className="space-y-2 text-sm">
                <Link 
                  href="/trainer/dashboard" 
                  className="block text-blue-600 hover:text-blue-800 transition-colors"
                >
                  → Trainer Dashboard
                </Link>
                <Link 
                  href="/trainer/clients" 
                  className="block text-blue-600 hover:text-blue-800 transition-colors"
                >
                  → Client Management
                </Link>
                <Link 
                  href="/trainer/programs" 
                  className="block text-blue-600 hover:text-blue-800 transition-colors"
                >
                  → Training Programs
                </Link>
                <Link 
                  href="/login" 
                  className="block text-blue-600 hover:text-blue-800 transition-colors"
                >
                  → Client Login
                </Link>
              </div>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={() => window.history.back()}
                className="w-full"
                variant="default"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go back
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
                Need help? Contact our support team for assistance.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

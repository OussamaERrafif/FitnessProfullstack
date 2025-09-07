'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { UserX, Home, Search } from 'lucide-react'
import Link from 'next/link'

export default function TrainerNotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <Card className="shadow-lg border-0">
          <CardContent className="p-8 text-center">
            <div className="mb-8">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <UserX className="w-8 h-8 text-blue-600" />
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                Trainer Page Not Found
              </h1>
              
              <p className="text-gray-600 leading-relaxed">
                The trainer page you're looking for doesn't exist. Let's get you back to managing your clients.
              </p>
            </div>

            {/* Trainer-specific navigation */}
            <div className="mb-8 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">Trainer Tools:</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <Link 
                  href="/trainer/dashboard" 
                  className="p-3 bg-white rounded-md hover:bg-gray-50 transition-colors text-center"
                >
                  <div className="font-medium text-gray-900">Dashboard</div>
                  <div className="text-gray-500 text-xs">Overview & stats</div>
                </Link>
                <Link 
                  href="/trainer/clients" 
                  className="p-3 bg-white rounded-md hover:bg-gray-50 transition-colors text-center"
                >
                  <div className="font-medium text-gray-900">Clients</div>
                  <div className="text-gray-500 text-xs">Manage clients</div>
                </Link>
                <Link 
                  href="/trainer/programs" 
                  className="p-3 bg-white rounded-md hover:bg-gray-50 transition-colors text-center"
                >
                  <div className="font-medium text-gray-900">Programs</div>
                  <div className="text-gray-500 text-xs">Training plans</div>
                </Link>
                <Link 
                  href="/trainer/calendar" 
                  className="p-3 bg-white rounded-md hover:bg-gray-50 transition-colors text-center"
                >
                  <div className="font-medium text-gray-900">Calendar</div>
                  <div className="text-gray-500 text-xs">Schedule sessions</div>
                </Link>
              </div>
            </div>

            <div className="space-y-3">
              <Button 
                asChild
                className="w-full"
                variant="default"
              >
                <Link href="/trainer/dashboard">
                  <Home className="w-4 h-4 mr-2" />
                  Trainer Dashboard
                </Link>
              </Button>
              
              <Button 
                onClick={() => window.history.back()}
                variant="outline"
                className="w-full"
              >
                <Search className="w-4 h-4 mr-2" />
                Go back
              </Button>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Looking for something specific? Use the search in your dashboard.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

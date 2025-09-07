'use client'

import { Button } from "@/components/ui/button"
import { Bell, Settings, User, LogOut } from "lucide-react"
import { MobileMenu } from './mobile-menu'
import { useSidebar } from './sidebar-context'

export function TrainerHeader() {
  const { isExpanded } = useSidebar()
  
  return (
    <header className={`bg-white border-b border-gray-200 sticky top-0 z-40 transition-all duration-300 ease-in-out ${isExpanded ? 'lg:ml-64' : 'lg:ml-16'}`}>
      <div className="px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Left side - Logo and mobile menu */}
          <div className="flex items-center space-x-4">
            <MobileMenu />
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">F</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">FitnessPr</h1>
                <p className="text-sm text-gray-600 hidden sm:block">Trainer Dashboard</p>
              </div>
            </div>
          </div>

          {/* Right side - User actions */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs"></span>
            </Button>

            {/* User menu */}
            <div className="flex items-center space-x-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900">Alex Johnson</p>
                <p className="text-xs text-gray-600">Certified Trainer</p>
              </div>
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-gray-600" />
              </div>
            </div>

            {/* Settings */}
            <Button variant="ghost" size="sm">
              <Settings className="h-5 w-5" />
            </Button>

            {/* Logout */}
            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}

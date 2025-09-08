'use client'

/**
 * @fileoverview TrainerHeader component for the FitnessPr trainer dashboard.
 * 
 * This component renders the main header for the trainer dashboard interface,
 * including navigation, user profile information, notifications, and action buttons.
 * It adapts to the sidebar state and provides responsive design for mobile devices.
 * 
 * @author FitnessPr Team
 * @version 1.0.0
 * @since 2024-01-01
 */

import { Button } from "@/components/ui/button"
import { Bell, Settings, User, LogOut } from "lucide-react"
import { MobileMenu } from './mobile-menu'
import { useSidebar } from './sidebar-context'

/**
 * TrainerHeader component that renders the main header for trainer dashboard.
 * 
 * This component provides the top navigation bar for the trainer interface,
 * including the application logo, mobile menu toggle, user information,
 * notification indicators, and quick action buttons for settings and logout.
 * 
 * Features:
 * - Responsive design that adapts to sidebar expansion state
 * - Mobile-first approach with hamburger menu for small screens
 * - Notification badge indicator
 * - User profile display with name and certification status
 * - Quick access to settings and logout functionality
 * - Sticky positioning for consistent navigation
 * 
 * @component
 * @example
 * ```tsx
 * import { TrainerHeader } from '@/components/trainer/trainer-header'
 * 
 * function TrainerDashboard() {
 *   return (
 *     <div>
 *       <TrainerHeader />
 *       <main>
 *         // Dashboard content
 *       </main>
 *     </div>
 *   )
 * }
 * ```
 * 
 * @returns {JSX.Element} The rendered header component
 * 
 * @dependencies
 * - Button component from UI library
 * - Lucide React icons for UI elements
 * - MobileMenu component for responsive navigation
 * - useSidebar hook for sidebar state management
 * 
 * @accessibility
 * - Semantic HTML structure with proper header tag
 * - Keyboard navigation support through Button components
 * - Screen reader friendly with descriptive text
 * - High contrast support through CSS classes
 * 
 * @responsive
 * - Desktop: Full header with expanded user info
 * - Tablet: Condensed layout with essential elements
 * - Mobile: Hamburger menu with minimal header content
 */
export function TrainerHeader() {
  /** 
   * Get sidebar expansion state from context to adjust header layout
   * @type {boolean} isExpanded - Whether the sidebar is currently expanded
   */
  const { isExpanded } = useSidebar()
  
  return (
    <header 
      className={`
        bg-white border-b border-gray-200 sticky top-0 z-40 
        transition-all duration-300 ease-in-out 
        ${isExpanded ? 'lg:ml-64' : 'lg:ml-16'}
      `}
      role="banner"
      aria-label="Trainer dashboard header"
    >
      <div className="px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Left side - Logo and mobile menu */}
          <div className="flex items-center space-x-4">
            {/* Mobile navigation menu - only visible on small screens */}
            <MobileMenu />
            
            {/* Application logo and branding */}
            <div className="flex items-center space-x-3">
              <div 
                className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center"
                role="img"
                aria-label="FitnessPr logo"
              >
                <span className="text-white font-bold text-sm">F</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">FitnessPr</h1>
                <p className="text-sm text-gray-600 hidden sm:block">Trainer Dashboard</p>
              </div>
            </div>
          </div>

          {/* Right side - User actions and navigation */}
          <div className="flex items-center space-x-4">
            {/* Notifications button with indicator badge */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="relative"
              aria-label="View notifications"
              title="Notifications"
            >
              <Bell className="h-5 w-5" aria-hidden="true" />
              <span 
                className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs"
                aria-label="Unread notifications"
                role="status"
              ></span>
            </Button>

            {/* User profile information and avatar */}
            <div className="flex items-center space-x-3">
              {/* User details - hidden on small screens */}
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900">Alex Johnson</p>
                <p className="text-xs text-gray-600">Certified Trainer</p>
              </div>
              
              {/* User avatar placeholder */}
              <div 
                className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center"
                role="img"
                aria-label="User avatar"
              >
                <User className="h-4 w-4 text-gray-600" aria-hidden="true" />
              </div>
            </div>

            {/* Settings button */}
            <Button 
              variant="ghost" 
              size="sm"
              aria-label="Open settings"
              title="Settings"
            >
              <Settings className="h-5 w-5" aria-hidden="true" />
            </Button>

            {/* Logout button with warning styling */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-red-600 hover:text-red-700"
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut className="h-5 w-5" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}

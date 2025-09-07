'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useSidebar } from "./sidebar-context"
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  DollarSign, 
  BarChart3, 
  Dumbbell, 
  UtensilsCrossed, 
  FileText, 
  Settings,
  BookOpen,
  ChevronLeft,
  ChevronRight
} from "lucide-react"

const navigationItems = [
  {
    title: "Dashboard",
    href: "/trainer/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Calendar",
    href: "/trainer/calendar",
    icon: Calendar,
  },
  {
    title: "Clients",
    href: "/trainer/clients",
    icon: Users,
  },
  {
    title: "Programs",
    href: "/trainer/programs",
    icon: Dumbbell,
  },
  {
    title: "Meals",
    href: "/trainer/meals",
    icon: UtensilsCrossed,
  },
  {
    title: "Exercises",
    href: "/trainer/exercises",
    icon: BookOpen,
  },
  {
    title: "Progress",
    href: "/trainer/progress",
    icon: BarChart3,
  },
  {
    title: "Payments",
    href: "/trainer/payments",
    icon: DollarSign,
  },
  {
    title: "Reports",
    href: "/trainer/reports",
    icon: FileText,
  }
]

export function TrainerSidebar() {
  const pathname = usePathname()
  const { isExpanded, setIsExpanded } = useSidebar()

  return (
    <aside className={cn(
      "fixed left-0 top-0 z-30 h-screen border-r border-gray-200 bg-white transition-all duration-300 ease-in-out hidden lg:block",
      isExpanded ? "w-64 overflow-y-auto" : "w-16 overflow-hidden"
    )}>
      <div className="p-2 pt-16">
        {/* Toggle Button */}
        <div className="flex justify-end mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-gray-100"
          >
            {isExpanded ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </div>

        <nav className="space-y-2">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center rounded-lg p-3 text-sm transition-colors group relative",
                  isExpanded ? "justify-start" : "justify-center",
                  isActive
                    ? "bg-primary-50 text-primary-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
                title={!isExpanded ? item.title : undefined}
              >
                <Icon className={cn(
                  "h-5 w-5 flex-shrink-0",
                  isExpanded ? "mr-3" : "",
                  isActive ? "text-primary-600" : "text-gray-400 group-hover:text-gray-600"
                )} />
                
                {/* Title text when expanded */}
                {isExpanded && (
                  <span className="font-medium truncate">
                    {item.title}
                  </span>
                )}
                
                {/* Tooltip when collapsed */}
                {!isExpanded && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                    {item.title}
                  </div>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Settings at bottom */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <Link
            href="/trainer/settings"
            className={cn(
              "flex items-center rounded-lg p-3 text-sm transition-colors group relative",
              isExpanded ? "justify-start" : "justify-center",
              pathname === "/trainer/settings"
                ? "bg-primary-50 text-primary-700"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            )}
            title={!isExpanded ? "Settings" : undefined}
          >
            <Settings className={cn(
              "h-5 w-5 flex-shrink-0",
              isExpanded ? "mr-3" : "",
              pathname === "/trainer/settings" ? "text-primary-600" : "text-gray-400 group-hover:text-gray-600"
            )} />
            
            {/* Title text when expanded */}
            {isExpanded && (
              <span className="font-medium truncate">
                Settings
              </span>
            )}
            
            {/* Tooltip when collapsed */}
            {!isExpanded && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                Settings
              </div>
            )}
          </Link>
        </div>
      </div>
    </aside>
  )
}
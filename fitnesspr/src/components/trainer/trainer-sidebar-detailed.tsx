'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
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
  ChevronDown,
  BookOpen
} from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

const navigationItems = [
  {
    title: "Overview",
    items: [
      {
        title: "Dashboard",
        href: "/trainer/dashboard",
        icon: LayoutDashboard,
        description: "Overview and quick stats"
      },
      {
        title: "Calendar",
        href: "/trainer/calendar",
        icon: Calendar,
        description: "Schedule and appointments"
      }
    ]
  },
  {
    title: "Client Management",
    items: [
      {
        title: "Clients",
        href: "/trainer/clients",
        icon: Users,
        description: "Manage your clients"
      },
      {
        title: "Progress Tracking",
        href: "/trainer/progress",
        icon: BarChart3,
        description: "Client progress analytics"
      }
    ]
  },
  {
    title: "Programs & Content",
    items: [
      {
        title: "Training Programs",
        href: "/trainer/programs",
        icon: Dumbbell,
        description: "Create and manage workout plans"
      },
      {
        title: "Meal Plans",
        href: "/trainer/meals",
        icon: UtensilsCrossed,
        description: "Nutrition and meal planning"
      },
      {
        title: "Exercise Library",
        href: "/trainer/exercises",
        icon: BookOpen,
        description: "Exercise database and templates"
      }
    ]
  },
  {
    title: "Business",
    items: [
      {
        title: "Payments",
        href: "/trainer/payments",
        icon: DollarSign,
        description: "Billing and transactions"
      },
      {
        title: "Reports",
        href: "/trainer/reports",
        icon: FileText,
        description: "Business analytics and reports"
      }
    ]
  }
]

export function TrainerSidebar({ isMobile = false }: { isMobile?: boolean }) {
  const pathname = usePathname()
  const [expandedSections, setExpandedSections] = useState<string[]>([
    "Overview", "Client Management", "Programs & Content", "Business"
  ])

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    )
  }

  return (
    <aside className={cn(
      "border-r border-gray-200 bg-white overflow-y-auto",
      isMobile 
        ? "w-full h-full" 
        : "fixed left-0 top-16 z-30 h-[calc(100vh-4rem)] w-64 hidden lg:block"
    )}>
      <div className="p-4">
        <nav className="space-y-6">
          {navigationItems.map((section) => (
            <div key={section.title}>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-between p-2 h-auto font-medium text-gray-700 hover:text-gray-900"
                onClick={() => toggleSection(section.title)}
              >
                <span className="text-xs uppercase tracking-wide font-semibold">
                  {section.title}
                </span>
                <ChevronDown 
                  className={cn(
                    "h-4 w-4 transition-transform",
                    expandedSections.includes(section.title) ? "rotate-180" : ""
                  )}
                />
              </Button>
              
              {expandedSections.includes(section.title) && (
                <div className="mt-2 space-y-1">
                  {section.items.map((item) => {
                    const isActive = pathname === item.href
                    const Icon = item.icon
                    
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center rounded-lg px-3 py-2 text-sm transition-colors group",
                          isActive
                            ? "bg-primary-50 text-primary-700 border-r-2 border-primary-500"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        )}
                      >
                        <Icon className={cn(
                          "h-4 w-4 mr-3 flex-shrink-0",
                          isActive ? "text-primary-600" : "text-gray-400 group-hover:text-gray-600"
                        )} />
                        <div>
                          <div className="font-medium">{item.title}</div>
                          <div className="text-xs text-gray-500 group-hover:text-gray-600">
                            {item.description}
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Settings at bottom */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <Link
            href="/trainer/settings"
            className={cn(
              "flex items-center rounded-lg px-3 py-2 text-sm transition-colors",
              pathname === "/trainer/settings"
                ? "bg-primary-50 text-primary-700 border-r-2 border-primary-500"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            )}
          >
            <Settings className="h-4 w-4 mr-3 text-gray-400" />
            <div>
              <div className="font-medium">Settings</div>
              <div className="text-xs text-gray-500">Account and preferences</div>
            </div>
          </Link>
        </div>
      </div>
    </aside>
  )
}

'use client'

import { TrainerSidebar, TrainerHeader } from '@/components/trainer'
import { SidebarProvider, useSidebar } from '@/components/trainer/sidebar-context'

function TrainerLayoutContent({ children }: { children: React.ReactNode }) {
  const { isExpanded } = useSidebar()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <TrainerSidebar />
      
      {/* Header */}
      <TrainerHeader />
      
      {/* Main Content */}
      <main className={`transition-all duration-300 ease-in-out pt-16 ${isExpanded ? 'lg:ml-64' : 'lg:ml-16'}`}>
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}

export function TrainerLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <TrainerLayoutContent>{children}</TrainerLayoutContent>
    </SidebarProvider>
  )
}

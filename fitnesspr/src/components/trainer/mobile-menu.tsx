'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { TrainerSidebar as TrainerSidebarDetailed } from './trainer-sidebar-detailed'

export function MobileMenu() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="lg:hidden"
        onClick={() => setOpen(true)}
      >
        <Menu className="h-6 w-6" />
      </Button>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/20" 
            onClick={() => setOpen(false)}
          />
          
          {/* Sidebar */}
          <div className="fixed left-0 top-0 z-50 h-full w-64 bg-white border-r shadow-lg">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-semibold">Menu</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="h-[calc(100%-4rem)] overflow-y-auto">
              <TrainerSidebarDetailed isMobile={true} />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

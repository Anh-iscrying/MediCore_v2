"use client"

import { RequireAuth } from "@/components/auth/require-auth"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <div className="relative h-screen overflow-hidden bg-background text-foreground font-sans antialiased">
        <div className="flex h-screen overflow-hidden">
          <div className="hidden h-screen w-64 shrink-0 md:block">
            <DashboardSidebar />
          </div>

          <div className="flex h-screen min-h-0 flex-1 flex-col overflow-hidden">
            <DashboardHeader />
            <main className="min-h-0 flex-1 overflow-y-auto bg-background">
              {children}
            </main>
          </div>
        </div>
      </div>
    </RequireAuth>
  )
}

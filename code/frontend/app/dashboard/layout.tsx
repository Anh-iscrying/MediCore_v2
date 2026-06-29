import type React from "react"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"

export const metadata = {
  title: "HealthCare Patient Portal — Dashboard",
  description: "Review your appointments, daily care tasks, and latest health updates."
}

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
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
  )
}

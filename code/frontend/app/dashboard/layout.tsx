import type React from "react"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"

export const metadata = {
  title: "Medicore Patient Portal — Dashboard",
  description: "Review your appointments, daily care tasks, and latest health updates."
}

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardShell>{children}</DashboardShell>
  )
}

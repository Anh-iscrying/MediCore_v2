"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  FileText,
  Calendar,
  MessageSquare,
  Activity,
  LogOut,
  UserCheck,
  User
} from "lucide-react"
import { cn } from "@/lib/utils"



export function DashboardSidebar() {
  const pathname = usePathname()

  const mainNav = [
    { name: "Trang chủ", href: "/dashboard", icon: Home },
    { name: "Hồ sơ sức khỏe", href: "/dashboard/history", icon: FileText },
    { name: "Lịch hẹn khám", href: "/dashboard/appointments", icon: Calendar },
    { name: "Trợ lý sức khỏe AI", href: "/dashboard/ai-assistant", icon: MessageSquare }
  ]

  return (
    <aside className="w-64 bg-sidebar text-sidebar-foreground/80 flex flex-col h-full select-none border-r border-sidebar-border shrink-0">
      {/* Brand Header */}
      <div className="p-6 pb-4">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="font-sans text-foreground text-xl font-bold tracking-tight transition-opacity group-hover:opacity-90">
            Medicore<span className="text-primary">.</span>
          </span>
        </Link>
      </div>

      {/* Main Navigation */}
      <div className="px-3 py-2 space-y-1">
        {mainNav.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-4 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 border",
                isActive
                  ? "bg-sidebar-accent text-foreground border-sidebar-border shadow-none"
                  : "border-transparent text-sidebar-foreground/70 hover:text-foreground hover:bg-sidebar-accent/50"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive ? "text-sidebar-primary" : "text-sidebar-foreground/70")} />
              {item.name}
            </Link>
          )
        })}
      </div>




    </aside>
  )
}

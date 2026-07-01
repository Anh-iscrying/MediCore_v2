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
  User,
  ChevronRight
} from "lucide-react"
import { cn } from "@/lib/utils"

interface CareTeamMember {
  name: string
  role: string
  avatarColor: string
  isOnline: boolean
}

const careTeam: CareTeamMember[] = [
  { name: "Dr. Sarah Jenkins", role: "Bác sĩ Tim mạch", avatarColor: "bg-[#111111] border border-[#1f1f1f] text-white", isOnline: true },
  { name: "Dr. Emily Watson", role: "BS. Vật lý trị liệu", avatarColor: "bg-[#111111] border border-[#1f1f1f] text-white", isOnline: true },
  { name: "Dr. Alex Rivera", role: "Bác sĩ Đa khoa", avatarColor: "bg-[#111111] border border-[#1f1f1f] text-white", isOnline: false }
]

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
          <span className="font-sans text-foreground text-xl font-bold tracking-tight flex items-center gap-1">
            <span className="text-sidebar-primary text-xl leading-none font-sans font-black select-none">*</span>
            Medicore
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

      <div className="h-px bg-sidebar-border mx-6 my-4" />

      {/* Library/Routines section */}
      <div className="flex-1 overflow-y-auto px-4 space-y-6 scrollbar-hide">
        {/* Care Team Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground px-2">
            <span>Bác sĩ của tôi</span>
          </div>

          <div className="space-y-2">
            {careTeam.map((member) => (
              <div
                key={member.name}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-sidebar-accent transition-all group border border-transparent hover:border-sidebar-border hover:shadow-none"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-foreground shrink-0 border border-sidebar-border bg-sidebar-accent">
                      {member.name.split(" ").slice(-1)[0][0]}
                    </div>
                    {member.isOnline && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#5db872] border-2 border-sidebar rounded-full" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-foreground group-hover:underline transition-all">
                      {member.name}
                    </div>
                    <div className="text-[10px] text-sidebar-foreground/70">{member.role}</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-sidebar-foreground/70" />
              </div>
            ))}
          </div>
        </div>
      </div>


    </aside>
  )
}

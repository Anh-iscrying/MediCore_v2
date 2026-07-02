"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Bell, ChevronDown, ExternalLink, LogOut, Settings } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/components/auth/auth-provider"
import { cn } from "@/lib/utils"

interface AuthenticatedUserMenuProps {
  onNavigate?: () => void
}

export function AuthenticatedUserMenu({ onNavigate }: AuthenticatedUserMenuProps) {
  const [showDropdown, setShowDropdown] = useState(false)
  const router = useRouter()
  const { user, logout } = useAuth()

  const displayName = user?.name || user?.email || "Người dùng"
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "ND"

  const handleLogout = async () => {
    await logout()
    setShowDropdown(false)
    if (onNavigate) onNavigate()
    router.push("/")
  }

  const handleLinkClick = () => {
    setShowDropdown(false)
    if (onNavigate) onNavigate()
  }

  return (
    <div className="flex items-center gap-3">
      <button
        className="relative flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground transition-all hover:text-foreground hover:bg-card"
        title="Thông báo"
      >
        <Bell className="h-4 w-4" />
        <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
      </button>

      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 rounded-full border border-border bg-muted p-1 pr-3 text-xs font-bold text-foreground transition-all hover:bg-card"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-[10px] font-black text-primary-foreground">
            {initials}
          </div>
          <span className="hidden md:inline">{displayName}</span>
          <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform duration-200", showDropdown && "rotate-180")} />
        </button>

        {showDropdown && (
          <div
            className="absolute right-0 mt-2 w-52 rounded-xl border border-border bg-card p-1 text-xs font-bold text-card-foreground z-50 shadow-lg"
          >
            <Link
              href="/dashboard/profile"
              className="flex w-full items-center justify-between rounded p-2.5 text-left transition-colors hover:bg-muted hover:text-foreground"
              onClick={handleLinkClick}
            >
              <span>Hồ sơ bệnh nhân</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
            <button
              type="button"
              className="flex w-full items-center justify-between rounded p-2.5 text-left transition-colors hover:bg-muted hover:text-foreground"
              onClick={handleLinkClick}
            >
              <span>Cài đặt</span>
              <Settings className="h-3.5 w-3.5" />
            </button>
            <div className="my-1 h-px bg-border" />
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center justify-between rounded p-2.5 text-left text-destructive transition-colors hover:bg-muted"
            >
              <span>Đăng xuất</span>
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

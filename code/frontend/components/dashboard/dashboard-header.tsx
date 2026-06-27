"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { Bell, ChevronDown, ExternalLink, LogOut, Settings } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export function DashboardHeader() {
  const [showDropdown, setShowDropdown] = useState(false)
  const pathname = usePathname()

  // Dynamic headers based on current route in Vietnamese
  const getHeaderInfo = () => {
    switch (pathname) {
      case "/dashboard/profile":
        return {
          title: "Hồ sơ bệnh nhân",
          subtitle: "Thông tin cá nhân, liên hệ khẩn cấp & dị ứng thuốc"
        }
      case "/dashboard/appointments":
        return {
          title: "Đặt lịch hẹn khám",
          subtitle: "Đặt lịch khám theo chuyên khoa, bác sĩ & theo dõi lịch hẹn"
        }
      case "/dashboard/history":
        return {
          title: "Hồ sơ bệnh án",
          subtitle: "Lịch sử các lần khám bệnh, chẩn đoán & hướng điều trị"
        }
      case "/dashboard/prescriptions":
        return {
          title: "Đơn thuốc điện tử",
          subtitle: "Xem chi tiết và tải đơn thuốc kê theo đợt"
        }
      case "/dashboard/ai-assistant":
        return {
          title: "Trợ lý sức khỏe AI",
          subtitle: "Tra cứu khoa khám & hướng dẫn chăm sóc sức khỏe"
        }
      case "/dashboard":
      default:
        return {
          title: "Bảng điều khiển",
          subtitle: "Cổng thông tin tự phục vụ dành cho bệnh nhân"
        }
    }
  }

  const headerInfo = getHeaderInfo()

  return (
    <header className="sticky top-0 z-40 flex h-16 select-none items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur-md md:px-6">
      <div className="flex items-center gap-3">
        <div>
          <p className="text-lg font-serif font-medium text-foreground tracking-tight">{headerInfo.title}</p>
          <p className="hidden text-xs text-muted-foreground sm:block">{headerInfo.subtitle}</p>
        </div>
      </div>

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
              AC
            </div>
            <span className="hidden md:inline">Alexander Carter</span>
            <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform duration-200", showDropdown && "rotate-180")} />
          </button>

          {showDropdown && (
            <div
              className="absolute right-0 mt-2 w-52 rounded-md border border-border bg-card p-1 text-xs font-bold text-card-foreground shadow-2xl z-50"
              style={{ boxShadow: "0px 2px 4px rgba(0,0,0,0.2), 0px 8px 16px -4px rgba(0,0,0,0.4)" }}
            >
              <Link
                href="/dashboard/profile"
                className="flex w-full items-center justify-between rounded p-2.5 text-left transition-colors hover:bg-muted hover:text-foreground"
                onClick={() => setShowDropdown(false)}
              >
                <span>Hồ sơ bệnh nhân</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
              <button
                className="flex w-full items-center justify-between rounded p-2.5 text-left transition-colors hover:bg-muted hover:text-foreground"
                onClick={() => setShowDropdown(false)}
              >
                <span>Cài đặt</span>
                <Settings className="h-3.5 w-3.5" />
              </button>
              <div className="my-1 h-px bg-border" />
              <Link
                href="/"
                className="flex w-full items-center justify-between rounded p-2.5 text-left text-destructive transition-colors hover:bg-muted"
              >
                <span>Đăng xuất</span>
                <LogOut className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

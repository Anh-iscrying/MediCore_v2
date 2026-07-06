"use client"

import { usePathname } from "next/navigation"
import { AuthenticatedUserMenu } from "@/components/base/authenticated-user-menu"

export function DashboardHeader() {
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
      case "/dashboard/settings":
        return {
          title: "Cài đặt",
          subtitle: "Đổi mật khẩu tài khoản bệnh nhân"
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
          <p className="text-lg font-sans font-black text-foreground tracking-tight">{headerInfo.title}</p>
          <p className="hidden text-xs text-muted-foreground sm:block">{headerInfo.subtitle}</p>
        </div>
      </div>

      <AuthenticatedUserMenu />
    </header>
  )
}


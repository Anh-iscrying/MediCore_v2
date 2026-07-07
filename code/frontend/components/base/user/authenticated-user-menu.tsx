"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { useRouter } from "next/navigation"
import { Bell, CheckCheck, ChevronDown, ExternalLink, LogOut, Settings, X } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/components/auth/auth-provider"
import { useNotifications } from "@/hooks/use-notifications"
import { cn } from "@/lib/utils"

interface AuthenticatedUserMenuProps {
  onNavigate?: () => void
}

export function AuthenticatedUserMenu({ onNavigate }: AuthenticatedUserMenuProps) {
  const [showDropdown, setShowDropdown] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const router = useRouter()
  const { user, logout } = useAuth()
  const { notifications, unreadCount, isLoading, examNotification, recordNotification, dismissExamNotification, dismissRecordNotification, markRead, markAllRead } = useNotifications(user, showNotifications || notificationsEnabled)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (user?.role !== "PATIENT") {
      setNotificationsEnabled(false)
      return
    }

    const timeoutId = window.setTimeout(() => setNotificationsEnabled(true), 3000)
    return () => window.clearTimeout(timeoutId)
  }, [user?.role])

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
    setShowNotifications(false)
    if (onNavigate) onNavigate()
  }

  const handleNotificationClick = async (id: number, redirectUrl?: string | null) => {
    await markRead(id)
    if (redirectUrl) {
      setShowNotifications(false)
      if (onNavigate) onNavigate()
      router.push(redirectUrl)
    }
  }

  const formatNotificationTime = (value?: string | null) => {
    if (!value) return "Vừa xong"
    return new Intl.DateTimeFormat("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
    }).format(new Date(value))
  }

  return (
    <>
    <div className="flex items-center gap-3">
      <div className="relative">
        <button
          className="relative flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground transition-all hover:text-foreground hover:bg-card"
          title="Thông báo"
          onClick={() => {
            setNotificationsEnabled(true)
            setShowNotifications(!showNotifications)
            setShowDropdown(false)
          }}
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-black text-primary-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        {showNotifications && (
          <div className="absolute right-0 mt-2 w-80 rounded-xl border border-border bg-card p-2 text-xs text-card-foreground z-50 shadow-lg">
            <div className="flex items-center justify-between px-2 py-2">
              <span className="font-black uppercase tracking-widest">Thông báo</span>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="flex items-center gap-1 rounded px-2 py-1 font-bold text-primary transition-colors hover:bg-muted"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Đọc tất cả
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto">
              {isLoading ? (
                <div className="px-3 py-6 text-center font-bold text-muted-foreground">Đang tải...</div>
              ) : notifications.length === 0 ? (
                <div className="px-3 py-6 text-center font-bold text-muted-foreground">Không có thông báo</div>
              ) : (
                notifications.map((notification) => (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() => handleNotificationClick(notification.id, notification.data?.redirectUrl)}
                    className={cn(
                      "mb-1 flex w-full flex-col gap-1 rounded-lg p-3 text-left transition-colors hover:bg-muted",
                      !notification.readAt && "bg-primary/10"
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="font-black text-foreground">{notification.title}</span>
                      {!notification.readAt && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />}
                    </div>
                    <span className="font-medium leading-relaxed text-muted-foreground">{notification.message}</span>
                    <span className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground">
                      {formatNotificationTime(notification.createdAt)}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

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
            <Link
              href="/dashboard/settings"
              className="flex w-full items-center justify-between rounded p-2.5 text-left transition-colors hover:bg-muted hover:text-foreground"
              onClick={handleLinkClick}
            >
              <span>Cài đặt</span>
              <Settings className="h-3.5 w-3.5" />
            </Link>
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

    {mounted && examNotification && createPortal(
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
        <div className="relative w-full max-w-md rounded-3xl border border-border bg-card p-8 text-center text-card-foreground shadow-2xl">
          <button
            type="button"
            onClick={dismissExamNotification}
            className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Đóng thông báo"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Bell className="h-8 w-8" />
          </div>
          <h2 className="mb-3 text-2xl font-black uppercase tracking-wide text-foreground">
            {examNotification?.type === "EXAM_STARTED" ? "Xin mời vào khám" : examNotification?.title || "Thông báo"}
          </h2>
          <p className="mb-6 text-base font-semibold leading-relaxed text-muted-foreground">
            {examNotification?.message || "Bạn có một thông báo mới từ hệ thống."}
          </p>
          <button
            type="button"
            onClick={dismissExamNotification}
            className="w-full rounded-full bg-primary px-6 py-3 text-sm font-black uppercase tracking-widest text-primary-foreground transition-all hover:bg-primary/90"
          >
            Tôi đã hiểu
          </button>
        </div>
      </div>,
      document.body
    )}

    {mounted && recordNotification && createPortal(
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
        <div className="relative w-full max-w-md rounded-3xl border border-border bg-card p-8 text-center text-card-foreground shadow-2xl">
          <button
            type="button"
            onClick={dismissRecordNotification}
            className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Đóng thông báo"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Bell className="h-8 w-8" />
          </div>
          <h2 className="mb-3 text-2xl font-black uppercase tracking-wide text-foreground">
            {recordNotification.title || "Hồ sơ khám đã sẵn sàng"}
          </h2>
          <p className="mb-6 text-base font-semibold leading-relaxed text-muted-foreground">
            {recordNotification.message || "Phiếu khám và đơn thuốc PDF đã được cập nhật."}
          </p>
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => {
                dismissRecordNotification()
                router.push(recordNotification.data?.redirectUrl || "/dashboard/history")
              }}
              className="w-full rounded-full bg-primary px-6 py-3 text-sm font-black uppercase tracking-widest text-primary-foreground transition-all hover:bg-primary/90"
            >
              Xem Hồ sơ sức khỏe
            </button>
            <button
              type="button"
              onClick={dismissRecordNotification}
              className="w-full rounded-full border border-border bg-card px-6 py-3 text-sm font-black uppercase tracking-widest text-foreground transition-all hover:bg-muted"
            >
              Để sau
            </button>
          </div>
        </div>
      </div>,
      document.body
    )}
    </>
  )
}

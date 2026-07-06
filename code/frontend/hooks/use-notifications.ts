"use client"

import { useCallback, useEffect, useState } from "react"
import type { Client } from "@stomp/stompjs"
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type NotificationItem,
} from "@/lib/notifications"
import type { AuthUser } from "@/lib/auth"

type WebSocketMessage = {
  eventType?: string
  data?: NotificationItem
  message?: string
  timestamp?: number
}

const WS_URL = process.env.NEXT_PUBLIC_BACKEND_WS_URL || "http://127.0.0.1:8080/api/v1/ws"

export function useNotifications(user: AuthUser | null, enabled = true) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [examNotification, setExamNotification] = useState<NotificationItem | null>(null)
  const [recordNotification, setRecordNotification] = useState<NotificationItem | null>(null)

  const refreshNotifications = useCallback(async () => {
    if (!enabled || user?.role !== "PATIENT") return

    setIsLoading(true)
    try {
      const response = await getNotifications()
      setNotifications(response.notifications || [])
      setUnreadCount(response.unreadCount || 0)
    } finally {
      setIsLoading(false)
    }
  }, [enabled, user?.role])

  useEffect(() => {
    void refreshNotifications()
  }, [refreshNotifications])

  useEffect(() => {
    if (!enabled || user?.role !== "PATIENT") return

    let client: Client | null = null
    let cancelled = false

    async function connect() {
      const tokenResponse = await fetch("/api/ws-token", { credentials: "include" })
      if (!tokenResponse.ok || cancelled) return

      const { token } = (await tokenResponse.json()) as { token?: string | null }
      if (!token || cancelled) return

      const [{ Client }, { default: SockJS }] = await Promise.all([
        import("@stomp/stompjs"),
        import("sockjs-client"),
      ])
      if (cancelled) return

      client = new Client({
        webSocketFactory: () => new SockJS(WS_URL),
        connectHeaders: {
          Authorization: `Bearer ${token}`,
        },
        reconnectDelay: 5000,
        debug: () => undefined,
        onConnect: () => {
          client?.subscribe("/user/queue/notifications", (message) => {
            const payload = JSON.parse(message.body) as WebSocketMessage
            if (!payload.data) return

            setNotifications((current) => {
              const exists = current.some((notification) => notification.id === payload.data?.id)
              return exists ? current : [payload.data as NotificationItem, ...current].slice(0, 20)
            })
            const shouldShowPopup = ["EXAM_STARTED", "APPOINTMENT_CANCELLED", "APPOINTMENT_COMPLETED"].includes(payload.eventType || "")
            if (shouldShowPopup) {
              setExamNotification(payload.data)
            }
            if (payload.eventType === "MEDICAL_RECORD_READY") {
              setRecordNotification(payload.data)
            }
            setUnreadCount((count) => payload.data?.unreadCount ?? count + 1)
          })
        },
      })

      client.activate()
    }

    void connect()

    return () => {
      cancelled = true
      void client?.deactivate()
    }
  }, [enabled, user?.role, user?.email])

  const markRead = useCallback(async (id: number) => {
    const updated = await markNotificationRead(id)
    setNotifications((current) => current.map((notification) => (
      notification.id === id ? { ...notification, ...updated } : notification
    )))
    setUnreadCount(updated.unreadCount ?? 0)
  }, [])

  const markAllRead = useCallback(async () => {
    const response = await markAllNotificationsRead()
    setNotifications(response.notifications || [])
    setUnreadCount(response.unreadCount || 0)
  }, [])

  return {
    notifications,
    unreadCount,
    isLoading,
    examNotification,
    recordNotification,
    dismissExamNotification: () => setExamNotification(null),
    dismissRecordNotification: () => setRecordNotification(null),
    refreshNotifications,
    markRead,
    markAllRead,
  }
}

import { apiFetch } from "@/lib/api"

export type NotificationItem = {
  id: number
  type: string
  title: string
  message: string
  data?: Record<string, unknown> | null
  readAt?: string | null
  createdAt?: string | null
  appointmentId?: number | null
  unreadCount?: number
}

export type NotificationListResponse = {
  notifications: NotificationItem[]
  unreadCount: number
}

export function getNotifications() {
  return apiFetch<NotificationListResponse>("/notifications")
}

export function markNotificationRead(id: number) {
  return apiFetch<NotificationItem>(`/notifications/${id}/read`, {
    method: "PATCH",
  })
}

export function markAllNotificationsRead() {
  return apiFetch<NotificationListResponse>("/notifications/read-all", {
    method: "PATCH",
  })
}

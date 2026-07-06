import { apiFetch } from "@/lib/api"

export type NotificationItem = {
  id: number
  recipientEmail?: string | null
  type: string
  title: string
  message: string
  data?: {
    appointmentId?: number | string | null
    medicalRecordId?: number | string | null
    pdfUrl?: string | null
    redirectUrl?: string | null
    status?: string | null
    doctorId?: number | string | null
    doctorName?: string | null
    appointmentDate?: string | null
    timeSlot?: string | null
    [key: string]: unknown
  } | null
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

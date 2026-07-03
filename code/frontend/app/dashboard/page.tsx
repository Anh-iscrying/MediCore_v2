"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useAuth } from "@/components/auth/auth-provider"
import { apiFetch } from "@/lib/api"
import { cn } from "@/lib/utils"

type PatientProfile = {
  id: number
  name: string
  dateOfBirth?: string | null
  gender?: string | null
  phone?: string | null
  email?: string | null
  address?: string | null
  patientCode?: string | null
}

type AppointmentResponse = {
  id: number
  patientName: string
  appointmentDate: string // yyyy-MM-dd
  timeSlot: string
  status: string
  doctorName: string
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<PatientProfile | null>(null)
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileData, appointmentsData] = await Promise.all([
          apiFetch<PatientProfile>("/patients/me"),
          apiFetch<AppointmentResponse[]>("/appointments/me")
        ])
        setProfile(profileData)
        setAppointments(appointmentsData)
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu dashboard:", error)
      } finally {
        setIsLoading(false)
      }
    }
    void fetchData()
  }, [])

  // 1. Tỷ lệ hoàn thành hồ sơ (%) dựa trên 5 trường đã điền
  const totalFields = 5
  let filledCount = 0
  if (profile?.name?.trim()) filledCount++
  if (profile?.dateOfBirth?.trim()) filledCount++
  if (profile?.gender?.trim()) filledCount++
  if (profile?.phone?.trim()) filledCount++
  if (profile?.address?.trim()) filledCount++
  const completenessPercent = profile ? Math.round((filledCount / totalFields) * 100) : 0

  // 2. Kiểm tra hồ sơ chưa đầy đủ (thiếu bất kỳ trường nào trong 4 trường thông tin tùy chọn)
  const isIncomplete = profile
    ? !profile.dateOfBirth?.trim() || !profile.gender?.trim() || !profile.phone?.trim() || !profile.address?.trim()
    : false

  // 3. Tìm lịch hẹn sắp tới (WAITING, CONFIRMED, IN_PROGRESS)
  const activeStatuses = ["WAITING", "CONFIRMED", "IN_PROGRESS"]
  const todayStr = new Date().toISOString().split("T")[0]
  const upcomingAppointments = appointments
    .filter((app) => activeStatuses.includes(app.status) && app.appointmentDate >= todayStr)
    .sort((a, b) => {
      if (a.appointmentDate !== b.appointmentDate) {
        return a.appointmentDate.localeCompare(b.appointmentDate)
      }
      return a.timeSlot.localeCompare(b.timeSlot)
    })

  const nearestAppointment = upcomingAppointments[0] || null

  // 4. Định dạng hiển thị lịch hẹn
  const formatAppointmentDisplay = (app: AppointmentResponse) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const [y, m, d] = app.appointmentDate.split("-")
    const appDate = new Date(parseInt(y), parseInt(m) - 1, parseInt(d))
    appDate.setHours(0, 0, 0, 0)

    let dateLabel = ""
    if (appDate.getTime() === today.getTime()) {
      dateLabel = "Hôm nay"
    } else if (appDate.getTime() === tomorrow.getTime()) {
      dateLabel = "Ngày mai"
    } else {
      dateLabel = `${d}/${m}/${y}`
    }

    const startTime = app.timeSlot.split(" ")[0] || app.timeSlot
    return `${dateLabel} ${startTime}`
  }

  // 5. Tính số việc cần làm (nhắc nhở y tế)
  let remindersCount = 0
  if (isIncomplete) remindersCount++
  if (nearestAppointment) remindersCount++

  const remindersText = remindersCount > 0 ? `${remindersCount} việc cần làm` : "Không có nhắc nhở"

  const appointmentMeta = nearestAppointment
    ? `Lịch hẹn: ${formatAppointmentDisplay(nearestAppointment)}`
    : "Chưa có lịch hẹn"

  const overviewCards = [
    {
      title: "Hồ sơ bệnh nhân",
      description: "Thông tin cá nhân, liên hệ khẩn cấp, dị ứng thuốc và tiền sử bệnh lý.",
      href: "/dashboard/profile",
      meta: `Hoàn thành ${completenessPercent}%`
    },
    {
      title: "Đặt lịch hẹn khám",
      description: "Chọn chuyên khoa, bác sĩ, ngày khám, giờ trống và khai báo triệu chứng.",
      href: "/dashboard/appointments",
      meta: appointmentMeta,
      highlight: true
    },
    {
      title: "Hồ sơ bệnh án",
      description: "Xem lại chi tiết các đợt khám bệnh trước, chẩn đoán và hướng điều trị.",
      href: "/dashboard/history",
      meta: "Khám gần nhất: 18 Th06 2026"
    },
    {
      title: "Đơn thuốc điện tử",
      description: "Xem chi tiết các thuốc được kê theo đợt khám, tải file PDF hoặc in đơn thuốc.",
      href: "/dashboard/prescriptions",
      meta: "2 đơn thuốc đang dùng"
    },
    {
      title: "Trợ lý sức khỏe AI",
      description: "Hỏi đáp nhanh thông tin sức khỏe, chuẩn bị trước buổi khám và nhận hướng dẫn tham khảo từ AI.",
      href: "/dashboard/ai-assistant",
      meta: "Kết nối AI backend"
    }
  ]

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1400px] space-y-8 p-4 md:p-8 animate-pulse select-none">
        <section className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <div className="h-4 w-32 rounded bg-[#868685]/20" />
            <div className="h-10 w-64 rounded bg-[#0e0f0c]/20" />
            <div className="h-4 w-96 rounded bg-[#454745]/20" />
          </div>
        </section>
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-48 rounded-xl border border-border bg-card" />
          ))}
        </section>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-8 p-4 md:p-8 select-none">
      {isIncomplete && (
        <div className="rounded-xl border border-[#ffd11a]/30 bg-[#ffd11a]/10 p-4 text-sm font-semibold text-[#4a3b1c] flex items-center gap-2">
          <span>⚠️</span>
          <span>
            Hồ sơ chưa đầy đủ thông tin. Vui lòng cập nhật thông tin{" "}
            <Link href="/dashboard/profile" className="underline hover:text-[#b86700] transition-colors font-bold">
              tại đây
            </Link>
          </span>
        </div>
      )}

      <section className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#868685]">Cổng bệnh nhân</p>
          <h1 className="font-sans text-3xl font-black leading-tight text-foreground text-balance md:text-5xl tracking-tight">
            Chào {profile?.name || user?.name || "Bệnh nhân"}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#454745] md:text-base">
            Quản lý lịch hẹn khám, hồ sơ sức khỏe, đơn thuốc điện tử và các nhắc nhở chăm sóc sức khỏe.
          </p>
        </div>

        <div className="grid w-full gap-3 sm:grid-cols-2 md:w-auto">
          <div className="rounded-xl border border-border bg-card p-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#868685]">Lịch hẹn sắp tới</p>
              <p className="mt-1 text-sm font-black text-foreground">
                {nearestAppointment ? formatAppointmentDisplay(nearestAppointment) : "Chưa có lịch hẹn"}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#868685]">Nhắc nhở y tế</p>
              <p className="mt-1 text-sm font-black text-foreground">{remindersText}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {overviewCards.map((card) => (
          <article
            key={card.href}
            className={cn(
              "rounded-xl border p-6 transition-all",
              card.highlight
                ? "bg-[#0e0f0c] border-[#0e0f0c] text-[#9fe870]"
                : "bg-card border-border text-foreground"
            )}
          >
            <div className="flex items-start justify-end gap-4">
              {!(card.href === "/dashboard/profile" || card.href === "/dashboard/appointments" || card.href === "/dashboard/ai-assistant") && (
                <span className={cn("rounded-sm border px-3 py-1 text-[10px] font-bold uppercase tracking-wider",
                  card.highlight
                    ? "border-[#9fe870]/20 bg-[#9fe870]/10 text-[#9fe870]"
                    : "border-border bg-background text-[#868685]"
                )}>
                  Mô phỏng
                </span>
              )}
            </div>

            <h2 className={cn("mt-5 text-xl font-sans font-black tracking-tight", card.highlight ? "text-[#9fe870]" : "text-foreground")}>{card.title}</h2>
            <p className={cn("mt-2 text-sm leading-relaxed",
              card.highlight ? "text-white/95" : "text-[#454745]"
            )}>{card.description}</p>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span className={cn("text-xs font-semibold", card.highlight ? "text-white/80" : "text-[#868685]")}>{card.meta}</span>
              <Link
                href={card.href}
                className={cn(
                  "rounded-xl px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors border text-center",
                  card.highlight
                    ? "bg-[#9fe870] text-[#0e0f0c] hover:bg-[#cdffad] border-[#9fe870]"
                    : "border-border text-foreground bg-background hover:bg-card hover:border-foreground"
                )}
              >
                Xem chi tiết
              </Link>
            </div>
          </article>
        ))}
      </section>

      <section className="rounded-xl border border-foreground bg-foreground p-6 text-[#e8ebe6]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-sans font-black tracking-tight text-[#9fe870]">Cổng thông tin tự phục vụ dành cho bệnh nhân</h2>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[#868685]">
              Các chức năng được phân tách rõ ràng trên giao diện trực quan. Chatbot AI đã kết nối backend; các tính năng xuất file đơn thuốc và mở rộng dữ liệu lâm sàng sẽ được tích hợp tiếp.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

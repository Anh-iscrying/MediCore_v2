"use client"

import React, { useState, useEffect, useMemo } from "react"
import { useData } from "@/components/base/providers/data-provider"
import { useAuth } from "@/components/base/providers/auth-provider"
import { Card } from "@/components/base/ui/card"
import { Badge } from "@/components/base/ui/badge"
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Users, 
  Calendar as CalendarIcon,
  CheckCircle,
  AlertCircle,
  XCircle,
  Activity
} from "lucide-react"
import { cn } from "@/lib/utils"

const daysOfWeek = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"]

const shiftConfig = {
  morning: {
    label: "Ca sáng (8h-12h)",
    className: "bg-green-500/20 text-green-800 border-green-500/30",
    bg: "bg-green-500/10 text-green-800 border-green-500/20",
    time: "08:00 - 12:00",
  },
  afternoon: {
    label: "Ca chiều (13h30-17h30)",
    className: "bg-yellow-400/30 text-yellow-900 border-yellow-500/30",
    bg: "bg-yellow-400/20 text-yellow-900 border-yellow-500/25",
    time: "13:30 - 17:30",
  },
  full_day: {
    label: "Cả ngày (8h-17h30)",
    className: "bg-blue-500/20 text-blue-800 border-blue-500/30",
    bg: "bg-blue-500/10 text-blue-850 border-blue-500/20",
    time: "08:00 - 17:30",
  },
  night: {
    label: "Ca tối (17h30-21h30)",
    className: "bg-purple-500/20 text-purple-800 border-purple-500/30",
    bg: "bg-purple-500/10 text-purple-850 border-purple-500/20",
    time: "17:30 - 21:30",
  },
  off: {
    label: "Nghỉ",
    className: "bg-muted/40 text-muted-foreground border-muted-foreground/30",
    bg: "bg-muted/20 text-muted-foreground border-muted/30",
    time: "Không có ca trực",
  },
}

export function DoctorScheduleContent() {
  const { user } = useAuth()
  const { schedule, appointments, patients, ensureScheduleLoaded, ensureAppointmentsLoaded } = useData()
  
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())

  useEffect(() => {
    ensureScheduleLoaded()
    ensureAppointmentsLoaded()
  }, [ensureScheduleLoaded, ensureAppointmentsLoaded])

  const doctorId = String(user?.doctorId ?? "")

  const doctorSchedule = useMemo(() => {
    return schedule.find((s) => String(s.doctorId) === doctorId)
  }, [schedule, doctorId])

  const doctorAppointments = useMemo(() => {
    return appointments.filter(
      (a) => String(a.doctorId) === doctorId && a.status?.toUpperCase() !== "CANCELLED"
    )
  }, [appointments, doctorId])

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const daysInMonth = useMemo(() => new Date(year, month + 1, 0).getDate(), [year, month])
  const firstDayIndex = useMemo(() => new Date(year, month, 1).getDay(), [year, month])

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const getFormattedDateStr = (date: Date) => {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, "0")
    const d = String(date.getDate()).padStart(2, "0")
    return `${y}-${m}-${d}`
  }

  const selectedDateStr = getFormattedDateStr(selectedDate)

  const selectedDayShift = useMemo(() => {
    if (!doctorSchedule) return "off"
    return doctorSchedule.shifts[selectedDateStr] || "off"
  }, [doctorSchedule, selectedDateStr])

  const selectedDayAppointments = useMemo(() => {
    return doctorAppointments
      .filter((a) => a.appointmentDate === selectedDateStr)
      .map((a) => {
        const patientObj = patients.find((p) => p.id === a.patientId || p.patientCode === a.patientId)
        return {
          ...a,
          patient: patientObj,
        }
      })
  }, [doctorAppointments, selectedDateStr, patients])

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case "WAITING":
      case "PENDING":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50 gap-1 px-2 py-0.5 font-semibold">
            <Clock className="w-3.5 h-3.5" /> Chờ khám
          </Badge>
        )
      case "CONFIRMED":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/50 gap-1 px-2 py-0.5 font-semibold">
            <CheckCircle className="w-3.5 h-3.5" /> Đã xác nhận
          </Badge>
        )
      case "IN_PROGRESS":
        return (
          <Badge variant="outline" className="bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/20 dark:text-sky-400 dark:border-sky-900/50 gap-1 px-2 py-0.5 font-semibold">
            <Activity className="w-3.5 h-3.5 animate-pulse" /> Đang khám
          </Badge>
        )
      case "DONE":
      case "COMPLETED":
        return (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50 gap-1 px-2 py-0.5 font-semibold">
            <CheckCircle className="w-3.5 h-3.5" /> Hoàn thành
          </Badge>
        )
      case "CANCELLED":
        return (
          <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/50 gap-1 px-2 py-0.5 font-semibold">
            <XCircle className="w-3.5 h-3.5" /> Đã hủy
          </Badge>
        )
      default:
        return <Badge variant="outline" className="px-2 py-0.5 font-semibold">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lịch Tháng */}
        <Card className="lg:col-span-2 p-6 border-none shadow-sm h-full bg-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">
              Tháng {month + 1} năm {year}
            </h3>
            <div className="flex gap-2">
              <button 
                onClick={handlePrevMonth} 
                className="p-2 border rounded-md hover:bg-secondary transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={handleNextMonth} 
                className="p-2 border rounded-md hover:bg-secondary transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Lưới Lịch */}
          <div className="grid grid-cols-7 gap-2 text-center text-sm mb-2">
            {daysOfWeek.map((day) => (
              <div key={day} className="text-muted-foreground font-medium">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {/* Điền các ô trống đầu tháng */}
            {Array.from({ length: firstDayIndex }).map((_, index) => (
              <div key={`empty-${index}`} />
            ))}

            {/* Render các ngày trong tháng */}
            {Array.from({ length: daysInMonth }).map((_, index) => {
              const day = index + 1
              const dateObj = new Date(year, month, day)
              const dateStr = getFormattedDateStr(dateObj)
              const isSelected = selectedDate.getDate() === day && selectedDate.getMonth() === month && selectedDate.getFullYear() === year

              const shift = doctorSchedule?.shifts[dateStr] || "off"
              const shiftInfo = shiftConfig[shift]

              const dayAppointments = doctorAppointments.filter((a) => a.appointmentDate === dateStr)

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(dateObj)}
                  className={cn(
                    "h-20 w-full rounded-lg flex flex-col items-center justify-center transition-all border relative",
                    isSelected 
                      ? "ring-2 ring-primary border-primary shadow-sm" 
                      : "",
                    shiftInfo ? shiftInfo.className : "bg-transparent hover:bg-secondary/20"
                  )}
                >
                  <span className="font-bold text-sm">{day}</span>

                  {shift !== "off" && (
                    <span className="text-[8px] mt-1 truncate w-full px-1 font-medium text-center opacity-85">
                      {shiftInfo.label.split(" ")[0]} {shiftInfo.label.split(" ")[1] || ""}
                    </span>
                  )}

                  {dayAppointments.length > 0 && (
                    <span className="text-[8px] text-primary font-bold mt-0.5">
                      {dayAppointments.length} lịch hẹn
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </Card>

        {/* Bảng Chi Tiết Ngày */}
        <div className="space-y-4 lg:h-full lg:flex lg:flex-col">
          <Card className="p-6 bg-card flex flex-col border-none shadow-sm lg:flex-1 lg:h-full">
            <div className="border-b pb-3 mb-4">
              <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider block">Chi tiết ngày</span>
              <span className="text-lg font-bold text-foreground mt-1 block">
                Thứ {selectedDate.getDay() === 0 ? "Chủ Nhật" : selectedDate.getDay() + 1}, {selectedDate.getDate()} Tháng {selectedDate.getMonth() + 1}
              </span>
            </div>

            {/* Thông tin Ca trực */}
            <div className={cn(
              "flex gap-3 items-center border rounded-xl p-3.5",
              shiftConfig[selectedDayShift].bg
            )}>
              <Clock className="w-5 h-5 shrink-0" />
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-bold">{shiftConfig[selectedDayShift].label}</span>
                <span className="text-xs opacity-90 mt-0.5">{shiftConfig[selectedDayShift].time}</span>
              </div>
            </div>

            {/* Danh sách Lịch hẹn đăng ký */}
            <div className="mt-5 flex-1 flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Lịch hẹn khám ({selectedDayAppointments.length})
                </span>
              </div>

              {selectedDayAppointments.length === 0 ? (
                <div className="flex-1 border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center bg-secondary/5">
                  <CalendarIcon className="w-8 h-8 text-muted-foreground/40 mb-2" />
                  <span className="text-xs font-semibold text-muted-foreground">Không có lịch hẹn</span>
                  <span className="text-[10px] text-muted-foreground/80 mt-1">
                    {selectedDayShift === "off" ? "Ngày nghỉ của bác sĩ" : "Không có bệnh nhân đăng ký"}
                  </span>
                </div>
              ) : (
                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                  {selectedDayAppointments.map((app) => (
                    <div 
                      key={app.id}
                      className="border rounded-xl p-3 bg-secondary/15 flex flex-col gap-2 hover:bg-secondary/25 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground">
                          {app.timeSlot}
                        </span>
                        {getStatusBadge(app.status)}
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-semibold text-foreground">
                          {app.patientName}
                        </span>
                        {app.patient?.phone && (
                          <span className="text-[10px] text-muted-foreground">
                            SĐT: {app.patient.phone}
                          </span>
                        )}
                        {app.symptomsInitial && (
                          <span className="text-[10px] text-muted-foreground line-clamp-1 italic mt-1">
                            Triệu chứng: {app.symptomsInitial}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

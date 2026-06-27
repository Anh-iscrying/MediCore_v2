"use client"

import { Card } from "@/components/base/ui/card"
import { useData } from "@/providers/data-provider"
import { Calendar, TrendingUp, Users, Stethoscope } from "lucide-react"

interface StatsCardsProps {
  dateRange?: { start: string; end: string }
  selectedSpecialty?: string | null
  selectedDoctor?: string | null
}

export function StatsCards({ dateRange, selectedSpecialty, selectedDoctor }: StatsCardsProps) {
  const { appointments, doctors, specialties } = useData()

  // Filter appointments based on selected filters
  const filteredAppointments = appointments.filter((apt) => {
    // Filter by specialty if selected
    if (selectedSpecialty && apt.specialtyId !== selectedSpecialty) return false
    // Filter by doctor if selected
    if (selectedDoctor && apt.doctorId !== selectedDoctor) return false
    // Filter by date range if provided
    if (dateRange?.start || dateRange?.end) {
      const aptDate = new Date(apt.appointmentDate).toISOString().split("T")[0]
      const startDate = dateRange?.start || "1900-01-01"
      const endDate = dateRange?.end || "2099-12-31"
      if (aptDate < startDate || aptDate > endDate) return false
    }
    return true
  })

  // Calculate KPIs (use reference date to avoid hydration mismatch)
  const today = "2026-06-22"
  const appointmentsToday = filteredAppointments.filter(
    (apt) => apt.appointmentDate.split("T")[0] === today
  )
  const completedAppointments = filteredAppointments.filter((apt) => apt.status === "COMPLETED")
  const completionRate =
    filteredAppointments.length > 0
      ? Math.round((completedAppointments.length / filteredAppointments.length) * 100)
      : 0

  // New patients (based on seeded data, would need proper tracking)
  const uniquePatients = new Set(filteredAppointments.map((apt) => apt.patientId)).size

  // Active doctors (have appointments)
  const activeDoctorsInFilter = new Set(filteredAppointments.map((apt) => apt.doctorId)).size
  const activeDoctors = selectedDoctor
    ? 1
    : selectedSpecialty
      ? doctors.filter((d) => d.specialtyId === selectedSpecialty && d.status === "active").length
      : doctors.filter((d) => d.status === "active").length

  const stats = [
    {
      title: "Lượt khám hôm nay",
      value: appointmentsToday.length,
      sub: `tổng: ${filteredAppointments.length} lượt`,
      icon: Calendar,
      primary: true,
    },
    {
      title: "Tỷ lệ hoàn thành",
      value: `${completionRate}%`,
      sub: `${completedAppointments.length}/${filteredAppointments.length} hoàn thành`,
      icon: TrendingUp,
      primary: false,
    },
    {
      title: "Bệnh nhân trong bộ lọc",
      value: uniquePatients,
      sub: `Số bệnh nhân khác nhau`,
      icon: Users,
      primary: false,
    },
    {
      title: "Bác sĩ đang hoạt động",
      value: activeDoctors,
      sub: `${activeDoctorsInFilter} có lịch khám`,
      icon: Stethoscope,
      primary: false,
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat, index) => (
        <Card
          key={stat.title}
          style={{ animationDelay: `${index * 80}ms` }}
          className={`${stat.primary ? "bg-primary text-primary-foreground" : "bg-card text-foreground"} p-4 transition-all duration-500 ease-out animate-slide-in-up hover:scale-[1.02] hover:shadow-xl shadow-lg`}
        >
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-xs font-medium opacity-90">{stat.title}</h3>
            <div
              className={`w-8 h-8 rounded-lg ${stat.primary ? "bg-primary-foreground/20" : "bg-primary"} flex items-center justify-center`}
            >
              <stat.icon className={`w-4 h-4 ${stat.primary ? "text-primary-foreground" : "text-primary-foreground"}`} />
            </div>
          </div>
          <p className="text-3xl font-bold mb-1">{stat.value}</p>
          <p className="text-xs opacity-80">{stat.sub}</p>
        </Card>
      ))}
    </div>
  )
}

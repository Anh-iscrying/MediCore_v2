"use client"

import { Card } from "@/components/base/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/base/ui/chart"
import { useData } from "@/providers/data-provider"
import { formatDateShortVN } from "@/lib/date-utils"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts"

const PIE_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
  "var(--color-muted-foreground)",
]

interface DashboardChartsProps {
  dateRange?: { start: string; end: string }
  selectedSpecialty?: string | null
  selectedDoctor?: string | null
}

export function DashboardCharts({
  dateRange,
  selectedSpecialty,
  selectedDoctor,
}: DashboardChartsProps) {
  const { appointments, doctors, specialties } = useData()

  // Filter appointments
  const filteredAppointments = appointments.filter((apt) => {
    if (selectedSpecialty && apt.specialtyId !== selectedSpecialty) return false
    if (selectedDoctor && apt.doctorId !== selectedDoctor) return false
    if (dateRange?.start || dateRange?.end) {
      const aptDate = apt.appointmentDate.split("T")[0]
      const startDate = dateRange?.start || "1900-01-01"
      const endDate = dateRange?.end || "2099-12-31"
      if (aptDate < startDate || aptDate > endDate) return false
    }
    return true
  })

  // 1. Appointment Status Pie Chart
  const statusDistribution = [
    { name: "Hoàn thành", value: filteredAppointments.filter((a) => a.status === "COMPLETED").length },
    { name: "Xác nhận", value: filteredAppointments.filter((a) => a.status === "CONFIRMED").length },
    { name: "Chờ xác nhận", value: filteredAppointments.filter((a) => a.status === "PENDING").length },
    { name: "Hủy", value: filteredAppointments.filter((a) => a.status === "CANCELLED").length },
  ].filter((s) => s.value > 0)

  // 2. Appointment Trend (by date)
  const trendData = (() => {
    const dateMap: Record<string, number> = {}
    filteredAppointments.forEach((apt) => {
      const date = apt.appointmentDate.split("T")[0]
      dateMap[date] = (dateMap[date] || 0) + 1
    })
    return Object.entries(dateMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-10)
      .map(([date, count]) => ({
        date: formatDateShortVN(date),
        "Lượt khám": count,
      }))
  })()

  // 3. Performance by Specialty (Bar Chart)
  const specialtyPerformance = specialties
    .map((sp) => {
      const spApts = filteredAppointments.filter((a) => a.specialtyId === sp.id)
      return {
        name: sp.name,
        "Tổng lịch": spApts.length,
        "Hoàn thành": spApts.filter((a) => a.status === "COMPLETED").length,
      }
    })
    .filter((s) => s["Tổng lịch"] > 0)

  // 4. Top 5 Doctors by Appointments
  const topDoctors = doctors
    .map((dr) => {
      const drApts = filteredAppointments.filter((a) => a.doctorId === dr.id)
      return {
        name: dr.name,
        "Số ca khám": drApts.filter((a) => a.status === "COMPLETED").length,
        "Tổng lịch": drApts.length,
      }
    })
    .sort((a, b) => b["Số ca khám"] - a["Số ca khám"])
    .slice(0, 5)

  return (
    <div className="space-y-3 md:space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
        {/* Appointment Status Pie Chart */}
        <Card className="p-4 md:p-5 animate-slide-in-up">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-foreground">Trạng thái lịch hẹn</h3>
            <p className="text-xs text-muted-foreground">Phân bố theo trạng thái</p>
          </div>
          <ChartContainer config={{ value: { label: "Số lịch" } }} className="h-[240px] w-full">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
              <Pie
                data={statusDistribution}
                dataKey="value"
                nameKey="name"
                innerRadius={45}
                outerRadius={75}
                paddingAngle={2}
              >
                {statusDistribution.map((entry, index) => (
                  <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
          <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5">
            {statusDistribution.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-sm"
                  style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                />
                <span className="text-[11px] text-muted-foreground">
                  {entry.name} ({entry.value})
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Trend Line Chart */}
        <Card className="p-4 md:p-5 animate-slide-in-up" style={{ animationDelay: "100ms" }}>
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-foreground">Xu hướng khám bệnh</h3>
            <p className="text-xs text-muted-foreground">Lượt khám theo ngày (10 ngày gần nhất)</p>
          </div>
          <ChartContainer
            config={{ "Lượt khám": { label: "Lượt khám", color: "var(--color-chart-1)" } }}
            className="h-[240px] w-full"
          >
            <LineChart data={trendData} margin={{ left: -16, right: 8, top: 8 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
              <YAxis tickLine={false} axisLine={false} fontSize={12} width={40} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                dataKey="Lượt khám"
                type="monotone"
                stroke="var(--color-chart-1)"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "var(--color-chart-1)" }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ChartContainer>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
        {/* Specialty Performance Bar Chart */}
        <Card className="p-4 md:p-5 animate-slide-in-up" style={{ animationDelay: "150ms" }}>
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-foreground">Hiệu suất chuyên khoa</h3>
            <p className="text-xs text-muted-foreground">So sánh giữa các chuyên khoa</p>
          </div>
          <ChartContainer
            config={{
              "Tổng lịch": { label: "Tổng lịch", color: "var(--color-chart-1)" },
              "Hoàn thành": { label: "Hoàn thành", color: "var(--color-chart-3)" },
            }}
            className="h-[240px] w-full"
          >
            <BarChart data={specialtyPerformance} margin={{ left: -16, right: 8, top: 8 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} fontSize={11} angle={-45} />
              <YAxis tickLine={false} axisLine={false} fontSize={12} width={40} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Bar dataKey="Tổng lịch" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Hoàn thành" fill="var(--color-chart-3)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </Card>

        {/* Top Doctors Bar Chart */}
        <Card className="p-4 md:p-5 animate-slide-in-up" style={{ animationDelay: "200ms" }}>
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-foreground">Hiệu suất bác sĩ hàng đầu</h3>
            <p className="text-xs text-muted-foreground">Top 5 bác sĩ có lượt khám nhiều nhất</p>
          </div>
          <ChartContainer
            config={{
              "Số ca khám": { label: "Ca khám hoàn thành", color: "var(--color-chart-2)" },
            }}
            className="h-[240px] w-full"
          >
            <BarChart data={topDoctors} margin={{ left: -16, right: 8, top: 8 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} fontSize={11} angle={-45} />
              <YAxis tickLine={false} axisLine={false} fontSize={12} width={40} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="Số ca khám" fill="var(--color-chart-2)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </Card>
      </div>
    </div>
  )
}

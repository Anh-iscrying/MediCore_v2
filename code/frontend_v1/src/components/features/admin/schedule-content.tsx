"use client"

import { useState } from "react"
import { useData } from "@/providers/data-provider"
import type { ShiftType } from "@/types/medical"
import { Card } from "@/components/base/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/base/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/base/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, CalendarPlus } from "lucide-react"

// --- CẤU HÌNH GIAO DIỆN CA TRỰC ---
const shiftConfig: Record<ShiftType, { label: string; short: string; className: string }> = {
  morning: { label: "Ca sáng", short: "Sáng", className: "bg-primary/15 text-primary border-primary/25" },
  afternoon: { label: "Ca chiều", short: "Chiều", className: "bg-amber-500/15 text-amber-600 border-amber-500/25 dark:text-amber-400" },
  night: { label: "Ca đêm", short: "Đêm", className: "bg-chart-2/15 text-chart-2 border-chart-2/30" },
  off: { label: "Nghỉ", short: "Nghỉ", className: "bg-muted text-muted-foreground border-border" },
}

const shiftOrder: ShiftType[] = ["morning", "afternoon", "night", "off"]
const daysOfWeek = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"]

export function ScheduleContent() {
  const { doctors, schedule, specialties, setShift } = useData()

  // --- STATE QUẢN LÝ LỊCH ---
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState(currentDate.getDate())

  // --- STATE QUẢN LÝ POPUP GÁN LỊCH HÀNG LOẠT ---
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false)
  const [bulkDoctorId, setBulkDoctorId] = useState("")
  const [bulkShift, setBulkShift] = useState<ShiftType>("morning")
  const [bulkDays, setBulkDays] = useState<number[]>([]) // 0 = CN, 1 = T2...
  const [bulkWeeks, setBulkWeeks] = useState<number[]>([1, 2, 3, 4, 5]) // Mặc định chọn tất cả 5 tuần

  // --- LOGIC TÍNH TOÁN NGÀY THÁNG ---
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOfMonth = new Date(year, month, 1).getDay() // 0 = CN, 1 = T2...

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
    setSelectedDay(1) // Reset về ngày 1 khi qua tháng mới
  }

  // Lấy ca trực của bác sĩ
  const getShift = (doctorId: string, day: number): ShiftType => {
    const entry = schedule.find((e) => e.doctorId === doctorId)
    return entry?.shifts[day - 1] ?? "off"
  }

  const specialtyName = (id: string) => specialties.find((s) => s.id === id)?.name ?? "—"

  // --- LOGIC GÁN LỊCH HÀNG LOẠT ---
  const handleBulkAssign = () => {
    if (!bulkDoctorId) return alert("Vui lòng chọn bác sĩ")
    if (bulkWeeks.length === 0) return alert("Vui lòng chọn ít nhất 1 tuần")
    if (bulkDays.length === 0) return alert("Vui lòng chọn ít nhất 1 thứ trong tuần")

    // Lặp qua tất cả các ngày trong tháng hiện tại
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const dayOfWeek = date.getDay()
      
      // Tính toán ngày hiện tại thuộc Tuần thứ mấy trong tháng (VD: ngày 8 -> Tuần 2)
      const weekOfMonth = Math.ceil(day / 7)

      // Chỉ gán ca nếu TRÙNG THỨ và TRÙNG TUẦN đã chọn
      if (bulkDays.includes(dayOfWeek) && bulkWeeks.includes(weekOfMonth)) {
        setShift(bulkDoctorId, day - 1, bulkShift)
      }
    }

    // Đóng modal và reset form về mặc định
    setIsBulkModalOpen(false)
    setBulkDays([])
    setBulkWeeks([1, 2, 3, 4, 5])
    setBulkDoctorId("")
  }

  // Toggle chọn Tuần
  const toggleBulkWeek = (weekNum: number) => {
    setBulkWeeks(prev => 
      prev.includes(weekNum) 
        ? prev.filter(w => w !== weekNum) 
        : [...prev, weekNum]
    )
  }

  // Toggle chọn Thứ
  const toggleBulkDay = (dayIndex: number) => {
    setBulkDays(prev => 
      prev.includes(dayIndex) 
        ? prev.filter(d => d !== dayIndex) 
        : [...prev, dayIndex]
    )
  }

  return (
    <div className="relative animate-slide-in-up">
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* --- CỘT TRÁI: BẢNG LỊCH --- */}
        <div className="flex-1 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold tracking-tight">Lịch trực bác sĩ</h2>
            <button 
              onClick={() => setIsBulkModalOpen(true)}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
            >
              <CalendarPlus className="w-4 h-4" />
              Gán lịch chu kỳ
            </button>
          </div>

          <Card className="p-6 border-none shadow-sm bg-card">
            {/* Header chuyển tháng */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">
                Tháng {month + 1} năm {year}
              </h3>
              <div className="flex gap-2">
                <button onClick={prevMonth} className="p-2 rounded-md hover:bg-secondary transition-colors border">
                  <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                </button>
                <button onClick={nextMonth} className="p-2 rounded-md hover:bg-secondary transition-colors border">
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Lưới lịch */}
            <div className="grid grid-cols-7 gap-y-4 gap-x-2 text-center">
              {daysOfWeek.map((day) => (
                <div key={day} className="text-sm font-medium text-muted-foreground mb-2">
                  {day}
                </div>
              ))}

              {Array.from({ length: firstDayOfMonth }).map((_, index) => (
                <div key={`empty-${index}`} className="h-12 w-full" />
              ))}

              {Array.from({ length: daysInMonth }).map((_, index) => {
                const day = index + 1
                const isSelected = day === selectedDay

                return (
                  <div key={day} className="flex justify-center">
                    <button
                      onClick={() => setSelectedDay(day)}
                      className={cn(
                        "h-12 w-full max-w-[3rem] rounded-xl text-sm transition-all flex items-center justify-center hover:bg-secondary/80",
                        isSelected 
                          ? "bg-primary text-primary-foreground font-bold shadow-md hover:bg-primary" 
                          : "text-foreground font-medium bg-secondary/20"
                      )}
                    >
                      {day}
                    </button>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>

        {/* --- CỘT PHẢI: CHI TIẾT CA TRỰC NGÀY ĐANG CHỌN --- */}
        <Card className="w-full lg:w-[420px] p-6 border-none shadow-sm bg-card flex flex-col h-fit">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-semibold">
              Ca trực ngày {selectedDay}/{month + 1}
            </h3>
            <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-md">
              {daysOfWeek[new Date(year, month, selectedDay).getDay()]}
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {doctors.map((doc) => {
              const currentShift = getShift(doc.id, selectedDay)
              
              return (
                <div key={doc.id} className="flex items-center justify-between p-3 rounded-xl border border-border bg-card/50 hover:bg-secondary/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-9 h-9">
                      <AvatarImage src={doc.avatar || "/placeholder.svg"} alt={doc.name} />
                      <AvatarFallback className="text-xs font-medium">{doc.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-foreground">{doc.name}</p>
                      <p className="text-[11px] text-muted-foreground">{specialtyName(doc.specialtyId)}</p>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className={cn(
                          "rounded-md border px-3 py-1.5 text-xs font-medium transition-all hover:scale-105 min-w-[80px]",
                          shiftConfig[currentShift].className
                        )}
                      >
                        {shiftConfig[currentShift].label}
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {shiftOrder.map((s) => (
                        <DropdownMenuItem 
                          key={s} 
                          onClick={() => setShift(doc.id, selectedDay - 1, s)}
                        >
                          <span className={cn("w-2.5 h-2.5 rounded-sm mr-2 border", shiftConfig[s].className)} />
                          {shiftConfig[s].label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      {/* --- POPUP MODAL: GÁN LỊCH HÀNG LOẠT --- */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-card w-full max-w-md rounded-xl shadow-lg p-6 animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Gán lịch theo chu kỳ</h3>
            
            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium mb-1.5 block text-foreground">Bác sĩ</label>
                <select 
                  className="w-full border rounded-md p-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={bulkDoctorId}
                  onChange={(e) => setBulkDoctorId(e.target.value)}
                >
                  <option value="">-- Chọn bác sĩ --</option>
                  {doctors.map(doc => (
                    <option key={doc.id} value={doc.id}>{doc.name} - {specialtyName(doc.specialtyId)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block text-foreground">Ca trực</label>
                <select 
                  className="w-full border rounded-md p-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={bulkShift}
                  onChange={(e) => setBulkShift(e.target.value as ShiftType)}
                >
                  {shiftOrder.map(s => (
                    <option key={s} value={s}>{shiftConfig[s].label}</option>
                  ))}
                </select>
              </div>

              {/* Chọn Tuần áp dụng */}
              <div>
                <label className="text-sm font-medium mb-2 block text-foreground">Áp dụng cho Tuần</label>
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5].map((weekNum) => {
                    const isSelected = bulkWeeks.includes(weekNum)
                    return (
                      <button
                        key={weekNum}
                        onClick={() => toggleBulkWeek(weekNum)}
                        className={cn(
                          "px-3 py-1.5 rounded-md text-xs font-medium border transition-colors",
                          isSelected 
                            ? "bg-primary text-primary-foreground border-primary shadow-sm" 
                            : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                        )}
                      >
                        Tuần {weekNum}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Chọn Thứ áp dụng */}
              <div>
                <label className="text-sm font-medium mb-2 block text-foreground">Áp dụng cho Thứ</label>
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5, 6, 0].map((dayIndex) => {
                    const isSelected = bulkDays.includes(dayIndex)
                    return (
                      <button
                        key={dayIndex}
                        onClick={() => toggleBulkDay(dayIndex)}
                        className={cn(
                          "px-3 py-1.5 rounded-md text-xs font-medium border transition-colors",
                          isSelected 
                            ? "bg-primary text-primary-foreground border-primary shadow-sm" 
                            : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                        )}
                      >
                        {daysOfWeek[dayIndex]}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-border">
              <button 
                onClick={() => setIsBulkModalOpen(false)}
                className="px-4 py-2 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
              >
                Hủy
              </button>
              <button 
                onClick={handleBulkAssign}
                className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Lưu áp dụng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
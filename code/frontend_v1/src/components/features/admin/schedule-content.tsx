"use client"

import { useState } from "react"
import { useData } from "@/providers/data-provider"
import { Card } from "@/components/base/ui/card"
import { Avatar, AvatarFallback } from "@/components/base/ui/avatar"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, CalendarPlus } from "lucide-react"

// --- CẤU HÌNH CA TRỰC ---
type ShiftType = 'morning' | 'afternoon' | 'off';

const shiftConfig: Record<ShiftType, { label: string; className: string }> = {
  morning: { 
    label: "Ca sáng (8h-12h)", 
    className: "bg-green-500/20 text-green-800 border-green-500/30" 
  },
  afternoon: { 
    label: "Ca chiều (13h30-17h30)", 
    className: "bg-yellow-400/30 text-yellow-900 border-yellow-500/30" 
  },
  off: { 
    label: "Nghỉ", 
    className: "bg-transparent border-border" 
  },
}

const shiftOrder: ShiftType[] = ["morning", "afternoon", "off"];
const daysOfWeek = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

export function ScheduleContent() {
  const { doctors, schedule, specialties, setShift } = useData()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState(currentDate.getDate())
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false)
  const [bulkDoctorId, setBulkDoctorId] = useState("")
  const [bulkShift, setBulkShift] = useState<ShiftType>("morning")
  const [bulkDays, setBulkDays] = useState<number[]>([]) 
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOfMonth = new Date(year, month, 1).getDay()

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

  const getShift = (doctorId: string, day: number): ShiftType => {
    const entry = schedule.find((e) => e.doctorId === doctorId)
    const shift = entry?.shifts[day - 1]
    return (shift === 'morning' || shift === 'afternoon') ? shift : 'off'
  }

  const specialtyName = (id: string) => specialties.find((s) => s.id === id)?.name ?? "—"

  return (
    <div className="relative animate-slide-in-up">
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* CỘT TRÁI: LỊCH THÁNG HIỂN THỊ CHI TIẾT BÁC SĨ */}
        <div className="flex-1 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">
              {selectedDoctor ? `Lịch trực: ${selectedDoctor.name}` : "Lịch trực bác sĩ"}
            </h2>
            <button onClick={() => setIsBulkModalOpen(true)} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90">
              <CalendarPlus className="w-4 h-4" /> Gán lịch chi tiết
            </button>
          </div>

          <Card className="p-6 border-none shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Tháng {month + 1} năm {year}</h3>
              <div className="flex gap-2">
                <button onClick={prevMonth} className="p-2 border rounded-md hover:bg-secondary"><ChevronLeft className="w-4 h-4" /></button>
                <button onClick={nextMonth} className="p-2 border rounded-md hover:bg-secondary"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
            
            <div className="grid grid-cols-7 gap-2 text-center text-sm">
              {daysOfWeek.map((day) => <div key={day} className="text-muted-foreground font-medium">{day}</div>)}
              {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`e-${i}`} />)}
              
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const doctorShift = selectedDoctor ? getShift(selectedDoctor.id, day) : null;
                const config = doctorShift ? shiftConfig[doctorShift] : null;

                return (
                  <button 
                    key={day} 
                    onClick={() => setSelectedDay(day)} 
                    className={cn(
                      "h-20 w-full rounded-lg flex flex-col items-center justify-center transition-all border",
                      day === selectedDay ? "ring-2 ring-primary" : "",
                      doctorShift && doctorShift !== 'off' ? config?.className : "bg-transparent hover:bg-secondary/20"
                    )}
                  >
                    <span className="font-bold">{day}</span>
                    {selectedDoctor && doctorShift && (
                      <span className="text-[8px] mt-1 truncate w-full px-1 font-medium text-muted-foreground">
                        {config?.label}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </Card>
        </div>

        {/* CỘT PHẢI: DANH SÁCH BÁC SĨ */}
        <div className="w-full lg:w-[420px]">
          <Card className="p-6 shadow-sm h-fit">
            <h3 className="text-base font-semibold mb-6">Danh sách bác sĩ</h3>
            <div className="flex flex-col gap-3">
              {doctors.map((doc) => (
                <button 
                  key={doc.id} 
                  onClick={() => setSelectedDoctor(doc)} 
                  className={cn(
                    "flex items-center justify-between p-3 rounded-xl border transition-colors text-left w-full",
                    selectedDoctor?.id === doc.id ? "bg-primary/10 border-primary" : "bg-card/50 hover:bg-secondary"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-9 h-9"><AvatarFallback>{doc.name.charAt(0)}</AvatarFallback></Avatar>
                    <div>
                      <p className="text-sm font-medium">{doc.name}</p>
                      <p className="text-[10px] text-muted-foreground">{specialtyName(doc.specialtyId)}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* MODAL GÁN LỊCH CHI TIẾT */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-card w-full max-w-sm rounded-xl p-6 shadow-2xl">
            <h3 className="text-lg font-semibold mb-4">Gán lịch chi tiết</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Bác sĩ</label>
                <select className="w-full border rounded p-2 text-sm bg-background" value={bulkDoctorId} onChange={(e) => setBulkDoctorId(e.target.value)}>
                  <option value="">-- Chọn bác sĩ --</option>
                  {doctors.map(doc => <option key={doc.id} value={doc.id}>{doc.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Ca trực</label>
                <select className="w-full border rounded p-2 text-sm bg-background" value={bulkShift} onChange={(e) => setBulkShift(e.target.value as ShiftType)}>
                  {shiftOrder.map(s => <option key={s} value={s}>{shiftConfig[s].label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Chọn ngày trong tháng</label>
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    return (
                      <button key={day} onClick={() => setBulkDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day])}
                        className={cn("h-7 w-7 rounded-full text-xs border transition-colors", bulkDays.includes(day) ? "bg-primary text-white" : "bg-secondary hover:bg-secondary/80")}>
                        {day}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
                <button onClick={() => setIsBulkModalOpen(false)} className="px-4 py-2 text-sm rounded bg-secondary hover:bg-secondary/80">Hủy</button>
                <button onClick={() => { bulkDays.forEach(d => setShift(bulkDoctorId, d - 1, bulkShift)); setIsBulkModalOpen(false); setBulkDays([]); }} 
                  className="px-4 py-2 text-sm rounded bg-primary text-white hover:bg-primary/90">Lưu</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
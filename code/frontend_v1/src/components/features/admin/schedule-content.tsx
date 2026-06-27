"use client"

import { useState } from "react"
import { useData } from "@/providers/data-provider"
import { Card } from "@/components/base/ui/card"
import { Avatar, AvatarFallback } from "@/components/base/ui/avatar"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, CalendarPlus, Search } from "lucide-react"
import { Input } from "@/components/base/ui/input"

// --- CẤU HÌNH CA TRỰC ---
type ShiftType = 'morning' | 'afternoon' | 'full_day' | 'off';

const shiftConfig: Record<ShiftType, { label: string; className: string }> = {
  morning: { 
    label: "Ca sáng (8h-12h)", 
    className: "bg-green-500/20 text-green-800 border-green-500/30" 
  },
  afternoon: {
    label: "Ca chiều (13h30-17h30)",
    className: "bg-yellow-400/30 text-yellow-900 border-yellow-500/30"
  },
  full_day: {
    label: "Cả ngày (8h-17h30)",
    className: "bg-blue-500/20 text-blue-800 border-blue-500/30"
  },
  off: {
    label: "Nghỉ", 
    className: "bg-muted/40 text-muted-foreground border-muted-foreground/30" 
  },
}

const shiftOrder: ShiftType[] = ["morning", "afternoon", "full_day", "off"];
const daysOfWeek = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

export function ScheduleContent() {
  const { doctors, schedule, specialties, setShift } = useData()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState(currentDate.getDate())
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false)
  const [bulkDoctorId, setBulkDoctorId] = useState("")
  const [bulkShifts, setBulkShifts] = useState<Record<number, ShiftType>>({})
  const [activeShift, setActiveShift] = useState<ShiftType>("morning") 
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOfMonth = new Date(year, month, 1).getDay()

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

  const getShift = (doctorId: string, dateStr: string): ShiftType => {
    const entry = schedule.find((e) => e.doctorId === doctorId)
    const shift = entry?.shifts[dateStr]
    return (shift === 'morning' || shift === 'afternoon' || shift === 'full_day') ? shift : 'off'
  }

  const specialtyName = (id: string) => specialties.find((s) => s.id === id)?.name ?? "—"

  const filteredDoctors = doctors.filter((doc) =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <>
      <div className="relative animate-slide-in-up space-y-4">
      {/* TIÊU ĐỀ & NÚT GÁN LỊCH */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex-1 flex justify-between items-center">
          <h2 className="text-xl font-bold animate-fade-in">
            {selectedDoctor ? `Lịch trực: ${selectedDoctor.name}` : "Lịch trực bác sĩ"}
          </h2>
          <button onClick={() => setIsBulkModalOpen(true)} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-all shadow-sm">
            <CalendarPlus className="w-4 h-4" /> Gán lịch chi tiết
          </button>
        </div>
        <div className="w-full lg:w-[420px] hidden lg:block" />
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-stretch">
        {/* CỘT TRÁI: LỊCH THÁNG HIỂN THỊ CHI TIẾT BÁC SĨ */}
        <div className="flex-1">
          <Card className="p-6 border-none shadow-sm h-full">
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
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const doctorShift = selectedDoctor ? getShift(selectedDoctor.id, dateStr) : null;
                const config = doctorShift ? shiftConfig[doctorShift] : null;

                return (
                  <button 
                    key={day} 
                    onClick={() => setSelectedDay(day)} 
                    className={cn(
                      "h-20 w-full rounded-lg flex flex-col items-center justify-center transition-all border",
                      day === selectedDay ? "ring-2 ring-primary" : "",
                      config ? config.className : "bg-transparent hover:bg-secondary/20"
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
        <div className="w-full lg:w-[420px] flex flex-col">
          <Card className="p-6 shadow-sm flex flex-col h-full max-h-[480px] lg:max-h-none lg:h-0 lg:min-h-full">
            <h3 className="text-base font-semibold mb-4">Danh sách bác sĩ</h3>
            
            {/* THANH TÌM KIẾM BÁC SĨ */}
            <div className="relative mb-4">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tìm tên bác sĩ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 text-sm focus-visible:ring-1"
              />
            </div>

            <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3 min-h-0">
              {filteredDoctors.length > 0 ? (
                filteredDoctors.map((doc) => (
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
                ))
              ) : (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  Không tìm thấy bác sĩ
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>

    {/* MODAL GÁN LỊCH CHI TIẾT */}
    {isBulkModalOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4" onClick={() => setIsBulkModalOpen(false)}>
          <div className="bg-card w-full max-w-sm rounded-xl p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">Gán lịch chi tiết</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Chọn tháng</label>
                <select 
                  className="w-full border rounded p-2 text-sm bg-background cursor-pointer" 
                  value={month} 
                  onChange={(e) => setCurrentDate(new Date(year, parseInt(e.target.value), 1))}
                >
                  {Array.from({ length: 12 }).map((_, i) => (
                    <option key={i} value={i}>Tháng {i + 1} năm {year}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Bác sĩ</label>
                <select className="w-full border rounded p-2 text-sm bg-background" value={bulkDoctorId} onChange={(e) => setBulkDoctorId(e.target.value)}>
                  <option value="">-- Chọn bác sĩ --</option>
                  {doctors.map(doc => <option key={doc.id} value={doc.id}>{doc.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Ca trực đang chọn</label>
                <div className="flex gap-2">
                  {shiftOrder.map(s => {
                    const config = shiftConfig[s];
                    const isActive = activeShift === s;
                    let activeClass = "";
                    if (s === 'morning') activeClass = "bg-green-500/20 text-green-800 border-green-500/40 hover:bg-green-500/30";
                    else if (s === 'afternoon') activeClass = "bg-yellow-400/30 text-yellow-900 border-yellow-500/40 hover:bg-yellow-400/40";
                    else if (s === 'full_day') activeClass = "bg-blue-500/20 text-blue-800 border-blue-500/40 hover:bg-blue-500/30";
                    else if (s === 'off') activeClass = "bg-muted text-muted-foreground border-muted-foreground/30 hover:bg-muted/80";
                    
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setActiveShift(s)}
                        className={cn(
                          "flex-1 py-1.5 px-2 text-xs font-medium rounded-lg border transition-all text-center",
                          isActive ? activeClass + " ring-1 ring-offset-1 ring-primary/40 font-semibold" : "bg-background border-border text-muted-foreground hover:bg-secondary/40"
                        )}
                      >
                        {config.label.split(" (")[0]}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Chọn ngày trong tháng</label>
                <div className="grid grid-cols-7 gap-1 text-center text-[10px]">
                  {/* Tiêu đề thứ trong tuần */}
                  {daysOfWeek.map((day) => (
                    <div key={day} className="text-muted-foreground font-semibold h-7 flex items-center justify-center">
                      {day}
                    </div>
                  ))}
                  
                  {/* Khoảng trống căn lề ngày đầu tháng */}
                  {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                    <div key={`offset-${i}`} className="h-7 w-7" />
                  ))}

                  {/* Các ngày trong tháng */}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const shiftOfDay = bulkShifts[day];
                    const isSelected = !!shiftOfDay;
                    
                    let activeDayClass = "bg-secondary text-foreground border-transparent";
                    if (shiftOfDay === 'morning') activeDayClass = "bg-green-500/25 text-green-800 border-green-500/40 font-semibold";
                    else if (shiftOfDay === 'afternoon') activeDayClass = "bg-yellow-400/35 text-yellow-900 border-yellow-500/40 font-semibold";
                    else if (shiftOfDay === 'full_day') activeDayClass = "bg-blue-500/25 text-blue-800 border-blue-500/40 font-semibold";
                    else if (shiftOfDay === 'off') activeDayClass = "bg-muted text-muted-foreground border-muted-foreground/45 font-semibold";

                    return (
                      <button 
                        key={day} 
                        type="button"
                        onClick={() => setBulkShifts(prev => {
                          const next = { ...prev };
                          if (next[day] === activeShift) {
                            delete next[day];
                          } else {
                            next[day] = activeShift;
                          }
                          return next;
                        })}
                        className={cn(
                          "h-7 w-7 rounded-full text-xs border transition-colors mx-auto flex items-center justify-center", 
                          isSelected ? activeDayClass : "bg-secondary hover:bg-secondary/80 text-foreground border-transparent"
                        )}
                      >
                        {day}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
                <button onClick={() => { setIsBulkModalOpen(false); setBulkShifts({}); }} className="px-4 py-2 text-sm rounded bg-secondary hover:bg-secondary/80">Hủy</button>
                <button onClick={async () => {
                  if (!bulkDoctorId) return
                  await Promise.all(Object.entries(bulkShifts).map(([dStr, s]) => {
                    const day = parseInt(dStr);
                    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    return setShift(bulkDoctorId, dateStr, s);
                  }));
                  setIsBulkModalOpen(false);
                  setBulkShifts({});
                }}
                  className="px-4 py-2 text-sm rounded bg-primary text-white hover:bg-primary/90">Lưu</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
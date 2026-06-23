"use client"

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

const days = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "CN"]

const shiftConfig: Record<ShiftType, { label: string; short: string; className: string }> = {
  morning: { label: "Ca sáng", short: "Sáng", className: "bg-primary/15 text-primary border-primary/25" },
  afternoon: { label: "Ca chiều", short: "Chiều", className: "bg-amber-500/15 text-amber-600 border-amber-500/25 dark:text-amber-400" },
  night: { label: "Ca đêm", short: "Đêm", className: "bg-chart-2/15 text-chart-2 border-chart-2/30" },
  off: { label: "Nghỉ", short: "—", className: "bg-muted text-muted-foreground border-border" },
}

const shiftOrder: ShiftType[] = ["morning", "afternoon", "night", "off"]

export function ScheduleContent() {
  const { doctors, schedule, specialties, setShift } = useData()

  const getShift = (doctorId: string, day: number): ShiftType => {
    const entry = schedule.find((e) => e.doctorId === doctorId)
    return entry?.shifts[day] ?? "off"
  }

  const specialtyName = (id: string) => specialties.find((s) => s.id === id)?.name ?? "—"

  return (
    <Card className="p-0 overflow-hidden animate-slide-in-up">
      <div className="flex flex-wrap items-center gap-3 p-4 border-b border-border">
        <p className="text-sm font-medium text-foreground mr-2">Chú thích:</p>
        {shiftOrder.map((s) => (
          <span
            key={s}
            className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium", shiftConfig[s].className)}
          >
            {shiftConfig[s].label}
          </span>
        ))}
        <p className="text-xs text-muted-foreground w-full sm:w-auto sm:ml-auto">Nhấn vào ô để thay đổi ca trực</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-border bg-secondary/40">
              <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 min-w-[200px] sticky left-0 bg-secondary/40">
                Bác sĩ
              </th>
              {days.map((d) => (
                <th key={d} className="text-center text-xs font-semibold text-muted-foreground px-2 py-3 min-w-[90px]">
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {doctors.map((doc) => (
              <tr key={doc.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                <td className="px-4 py-3 sticky left-0 bg-card">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={doc.avatar || "/placeholder.svg"} alt={doc.name} />
                      <AvatarFallback className="text-xs">{doc.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-foreground whitespace-nowrap">{doc.name}</p>
                      <p className="text-[11px] text-muted-foreground">{specialtyName(doc.specialtyId)}</p>
                    </div>
                  </div>
                </td>
                {days.map((_, dayIdx) => {
                  const shift = getShift(doc.id, dayIdx)
                  return (
                    <td key={dayIdx} className="px-2 py-2 text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            className={cn(
                              "w-full rounded-md border px-2 py-1.5 text-xs font-medium transition-all hover:scale-105",
                              shiftConfig[shift].className,
                            )}
                          >
                            {shiftConfig[shift].short}
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="center">
                          {shiftOrder.map((s) => (
                            <DropdownMenuItem key={s} onClick={() => setShift(doc.id, dayIdx, s)}>
                              <span
                                className={cn("w-2.5 h-2.5 rounded-sm mr-2 border", shiftConfig[s].className)}
                              />
                              {shiftConfig[s].label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

"use client"

import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/base/ui/dialog"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface Doctor {
  id: number
  name: string
  specialty: string
  experience: string
  rating: number
  fee: string
  education: string
  bio: string
  avatarColor: string
}

interface DoctorDetailModalProps {
  doctor: Doctor | null
  isOpen: boolean
  onClose: () => void
}

export function DoctorDetailModal({
  doctor,
  isOpen,
  onClose
}: DoctorDetailModalProps) {
  if (!doctor) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-card border-border w-full max-w-xl p-8 shadow-none text-foreground max-h-[90vh] overflow-y-auto scrollbar-hide sm:max-w-xl [&>button]:text-muted-foreground hover:[&>button]:text-foreground [&>button]:right-6 [&>button]:top-6 [&>button]:p-1.5 [&>button]:rounded-full hover:[&>button]:bg-background transition-colors rounded-xl">
        {/* Doctor Info */}
        <div className="flex items-center gap-4 mb-5 select-none">
          <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold text-foreground shrink-0 border border-border bg-background shadow-none">
            {doctor.name.split(" ").slice(-1)[0][0]}
          </div>
          <div>
            <span className="text-[9px] uppercase font-bold tracking-widest text-[#054d28] bg-[#e2f6d5] px-2.5 py-0.5 rounded-full border border-[#2ead4b]/20">
              BS. Chuyên Khoa
            </span>
            <DialogTitle className="text-xl font-sans font-black text-foreground mt-1.5 tracking-tight">{doctor.name}</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-0.5">{doctor.specialty} • {doctor.experience}</DialogDescription>
          </div>
        </div>

        {/* Content Details */}
        <div className="space-y-4 text-xs font-semibold text-foreground leading-relaxed select-none">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Chuyên ngành / Trình độ</p>
            <p className="text-foreground bg-background p-2.5 rounded-xl border border-border font-medium">{doctor.specialty} • {doctor.experience}</p>
          </div>

          <div>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Tiểu sử & Chuyên môn</p>
            <p className="text-[#454745] leading-relaxed bg-background p-2.5 rounded-xl border border-border font-normal">{doctor.bio}</p>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  )
}


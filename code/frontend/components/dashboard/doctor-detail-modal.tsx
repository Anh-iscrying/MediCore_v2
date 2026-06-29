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
      <DialogContent className="bg-[#efe9de] border-[#e6dfd8] w-full max-w-xl p-8 shadow-2xl text-[#141413] max-h-[90vh] overflow-y-auto scrollbar-hide sm:max-w-xl [&>button]:text-[#6c6a64] hover:[&>button]:text-[#141413] [&>button]:right-6 [&>button]:top-6 [&>button]:p-1.5 [&>button]:rounded-full hover:[&>button]:bg-[#faf9f5] transition-colors">
        {/* Doctor Info */}
        <div className="flex items-center gap-4 mb-5 select-none">
          <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold text-[#141413] shrink-0 border border-[#e6dfd8] bg-[#faf9f5] shadow-sm">
            {doctor.name.split(" ").slice(-1)[0][0]}
          </div>
          <div>
            <span className="text-[9px] uppercase font-bold tracking-widest text-[#cc785c] bg-[#cc785c]/10 px-2.5 py-0.5 rounded-full border border-[#cc785c]/20">
              BS. Chuyên Khoa
            </span>
            <DialogTitle className="text-xl font-serif font-medium text-[#141413] mt-1.5">{doctor.name}</DialogTitle>
            <DialogDescription className="text-xs text-[#6c6a64] mt-0.5">{doctor.specialty} • {doctor.experience}</DialogDescription>
          </div>
        </div>

        {/* Content Details */}
        <div className="space-y-4 text-xs font-semibold text-[#141413] leading-relaxed select-none">
          <div>
            <p className="text-[10px] text-[#6c6a64] uppercase font-bold tracking-widest mb-1">Chuyên ngành / Trình độ</p>
            <p className="text-[#141413] bg-[#faf9f5] p-2.5 rounded border border-[#e6dfd8] font-medium">{doctor.specialty} • {doctor.experience}</p>
          </div>

          <div>
            <p className="text-[10px] text-[#6c6a64] uppercase font-bold tracking-widest mb-1">Tiểu sử & Chuyên môn</p>
            <p className="text-[#3d3d3a] leading-relaxed bg-[#faf9f5] p-2.5 rounded border border-[#e6dfd8] font-normal">{doctor.bio}</p>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  )
}


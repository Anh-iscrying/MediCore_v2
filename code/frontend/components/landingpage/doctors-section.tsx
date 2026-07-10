"use client"

import { CalendarCheck, ShieldCheck, Stethoscope } from "lucide-react"

const doctors = [
  {
    role: "Bác sĩ Tim mạch",
    focus: "Theo dõi huyết áp, đau ngực, hồi hộp và nguy cơ tim mạch.",
    image: "/images/doctor-chen.png",
  },
  {
    role: "Bác sĩ Nội tổng quát",
    focus: "Đánh giá triệu chứng thường gặp, bệnh mạn tính và hướng khám tiếp theo.",
    image: "/images/doctor-jenkins.png",
  },
  {
    role: "Bác sĩ Răng Hàm Mặt",
    focus: "Tư vấn đau cơ xương khớp, hồi phục sau chấn thương và kế hoạch tái khám.",
    image: "/images/doctor-vance.png",
  },
]

const trustNotes = [
  { label: "Giải thích dễ hiểu", icon: Stethoscope },
  { label: "Theo dõi sau khám", icon: CalendarCheck },
  { label: "Tôn trọng dữ liệu", icon: ShieldCheck },
]

export function DoctorsSection() {
  return (
    <section id="doctors" className="scroll-mt-24 border-t border-border bg-background py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-12 grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
          <div>
            <p className="mb-4 max-w-max rounded-full bg-card px-4 py-2 text-sm font-semibold text-foreground ring-1 ring-border">
              Đội ngũ chuyên môn
            </p>
            <h2 className="text-4xl font-black tracking-[-0.03em] text-foreground md:text-5xl">
              Bác sĩ đồng hành từ khám đến theo dõi
            </h2>
          </div>
          <p className="max-w-2xl text-base leading-8 text-foreground/65 lg:justify-self-end">
            Medicore ưu tiên giao tiếp rõ ràng, hồ sơ đầy đủ và kế hoạch chăm sóc phù hợp với từng người bệnh. Thông tin bác sĩ cụ thể sẽ được hiển thị khi đặt lịch.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {doctors.map((doctor) => (
            <div key={doctor.role} className="overflow-hidden rounded-[24px] bg-card ring-1 ring-border transition-all duration-300 hover:-translate-y-1 hover:bg-muted">
              <img
                src={doctor.image}
                alt={doctor.role}
                className="h-64 w-full object-cover"
              />
              <div className="p-7">
                <h3 className="text-2xl font-black tracking-tight text-foreground">{doctor.role}</h3>
                <p className="mt-3 text-sm leading-7 text-foreground/65">{doctor.focus}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {trustNotes.map((note) => {
            const Icon = note.icon
            return (
              <div key={note.label} className="flex items-center gap-3 rounded-[24px] bg-card px-5 py-4 text-sm font-semibold text-foreground ring-1 ring-border">
                <span className="flex size-9 items-center justify-center rounded-full bg-primary/20">
                  <Icon className="size-4 stroke-[1.8]" />
                </span>
                {note.label}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

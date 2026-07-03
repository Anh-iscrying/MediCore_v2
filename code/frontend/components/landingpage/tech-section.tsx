"use client"

import Link from "next/link"
import { ArrowRight, Bell, FileText, LockKeyhole } from "lucide-react"
import { Button } from "@/components/base/ui/button"

const technologies = [
  {
    title: "Hồ sơ khám tập trung",
    description: "Lưu thông tin lần khám, thuốc đang dùng và kết quả cũ để bác sĩ có bối cảnh đầy đủ hơn.",
    icon: FileText,
  },
  {
    title: "Đặt lịch và nhắc lịch",
    description: "Người bệnh xem lịch hẹn, nhận nhắc chuẩn bị trước khi đến viện và hạn chế quên tái khám.",
    icon: Bell,
  },
  {
    title: "Dữ liệu được bảo vệ",
    description: "Thông tin y tế được xử lý theo quyền truy cập phù hợp, giảm chia sẻ thừa trong quá trình chăm sóc.",
    icon: LockKeyhole,
  },
]

export function TechSection() {
  return (
    <section id="tech" className="scroll-mt-24 border-t border-border bg-background py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-12 max-w-2xl">
          <p className="mb-4 max-w-max rounded-full bg-card px-4 py-2 text-sm font-semibold text-foreground ring-1 ring-border">
            Hạ tầng chăm sóc
          </p>
          <h2 className="text-4xl font-black tracking-[-0.03em] text-foreground md:text-5xl">
            Công nghệ phục vụ quyết định y khoa
          </h2>
          <p className="mt-5 text-base leading-8 text-foreground/65">
            Hệ thống số hóa tập trung vào những việc người bệnh cần nhất: đặt lịch rõ, thông tin đủ và theo dõi thuận tiện.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {technologies.map((tech) => {
            const Icon = tech.icon
            return (
              <div key={tech.title} className="rounded-[24px] bg-card p-7 ring-1 ring-border transition-all duration-300 hover:-translate-y-1 hover:bg-muted">
                <div className="mb-8 flex size-14 items-center justify-center rounded-full bg-primary/20 text-foreground">
                  <Icon className="size-6 stroke-[1.7]" />
                </div>
                <h3 className="text-2xl font-black tracking-tight text-foreground">{tech.title}</h3>
                <p className="mt-4 text-sm leading-7 text-foreground/65">{tech.description}</p>
              </div>
            )
          })}
        </div>

        <div className="mt-8 rounded-[24px] bg-foreground p-6 text-background lg:flex lg:items-center lg:justify-between lg:p-8">
          <div>
            <h3 className="text-2xl font-black tracking-tight text-background">Cổng bệnh nhân Medicore</h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-background/70">
              Theo dõi lịch hẹn, thông tin khám và các hướng dẫn trước khi đến viện trong một nơi.
            </p>
          </div>
          <Button asChild className="mt-6 h-12 rounded-[24px] bg-primary px-7 text-base font-semibold text-primary-foreground hover:bg-primary/90 lg:mt-0">
            <Link href="/dashboard">
              Vào cổng bệnh nhân
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

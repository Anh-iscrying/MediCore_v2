"use client"

import Link from "next/link"
import { ArrowRight, FileCheck2, Stethoscope } from "lucide-react"
import { Button } from "@/components/base/ui/button"

const principles = [
  {
    title: "Minh bạch & Bảo mật",
    description: "Người bệnh luôn biết rõ cần chuẩn bị gì trước khi khám, đồng thời thông tin y tế cá nhân được bảo mật tuyệt đối.",
    icon: FileCheck2,
  },
  {
    title: "Bác sĩ quyết định điều trị",
    description: "Công nghệ chỉ hỗ trợ tổ chức thông tin. Mọi quyết định chuyên môn và phương án điều trị luôn thuộc về bác sĩ.",
    icon: Stethoscope,
  },
]

export function MissionSection() {
  return (
    <section id="mission" className="scroll-mt-24 border-t border-border bg-background px-6 py-20 lg:py-24">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[24px] bg-foreground text-background">
        <div className="grid gap-10 p-6 lg:grid-cols-[0.9fr_1.1fr] lg:p-10 xl:p-12">
          <div className="flex flex-col justify-between gap-10">
            <div>
              <p className="mb-5 max-w-max rounded-full bg-background/10 px-4 py-2 text-sm font-semibold text-primary ring-1 ring-background/15">
                Sứ mệnh Medicore
              </p>
              <h2 className="text-4xl font-black tracking-[-0.04em] text-background md:text-5xl lg:text-6xl">
                Y tế dễ tiếp cận, minh bạch và có trách nhiệm
              </h2>
            </div>
            <p className="max-w-xl text-base leading-8 text-background/70">
              Medicore kết hợp quy trình khám rõ ràng, hồ sơ số và đội ngũ bác sĩ để người bệnh được chuẩn bị tốt hơn trước mỗi quyết định chăm sóc sức khỏe.
            </p>
          </div>

          <div className="grid gap-4">
            {principles.map((principle) => {
              const Icon = principle.icon
              return (
                <div key={principle.title} className="rounded-[24px] bg-background p-6 text-foreground">
                  <div className="mb-5 flex size-12 items-center justify-center rounded-full bg-primary/30">
                    <Icon className="size-5 stroke-[1.8]" />
                  </div>
                  <h3 className="text-2xl font-black tracking-tight">{principle.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-foreground/65">{principle.description}</p>
                </div>
              )
            })}
            <Button asChild className="h-12 rounded-[24px] bg-primary px-7 text-base font-semibold text-primary-foreground hover:bg-primary/90 sm:max-w-max">
              <Link href="/dashboard/appointments">
                Đặt lịch khám
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

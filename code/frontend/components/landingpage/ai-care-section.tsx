"use client"

import Link from "next/link"
import { ArrowRight, CheckCircle2, ClipboardList, ShieldCheck, Siren } from "lucide-react"
import { Button } from "@/components/base/ui/button"

const steps = [
  "Ghi nhận triệu chứng và thời điểm xuất hiện",
  "Gợi ý chuyên khoa phù hợp để đặt lịch",
  "Nhắc chuẩn bị giấy tờ, đơn thuốc và kết quả cũ",
  "Khuyến nghị gặp bác sĩ khi có dấu hiệu nguy hiểm",
]

export function AICareSection() {
  return (
    <section id="ai-care" className="scroll-mt-24 border-t border-border bg-background py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div className="rounded-[24px] bg-card p-6 ring-1 ring-border lg:p-8">
            <div className="mb-8 flex items-start justify-between gap-6">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/20 px-4 py-2 text-sm font-semibold text-foreground">
                  <ShieldCheck className="size-4" />
                  Hỗ trợ an toàn
                </div>
                <h3 className="text-3xl font-black tracking-[-0.03em] text-foreground">Hướng dẫn trước khi khám</h3>
              </div>
              <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-foreground text-primary">
                <ClipboardList className="size-6" />
              </div>
            </div>

            <div className="space-y-3">
              {steps.map((step) => (
                <div key={step} className="flex gap-3 rounded-[20px] bg-background p-4 text-sm font-semibold leading-6 text-foreground">
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-foreground" />
                  <span>{step}</span>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-[20px] bg-foreground p-5 text-background">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary">
                <Siren className="size-4" />
                Lưu ý y tế
              </div>
              <p className="text-sm leading-6 text-background/75">
                AI chỉ hỗ trợ sắp xếp thông tin và hướng dẫn đặt lịch. Chẩn đoán và điều trị thuộc về bác sĩ.
              </p>
            </div>
          </div>

          <div className="lg:pl-8">
            <p className="mb-4 max-w-max rounded-full bg-card px-4 py-2 text-sm font-semibold text-foreground ring-1 ring-border">
              Trước khi đến viện
            </p>
            <h2 className="text-4xl font-black tracking-[-0.03em] text-foreground md:text-5xl">
              Chuẩn bị tốt hơn cho mỗi lần khám
            </h2>
            <p className="mt-6 max-w-xl text-base leading-8 text-foreground/65">
              Medicore giúp người bệnh mô tả triệu chứng rõ hơn, chọn đúng chuyên khoa và không bỏ sót thông tin quan trọng trước buổi khám.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[24px] bg-card p-5 ring-1 ring-border">
                <div className="text-xl font-black text-foreground">Khai báo triệu chứng</div>
                <p className="mt-2 text-sm leading-6 text-foreground/65">Điền thông tin ban đầu trước khi gặp bác sĩ.</p>
              </div>
              <div className="rounded-[24px] bg-card p-5 ring-1 ring-border">
                <div className="text-xl font-black text-foreground">Chuẩn bị hồ sơ</div>
                <p className="mt-2 text-sm leading-6 text-foreground/65">Nhận nhắc lịch và danh sách giấy tờ cần mang theo.</p>
              </div>
            </div>

            <Button asChild className="mt-8 h-12 rounded-[24px] bg-primary px-7 text-base font-semibold text-primary-foreground hover:bg-primary/90">
              <Link href="/dashboard/ai-assistant">
                Mở hỗ trợ trước khám
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

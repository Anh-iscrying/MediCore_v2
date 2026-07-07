"use client"

import Link from "next/link"
import { ArrowRight, CalendarCheck, ClipboardList, ShieldCheck } from "lucide-react"
import { Button } from "@/components/base/ui/button"
import { AnimatedText } from "@/components/base/effects/animated-text"

const trustItems = [
  { label: "Bác sĩ chuyên khoa", icon: ShieldCheck },
  { label: "Hồ sơ minh bạch", icon: ClipboardList },
  { label: "Chuẩn bị trước khám", icon: CalendarCheck },
]

export function HeroSection() {
  return (
    <section className="relative flex min-h-[100dvh] items-center overflow-hidden bg-black pt-24 pb-12 text-white lg:pt-28 lg:pb-16">
      {/* Background Video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        disablePictureInPicture
        controlsList="nofullscreen"
        className="absolute inset-0 z-0 h-full w-full translate-z-0 object-cover pointer-events-none"
      >
        <source src="/images/0702.mp4" type="video/mp4" />
      </video>

      {/* Keep video visible while preserving text contrast */}
      <div className="absolute inset-0 z-0 bg-black/8 pointer-events-none" />
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-black/58 via-black/18 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 z-0 h-36 bg-gradient-to-t from-black/32 to-transparent pointer-events-none" />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl gap-10 px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end lg:px-8">
        <div className="max-w-xl lg:pb-8">
          <p className="mb-4 max-w-max rounded-full border border-white/20 bg-white/70 px-3.5 py-1.5 text-xs font-semibold text-foreground shadow-sm backdrop-blur-md">
            Bệnh viện thông minh, chăm sóc rõ ràng
          </p>

          <h1 className="text-4xl font-black leading-[0.95] tracking-[-0.04em] text-white sm:text-5xl lg:text-[64px]">
            <AnimatedText text="Chăm sóc y tế" delay={0.05} />
            <br />
            <span className="text-primary">
              <AnimatedText text="đúng lúc" delay={0.45} />
            </span>
          </h1>

          <p className="mt-5 max-w-lg text-sm font-medium leading-relaxed text-white/82 sm:text-base lg:text-[17px]">
            Đặt lịch với bác sĩ chuyên khoa, theo dõi hồ sơ khám và nhận hướng dẫn chuẩn bị trước khi đến viện.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="h-11 rounded-full bg-primary px-6 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90"
            >
              <Link href="/dashboard/appointments">
                Đặt lịch khám
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-11 rounded-full border-white/45 bg-white/10 px-6 text-sm font-bold text-white backdrop-blur-md hover:bg-white/20 hover:text-white"
            >
              <Link href="#specialties">Xem chuyên khoa</Link>
            </Button>
          </div>

          {/* Trust items inline list under buttons */}
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            {trustItems.map((item) => {
              const Icon = item.icon
              return (
                <div key={item.label} className="flex items-center gap-2 text-xs font-semibold text-white/85">
                  <span className="flex size-6 items-center justify-center rounded-full bg-primary/20 text-primary">
                    <Icon className="size-3.5" />
                  </span>
                  <span>{item.label}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right Column: Clean Staggered Glass Cards */}
        <div className="hidden justify-self-end lg:block">
          <div className="grid w-[460px] gap-6">
            <div className="ml-auto w-[330px] rounded-[28px] border border-white/14 bg-white/12 p-5 text-white shadow-2xl shadow-black/25 backdrop-blur-md">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">Lần khám tiếp theo</div>
              <div className="mt-3 text-2xl font-black tracking-tight">Sẵn sàng trong 3 bước</div>
              <p className="mt-2 text-sm leading-relaxed text-white/72">
                Chọn chuyên khoa, gửi thông tin và nhận nhắc lịch trước khi đến viện.
              </p>
            </div>

            <div className="mr-auto w-[300px] rounded-[26px] border border-primary/30 bg-primary/18 p-5 text-white shadow-xl shadow-black/20 backdrop-blur-md">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-white/65">An toàn y tế</div>
              <div className="mt-3 text-xl font-black tracking-tight text-primary">Bác sĩ quyết định</div>
              <p className="mt-2 text-sm leading-relaxed text-white/72">
                AI chỉ hỗ trợ chuẩn bị thông tin. Chẩn đoán và điều trị thuộc về bác sĩ.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

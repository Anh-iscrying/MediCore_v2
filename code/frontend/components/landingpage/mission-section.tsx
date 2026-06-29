"use client"

import { useEffect, useRef } from "react"
import { Button } from "@/components/base/ui/button"
import { ArrowRight } from "lucide-react"

export function MissionSection() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-up")
          }
        })
      },
      { threshold: 0.1 },
    )

    const elements = sectionRef.current?.querySelectorAll(".reveal")
    elements?.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} id="mission" className="py-24 lg:py-32 px-6 bg-background border-t border-border">
      <div className="relative max-w-7xl mx-auto rounded-lg overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img src="/images/hero-hospital.png" alt="Không gian bệnh viện hiện đại" className="w-full h-full object-cover" />
          {/* Subtle dark overlay for text readability */}
          <div className="absolute inset-0 bg-black/25 dark:bg-black/85" />
        </div>

        {/* Content with padding */}
        <div className="relative px-6 lg:px-8 py-16 lg:py-24 z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Empty column to push content to the right */}
            <div className="order-2 lg:order-1"></div>

            {/* Content */}
            <div className="order-1 lg:order-2">
              <p className="reveal opacity-0 text-xs md:text-sm uppercase tracking-[0.25em] text-primary font-bold mb-4">
                Sứ mệnh của chúng tôi
              </p>
              <h2 className="reveal opacity-0 animation-delay-200 font-sans text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-6">
                Chăm sóc y tế tận tâm cho mọi người
              </h2>
              <div className="reveal opacity-0 animation-delay-400 space-y-6 text-neutral-300 text-sm md:text-base leading-relaxed">
                <p>
                  Tại Medicore Hospital, chúng tôi tin rằng chăm sóc sức khỏe cần tận tâm, dễ tiếp cận và được hỗ trợ bởi khoa học tiên tiến. Đội ngũ bác sĩ chuyên khoa tận tụy của chúng tôi kết hợp chuyên môn y khoa với sự thấu hiểu để mang đến dịch vụ chăm sóc cá nhân hóa.
                </p>
                <p>
                  Với tư vấn ứng dụng AI hoạt động 24/7 cùng các bác sĩ giàu kinh nghiệm ở nhiều chuyên khoa, chúng tôi cam kết đồng hành cùng hành trình chăm sóc sức khỏe của bạn ở mọi bước.
                </p>
              </div>
              <div className="reveal opacity-0 animation-delay-600 mt-10">
                <Button
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-102 font-bold uppercase tracking-widest text-[11px] rounded-full px-8 py-4.5 transition-all duration-200 group"
                >
                  Liên hệ với chúng tôi
                  <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/base/ui/button"
import { ArrowRight } from "lucide-react"
import { AnimatedText } from "@/components/base/animated-text"

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const imageContainerRef = useRef<HTMLDivElement>(null)
  const [scrollProgress, setScrollProgress] = useState(0)

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

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return

      const scrollY = window.scrollY
      const sectionHeight = sectionRef.current.offsetHeight

      // Calculate progress (0 to 1) based on scroll within the hero section
      const progress = Math.min(scrollY / (sectionHeight * 0.5), 1)
      setScrollProgress(progress)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll() // Initial check

    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scale = 1 - scrollProgress * 0.05 // Reduces from 1 to 0.95
  const borderRadius = scrollProgress * 24 // Increases from 0 to 24px

  return (
    <section ref={sectionRef} className="relative min-h-screen flex items-center overflow-hidden pt-20 bg-background">
      {/* Full-width background image with zoom effect */}
      <div
        ref={imageContainerRef}
        className="absolute inset-0 w-full h-full overflow-hidden transition-transform duration-100"
        style={{
          transform: `scale(${scale})`,
          borderRadius: `${borderRadius}px`,
        }}
      >
        <img
          src="/images/hero-hospital.png"
          alt="Đội ngũ y tế chuyên nghiệp đang chăm sóc bệnh nhân"
          className="w-full h-full object-cover animate-zoom-in"
        />
        {/* Deep gradient overlay for premium look & excellent text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#181715]/95 via-[#181715]/50 to-transparent" />
      </div>

      {/* Content overlay - text on the left */}
      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-32 w-full z-10">
        <div className="max-w-2xl">
          {/* Text content */}
          <p className="reveal opacity-0 text-xs md:text-sm uppercase tracking-[0.25em] text-primary font-bold mb-6">
            Giải pháp chăm sóc sức khỏe tiên tiến
          </p>
          <h1 className="font-sans text-4xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1] text-white tracking-tight mb-8">
            <AnimatedText text="Sức khỏe của bạn" delay={0.2} />
            <br />
            <span className="text-primary">
              <AnimatedText text="Ưu tiên của chúng tôi" delay={0.6} />
            </span>
          </h1>
          <p className="reveal opacity-0 animation-delay-400 text-base md:text-lg text-neutral-300 leading-relaxed mb-10 max-w-xl">
Trải nghiệm dịch vụ chăm sóc tận tâm từ các bác sĩ chuyên khoa giàu kinh nghiệm. Tư vấn ứng dụng AI và phác đồ điều trị cá nhân hóa cho hành trình chăm sóc sức khỏe của bạn.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/auth/signup">
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-102 font-bold uppercase tracking-widest text-xs rounded-full px-8 py-6 transition-all duration-200 shadow-lg shadow-black/10 group"
              >
                Đặt lịch tư vấn
                <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="#specialties">
              <Button
                size="lg"
                variant="outline"
                className="rounded-full px-8 py-6 text-xs font-bold uppercase tracking-widest border-neutral-700 hover:border-white text-white bg-transparent backdrop-blur-sm hover:bg-white/10 transition-all duration-200"
              >
                Chuyên khoa của chúng tôi
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

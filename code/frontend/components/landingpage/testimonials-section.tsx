"use client"

import { useEffect, useRef } from "react"
import { ScrollBlurText } from "@/components/base/scroll-blur-text"

const patientStories = [
  {
    quote:
      "Đội ngũ tim mạch tại Medicore Hospital đã cứu sống tôi. Chuyên môn cao và sự chăm sóc tận tâm của họ tạo nên khác biệt lớn trong quá trình hồi phục của tôi.",
    author: "Robert M.",
    role: "Bệnh nhân phẫu thuật tim",
    avatar: "/placeholder.svg?height=80&width=80",
  },
  {
    quote:
      "Phác đồ điều trị của bác sĩ Chen cho bệnh lý thần kinh của tôi đã thay đổi mọi thứ. Giờ đây tôi có thể tận hưởng cuộc sống trở lại nhờ quản lý phù hợp và theo dõi bằng AI.",
    author: "Jennifer K.",
    role: "Bệnh nhân thần kinh",
    avatar: "/placeholder.svg?height=80&width=80",
  },
  {
    quote:
      "Ca phẫu thuật chỉnh hình đúng là điều tôi cần. Phương pháp ít xâm lấn giúp tôi hồi phục nhanh hơn và ít đau hơn mong đợi.",
    author: "David S.",
    role: "Bệnh nhân phẫu thuật chỉnh hình",
    avatar: "/placeholder.svg?height=80&width=80",
  },
  {
    quote:
      "Hỗ trợ tư vấn AI 24/7 thật sự hữu ích trong việc quản lý sức khỏe giữa các lần tái khám. Các bác sĩ ở đây thực sự quan tâm đến bệnh nhân.",
    author: "Maria T.",
    role: "Bệnh nhân điều trị lâu dài",
    avatar: "/placeholder.svg?height=80&width=80",
  },
  {
    quote:
      "Chuyên nghiệp, tận tâm và kỹ lưỡng. Medicore Hospital đã thiết lập một tiêu chuẩn mới cho dịch vụ chăm sóc bệnh nhân.",
    author: "Stephen W.",
    role: "Bệnh nhân khám tổng quát",
    avatar: "/placeholder.svg?height=80&width=80",
  },
]

export function PatientStoriesSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

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
    const scrollContainer = scrollRef.current
    if (!scrollContainer) return

    let animationId: number
    let scrollPosition = 0
    const scrollSpeed = 0.5 // pixels per frame

    const animate = () => {
      scrollPosition += scrollSpeed

      // Reset position when we've scrolled past half (since we duplicate content)
      if (scrollPosition >= scrollContainer.scrollWidth / 2) {
        scrollPosition = 0
      }

      scrollContainer.scrollLeft = scrollPosition
      animationId = requestAnimationFrame(animate)
    }

    animationId = requestAnimationFrame(animate)

    // Pause on hover
    const handleMouseEnter = () => cancelAnimationFrame(animationId)
    const handleMouseLeave = () => {
      animationId = requestAnimationFrame(animate)
    }

    scrollContainer.addEventListener("mouseenter", handleMouseEnter)
    scrollContainer.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      cancelAnimationFrame(animationId)
      scrollContainer.removeEventListener("mouseenter", handleMouseEnter)
      scrollContainer.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [])

  const duplicatedPatientStories = [...patientStories, ...patientStories]

  return (
    <section ref={sectionRef} id="patient-stories" className="py-24 bg-background overflow-hidden lg:py-32 lg:pb-0 border-t border-border">
      {/* Section Header */}
      <div className="w-full">
        <div className="text-center mb-16 lg:mb-20 px-6">
          <p className="reveal opacity-0 text-xs md:text-sm uppercase tracking-[0.25em] text-primary font-bold mb-4">
            Câu chuyện bệnh nhân
          </p>
          <ScrollBlurText
            text="Kết quả thực tế, hồi phục thực sự"
            className="font-sans text-4xl text-foreground font-extrabold tracking-tight mb-6 md:text-6xl"
          />
        </div>

        <div className="reveal opacity-0 animation-delay-400">
          <div ref={scrollRef} className="flex gap-6 overflow-x-hidden" style={{ scrollBehavior: "auto" }}>
            {duplicatedPatientStories.map((story, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-[320px] md:w-[380px] bg-card rounded-lg p-8 border border-border hover:bg-muted hover:scale-102 transition-all duration-300 my-6 flex flex-col justify-between"
                style={{
                  boxShadow: 'rgba(0,0,0,0.05) 0px 8px 8px'
                }}
              >
                <blockquote className="font-sans text-base text-foreground leading-relaxed mb-6 font-medium">
                  "{story.quote}"
                </blockquote>

                <div className="flex items-center gap-3 pt-4 border-t border-border">
                  <img
                    src={story.avatar || "/placeholder.svg"}
                    alt={story.author}
                    className="w-12 h-12 rounded-full object-cover border border-border"
                  />
                  <div>
                    <div className="font-bold text-sm text-foreground">{story.author}</div>
                    <div className="text-xs text-muted-foreground">{story.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
